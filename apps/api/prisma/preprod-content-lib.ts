import fs from 'node:fs/promises';
import path from 'node:path';

import {
  ArticleType,
  ContentStatus,
  CouncilMemberRole,
  DirectoryType,
  MediaType,
  Prisma,
  PrismaClient,
  PublicationType,
} from '@prisma/client';

export const PREPROD_CONTENT_SCHEMA_VERSION = 'preprod-content.v1';
export const PREPROD_CONTENT_DIR = path.resolve(process.cwd(), '../../backups/preprod-content');

type JsonRecord = Record<string, unknown>;

export type ExportedSettings = {
  id: string;
  siteName: string;
  branding: Prisma.JsonValue;
  accessibility: Prisma.JsonValue;
  contactEmail: string | null;
  contactPhone: string | null;
  address: Prisma.JsonValue | null;
  municipalityProfile: Prisma.JsonValue | null;
};

export type ExportedMedia = {
  id: string;
  title: string | null;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  storageKey: string;
  bucket: string;
  type: string;
  width: number | null;
  height: number | null;
  duration: number | null;
};

export type ExportedArticle = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: Prisma.JsonValue;
  metaTitle: string | null;
  metaDescription: string | null;
  type: string;
  publicationType: string | null;
  documentNumber: string | null;
  meetingDate: string | null;
  publicationYear: number | null;
  isFlash: boolean;
  status: string;
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
  coverMediaId: string | null;
  documentMediaId: string | null;
};

export type ExportedEvent = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: Prisma.JsonValue;
  metaTitle: string | null;
  metaDescription: string | null;
  locationName: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  startsAt: string;
  endsAt: string | null;
  status: string;
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
  coverMediaId: string | null;
};

export type ExportedDirectoryEntry = {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  postalCode: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  openingHours: Prisma.JsonValue | null;
  status: string;
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
  coverMediaId: string | null;
};

export type ExportedProcedure = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: Prisma.JsonValue;
  steps: Prisma.JsonValue | null;
  externalUrl: string | null;
  status: string;
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
  coverMediaId: string | null;
};

export type ExportedCouncilMember = {
  id: string;
  name: string;
  role: string;
  roleTitle: string | null;
  delegations: string | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  order: number;
  status: string;
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
  photoMediaId: string | null;
};

export type ExportedMunicipalService = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  openingHours: Prisma.JsonValue | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  order: number;
  status: string;
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
  coverMediaId: string | null;
};

export type ExportedTransportInfo = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: Prisma.JsonValue;
  operator: string | null;
  website: string | null;
  phone: string | null;
  status: string;
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
  coverMediaId: string | null;
};

export type ExportedRelationRow = {
  parentId: string;
  mediaId: string;
  order: number;
};

export type PreprodContentExport = {
  schemaVersion: typeof PREPROD_CONTENT_SCHEMA_VERSION;
  exportedAt: string;
  source: {
    app: 'villiers-adam';
    kind: 'content-export';
  };
  collections: {
    settings: ExportedSettings | null;
    media: ExportedMedia[];
    articles: ExportedArticle[];
    articleMedia: ExportedRelationRow[];
    events: ExportedEvent[];
    eventMedia: ExportedRelationRow[];
    directoryEntries: ExportedDirectoryEntry[];
    directoryEntryMedia: ExportedRelationRow[];
    procedures: ExportedProcedure[];
    procedureMedia: ExportedRelationRow[];
    councilMembers: ExportedCouncilMember[];
    municipalServices: ExportedMunicipalService[];
    transportInfo: ExportedTransportInfo[];
  };
  excludedCollections: string[];
};

export type ImportMode = 'merge' | 'replace';

export type ImportOptions = {
  file?: string;
  dryRun: boolean;
  mode: ImportMode;
  adminEmail?: string;
  confirmReplace?: string;
};

export type ImportCounts = {
  settings: number;
  media: number;
  articles: number;
  articleMedia: number;
  events: number;
  eventMedia: number;
  directoryEntries: number;
  directoryEntryMedia: number;
  procedures: number;
  procedureMedia: number;
  councilMembers: number;
  municipalServices: number;
  transportInfo: number;
};

export type ImportReport = {
  success: true;
  dryRun: boolean;
  mode: ImportMode;
  file: string;
  adminEmail: string;
  schemaVersion: string;
  counts: {
    source: ImportCounts;
    wouldUpsert?: ImportCounts;
    imported?: ImportCounts;
  };
  media: {
    buckets: string[];
    storageKeys: string[];
    note: string;
  };
};

