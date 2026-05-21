import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

import {
  ArticleType,
  ContentStatus,
  MediaType,
  Prisma,
  PrismaClient,
} from '@prisma/client';
import { Client as MinioClient } from 'minio';

type PriorityLevel = 'high' | 'medium';

type DemoImageSpec = {
  key: string;
  relativePath: string;
  title: string;
};

type EventSeedSpec = {
  title: string;
  slug: string;
  summary: string;
  contentHtml: string;
  startsAt: string;
  endsAt: string;
  locationName: string;
  address: string;
  imageKey: string;
};

type FlashArticleSeedSpec = {
  title: string;
  slug: string;
  summary: string;
  contentHtml: string;
  priority: PriorityLevel;
  imageKey: string;
};

type UpsertResult = {
  title: string;
  slug: string;
  action: 'created' | 'updated';
  imagePath: string;
};

const prisma = new PrismaClient();

const IMAGE_SPECS: DemoImageSpec[] = [
  {
    key: 'mairie-village',
    relativePath: 'apps/web/public/images/mairie-villiers-adam.jpg',
    title: 'Mairie de Villiers-Adam',
  },
  {
    key: 'lavoir',
    relativePath: 'apps/web/public/images/lavoir.jpg',
    title: 'Lavoir de Villiers-Adam',
  },
  {
    key: 'chemin',
    relativePath: 'apps/web/public/images/chemin.jpg',
    title: 'Chemin de Villiers-Adam',
  },
  {
    key: 'ancienne-mairie',
    relativePath: 'apps/web/public/images/vieux_villiers-adam/ancienne-mairie.jpg',
    title: 'Ancienne mairie - archives',
  },
  {
    key: 'ecole-neige',
    relativePath: 'apps/web/public/images/ecole_neige.jpg',
    title: 'Ecole de Villiers-Adam',
  },
  {
    key: 'rue-bethemont',
    relativePath: 'apps/web/public/images/vieux_villiers-adam/rue_de_bethemont.jpg',
    title: 'Rue de Bethemont - archives',
  },
  {
    key: 'villiers1',
    relativePath: 'apps/web/public/images/villiers1.jpg',
    title: 'Vue de Villiers-Adam',
  },
];

const DEMO_EVENTS: EventSeedSpec[] = [
  {
    title: 'Fête de la Saint-Jean',
    slug: 'fete-de-la-saint-jean-2026',
    summary:
      "Une soirée conviviale au cœur du village avec animations, musique et restauration sur place. Un rendez-vous familial pour célébrer l’arrivée de l’été à Villiers-Adam.",
    contentHtml:
      '<p>Une soirée conviviale au cœur du village avec animations, musique et restauration sur place.</p><p>Un rendez-vous familial pour célébrer l’arrivée de l’été à Villiers-Adam.</p><p><strong>Catégories :</strong> festive, commune, culture.</p>',
    startsAt: '2026-06-22T19:00:00+02:00',
    endsAt: '2026-06-22T23:30:00+02:00',
    locationName: 'Place de la Mairie',
    address: 'Place de la Mairie, 95840 Villiers-Adam',
    imageKey: 'mairie-village',
  },
  {
    title: 'Cinéma plein air au village',
    slug: 'cinema-plein-air-village-2026',
    summary:
      'Projection familiale en plein air à la tombée de la nuit. Les habitants sont invités à venir avec plaids et chaises pliantes pour profiter d’un moment convivial.',
    contentHtml:
      '<p>Projection familiale en plein air à la tombée de la nuit.</p><p>Les habitants sont invités à venir avec plaids et chaises pliantes pour profiter d’un moment convivial.</p><p><strong>Catégories :</strong> culture, famille.</p>',
    startsAt: '2026-07-12T21:30:00+02:00',
    endsAt: '2026-07-12T23:45:00+02:00',
    locationName: 'Esplanade du Lavoir',
    address: 'Esplanade du Lavoir, 95840 Villiers-Adam',
    imageKey: 'lavoir',
  },
  {
    title: 'Marché d’été des producteurs',
    slug: 'marche-ete-producteurs-2026',
    summary:
      'Producteurs locaux, artisanat, dégustations et animations pour petits et grands. Une journée pour découvrir les savoir-faire du territoire.',
    contentHtml:
      '<p>Producteurs locaux, artisanat, dégustations et animations pour petits et grands.</p><p>Une journée pour découvrir les savoir-faire du territoire.</p><p><strong>Catégories :</strong> marché, vie locale.</p>',
    startsAt: '2026-07-27T10:00:00+02:00',
    endsAt: '2026-07-27T18:00:00+02:00',
    locationName: 'Place du Village',
    address: 'Centre-bourg, 95840 Villiers-Adam',
    imageKey: 'chemin',
  },
  {
    title: 'Forum des associations',
    slug: 'forum-des-associations-2026',
    summary:
      'Rencontre avec les associations locales, découverte des activités proposées et inscriptions pour la nouvelle saison.',
    contentHtml:
      '<p>Rencontre avec les associations locales, découverte des activités proposées et inscriptions pour la nouvelle saison.</p><p><strong>Catégories :</strong> associations, sport, culture.</p>',
    startsAt: '2026-09-07T09:30:00+02:00',
    endsAt: '2026-09-07T17:00:00+02:00',
    locationName: 'Salle communale',
    address: 'Salle communale, 95840 Villiers-Adam',
    imageKey: 'ancienne-mairie',
  },
  {
    title: 'Marché de Noël de Villiers-Adam',
    slug: 'marche-de-noel-villiers-adam-2026',
    summary:
      'Stands artisanaux, gourmandises, animations enfants et ambiance festive pour préparer les fêtes de fin d’année.',
    contentHtml:
      '<p>Stands artisanaux, gourmandises, animations enfants et ambiance festive pour préparer les fêtes de fin d’année.</p><p><strong>Catégories :</strong> fêtes, famille.</p>',
    startsAt: '2026-12-14T10:00:00+01:00',
    endsAt: '2026-12-14T19:00:00+01:00',
    locationName: 'Place de la Mairie',
    address: 'Place de la Mairie, 95840 Villiers-Adam',
    imageKey: 'villiers1',
  },
];

