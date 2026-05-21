import {
  ArticleType,
  ContentStatus,
  Prisma,
  PrismaClient,
  PublicationType,
} from '@prisma/client';

type JsonRecord = Record<string, unknown>;
type JsonArray = unknown[];

type LegacyLink = {
  label: string;
  url: string;
  description: string;
  priority: number;
  sourceLabel: string;
  sourceUrl: string;
  importedAt: string;
};

type LegacyDocument = {
  title: string;
  description: string;
  url?: string;
  priority: number;
  sourceLabel: string;
  sourceUrl: string;
  importedAt: string;
};

type LegacyProcedureSeed = {
  title: string;
  slug: string;
  summary: string;
  content: string;
  externalUrl: string;
};

type LegacyPublicationSeed = {
  title: string;
  slug: string;
  summary: string;
  publicationType: PublicationType;
  documentNumber?: string;
  publicationYear?: number;
  meetingDate?: Date;
  sourceUrl: string;
  attachmentUrl?: string;
};

const prisma = new PrismaClient();

const SOURCE_LABEL = 'Ancien site communal / LaPageLocale';
const SOURCE_URL = 'https://lapagelocale.fr/95840-villiers-adam';
const LEGACY_INSEE = '95678';

const LEGACY_USEFUL_LINKS: Omit<LegacyLink, 'sourceLabel' | 'sourceUrl' | 'importedAt'>[] = [
  {
    label: 'Vos démarches / Service-public',
    url: 'https://www.service-public.fr/',
    description: 'Démarches administratives nationales, selon le lien public affiché sur l’ancien site communal.',
    priority: 10,
  },
  {
    label: 'Payez en ligne / PayFip',
    url: 'https://www.tipi.budget.gouv.fr',
    description: 'Paiement en ligne des services publics, selon le lien public affiché sur l’ancien site communal.',
    priority: 20,
  },
  {
    label: 'Enquête publique PLU',
    url: 'https://drive.google.com/file/d/1TRAUoobxeWon4K9nr0eMoLdJtCr2GrFp/view?usp=sharing',
    description: 'Dossier public relaye sur l’ancien site communal pour l’enquête publique PLU 2025.',
    priority: 30,
  },
  {
    label: 'Portail Geosphere',
    url: 'https://oisetroisforets.geosphere.fr/guichet-unique',
    description: 'Accès au portail Geosphere mentionné sur l’ancien site communal.',
    priority: 40,
  },
  {
    label: 'Enfance et jeunesse / Portail Familles',
    url: 'https://portail.berger-levrault.fr/MairieVilliersAdam95840/accueil',
    description: 'Portail familles relayé sur l’ancien site communal.',
    priority: 50,
  },
  {
    label: 'Publications administratives (archive legacy)',
    url: 'https://lapagelocale.fr/getPosts.php?insee=95678&group=16&cgroup=-1&f=0&c=20',
    description: 'Archive publique des publications administratives sur l’ancien site communal.',
    priority: 60,
  },
];

const LEGACY_DOCUMENTS: Omit<LegacyDocument, 'sourceLabel' | 'sourceUrl' | 'importedAt'>[] = [
  {
    title: 'Horaires mairie (archive legacy)',
    description:
      'Horaires publiés sur l’ancien site communal : lundi et jeudi 9h-12h / 14h-17h ; mercredi et samedi 10h-12h ; mardi et vendredi fermés ; samedi matin fermé en juillet/août. Ce relevé est conservé comme repère documentaire et doit être revérifié avant toute mise à jour des horaires canoniques.',
    url: 'https://lapagelocale.fr/getPosts.php?insee=95678&group=15&cgroup=9&f=0&c=10',
    priority: 10,
  },
  {
    title: 'Agence postale communale (archive legacy)',
    description:
      'Horaires publiés sur l’ancien site communal : lundi et jeudi 9h-12h / 14h-17h ; mercredi et samedi 10h-12h ; mardi et vendredi fermés ; samedi matin fermé en juillet/août. Mention spécifique : le mercredi, uniquement retrait colis et recommandé. Ce relevé est conservé comme repère documentaire et doit être revérifié avant toute mise à jour canonique.',
    url: 'https://lapagelocale.fr/getPosts.php?insee=95678&group=15&cgroup=9&f=0&c=10',
    priority: 20,
  },
];