type RelationCollections = Pick<
  PreprodContentExport['collections'],
  'articleMedia' | 'eventMedia' | 'directoryEntryMedia' | 'procedureMedia'
>;

const REPLACE_CONFIRMATION_TOKEN = 'REPLACE_PREPROD_CONTENT';

export function getReplaceConfirmationToken() {
  return REPLACE_CONFIRMATION_TOKEN;
}

function toIso(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

function deepMergeJson(existing: unknown, incoming: unknown): Prisma.InputJsonValue {
  if (Array.isArray(existing) || Array.isArray(incoming)) {
    return (incoming ?? existing ?? null) as Prisma.InputJsonValue;
  }

  if (isRecord(existing) && isRecord(incoming)) {
    const merged: JsonRecord = { ...existing };
    for (const [key, value] of Object.entries(incoming)) {
      merged[key] = deepMergeJson(existing[key], value);
    }
    return merged as Prisma.InputJsonValue;
  }

  if (incoming === undefined) {
    return (existing ?? null) as Prisma.InputJsonValue;
  }

  return (incoming ?? null) as Prisma.InputJsonValue;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeFileArgument(file?: string) {
  if (!file) return undefined;
  return path.isAbsolute(file) ? file : path.resolve(process.cwd(), file);
}

async function findLatestExportFile() {
  await fs.mkdir(PREPROD_CONTENT_DIR, { recursive: true });
  const entries = await fs.readdir(PREPROD_CONTENT_DIR, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => entry.name)
    .sort();

  const latest = files.at(-1);
  return latest ? path.join(PREPROD_CONTENT_DIR, latest) : undefined;
}

function ensureCompatibleSchemaVersion(value: string) {
  if (value !== PREPROD_CONTENT_SCHEMA_VERSION) {
    throw new Error(
      `Incompatible schemaVersion: expected ${PREPROD_CONTENT_SCHEMA_VERSION}, received ${value}`,
    );
  }
}

export async function resolveImportFile(file?: string) {
  const normalized = normalizeFileArgument(file);
  if (normalized) return normalized;

  const latest = await findLatestExportFile();
  if (!latest) {
    throw new Error(`No export file found in ${PREPROD_CONTENT_DIR}`);
  }
  return latest;
}

export async function buildPreprodContentExport(prisma: PrismaClient): Promise<PreprodContentExport> {
  const [
    settings,
    media,
    articles,
    articleMedia,
    events,
    eventMedia,
    directoryEntries,
    directoryEntryMedia,
    procedures,
    procedureMedia,
    councilMembers,
    municipalServices,
    transportInfo,
  ] = await Promise.all([
    prisma.settings.findUnique({ where: { id: 'default' } }),
    prisma.media.findMany({ orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] }),
    prisma.article.findMany({ orderBy: [{ createdAt: 'asc' }, { slug: 'asc' }] }),
    prisma.articleMedia.findMany({ orderBy: [{ articleId: 'asc' }, { order: 'asc' }, { mediaId: 'asc' }] }),
    prisma.event.findMany({ orderBy: [{ createdAt: 'asc' }, { slug: 'asc' }] }),
    prisma.eventMedia.findMany({ orderBy: [{ eventId: 'asc' }, { order: 'asc' }, { mediaId: 'asc' }] }),
    prisma.directoryEntry.findMany({ orderBy: [{ createdAt: 'asc' }, { slug: 'asc' }] }),
    prisma.directoryEntryMedia.findMany({
      orderBy: [{ directoryEntryId: 'asc' }, { order: 'asc' }, { mediaId: 'asc' }],
    }),
    prisma.procedure.findMany({ orderBy: [{ createdAt: 'asc' }, { slug: 'asc' }] }),
    prisma.procedureMedia.findMany({ orderBy: [{ procedureId: 'asc' }, { order: 'asc' }, { mediaId: 'asc' }] }),
    prisma.councilMember.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }] }),
    prisma.municipalService.findMany({ orderBy: [{ order: 'asc' }, { slug: 'asc' }] }),
    prisma.transportInfo.findMany({ orderBy: [{ createdAt: 'asc' }, { slug: 'asc' }] }),
  ]);

  return {
    schemaVersion: PREPROD_CONTENT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    source: {
      app: 'villiers-adam',
      kind: 'content-export',
    },
    collections: {
      settings: settings
        ? {
            id: settings.id,
            siteName: settings.siteName,
            branding: settings.branding,
            accessibility: settings.accessibility,
            contactEmail: settings.contactEmail,
            contactPhone: settings.contactPhone,
            address: settings.address,
            municipalityProfile: settings.municipalityProfile,
          }
        : null,
      media: media.map((item) => ({
        id: item.id,
        title: item.title,
        filename: item.filename,
        mimeType: item.mimeType,
        size: item.size,
        url: item.url,
        storageKey: item.storageKey,
        bucket: item.bucket,
        type: item.type,
        width: item.width,
        height: item.height,
        duration: item.duration,
      })),
      articles: articles.map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        summary: item.summary,
        content: item.content,
        metaTitle: item.metaTitle,
        metaDescription: item.metaDescription,
        type: item.type,
        publicationType: item.publicationType,
        documentNumber: item.documentNumber,
        meetingDate: toIso(item.meetingDate),
        publicationYear: item.publicationYear,
        isFlash: item.isFlash,
        status: item.status,
        publishedAt: toIso(item.publishedAt),
        scheduledAt: toIso(item.scheduledAt),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        coverMediaId: item.coverMediaId,
        documentMediaId: item.documentMediaId,
      })),
      articleMedia: articleMedia.map((item) => ({
        parentId: item.articleId,
        mediaId: item.mediaId,
        order: item.order,
      })),
      events: events.map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        summary: item.summary,
        content: item.content,
        metaTitle: item.metaTitle,
        metaDescription: item.metaDescription,
        locationName: item.locationName,
        address: item.address,
        latitude: item.latitude,
        longitude: item.longitude,
        startsAt: item.startsAt.toISOString(),
        endsAt: toIso(item.endsAt),
        status: item.status,
        publishedAt: toIso(item.publishedAt),
        scheduledAt: toIso(item.scheduledAt),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        coverMediaId: item.coverMediaId,
      })),
      eventMedia: eventMedia.map((item) => ({
        parentId: item.eventId,
        mediaId: item.mediaId,
        order: item.order,
      })),
      directoryEntries: directoryEntries.map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        type: item.type,
        description: item.description,
        phone: item.phone,
        email: item.email,
        website: item.website,
        addressLine1: item.addressLine1,
        addressLine2: item.addressLine2,
        postalCode: item.postalCode,
        city: item.city,
        country: item.country,
        latitude: item.latitude,
        longitude: item.longitude,
        openingHours: item.openingHours,
        status: item.status,
        publishedAt: toIso(item.publishedAt),
        scheduledAt: toIso(item.scheduledAt),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        coverMediaId: item.coverMediaId,
      })),
      directoryEntryMedia: directoryEntryMedia.map((item) => ({
        parentId: item.directoryEntryId,
        mediaId: item.mediaId,
        order: item.order,
      })),
      procedures: procedures.map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        summary: item.summary,
        content: item.content,
        steps: item.steps,
        externalUrl: item.externalUrl,
        status: item.status,
        publishedAt: toIso(item.publishedAt),
        scheduledAt: toIso(item.scheduledAt),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        coverMediaId: item.coverMediaId,
      })),
      procedureMedia: procedureMedia.map((item) => ({
        parentId: item.procedureId,
        mediaId: item.mediaId,
        order: item.order,
      })),
      councilMembers: councilMembers.map((item) => ({
        id: item.id,
        name: item.name,
        role: item.role,
        roleTitle: item.roleTitle,
        delegations: item.delegations,
        bio: item.bio,
        email: item.email,
        phone: item.phone,
        order: item.order,
        status: item.status,
        publishedAt: toIso(item.publishedAt),
        scheduledAt: toIso(item.scheduledAt),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        photoMediaId: item.photoMediaId,
      })),
      municipalServices: municipalServices.map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        category: item.category,
        openingHours: item.openingHours,
        address: item.address,
        phone: item.phone,
        email: item.email,
        website: item.website,
        order: item.order,
        status: item.status,
        publishedAt: toIso(item.publishedAt),
        scheduledAt: toIso(item.scheduledAt),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        coverMediaId: item.coverMediaId,
      })),
      transportInfo: transportInfo.map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        summary: item.summary,
        content: item.content,
        operator: item.operator,
        website: item.website,
        phone: item.phone,
        status: item.status,
        publishedAt: toIso(item.publishedAt),
        scheduledAt: toIso(item.scheduledAt),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        coverMediaId: item.coverMediaId,
      })),
    },
    excludedCollections: [
      'users',
      'sessions',
      'passwordResetTokens',
      'notifications',
      'auditLogs',
      'versions',
      'newsletterSubscriptions',
      'newsletterTopics',
      'newsletterSubscriptionTopics',
      'exportArchives',
      'meilisearch-index-state',
      'local-public-assets-versioned-in-git',
    ],
  };
}