const DEMO_FLASH_ARTICLES: FlashArticleSeedSpec[] = [
  {
    title: 'Travaux chemin du Bord’Haut : circulation alternée',
    slug: 'travaux-chemin-du-bord-haut-circulation-alternee',
    summary:
      'Des travaux ponctuels entraînent une circulation alternée. Merci de respecter la signalisation mise en place.',
    contentHtml:
      '<p>La commune informe les habitants que des travaux ponctuels peuvent perturber la circulation chemin du Bord’Haut.</p><p>Une signalisation temporaire est mise en place afin de sécuriser les déplacements.</p><p>Merci de votre compréhension.</p>',
    priority: 'high',
    imageKey: 'chemin',
  },
  {
    title: 'Menu scolaire de la semaine disponible',
    slug: 'menu-scolaire-de-la-semaine-disponible',
    summary:
      'Le menu de la restauration scolaire est disponible dans la rubrique École.',
    contentHtml:
      '<p>Les familles peuvent consulter le menu hebdomadaire de la restauration scolaire depuis la rubrique École du site communal.</p><p>Les informations sont mises à jour régulièrement.</p>',
    priority: 'medium',
    imageKey: 'ecole-neige',
  },
  {
    title: 'Vigilance météo : fortes chaleurs',
    slug: 'vigilance-meteo-fortes-chaleurs',
    summary:
      'En période de chaleur, pensez à vous hydrater et à prendre des nouvelles des personnes fragiles.',
    contentHtml:
      '<p>En cas de fortes chaleurs, la commune rappelle les bons gestes : boire régulièrement, éviter les efforts aux heures les plus chaudes, fermer volets et fenêtres en journée, et prendre des nouvelles des personnes isolées.</p>',
    priority: 'high',
    imageKey: 'villiers1',
  },
  {
    title: 'Collecte des déchets verts : rappel du calendrier',
    slug: 'collecte-des-dechets-verts-rappel-du-calendrier',
    summary:
      'La prochaine collecte des déchets verts aura lieu selon le calendrier communal.',
    contentHtml:
      '<p>La commune rappelle aux habitants de consulter les informations pratiques afin de connaître les modalités et dates de collecte des déchets verts.</p><p>Merci de sortir les déchets uniquement aux horaires autorisés.</p>',
    priority: 'medium',
    imageKey: 'rue-bethemont',
  },
  {
    title: 'Réunion publique en mairie',
    slug: 'reunion-publique-en-mairie',
    summary:
      'Une réunion d’information aura lieu en mairie concernant les projets communaux en cours.',
    contentHtml:
      '<p>Les habitants sont invités à une réunion publique en mairie afin d’échanger sur les projets communaux en cours et les prochaines actions prévues pour le village.</p>',
    priority: 'high',
    imageKey: 'mairie-village',
  },
];

