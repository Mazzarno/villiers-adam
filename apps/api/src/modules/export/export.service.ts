import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import AdmZip from 'adm-zip';
import archiver from 'archiver';
import { PassThrough } from 'node:stream';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

import { PrismaService } from '../../common/prisma/prisma.service';
import { MinioService } from '../media/minio.service';
import { ArchiveImportOptionsInput, ImportMode } from './dto/export.schemas';

type ExportEntity = 'articles' | 'events' | 'annuaire' | 'demarches' | 'council' | 'services' | 'transports';
type UploadedArchive = { buffer: Buffer };

interface ImportCounts {
  articles: number;
  events: number;
  directoryEntries: number;
  procedures: number;
  councilMembers: number;
  municipalServices: number;
  transportInfo: number;
  media: number;
  settings: number;
}

interface ImportExecutionResult {
  inserted: ImportCounts;
  skipped: ImportCounts;
  deleted: ImportCounts;
}

interface BackupInfo {
  filename: string;
  storageKey: string;
  size: number;
}

const REPLACE_CONFIRMATION_TOKEN = 'REPLACE_ALL_DATA';
const importRecordSchema = z.record(z.string(), z.unknown());
const importMediaSchema = z.object({
  storageKey: z.string().trim().min(1),
}).passthrough();
const importPayloadSchema = z.object({
  version: z.string(),
  exportedAt: z.string(),
  data: z.object({
    articles: z.array(importRecordSchema),
    events: z.array(importRecordSchema),
    directoryEntries: z.array(importRecordSchema),
    procedures: z.array(importRecordSchema),
    councilMembers: z.array(importRecordSchema),
    municipalServices: z.array(importRecordSchema),
    transportInfo: z.array(importRecordSchema),
    media: z.array(importMediaSchema),
    settings: z.record(z.string(), z.unknown()).nullable(),
  }).strict(),
}).strict();

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
  ) {}

  private emptyCounts(): ImportCounts {
    return {
      articles: 0,
      events: 0,
      directoryEntries: 0,
      procedures: 0,
      councilMembers: 0,
      municipalServices: 0,
      transportInfo: 0,
      media: 0,
      settings: 0,
    };
  }

  private isUniqueConstraintError(error: unknown) {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
  }

  private isSkipDuplicatesUnsupportedError(error: unknown) {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2026';
  }

  private async createManyWithDuplicateFallback<T>(
    rows: T[],
    createMany: () => Promise<{ count: number }>,
    createOne: (row: T) => Promise<unknown>,
  ) {
    if (rows.length === 0) {
      return { count: 0, skipped: 0 };
    }

    try {
      const result = await createMany();
      return {
        count: result.count,
        skipped: Math.max(rows.length - result.count, 0),
      };
    } catch (error) {
      if (!this.isSkipDuplicatesUnsupportedError(error)) {
        throw error;
      }

      let inserted = 0;
      let skipped = 0;
      for (const row of rows) {
        try {
          await createOne(row);
          inserted += 1;
        } catch (innerError) {
          if (this.isUniqueConstraintError(innerError)) {
            skipped += 1;
            continue;
          }
          throw innerError;
        }
      }

      return {
        count: inserted,
        skipped,
      };
    }
  }

  private async streamToBuffer(stream: PassThrough): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk: Buffer | string) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      stream.once('error', reject);
      stream.once('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  private async currentCounts(): Promise<ImportCounts> {
    const [
      articles,
      events,
      directoryEntries,
      procedures,
      councilMembers,
      municipalServices,
      transportInfo,
      media,
      settings,
    ] = await Promise.all([
      this.prisma.article.count(),
      this.prisma.event.count(),
      this.prisma.directoryEntry.count(),
      this.prisma.procedure.count(),
      this.prisma.councilMember.count(),
      this.prisma.municipalService.count(),
      this.prisma.transportInfo.count(),
      this.prisma.media.count(),
      this.prisma.settings.count({ where: { id: 'default' } }),
    ]);

    return {
      articles,
      events,
      directoryEntries,
      procedures,
      councilMembers,
      municipalServices,
      transportInfo,
      media,
      settings,
    };
  }

  private async createPreReplaceBackup(userId: string): Promise<BackupInfo> {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    const safeUserId = (userId || 'system').replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 64) || 'system';
    const filename = `pre-replace-backup-${timestamp}.zip`;
    const storageKey = `backups/pre-import/${timestamp}-${safeUserId}.zip`;
    const backup = await this.exportFull(userId);
    const backupBuffer = await this.streamToBuffer(backup.stream as PassThrough);

    await this.minio.putObject(storageKey, backupBuffer, backupBuffer.length);
    await this.saveArchive(filename, storageKey, backupBuffer.length, userId);

    return {
      filename,
      storageKey,
      size: backupBuffer.length,
    };
  }

  private sanitizeCsvCell(value: string) {
    return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  }

  private toCsv<T extends Record<string, unknown>>(data: T[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const rows = data.map((item) =>
      headers
        .map((header) => {
          const value = item[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') {
            const strValue = this.sanitizeCsvCell(JSON.stringify(value));
            return `"${strValue.replace(/"/g, '""')}"`;
          }

          const str = this.sanitizeCsvCell(String(value));
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(','),
    );

    return [headers.join(','), ...rows].join('\n');
  }

  async exportToCsv(entity: ExportEntity): Promise<string> {
    let data: Record<string, unknown>[];

    switch (entity) {
      case 'articles':
        data = await this.prisma.article.findMany();
        break;
      case 'events':
        data = await this.prisma.event.findMany();
        break;
      case 'annuaire':
        data = await this.prisma.directoryEntry.findMany();
        break;
      case 'demarches':
        data = await this.prisma.procedure.findMany();
        break;
      case 'council':
        data = await this.prisma.councilMember.findMany();
        break;
      case 'services':
        data = await this.prisma.municipalService.findMany();
        break;
      case 'transports':
        data = await this.prisma.transportInfo.findMany();
        break;
      default:
        throw new BadRequestException(`Unknown entity: ${entity}`);
    }

    return this.toCsv(data as Record<string, unknown>[]);
  }

  async exportAllCsv() {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = new PassThrough();

    archive.pipe(stream);

    const entities: ExportEntity[] = [
      'articles',
      'events',
      'annuaire',
      'demarches',
      'council',
      'services',
      'transports',
    ];

    for (const entity of entities) {
      const csv = await this.exportToCsv(entity);
      if (csv) {
        archive.append(csv, { name: `${entity}.csv` });
      }
    }

    await archive.finalize();

    return stream;
  }

  async exportFull(userId: string) {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = new PassThrough();

    archive.pipe(stream);

    // Fetch all data
    const [
      articles,
      events,
      directory,
      procedures,
      councilMembers,
      municipalServices,
      transportInfo,
      media,
      settings,
    ] = await Promise.all([
      this.prisma.article.findMany(),
      this.prisma.event.findMany(),
      this.prisma.directoryEntry.findMany(),
      this.prisma.procedure.findMany(),
      this.prisma.councilMember.findMany(),
      this.prisma.municipalService.findMany(),
      this.prisma.transportInfo.findMany(),
      this.prisma.media.findMany(),
      this.prisma.settings.findUnique({ where: { id: 'default' } }),
    ]);

    // Create export data structure
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data: {
        articles,
        events,
        directoryEntries: directory,
        procedures,
        councilMembers,
        municipalServices,
        transportInfo,
        media,
        settings,
      },
    };

    // Add data.json
    archive.append(JSON.stringify(exportData, null, 2), { name: 'data.json' });

    // Add metadata
    const metadata = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      exportedBy: userId,
      counts: {
        articles: articles.length,
        events: events.length,
        directoryEntries: directory.length,
        procedures: procedures.length,
        councilMembers: councilMembers.length,
        municipalServices: municipalServices.length,
        transportInfo: transportInfo.length,
        media: media.length,
      },
    };
    archive.append(JSON.stringify(metadata, null, 2), { name: 'metadata.json' });

    // Add media files
    for (const item of media) {
      try {
        const objectStream = await this.minio.getObjectStream(item.storageKey);
        archive.append(objectStream, { name: `media/${item.storageKey}` });
      } catch (error) {
        console.error(`Failed to export media ${item.storageKey}:`, error);
      }
    }

    await archive.finalize();

    // Calculate size
    let size = 0;
    stream.on('data', (chunk) => {
      size += chunk.length;
    });

    return { stream, size };
  }

  async importFromArchive(file: UploadedArchive, userId: string, options: ArchiveImportOptionsInput) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('No file uploaded');
    }

    const mode: ImportMode = options.mode ?? 'merge';
    const dryRun = options.dryRun ?? false;
    const isReplaceMode = mode === 'replace';

    if (isReplaceMode && !dryRun && options.confirmReplace !== REPLACE_CONFIRMATION_TOKEN) {
      throw new BadRequestException(
        `Destructive replace mode requires confirmReplace=${REPLACE_CONFIRMATION_TOKEN}`,
      );
    }

    this.logger.warn(`Archive import requested (mode=${mode}, dryRun=${dryRun}, userId=${userId})`);

    const zip = new AdmZip(file.buffer);
    const entries = zip.getEntries();
    const maxEntries = 5000;
    const maxTotalUncompressedBytes = 200 * 1024 * 1024;

    if (entries.length > maxEntries) {
      throw new BadRequestException('Archive contains too many entries');
    }

    const totalUncompressedBytes = entries.reduce((acc, entry) => {
      const entrySize = Number(entry.header?.size ?? 0);
      return acc + (Number.isFinite(entrySize) ? entrySize : 0);
    }, 0);

    if (totalUncompressedBytes > maxTotalUncompressedBytes) {
      throw new BadRequestException('Archive uncompressed size is too large');
    }

    const dataEntry = zip.getEntry('data.json');
    if (!dataEntry) {
      throw new BadRequestException('Invalid archive: data.json not found');
    }

    let rawParsed: unknown;
    try {
      rawParsed = JSON.parse(dataEntry.getData().toString('utf-8'));
    } catch {
      throw new BadRequestException('Invalid archive: data.json is not valid JSON');
    }

    const parsedResult = importPayloadSchema.safeParse(rawParsed);
    if (!parsedResult.success) {
      const details = parsedResult.error.issues
        .slice(0, 5)
        .map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
        .join('; ');
      throw new BadRequestException(`Invalid archive format: ${details}`);
    }

    const data = parsedResult.data.data;
    const articles = data.articles;
    const events = data.events;
    const directoryEntries = data.directoryEntries;
    const procedures = data.procedures;
    const councilMembers = data.councilMembers;
    const municipalServices = data.municipalServices;
    const transportInfo = data.transportInfo;
    const media = data.media;
    const settings = data.settings;

    const sourceCounts: ImportCounts = {
      articles: articles.length,
      events: events.length,
      directoryEntries: directoryEntries.length,
      procedures: procedures.length,
      councilMembers: councilMembers.length,
      municipalServices: municipalServices.length,
      transportInfo: transportInfo.length,
      media: media.length,
      settings: settings ? 1 : 0,
    };

    const mediaEntryMap = new Map<string, AdmZip.IZipEntry>();
    for (const entry of entries) {
      if (!entry.entryName.startsWith('media/') || entry.isDirectory) {
        continue;
      }
      const storageKey = entry.entryName.replace(/^media\//, '');
      if (!storageKey) {
        continue;
      }
      mediaEntryMap.set(storageKey, entry);
    }

    const missingMediaKeys = media
      .map((item) => item.storageKey)
      .filter((storageKey) => !mediaEntryMap.has(storageKey));
    if (isReplaceMode && missingMediaKeys.length > 0) {
      throw new BadRequestException(
        `Invalid archive: missing media files for ${missingMediaKeys.length} media records`,
      );
    }

    const warnings: string[] = [];
    if (!isReplaceMode && missingMediaKeys.length > 0) {
      warnings.push(
        `${missingMediaKeys.length} media records skipped because corresponding media files are missing from archive`,
      );
    }

    const mediaRecordsForImport = isReplaceMode
      ? media
      : media.filter((item) => mediaEntryMap.has(item.storageKey));
    const currentCounts = await this.currentCounts();
    const wouldDelete = isReplaceMode ? currentCounts : this.emptyCounts();
    const plannedCounts: ImportCounts = {
      ...sourceCounts,
      media: mediaRecordsForImport.length,
      settings: isReplaceMode && settings ? 1 : 0,
    };

    if (dryRun) {
      this.logger.log(
        `Archive import dry-run computed (mode=${mode}, userId=${userId}, records=${JSON.stringify(plannedCounts)})`,
      );
      return {
        success: true,
        dryRun: true,
        mode,
        destructive: isReplaceMode,
        requiredConfirmationToken: isReplaceMode ? REPLACE_CONFIRMATION_TOKEN : undefined,
        counts: {
          source: sourceCounts,
          wouldImport: plannedCounts,
          wouldDelete,
        },
        warnings,
      };
    }

    const withActor = (record: Record<string, unknown>) => ({
      ...(record as Record<string, unknown>),
      createdById: userId,
      updatedById: userId,
    });

    const normalizeMedia = (record: z.infer<typeof importMediaSchema>): Prisma.MediaCreateManyInput => ({
      ...(record as Prisma.MediaCreateManyInput),
      createdById: (record.createdById as string | undefined) ?? userId,
    });

    const mediaStorageKeys = mediaRecordsForImport.map((item) => item.storageKey);
    let mediaStorageKeysToUpload = new Set(mediaStorageKeys);
    if (!isReplaceMode && mediaStorageKeys.length > 0) {
      const existingMedia = await this.prisma.media.findMany({
        where: { storageKey: { in: mediaStorageKeys } },
        select: { storageKey: true },
      });
      const existingKeys = new Set(existingMedia.map((row) => row.storageKey));
      mediaStorageKeysToUpload = new Set(mediaStorageKeys.filter((key) => !existingKeys.has(key)));
    }

    let backupInfo: BackupInfo | null = null;
    if (isReplaceMode) {
      this.logger.warn(`Creating pre-replace backup before destructive import (userId=${userId})`);
      backupInfo = await this.createPreReplaceBackup(userId);
      this.logger.warn(
        `Pre-replace backup created (storageKey=${backupInfo.storageKey}, size=${backupInfo.size})`,
      );
    }

    for (const storageKey of mediaStorageKeysToUpload) {
      const entry = mediaEntryMap.get(storageKey);
      if (!entry) {
        throw new BadRequestException(`Invalid archive: media/${storageKey} is missing`);
      }

      const buffer = entry.getData();
      try {
        await this.minio.putObject(storageKey, buffer, buffer.length);
      } catch (error) {
        this.logger.error(`Failed to import media object ${storageKey}`, error as Error);
        throw new BadRequestException(`Failed to import media file: ${storageKey}`);
      }
    }

    const executionResult = await this.prisma.$transaction(async (tx): Promise<ImportExecutionResult> => {
      const inserted = this.emptyCounts();
      const skipped = this.emptyCounts();
      const deleted = this.emptyCounts();

      if (isReplaceMode) {
        deleted.articles = (await tx.article.deleteMany()).count;
        deleted.events = (await tx.event.deleteMany()).count;
        deleted.directoryEntries = (await tx.directoryEntry.deleteMany()).count;
        deleted.procedures = (await tx.procedure.deleteMany()).count;
        deleted.councilMembers = (await tx.councilMember.deleteMany()).count;
        deleted.municipalServices = (await tx.municipalService.deleteMany()).count;
        deleted.transportInfo = (await tx.transportInfo.deleteMany()).count;
        deleted.media = (await tx.media.deleteMany()).count;
        deleted.settings = (await tx.settings.deleteMany({ where: { id: 'default' } })).count;
      }

      const mediaRows = mediaRecordsForImport.map(normalizeMedia);
      const mediaInsert = await this.createManyWithDuplicateFallback(
        mediaRows,
        () => tx.media.createMany({ data: mediaRows, skipDuplicates: true }),
        (row) => tx.media.create({ data: row as Prisma.MediaUncheckedCreateInput }),
      );
      inserted.media = mediaInsert.count;
      skipped.media = mediaInsert.skipped;

      const articleRows = articles.map(withActor) as Prisma.ArticleCreateManyInput[];
      const articleInsert = await this.createManyWithDuplicateFallback(
        articleRows,
        () => tx.article.createMany({ data: articleRows, skipDuplicates: true }),
        (row) => tx.article.create({ data: row as Prisma.ArticleUncheckedCreateInput }),
      );
      inserted.articles = articleInsert.count;
      skipped.articles = articleInsert.skipped;

      const eventRows = events.map(withActor) as Prisma.EventCreateManyInput[];
      const eventInsert = await this.createManyWithDuplicateFallback(
        eventRows,
        () => tx.event.createMany({ data: eventRows, skipDuplicates: true }),
        (row) => tx.event.create({ data: row as Prisma.EventUncheckedCreateInput }),
      );
      inserted.events = eventInsert.count;
      skipped.events = eventInsert.skipped;

      const directoryRows = directoryEntries.map(withActor) as Prisma.DirectoryEntryCreateManyInput[];
      const directoryInsert = await this.createManyWithDuplicateFallback(
        directoryRows,
        () => tx.directoryEntry.createMany({ data: directoryRows, skipDuplicates: true }),
        (row) => tx.directoryEntry.create({ data: row as Prisma.DirectoryEntryUncheckedCreateInput }),
      );
      inserted.directoryEntries = directoryInsert.count;
      skipped.directoryEntries = directoryInsert.skipped;

      const procedureRows = procedures.map(withActor) as Prisma.ProcedureCreateManyInput[];
      const procedureInsert = await this.createManyWithDuplicateFallback(
        procedureRows,
        () => tx.procedure.createMany({ data: procedureRows, skipDuplicates: true }),
        (row) => tx.procedure.create({ data: row as Prisma.ProcedureUncheckedCreateInput }),
      );
      inserted.procedures = procedureInsert.count;
      skipped.procedures = procedureInsert.skipped;

      const councilRows = councilMembers.map(withActor) as Prisma.CouncilMemberCreateManyInput[];
      const councilInsert = await this.createManyWithDuplicateFallback(
        councilRows,
        () => tx.councilMember.createMany({ data: councilRows, skipDuplicates: true }),
        (row) => tx.councilMember.create({ data: row as Prisma.CouncilMemberUncheckedCreateInput }),
      );
      inserted.councilMembers = councilInsert.count;
      skipped.councilMembers = councilInsert.skipped;

      const serviceRows = municipalServices.map(withActor) as Prisma.MunicipalServiceCreateManyInput[];
      const serviceInsert = await this.createManyWithDuplicateFallback(
        serviceRows,
        () => tx.municipalService.createMany({ data: serviceRows, skipDuplicates: true }),
        (row) => tx.municipalService.create({ data: row as Prisma.MunicipalServiceUncheckedCreateInput }),
      );
      inserted.municipalServices = serviceInsert.count;
      skipped.municipalServices = serviceInsert.skipped;

      const transportRows = transportInfo.map(withActor) as Prisma.TransportInfoCreateManyInput[];
      const transportInsert = await this.createManyWithDuplicateFallback(
        transportRows,
        () => tx.transportInfo.createMany({ data: transportRows, skipDuplicates: true }),
        (row) => tx.transportInfo.create({ data: row as Prisma.TransportInfoUncheckedCreateInput }),
      );
      inserted.transportInfo = transportInsert.count;
      skipped.transportInfo = transportInsert.skipped;

      if (isReplaceMode && settings) {
        await tx.settings.create({
          data: {
            id: 'default',
            siteName: (settings.siteName as string) ?? 'Mairie',
            branding: (settings.branding as object) ?? {},
            accessibility: (settings.accessibility as object) ?? {},
            contactEmail: settings.contactEmail as string | undefined,
            contactPhone: settings.contactPhone as string | undefined,
            address: settings.address as object | undefined,
            municipalityProfile: settings.municipalityProfile as object | undefined,
          },
        });
        inserted.settings = 1;
      } else if (settings) {
        skipped.settings = 1;
      }

      return {
        inserted,
        skipped,
        deleted,
      };
    });

    this.logger.log(
      `Archive import completed (mode=${mode}, userId=${userId}, inserted=${JSON.stringify(executionResult.inserted)}, deleted=${JSON.stringify(executionResult.deleted)})`,
    );

    return {
      success: true,
      mode,
      dryRun: false,
      destructive: isReplaceMode,
      backup: backupInfo,
      requiredConfirmationToken: isReplaceMode ? REPLACE_CONFIRMATION_TOKEN : undefined,
      counts: {
        source: sourceCounts,
        imported: executionResult.inserted,
        skipped: executionResult.skipped,
        deleted: executionResult.deleted,
      },
      warnings,
    };
  }

  async saveArchive(filename: string, storageKey: string, size: number, userId: string) {
    return this.prisma.exportArchive.create({
      data: {
        filename,
        storageKey,
        size,
        createdById: userId,
      },
    });
  }

  async listArchives(userId?: string) {
    return this.prisma.exportArchive.findMany({
      where: userId ? { createdById: userId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async deleteArchive(id: string) {
    const archive = await this.prisma.exportArchive.findUnique({ where: { id } });
    if (!archive) {
      throw new BadRequestException('Archive not found');
    }

    // Delete from MinIO
    try {
      await this.minio.removeObject(archive.storageKey);
    } catch (error) {
      console.error(`Failed to delete archive from MinIO:`, error);
    }

    // Delete from database
    return this.prisma.exportArchive.delete({ where: { id } });
  }
}
