import fs from 'node:fs';
import path from 'node:path';
import {
  ArticleType,
  ContentStatus,
  CouncilMemberRole,
  PrismaClient,
  PublicationType,
} from '@prisma/client';
import { slugify } from '@villiers-adam/shared';

type LegacySource = {
  sourceUrl?: string | null;
  importedFrom?: string;
  filename?: string;
  postIndex?: string;
  createdAt?: string | null;
};

type LegacyCouncilMember = {
  name: string;
  role: CouncilMemberRole;
  roleTitle?: string;
  delegations?: string;
  order?: number;
  source?: LegacySource;
};

type LegacyMunicipalService = {
  name: string;
  slug: string;
  description?: string;
  category?: string;
  order?: number;
  source?: LegacySource;
};

type LegacyProcedure = {
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  externalUrl?: string | null;
  source?: LegacySource;
};

type LegacyTransport = {
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  operator?: string;
  website?: string;
  phone?: string;
  source?: LegacySource;
};

type LegacyPublication = {
  title: string;
  slug: string;
  summary?: string;
  publicationType: PublicationType;
  publicationYear?: number | null;
  documentNumber?: string | null;
  sourceUrl?: string | null;
  legacyPath?: string;
  source?: LegacySource;
};

type LegacyPayload = {
  generatedAt: string;
  curated: {
    councilMembers: LegacyCouncilMember[];
    municipalServices: LegacyMunicipalService[];
    procedures: LegacyProcedure[];
    transports: LegacyTransport[];
    publications: LegacyPublication[];
  };
};

const prisma = new PrismaClient();

function resolveCuratedDataPath() {
  if (process.env.LEGACY_CURATED_FILE) {
    return path.resolve(process.cwd(), process.env.LEGACY_CURATED_FILE);
  }

  const candidates = [
    path.resolve(process.cwd(), 'old_villiers-adam_website_data/curated/legacy-curated-data.json'),
    path.resolve(
      process.cwd(),
      '../../old_villiers-adam_website_data/curated/legacy-curated-data.json',
    ),
  ];

  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    throw new Error(
      'Curated file not found. Provide LEGACY_CURATED_FILE or place legacy-curated-data.json in one of the expected curated directories.',
    );
  }

  return found;
}

function loadPayload(): LegacyPayload {
  const filepath = resolveCuratedDataPath();
  const raw = fs.readFileSync(filepath, 'utf8');
  return JSON.parse(raw) as LegacyPayload;
}

async function resolveActorId() {
  const superAdmin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' },
    orderBy: { createdAt: 'asc' },
  });

  if (superAdmin) return superAdmin.id;

  const fallbackUser = await prisma.user.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  if (!fallbackUser) {
    throw new Error('No user found in database. Create an admin user before importing legacy data.');
  }

  return fallbackUser.id;
}

function mergeSummaryWithSource(summary: string | undefined, source?: LegacySource) {
  if (summary?.trim()) {
    return summary.trim();
  }
  if (source?.sourceUrl) {
    return 'Contenu issu des archives municipales.';
  }
  return '';
}

function buildArticleContent(item: LegacyPublication) {
  const lines = [`<p>${item.summary || 'Publication importee depuis les archives historiques.'}</p>`];

  if (item.sourceUrl) {
    lines.push(
      `<p><a href="${item.sourceUrl}" target="_blank" rel="noopener noreferrer">Consulter le document source</a></p>`,
    );
  }
  if (item.legacyPath) {
    lines.push(`<p>Fichier archive local: ${item.legacyPath}</p>`);
  }

  return lines.join('');
}

function makeUniqueSlug(baseSlug: string, seen: Set<string>) {
  let slug = baseSlug || 'legacy-item';
  let index = 2;
  while (seen.has(slug)) {
    slug = `${baseSlug}-${index}`;
    index += 1;
  }
  seen.add(slug);
  return slug;
}

async function importCouncilMembers(actorId: string, items: LegacyCouncilMember[]) {
  let created = 0;
  let updated = 0;

  for (const item of items) {
    const existing = await prisma.councilMember.findFirst({
      where: {
        name: item.name,
        role: item.role,
      },
    });

    if (existing) {
      await prisma.councilMember.update({
        where: { id: existing.id },
        data: {
          roleTitle: item.roleTitle || null,
          delegations: item.delegations || null,
          order: item.order ?? existing.order,
          status: ContentStatus.PUBLISHED,
          publishedAt: existing.publishedAt || new Date(),
          updatedById: actorId,
        },
      });
      updated += 1;
    } else {
      await prisma.councilMember.create({
        data: {
          name: item.name,
          role: item.role,
          roleTitle: item.roleTitle || null,
          delegations: item.delegations || null,
          order: item.order ?? 0,
          status: ContentStatus.PUBLISHED,
          publishedAt: new Date(),
          createdById: actorId,
          updatedById: actorId,
        },
      });
      created += 1;
    }
  }

  return { created, updated };
}