const ROOT_DIR = path.resolve(__dirname, '..', '..', '..');

function fileExtension(value: string) {
  const ext = path.extname(value).toLowerCase();
  return ext === '.jpeg' ? '.jpg' : ext;
}

function mimeTypeFromPath(filePath: string) {
  const ext = fileExtension(filePath);
  if (ext === '.jpg') return 'image/jpeg';
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  throw new Error(`Unsupported image extension for demo media: ${filePath}`);
}

function fileNameFromPath(filePath: string) {
  return path.basename(filePath).replace(/\s+/g, '-');
}

function storageKeyForDemoMedia(relativePath: string, contentHash: string) {
  const normalized = relativePath
    .replace(/^apps\/web\/public\//, '')
    .replace(/\\/g, '/')
    .toLowerCase();

  return `demo-content/${contentHash.slice(0, 12)}-${normalized}`;
}

function assertEnv(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function buildMinioClient() {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const endPoint = assertEnv('MINIO_ENDPOINT', nodeEnv === 'production' ? undefined : 'localhost');
  const port = Number(process.env.MINIO_PORT ?? 9000);
  const accessKey = assertEnv(
    'MINIO_ACCESS_KEY',
    nodeEnv === 'production' ? undefined : 'minio_dev_access',
  );
  const secretKey = assertEnv(
    'MINIO_SECRET_KEY',
    nodeEnv === 'production' ? undefined : 'minio_dev_secret',
  );
  const useSSL = (process.env.MINIO_USE_SSL ?? 'false').toLowerCase() === 'true';

  return new MinioClient({
    endPoint,
    port,
    accessKey,
    secretKey,
    useSSL,
  });
}

async function resolveActorId() {
  const superAdmin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' },
    orderBy: { createdAt: 'asc' },
  });

  if (superAdmin) {
    return superAdmin.id;
  }

  const firstUser = await prisma.user.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  if (!firstUser) {
    throw new Error('No user found. Seed admin user before seeding demo content.');
  }

  return firstUser.id;
}