const LEGACY_PROCEDURES: LegacyProcedureSeed[] = [
  {
    title: 'Vos démarches / Service-public',
    slug: 'vos-demarches-service-public',
    summary:
      'Accès direct au portail national Service-Public.fr, relayé sur l’ancien site communal comme point d’entrée pour les démarches des habitants.',
    content: `<p>Cette démarche renvoie vers le portail national Service-Public.fr, mis en avant sur l’ancien site communal pour orienter les habitants vers les démarches administratives courantes.</p><p>Source : <a href="${SOURCE_URL}" target="_blank" rel="noopener noreferrer">${SOURCE_LABEL}</a></p>`,
    externalUrl: 'https://www.service-public.fr/',
  },
  {
    title: 'Payez en ligne / PayFip',
    slug: 'payez-en-ligne-payfip',
    summary:
      'Accès direct au service de paiement en ligne PayFiP, relayé sur l’ancien site communal.',
    content: `<p>Cette démarche renvoie vers le service de paiement en ligne PayFiP, affiché sur l’ancien site communal pour le règlement en ligne.</p><p>Source : <a href="${SOURCE_URL}" target="_blank" rel="noopener noreferrer">${SOURCE_LABEL}</a></p>`,
    externalUrl: 'https://www.tipi.budget.gouv.fr',
  },
];

const LEGACY_PUBLICATIONS: LegacyPublicationSeed[] = [
  {
    title: 'Conseil municipal du 27 avril 2026',
    slug: 'conseil-municipal-du-27-avril-2026',
    summary:
      'Compte-rendu et pièces liées à la séance du conseil municipal du 27 avril 2026, confirmés sur l’ancien site communal.',
    publicationType: PublicationType.COMPTE_RENDU,
    publicationYear: 2026,
    meetingDate: new Date('2026-04-27T20:30:00+02:00'),
    sourceUrl: 'https://lapagelocale.fr/getPosts.php?insee=95678&group=7&cgroup=0&f=0&c=10',
  },
  {
    title: 'Arrêté temporaire 2026/22T',
    slug: 'arrete-temporaire-2026-22t',
    summary:
      'Arrêté temporaire confirmé sur l’ancien site communal concernant circulation et stationnement au 9 rue Paul Bert.',
    publicationType: PublicationType.ARRETE,
    documentNumber: '2026/22T',
    publicationYear: 2026,
    sourceUrl: 'https://lapagelocale.fr/getPosts.php?index=80624',
    attachmentUrl: buildLegacyAttachmentUrl(
      'Arrete_2026_22T_9_rue_Paul_Bert_Circulation_et_stationnement.pdf',
    ),
  },
  {
    title: 'Arrêté préfectoral campagne de chasse 2026 - 2027',
    slug: 'arrete-prefectoral-campagne-de-chasse-2026-2027',
    summary:
      'Publication administrative confirmée sur l’ancien site communal relative à la campagne de chasse 2026-2027. Le numéro exact de l’arrêté présente une divergence entre le texte et le nom de fichier legacy ; il n’est donc pas normalisé ici.',
    publicationType: PublicationType.ARRETE,
    publicationYear: 2026,
    sourceUrl: 'https://lapagelocale.fr/getPosts.php?insee=95678&group=16&cgroup=-1&f=0&c=20',
    attachmentUrl: buildLegacyAttachmentUrl('AP_2026-18575_Chasse_ouverture_generale_correction.pdf'),
  },
];

function buildLegacyAttachmentUrl(filename: string) {
  return `https://lapagelocale.fr/imgcom/${LEGACY_INSEE}/${filename}`;
}

function asRecord(value: unknown): JsonRecord {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as JsonRecord;
  }
  return {};
}

function asArray(value: unknown): JsonArray {
  return Array.isArray(value) ? value : [];
}

function toInputJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function isObjectItem(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function upsertByStringKey<T extends JsonRecord>(
  current: unknown,
  incoming: T[],
  key: keyof T,
): T[] {
  const keyName = String(key);
  const next = new Map<string, T>();

  for (const item of asArray(current)) {
    if (!isObjectItem(item)) continue;
    const itemKey = item[keyName];
    if (typeof itemKey !== 'string' || itemKey.trim().length === 0) continue;
    next.set(itemKey, item as T);
  }

  for (const item of incoming) {
    next.set(String(item[key]), item);
  }

  return Array.from(next.values()).sort((a, b) => {
    const aPriority = typeof a.priority === 'number' ? a.priority : 0;
    const bPriority = typeof b.priority === 'number' ? b.priority : 0;
    return aPriority - bPriority;
  });
}

function buildLegacyLinks(nowIso: string): LegacyLink[] {
  return LEGACY_USEFUL_LINKS.map((item) => ({
    ...item,
    sourceLabel: SOURCE_LABEL,
    sourceUrl: SOURCE_URL,
    importedAt: nowIso,
  }));
}

function buildLegacyDocuments(nowIso: string): LegacyDocument[] {
  return LEGACY_DOCUMENTS.map((item) => ({
    ...item,
    sourceLabel: SOURCE_LABEL,
    sourceUrl: SOURCE_URL,
    importedAt: nowIso,
  }));
}

function buildLegacyMetadata(nowIso: string): JsonRecord {
  return {
    sourceLabel: SOURCE_LABEL,
    sourceUrl: SOURCE_URL,
    importedAt: nowIso,
    note: 'Contenu d’archive importé à titre informatif et éditable. Vérification municipale recommandée avant modification des données canoniques.',
  };
}

function mergeInfosPratiques(current: JsonRecord, nowIso: string): JsonRecord {
  return {
    ...current,
    usefulLinks: upsertByStringKey(current.usefulLinks, buildLegacyLinks(nowIso), 'label'),
    documents: upsertByStringKey(current.documents, buildLegacyDocuments(nowIso), 'title'),
    legacySource: buildLegacyMetadata(nowIso),
    updatedAt: nowIso,
  };
}

async function resolveActorId() {
  const superAdmin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' },
    orderBy: { createdAt: 'asc' },
  });

  if (superAdmin) {
    return superAdmin.id;
  }

  const fallback = await prisma.user.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  if (!fallback) {
    throw new Error('No user found in database. Create an admin user before importing legacy content.');
  }

  return fallback.id;
}

function buildOpeningHours() {
  return {
    monday: [{ opensAt: '09:00', closesAt: '12:00' }, { opensAt: '14:00', closesAt: '17:00' }],
    tuesday: [],
    wednesday: [{ opensAt: '10:00', closesAt: '12:00' }],
    thursday: [{ opensAt: '09:00', closesAt: '12:00' }, { opensAt: '14:00', closesAt: '17:00' }],
    friday: [],
    saturday: [{ opensAt: '10:00', closesAt: '12:00' }],
    sunday: [],
    notes: ['Ferme le samedi matin en juillet/aout.'],
  };
}

function buildPostalOpeningHours() {
  return {
    ...buildOpeningHours(),
    notes: [
      'Ferme le samedi matin en juillet/aout.',
      'Le mercredi, uniquement retrait colis et recommande.',
    ],
  };
}

async function updateMunicipalServices(actorId: string) {
  const commonWebsite = SOURCE_URL;

  const mairie = await prisma.municipalService.findUnique({
    where: { slug: 'accueil-mairie' },
  });

  if (mairie) {
    await prisma.municipalService.update({
      where: { id: mairie.id },
      data: {
        phone: mairie.phone || '01 34 69 28 17',
        website: mairie.website || commonWebsite,
        openingHours: toInputJson(buildOpeningHours()),
        description:
          mairie.description ||
          'Horaires historiques issus de l’ancien site communal, conservés à titre informatif. Vérification municipale recommandée avant toute mise à jour des horaires canoniques.',
        updatedById: actorId,
      },
    });
  }

  const postal = await prisma.municipalService.findUnique({
    where: { slug: 'agence-postale-communale' },
  });

  if (postal) {
    await prisma.municipalService.update({
      where: { id: postal.id },
      data: {
        phone: postal.phone || '01 34 69 28 17',
        website: postal.website || commonWebsite,
        openingHours: toInputJson(buildPostalOpeningHours()),
        description:
          postal.description ||
          'Horaires historiques issus de l’ancien site communal, conservés à titre informatif. Le mercredi, retrait colis et recommande uniquement selon la source legacy.',
        updatedById: actorId,
      },
    });
  }
}

