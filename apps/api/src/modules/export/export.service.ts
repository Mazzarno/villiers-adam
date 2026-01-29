import { BadRequestException, Injectable } from '@nestjs/common';
import archiver from 'archiver';
import { PassThrough } from 'node:stream';

import { PrismaService } from '../../common/prisma/prisma.service';
import { MinioService } from '../media/minio.service';

type ExportEntity = 'articles' | 'events' | 'annuaire' | 'demarches' | 'council' | 'services' | 'transports';

@Injectable()
export class ExportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
  ) {}

  private toCsv<T extends Record<string, unknown>>(data: T[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const rows = data.map((item) =>
      headers
        .map((header) => {
          const value = item[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          const str = String(value);
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
      await this.minio.deleteObject(archive.storageKey);
    } catch (error) {
      console.error(`Failed to delete archive from MinIO:`, error);
    }

    // Delete from database
    return this.prisma.exportArchive.delete({ where: { id } });
  }
}