export async function writePreprodContentExportFile(payload: PreprodContentExport) {
  await fs.mkdir(PREPROD_CONTENT_DIR, { recursive: true });
  const timestamp = payload.exportedAt.replace(/[:.]/g, '-');
  const filename = `preprod-content-${timestamp}.json`;
  const filePath = path.join(PREPROD_CONTENT_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2));
  return filePath;
}

export async function readPreprodContentFile(filePath: string): Promise<PreprodContentExport> {
  const raw = await fs.readFile(filePath, 'utf-8');
  const parsed = JSON.parse(raw) as PreprodContentExport;
  ensureCompatibleSchemaVersion(parsed.schemaVersion);
  return parsed;
}

async function resolveImportAdmin(prisma: PrismaClient, adminEmail?: string) {
  const targetEmail = adminEmail ?? process.env.SEED_ADMIN_EMAIL ?? 'admin@mairie.fr';
  if (!targetEmail) {
    throw new Error('Missing admin email. Pass --admin-email or set SEED_ADMIN_EMAIL.');
  }

  const user = await prisma.user.findUnique({
    where: { email: targetEmail },
    select: { id: true, email: true },
  });

  if (!user) {
    throw new Error(`Bootstrap admin not found for email ${targetEmail}`);
  }

  return user;
}