async function ensureDemoMedia(actorId: string) {
  const minioClient = buildMinioClient();
  const bucket = process.env.MINIO_BUCKET ?? 'mairie-media';
  const bucketExists = await minioClient.bucketExists(bucket).catch(() => false);

  if (!bucketExists) {
    await minioClient.makeBucket(bucket, 'fr-par');
  }

  const mediaByKey = new Map<string, { id: string; publicPath: string }>();

  for (const spec of IMAGE_SPECS) {
    const absolutePath = path.resolve(ROOT_DIR, spec.relativePath);
    const fileBuffer = await fs.readFile(absolutePath);
    const hash = createHash('sha256').update(fileBuffer).digest('hex');
    const storageKey = storageKeyForDemoMedia(spec.relativePath, hash);
    const filename = fileNameFromPath(spec.relativePath);
    const mimeType = mimeTypeFromPath(spec.relativePath);
    const size = fileBuffer.length;

    await minioClient.putObject(bucket, storageKey, fileBuffer, size, {
      'Content-Type': mimeType,
      'X-Amz-Meta-Source': 'demo-content-seed',
    });

    const media = await prisma.media.upsert({
      where: { storageKey },
      update: {
        title: spec.title,
        filename,
        mimeType,
        size,
        url: `/media/public/${storageKey}`,
        bucket,
        type: MediaType.IMAGE,
        createdById: actorId,
      },
      create: {
        title: spec.title,
        filename,
        mimeType,
        size,
        url: `/media/public/${storageKey}`,
        storageKey,
        bucket,
        type: MediaType.IMAGE,
        createdById: actorId,
      },
      select: {
        id: true,
      },
    });

    mediaByKey.set(spec.key, {
      id: media.id,
      publicPath: spec.relativePath.replace(/^apps\/web\/public\//, '/'),
    });
  }

  return mediaByKey;
}

function ensureImage(
  mediaByKey: Map<string, { id: string; publicPath: string }>,
  imageKey: string,
) {
  const media = mediaByKey.get(imageKey);
  if (!media) {
    throw new Error(`Missing demo image mapping for key: ${imageKey}`);
  }
  return media;
}

async function upsertDemoEvents(
  actorId: string,
  mediaByKey: Map<string, { id: string; publicPath: string }>,
) {
  const results: UpsertResult[] = [];

  for (const spec of DEMO_EVENTS) {
    const image = ensureImage(mediaByKey, spec.imageKey);
    const existing = await prisma.event.findFirst({
      where: {
        OR: [{ title: spec.title }, { slug: spec.slug }],
      },
      select: { id: true },
    });

    const data: Prisma.EventUncheckedCreateInput = {
      title: spec.title,
      slug: spec.slug,
      summary: spec.summary,
      content: spec.contentHtml,
      metaTitle: spec.title,
      metaDescription: `${spec.summary} (Contenu de démonstration.)`,
      locationName: spec.locationName,
      address: spec.address,
      startsAt: new Date(spec.startsAt),
      endsAt: new Date(spec.endsAt),
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
      scheduledAt: null,
      coverMediaId: image.id,
      createdById: actorId,
      updatedById: actorId,
    };

    if (existing) {
      await prisma.event.update({
        where: { id: existing.id },
        data: {
          ...data,
          createdById: undefined,
        },
      });
      results.push({
        title: spec.title,
        slug: spec.slug,
        action: 'updated',
        imagePath: image.publicPath,
      });
    } else {
      await prisma.event.create({
        data,
      });
      results.push({
        title: spec.title,
        slug: spec.slug,
        action: 'created',
        imagePath: image.publicPath,
      });
    }
  }

  return results;
}

async function upsertDemoFlashArticles(
  actorId: string,
  mediaByKey: Map<string, { id: string; publicPath: string }>,
) {
  const results: UpsertResult[] = [];

  for (const spec of DEMO_FLASH_ARTICLES) {
    const image = ensureImage(mediaByKey, spec.imageKey);
    const existing = await prisma.article.findFirst({
      where: {
        OR: [{ title: spec.title }, { slug: spec.slug }],
      },
      select: { id: true },
    });

    const priorityLabel = spec.priority === 'high' ? 'Priorité haute' : 'Priorité moyenne';
    const data: Prisma.ArticleUncheckedCreateInput = {
      title: spec.title,
      slug: spec.slug,
      summary: spec.summary,
      content: spec.contentHtml,
      metaTitle: spec.title,
      metaDescription: `${spec.summary} (${priorityLabel} - contenu de démonstration.)`,
      type: ArticleType.ACTUALITE,
      publicationType: null,
      documentMediaId: null,
      documentNumber: null,
      meetingDate: null,
      publicationYear: 2026,
      isFlash: true,
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
      scheduledAt: null,
      coverMediaId: image.id,
      createdById: actorId,
      updatedById: actorId,
    };

    if (existing) {
      await prisma.article.update({
        where: { id: existing.id },
        data: {
          ...data,
          createdById: undefined,
        },
      });
      results.push({
        title: spec.title,
        slug: spec.slug,
        action: 'updated',
        imagePath: image.publicPath,
      });
    } else {
      await prisma.article.create({
        data,
      });
      results.push({
        title: spec.title,
        slug: spec.slug,
        action: 'created',
        imagePath: image.publicPath,
      });
    }
  }

  return results;
}

async function main() {
  const actorId = await resolveActorId();
  const mediaByKey = await ensureDemoMedia(actorId);
  const eventResults = await upsertDemoEvents(actorId, mediaByKey);
  const articleResults = await upsertDemoFlashArticles(actorId, mediaByKey);

  console.log('Demo content seed completed.');
  console.log('Events:');
  for (const result of eventResults) {
    console.log(`- [${result.action}] ${result.title} (${result.slug}) image=${result.imagePath}`);
  }

  console.log('Flash articles:');
  for (const result of articleResults) {
    console.log(`- [${result.action}] ${result.title} (${result.slug}) image=${result.imagePath}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