async function upsertProcedures(actorId: string) {
  for (const item of LEGACY_PROCEDURES) {
    await prisma.procedure.upsert({
      where: { slug: item.slug },
      create: {
        title: item.title,
        slug: item.slug,
        summary: item.summary,
        content: item.content,
        externalUrl: item.externalUrl,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        createdById: actorId,
        updatedById: actorId,
      },
      update: {
        title: item.title,
        summary: item.summary,
        content: item.content,
        externalUrl: item.externalUrl,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        updatedById: actorId,
      },
    });
  }
}

function buildPublicationContent(item: LegacyPublicationSeed) {
  const lines = [`<p>${item.summary}</p>`];
  lines.push(
    `<p>Source archive : <a href="${item.sourceUrl}" target="_blank" rel="noopener noreferrer">${SOURCE_LABEL}</a></p>`,
  );
  if (item.attachmentUrl) {
    lines.push(
      `<p><a href="${item.attachmentUrl}" target="_blank" rel="noopener noreferrer">Consulter le document joint archive</a></p>`,
    );
  }
  return lines.join('');
}

async function upsertPublications(actorId: string) {
  for (const item of LEGACY_PUBLICATIONS) {
    await prisma.article.upsert({
      where: { slug: item.slug },
      create: {
        title: item.title,
        slug: item.slug,
        summary: item.summary,
        content: buildPublicationContent(item),
        type: ArticleType.PUBLICATION,
        publicationType: item.publicationType,
        documentNumber: item.documentNumber || null,
        publicationYear: item.publicationYear || null,
        meetingDate: item.meetingDate || null,
        isFlash: false,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        createdById: actorId,
        updatedById: actorId,
      },
      update: {
        title: item.title,
        summary: item.summary,
        content: buildPublicationContent(item),
        type: ArticleType.PUBLICATION,
        publicationType: item.publicationType,
        documentNumber: item.documentNumber || null,
        publicationYear: item.publicationYear || null,
        meetingDate: item.meetingDate || null,
        isFlash: false,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        updatedById: actorId,
      },
    });
  }
}

async function updateSettings(nowIso: string) {
  const settings = await prisma.settings.findUnique({
    where: { id: 'default' },
  });

  if (!settings) {
    throw new Error('Settings row id=default missing. Run base seed first.');
  }

  const currentProfile = asRecord(settings.municipalityProfile);
  const currentVieQuotidienne = asRecord(currentProfile.vieQuotidienne);
  const currentInfosPratiques = asRecord(currentVieQuotidienne.infosPratiques);

  const nextProfile: JsonRecord = {
    ...currentProfile,
    vieQuotidienne: {
      ...currentVieQuotidienne,
      infosPratiques: mergeInfosPratiques(currentInfosPratiques, nowIso),
    },
  };

  await prisma.settings.update({
    where: { id: 'default' },
    data: {
      municipalityProfile: toInputJson(nextProfile),
    },
  });
}

async function main() {
  const actorId = await resolveActorId();
  const nowIso = new Date().toISOString();

  await updateSettings(nowIso);
  await updateMunicipalServices(actorId);
  await upsertProcedures(actorId);
  await upsertPublications(actorId);

  console.log('Legacy LaPageLocale content seed completed.');
  console.log('- infosPratiques enriched');
  console.log('- municipal services updated');
  console.log('- procedures upserted');
  console.log('- publications upserted');
  console.log('- flash content untouched');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