async function importMunicipalServices(actorId: string, items: LegacyMunicipalService[]) {
  let created = 0;
  let updated = 0;
  const seenSlugs = new Set<string>();

  for (const item of items) {
    const rawSlug = slugify(item.slug || item.name) || 'service-municipal';
    const uniqueSlug = makeUniqueSlug(rawSlug, seenSlugs);
    const description = mergeSummaryWithSource(item.description, item.source);

    const existing = await prisma.municipalService.findUnique({ where: { slug: uniqueSlug } });
    await prisma.municipalService.upsert({
      where: { slug: uniqueSlug },
      create: {
        name: item.name,
        slug: uniqueSlug,
        description: description || null,
        category: item.category || null,
        order: item.order ?? 0,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        createdById: actorId,
        updatedById: actorId,
      },
      update: {
        name: item.name,
        description: description || null,
        category: item.category || null,
        order: item.order ?? 0,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        updatedById: actorId,
      },
    });

    if (existing) updated += 1;
    else created += 1;
  }

  return { created, updated };
}

async function importProcedures(actorId: string, items: LegacyProcedure[]) {
  let created = 0;
  let updated = 0;
  const seenSlugs = new Set<string>();

  for (const item of items) {
    const rawSlug = slugify(item.slug || item.title) || 'demarche-legacy';
    const uniqueSlug = makeUniqueSlug(rawSlug, seenSlugs);
    const summary = mergeSummaryWithSource(item.summary, item.source);
    const content = item.content || `<p>${summary || item.title}</p>`;

    const existing = await prisma.procedure.findUnique({ where: { slug: uniqueSlug } });
    await prisma.procedure.upsert({
      where: { slug: uniqueSlug },
      create: {
        title: item.title,
        slug: uniqueSlug,
        summary: summary || null,
        content,
        externalUrl: item.externalUrl || null,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        createdById: actorId,
        updatedById: actorId,
      },
      update: {
        title: item.title,
        summary: summary || null,
        content,
        externalUrl: item.externalUrl || null,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        updatedById: actorId,
      },
    });

    if (existing) updated += 1;
    else created += 1;
  }

  return { created, updated };
}

async function importTransports(actorId: string, items: LegacyTransport[]) {
  let created = 0;
  let updated = 0;
  const seenSlugs = new Set<string>();

  for (const item of items) {
    const rawSlug = slugify(item.slug || item.title) || 'transport-legacy';
    const uniqueSlug = makeUniqueSlug(rawSlug, seenSlugs);
    const summary = mergeSummaryWithSource(item.summary, item.source);
    const content = item.content || `<p>${summary || item.title}</p>`;

    const existing = await prisma.transportInfo.findUnique({ where: { slug: uniqueSlug } });
    await prisma.transportInfo.upsert({
      where: { slug: uniqueSlug },
      create: {
        title: item.title,
        slug: uniqueSlug,
        summary: summary || null,
        content,
        operator: item.operator || null,
        website: item.website || null,
        phone: item.phone || null,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        createdById: actorId,
        updatedById: actorId,
      },
      update: {
        title: item.title,
        summary: summary || null,
        content,
        operator: item.operator || null,
        website: item.website || null,
        phone: item.phone || null,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        updatedById: actorId,
      },
    });

    if (existing) updated += 1;
    else created += 1;
  }

  return { created, updated };
}

async function importPublications(actorId: string, items: LegacyPublication[]) {
  let created = 0;
  let updated = 0;
  const seenSlugs = new Set<string>();

  for (const item of items) {
    const rawSlug = slugify(item.slug || item.title) || 'publication-legacy';
    const uniqueSlug = makeUniqueSlug(rawSlug, seenSlugs);
    const summary = mergeSummaryWithSource(item.summary, item.source);
    const content = buildArticleContent(item);

    const existing = await prisma.article.findUnique({ where: { slug: uniqueSlug } });
    await prisma.article.upsert({
      where: { slug: uniqueSlug },
      create: {
        title: item.title,
        slug: uniqueSlug,
        summary: summary || null,
        content,
        type: ArticleType.PUBLICATION,
        publicationType: item.publicationType,
        documentNumber: item.documentNumber || null,
        publicationYear: item.publicationYear ?? null,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        createdById: actorId,
        updatedById: actorId,
      },
      update: {
        title: item.title,
        summary: summary || null,
        content,
        type: ArticleType.PUBLICATION,
        publicationType: item.publicationType,
        documentNumber: item.documentNumber || null,
        publicationYear: item.publicationYear ?? null,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        updatedById: actorId,
      },
    });

    if (existing) updated += 1;
    else created += 1;
  }

  return { created, updated };
}

async function main() {
  const payload = loadPayload();
  const actorId = await resolveActorId();

  console.log(`Importing legacy curated data generated at ${payload.generatedAt}`);

  const councilStats = await importCouncilMembers(actorId, payload.curated.councilMembers || []);
  const serviceStats = await importMunicipalServices(
    actorId,
    payload.curated.municipalServices || [],
  );
  const procedureStats = await importProcedures(actorId, payload.curated.procedures || []);
  const transportStats = await importTransports(actorId, payload.curated.transports || []);
  const publicationStats = await importPublications(actorId, payload.curated.publications || []);

  console.log('Legacy import complete.');
  console.log(`- CouncilMember: ${councilStats.created} created, ${councilStats.updated} updated`);
  console.log(`- MunicipalService: ${serviceStats.created} created, ${serviceStats.updated} updated`);
  console.log(`- Procedure: ${procedureStats.created} created, ${procedureStats.updated} updated`);
  console.log(`- TransportInfo: ${transportStats.created} created, ${transportStats.updated} updated`);
  console.log(`- Article(PUBLICATION): ${publicationStats.created} created, ${publicationStats.updated} updated`);
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