async function replaceImportedRelations(
  prisma: Prisma.TransactionClient,
  relationType: keyof RelationCollections,
  parentId: string,
  rows: ExportedRelationRow[],
) {
  if (relationType === 'articleMedia') {
    await prisma.articleMedia.deleteMany({ where: { articleId: parentId } });
    if (rows.length > 0) {
      await prisma.articleMedia.createMany({
        data: rows.map((row) => ({ articleId: parentId, mediaId: row.mediaId, order: row.order })),
      });
    }
    return;
  }

  if (relationType === 'eventMedia') {
    await prisma.eventMedia.deleteMany({ where: { eventId: parentId } });
    if (rows.length > 0) {
      await prisma.eventMedia.createMany({
        data: rows.map((row) => ({ eventId: parentId, mediaId: row.mediaId, order: row.order })),
      });
    }
    return;
  }

  if (relationType === 'directoryEntryMedia') {
    await prisma.directoryEntryMedia.deleteMany({ where: { directoryEntryId: parentId } });
    if (rows.length > 0) {
      await prisma.directoryEntryMedia.createMany({
        data: rows.map((row) => ({
          directoryEntryId: parentId,
          mediaId: row.mediaId,
          order: row.order,
        })),
      });
    }
    return;
  }

  await prisma.procedureMedia.deleteMany({ where: { procedureId: parentId } });
  if (rows.length > 0) {
    await prisma.procedureMedia.createMany({
      data: rows.map((row) => ({ procedureId: parentId, mediaId: row.mediaId, order: row.order })),
    });
  }
}

export async function importPreprodContent(
  prisma: PrismaClient,
  options: ImportOptions,
): Promise<ImportReport> {
  const filePath = await resolveImportFile(options.file);
  const payload = await readPreprodContentFile(filePath);
  const admin = await resolveImportAdmin(prisma, options.adminEmail);

  if (options.mode === 'replace' && options.confirmReplace !== REPLACE_CONFIRMATION_TOKEN) {
    throw new Error(
      `Replace mode requires --confirm-replace ${REPLACE_CONFIRMATION_TOKEN}`,
    );
  }

  const counts: ImportCounts = {
    settings: payload.collections.settings ? 1 : 0,
    media: payload.collections.media.length,
    articles: payload.collections.articles.length,
    articleMedia: payload.collections.articleMedia.length,
    events: payload.collections.events.length,
    eventMedia: payload.collections.eventMedia.length,
    directoryEntries: payload.collections.directoryEntries.length,
    directoryEntryMedia: payload.collections.directoryEntryMedia.length,
    procedures: payload.collections.procedures.length,
    procedureMedia: payload.collections.procedureMedia.length,
    councilMembers: payload.collections.councilMembers.length,
    municipalServices: payload.collections.municipalServices.length,
    transportInfo: payload.collections.transportInfo.length,
  };

  const mediaBuckets = Array.from(new Set(payload.collections.media.map((item) => item.bucket))).sort();
  const mediaKeys = payload.collections.media.map((item) => item.storageKey).sort();

  if (options.dryRun) {
    return {
      success: true,
      dryRun: true,
      mode: options.mode,
      file: filePath,
      adminEmail: admin.email,
      schemaVersion: payload.schemaVersion,
      counts: {
        source: counts,
        wouldUpsert: counts,
      },
      media: {
        buckets: mediaBuckets,
        storageKeys: mediaKeys,
        note: 'JSON export includes media metadata only. Copy MinIO objects separately by storageKey.',
      },
    };
  }

  await prisma.$transaction(async (tx) => {
    if (options.mode === 'replace') {
      await tx.articleMedia.deleteMany();
      await tx.eventMedia.deleteMany();
      await tx.directoryEntryMedia.deleteMany();
      await tx.procedureMedia.deleteMany();
      await tx.article.deleteMany();
      await tx.event.deleteMany();
      await tx.directoryEntry.deleteMany();
      await tx.procedure.deleteMany();
      await tx.councilMember.deleteMany();
      await tx.municipalService.deleteMany();
      await tx.transportInfo.deleteMany();
      await tx.media.deleteMany();
    }

    const mediaIdMap = new Map<string, string>();

    for (const item of payload.collections.media) {
      const saved = await tx.media.upsert({
        where: { storageKey: item.storageKey },
        update: {
          title: item.title,
          filename: item.filename,
          mimeType: item.mimeType,
          size: item.size,
          url: item.url,
          bucket: item.bucket,
          type: item.type as MediaType,
          width: item.width,
          height: item.height,
          duration: item.duration,
          createdById: admin.id,
        },
        create: {
          id: item.id,
          title: item.title,
          filename: item.filename,
          mimeType: item.mimeType,
          size: item.size,
          url: item.url,
          storageKey: item.storageKey,
          bucket: item.bucket,
          type: item.type as MediaType,
          width: item.width,
          height: item.height,
          duration: item.duration,
          createdById: admin.id,
        },
        select: { id: true },
      });
      mediaIdMap.set(item.id, saved.id);
    }

    if (payload.collections.settings) {
      const existing = await tx.settings.findUnique({ where: { id: payload.collections.settings.id } });
      const incoming = payload.collections.settings;
      const mergedMunicipalityProfile = deepMergeJson(
        existing?.municipalityProfile,
        incoming.municipalityProfile,
      );

      await tx.settings.upsert({
        where: { id: incoming.id },
        update: {
          siteName: incoming.siteName,
          branding: incoming.branding as Prisma.InputJsonValue,
          accessibility: incoming.accessibility as Prisma.InputJsonValue,
          contactEmail: incoming.contactEmail,
          contactPhone: incoming.contactPhone,
          address: (incoming.address ?? Prisma.JsonNull) as Prisma.InputJsonValue,
          municipalityProfile: mergedMunicipalityProfile,
        },
        create: {
          id: incoming.id,
          siteName: incoming.siteName,
          branding: incoming.branding as Prisma.InputJsonValue,
          accessibility: incoming.accessibility as Prisma.InputJsonValue,
          contactEmail: incoming.contactEmail,
          contactPhone: incoming.contactPhone,
          address: (incoming.address ?? Prisma.JsonNull) as Prisma.InputJsonValue,
          municipalityProfile: mergedMunicipalityProfile,
        },
      });
    }

    const articleIdBySource = new Map<string, string>();
    for (const item of payload.collections.articles) {
      const saved = await tx.article.upsert({
        where: { slug: item.slug },
        update: {
          title: item.title,
          summary: item.summary,
          content: item.content as Prisma.InputJsonValue,
          metaTitle: item.metaTitle,
          metaDescription: item.metaDescription,
          type: item.type as ArticleType,
          publicationType: item.publicationType as PublicationType | null,
          documentNumber: item.documentNumber,
          meetingDate: item.meetingDate,
          publicationYear: item.publicationYear,
          isFlash: item.isFlash,
          status: item.status as ContentStatus,
          publishedAt: item.publishedAt,
          scheduledAt: item.scheduledAt,
          coverMediaId: item.coverMediaId ? mediaIdMap.get(item.coverMediaId) ?? null : null,
          documentMediaId: item.documentMediaId ? mediaIdMap.get(item.documentMediaId) ?? null : null,
          updatedById: admin.id,
        },
        create: {
          id: item.id,
          title: item.title,
          slug: item.slug,
          summary: item.summary,
          content: item.content as Prisma.InputJsonValue,
          metaTitle: item.metaTitle,
          metaDescription: item.metaDescription,
          type: item.type as ArticleType,
          publicationType: item.publicationType as PublicationType | null,
          documentNumber: item.documentNumber,
          meetingDate: item.meetingDate,
          publicationYear: item.publicationYear,
          isFlash: item.isFlash,
          status: item.status as ContentStatus,
          publishedAt: item.publishedAt,
          scheduledAt: item.scheduledAt,
          coverMediaId: item.coverMediaId ? mediaIdMap.get(item.coverMediaId) ?? null : null,
          documentMediaId: item.documentMediaId ? mediaIdMap.get(item.documentMediaId) ?? null : null,
          createdById: admin.id,
          updatedById: admin.id,
        },
        select: { id: true },
      });
      articleIdBySource.set(item.id, saved.id);
    }

    const eventIdBySource = new Map<string, string>();
    for (const item of payload.collections.events) {
      const saved = await tx.event.upsert({
        where: { slug: item.slug },
        update: {
          title: item.title,
          summary: item.summary,
          content: item.content as Prisma.InputJsonValue,
          metaTitle: item.metaTitle,
          metaDescription: item.metaDescription,
          locationName: item.locationName,
          address: item.address,
          latitude: item.latitude,
          longitude: item.longitude,
          startsAt: item.startsAt,
          endsAt: item.endsAt,
          status: item.status as ContentStatus,
          publishedAt: item.publishedAt,
          scheduledAt: item.scheduledAt,
          coverMediaId: item.coverMediaId ? mediaIdMap.get(item.coverMediaId) ?? null : null,
          updatedById: admin.id,
        },
        create: {
          id: item.id,
          title: item.title,
          slug: item.slug,
          summary: item.summary,
          content: item.content as Prisma.InputJsonValue,
          metaTitle: item.metaTitle,
          metaDescription: item.metaDescription,
          locationName: item.locationName,
          address: item.address,
          latitude: item.latitude,
          longitude: item.longitude,
          startsAt: item.startsAt,
          endsAt: item.endsAt,
          status: item.status as ContentStatus,
          publishedAt: item.publishedAt,
          scheduledAt: item.scheduledAt,
          coverMediaId: item.coverMediaId ? mediaIdMap.get(item.coverMediaId) ?? null : null,
          createdById: admin.id,
          updatedById: admin.id,
        },
        select: { id: true },
      });
      eventIdBySource.set(item.id, saved.id);
    }

    const directoryIdBySource = new Map<string, string>();
    for (const item of payload.collections.directoryEntries) {
      const saved = await tx.directoryEntry.upsert({
        where: { slug: item.slug },
        update: {
          name: item.name,
          type: item.type as DirectoryType,
          description: item.description,
          phone: item.phone,
          email: item.email,
          website: item.website,
          addressLine1: item.addressLine1,
          addressLine2: item.addressLine2,
          postalCode: item.postalCode,
          city: item.city,
          country: item.country,
          latitude: item.latitude,
          longitude: item.longitude,
          openingHours: (item.openingHours ?? Prisma.JsonNull) as Prisma.InputJsonValue,
          status: item.status as ContentStatus,
          publishedAt: item.publishedAt,
          scheduledAt: item.scheduledAt,
          coverMediaId: item.coverMediaId ? mediaIdMap.get(item.coverMediaId) ?? null : null,
          updatedById: admin.id,
        },
        create: {
          id: item.id,
          name: item.name,
          slug: item.slug,
          type: item.type as DirectoryType,
          description: item.description,
          phone: item.phone,
          email: item.email,
          website: item.website,
          addressLine1: item.addressLine1,
          addressLine2: item.addressLine2,
          postalCode: item.postalCode,
          city: item.city,
          country: item.country,
          latitude: item.latitude,
          longitude: item.longitude,
          openingHours: (item.openingHours ?? Prisma.JsonNull) as Prisma.InputJsonValue,
          status: item.status as ContentStatus,
          publishedAt: item.publishedAt,
          scheduledAt: item.scheduledAt,
          coverMediaId: item.coverMediaId ? mediaIdMap.get(item.coverMediaId) ?? null : null,
          createdById: admin.id,
          updatedById: admin.id,
        },
        select: { id: true },
      });
      directoryIdBySource.set(item.id, saved.id);
    }

    const procedureIdBySource = new Map<string, string>();
    for (const item of payload.collections.procedures) {
      const saved = await tx.procedure.upsert({
        where: { slug: item.slug },
        update: {
          title: item.title,
          summary: item.summary,
          content: item.content as Prisma.InputJsonValue,
          steps: (item.steps ?? Prisma.JsonNull) as Prisma.InputJsonValue,
          externalUrl: item.externalUrl,
          status: item.status as ContentStatus,
          publishedAt: item.publishedAt,
          scheduledAt: item.scheduledAt,
          coverMediaId: item.coverMediaId ? mediaIdMap.get(item.coverMediaId) ?? null : null,
          updatedById: admin.id,
        },
        create: {
          id: item.id,
          title: item.title,
          slug: item.slug,
          summary: item.summary,
          content: item.content as Prisma.InputJsonValue,
          steps: (item.steps ?? Prisma.JsonNull) as Prisma.InputJsonValue,
          externalUrl: item.externalUrl,
          status: item.status as ContentStatus,
          publishedAt: item.publishedAt,
          scheduledAt: item.scheduledAt,
          coverMediaId: item.coverMediaId ? mediaIdMap.get(item.coverMediaId) ?? null : null,
          createdById: admin.id,
          updatedById: admin.id,
        },
        select: { id: true },
      });
      procedureIdBySource.set(item.id, saved.id);
    }

    for (const item of payload.collections.councilMembers) {
      await tx.councilMember.upsert({
        where: { id: item.id },
        update: {
          name: item.name,
          role: item.role as CouncilMemberRole,
          roleTitle: item.roleTitle,
          delegations: item.delegations,
          bio: item.bio,
          email: item.email,
          phone: item.phone,
          order: item.order,
          status: item.status as ContentStatus,
          publishedAt: item.publishedAt,
          scheduledAt: item.scheduledAt,
          photoMediaId: item.photoMediaId ? mediaIdMap.get(item.photoMediaId) ?? null : null,
          updatedById: admin.id,
        },
        create: {
          id: item.id,
          name: item.name,
          role: item.role as CouncilMemberRole,
          roleTitle: item.roleTitle,
          delegations: item.delegations,
          bio: item.bio,
          email: item.email,
          phone: item.phone,
          order: item.order,
          status: item.status as ContentStatus,
          publishedAt: item.publishedAt,
          scheduledAt: item.scheduledAt,
          photoMediaId: item.photoMediaId ? mediaIdMap.get(item.photoMediaId) ?? null : null,
          createdById: admin.id,
          updatedById: admin.id,
        },
      });
    }

    for (const item of payload.collections.municipalServices) {
      await tx.municipalService.upsert({
        where: { slug: item.slug },
        update: {
          name: item.name,
          description: item.description,
          category: item.category,
          openingHours: (item.openingHours ?? Prisma.JsonNull) as Prisma.InputJsonValue,
          address: item.address,
          phone: item.phone,
          email: item.email,
          website: item.website,
          order: item.order,
          status: item.status as ContentStatus,
          publishedAt: item.publishedAt,
          scheduledAt: item.scheduledAt,
          coverMediaId: item.coverMediaId ? mediaIdMap.get(item.coverMediaId) ?? null : null,
          updatedById: admin.id,
        },
        create: {
          id: item.id,
          name: item.name,
          slug: item.slug,
          description: item.description,
          category: item.category,
          openingHours: (item.openingHours ?? Prisma.JsonNull) as Prisma.InputJsonValue,
          address: item.address,
          phone: item.phone,
          email: item.email,
          website: item.website,
          order: item.order,
          status: item.status as ContentStatus,
          publishedAt: item.publishedAt,
          scheduledAt: item.scheduledAt,
          coverMediaId: item.coverMediaId ? mediaIdMap.get(item.coverMediaId) ?? null : null,
          createdById: admin.id,
          updatedById: admin.id,
        },
      });
    }

    for (const item of payload.collections.transportInfo) {
      await tx.transportInfo.upsert({
        where: { slug: item.slug },
        update: {
          title: item.title,
          summary: item.summary,
          content: item.content as Prisma.InputJsonValue,
          operator: item.operator,
          website: item.website,
          phone: item.phone,
          status: item.status as ContentStatus,
          publishedAt: item.publishedAt,
          scheduledAt: item.scheduledAt,
          coverMediaId: item.coverMediaId ? mediaIdMap.get(item.coverMediaId) ?? null : null,
          updatedById: admin.id,
        },
        create: {
          id: item.id,
          title: item.title,
          slug: item.slug,
          summary: item.summary,
          content: item.content as Prisma.InputJsonValue,
          operator: item.operator,
          website: item.website,
          phone: item.phone,
          status: item.status as ContentStatus,
          publishedAt: item.publishedAt,
          scheduledAt: item.scheduledAt,
          coverMediaId: item.coverMediaId ? mediaIdMap.get(item.coverMediaId) ?? null : null,
          createdById: admin.id,
          updatedById: admin.id,
        },
      });
    }

    const articleRelations = new Map<string, ExportedRelationRow[]>();
    for (const row of payload.collections.articleMedia) {
      const nextParentId = articleIdBySource.get(row.parentId);
      const nextMediaId = mediaIdMap.get(row.mediaId);
      if (!nextParentId || !nextMediaId) continue;
      const bucket = articleRelations.get(nextParentId) ?? [];
      bucket.push({ parentId: nextParentId, mediaId: nextMediaId, order: row.order });
      articleRelations.set(nextParentId, bucket);
    }

    const eventRelations = new Map<string, ExportedRelationRow[]>();
    for (const row of payload.collections.eventMedia) {
      const nextParentId = eventIdBySource.get(row.parentId);
      const nextMediaId = mediaIdMap.get(row.mediaId);
      if (!nextParentId || !nextMediaId) continue;
      const bucket = eventRelations.get(nextParentId) ?? [];
      bucket.push({ parentId: nextParentId, mediaId: nextMediaId, order: row.order });
      eventRelations.set(nextParentId, bucket);
    }

    const directoryRelations = new Map<string, ExportedRelationRow[]>();
    for (const row of payload.collections.directoryEntryMedia) {
      const nextParentId = directoryIdBySource.get(row.parentId);
      const nextMediaId = mediaIdMap.get(row.mediaId);
      if (!nextParentId || !nextMediaId) continue;
      const bucket = directoryRelations.get(nextParentId) ?? [];
      bucket.push({ parentId: nextParentId, mediaId: nextMediaId, order: row.order });
      directoryRelations.set(nextParentId, bucket);
    }

    const procedureRelations = new Map<string, ExportedRelationRow[]>();
    for (const row of payload.collections.procedureMedia) {
      const nextParentId = procedureIdBySource.get(row.parentId);
      const nextMediaId = mediaIdMap.get(row.mediaId);
      if (!nextParentId || !nextMediaId) continue;
      const bucket = procedureRelations.get(nextParentId) ?? [];
      bucket.push({ parentId: nextParentId, mediaId: nextMediaId, order: row.order });
      procedureRelations.set(nextParentId, bucket);
    }

    for (const [parentId, rows] of articleRelations) {
      await replaceImportedRelations(tx, 'articleMedia', parentId, rows);
    }
    for (const [parentId, rows] of eventRelations) {
      await replaceImportedRelations(tx, 'eventMedia', parentId, rows);
    }
    for (const [parentId, rows] of directoryRelations) {
      await replaceImportedRelations(tx, 'directoryEntryMedia', parentId, rows);
    }
    for (const [parentId, rows] of procedureRelations) {
      await replaceImportedRelations(tx, 'procedureMedia', parentId, rows);
    }
  });

  return {
    success: true,
    dryRun: false,
    mode: options.mode,
    file: filePath,
    adminEmail: admin.email,
    schemaVersion: payload.schemaVersion,
    counts: {
      source: counts,
      imported: counts,
    },
    media: {
      buckets: mediaBuckets,
      storageKeys: mediaKeys,
      note: 'JSON import restores media metadata only. Copy MinIO objects separately before or after import.',
    },
  };
}

export function parseImportOptions(argv: string[]): ImportOptions {
  let file: string | undefined;
  let dryRun = false;
  let mode: ImportMode = 'merge';
  let adminEmail: string | undefined;
  let confirmReplace: string | undefined;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--file') {
      file = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === '--dry-run') {
      dryRun = true;
      continue;
    }
    if (arg === '--replace') {
      mode = 'replace';
      continue;
    }
    if (arg === '--admin-email') {
      adminEmail = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === '--confirm-replace') {
      confirmReplace = argv[index + 1];
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return {
    file,
    dryRun,
    mode,
    adminEmail,
    confirmReplace,
  };
}
