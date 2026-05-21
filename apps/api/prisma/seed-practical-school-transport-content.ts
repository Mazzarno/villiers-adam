import { ContentStatus, Prisma, PrismaClient } from '@prisma/client';
import { slugify } from '@villiers-adam/shared';

type JsonRecord = Record<string, unknown>;

const prisma = new PrismaClient();

const infosPratiquesContent: JsonRecord = {
  title: 'Infos pratiques',
  intro:
    'Retrouvez les informations utiles du quotidien : numéros d’urgence, déchets, démarches courantes, règles de vie locale et liens pratiques. Les informations détaillées doivent être vérifiées et mises à jour régulièrement par la mairie.',
  emergencyNumbers: [
    {
      label: 'Urgence européenne',
      value: '112',
      description: 'Numéro d’urgence européen accessible gratuitement.',
      priority: 1,
    },
    {
      label: 'SAMU',
      value: '15',
      description: 'Urgences médicales.',
      priority: 2,
    },
    {
      label: 'Police / Gendarmerie',
      value: '17',
      description: 'Urgences liées à la sécurité des personnes et des biens.',
      priority: 3,
    },
    {
      label: 'Pompiers',
      value: '18',
      description: 'Incendie, accident, secours d’urgence.',
      priority: 4,
    },
    {
      label: 'Urgence SMS pour personnes sourdes ou malentendantes',
      value: '114',
      description: 'Numéro d’urgence accessible par SMS ou visio.',
      priority: 5,
    },
  ],
  waste: [
    {
      title: 'Collecte et tri des déchets',
      description:
        'La collecte et le traitement des déchets relèvent du Syndicat Tri-Or. Les habitants doivent se référer aux calendriers de collecte et aux consignes de tri communiqués par le syndicat.',
      linkUrl: 'https://tri-or.fr/',
      linkLabel: 'Consulter le site du Syndicat Tri-Or',
      priority: 1,
    },
    {
      title: 'Calendriers de collecte',
      description:
        'Les calendriers de collecte peuvent évoluer selon les périodes de l’année. La mairie peut publier ici les informations importantes ou renvoyer vers le calendrier officiel du Syndicat Tri-Or.',
      linkUrl: 'https://tri-or.fr/',
      linkLabel: 'Voir les calendriers de collecte',
      priority: 2,
    },
    {
      title: 'Déchetterie de Champagne-sur-Oise',
      description:
        'Déchetterie située ZA du Paradis, rue Pasteur prolongée, 95660 Champagne-sur-Oise. Fermée le jeudi et les jours fériés.',
      location: 'ZA du Paradis, rue Pasteur prolongée, 95660 Champagne-sur-Oise',
      linkUrl: 'https://tri-or.fr/',
      linkLabel: 'Horaires et conditions d’accès',
      priority: 3,
    },
    {
      title: 'Déchetterie de Viarmes',
      description:
        'Déchetterie située chemin des Réservoirs, 95270 Viarmes. Fermée le mardi et les jours fériés.',
      location: 'Chemin des Réservoirs, 95270 Viarmes',
      linkUrl: 'https://tri-or.fr/',
      linkLabel: 'Horaires et conditions d’accès',
      priority: 4,
    },
    {
      title: 'Contact Syndicat Tri-Or',
      description:
        'Accueil du Syndicat Tri-Or : 01 34 70 05 60 — info@tri-or.fr. Horaires d’accueil indiqués par Tri-Or : du lundi au vendredi de 9h à 12h30 et de 13h30 à 17h.',
      linkUrl: 'https://tri-or.fr/',
      linkLabel: 'Contacter le Syndicat Tri-Or',
      priority: 5,
    },
  ],
  localRules: [
    {
      title: 'Bruit et voisinage',
      description:
        'Les travaux bruyants, l’entretien des jardins et les activités sonores doivent respecter les règles locales en vigueur. Les horaires précis sont à confirmer par la mairie avant publication officielle.',
      priority: 1,
    },
    {
      title: 'Stationnement et circulation',
      description:
        'Merci de respecter les zones de stationnement, les accès riverains, les cheminements piétons et les accès de secours. Les informations spécifiques à la commune doivent être précisées par la mairie.',
      priority: 2,
    },
    {
      title: 'Animaux',
      description:
        'Les propriétaires d’animaux sont invités à veiller à la propreté de l’espace public et à la tranquillité des riverains.',
      priority: 3,
    },
    {
      title: 'Signalement',
      description:
        'Pour signaler un problème sur l’espace public, les habitants peuvent contacter la mairie via la page Contact du site.',
      priority: 4,
    },
  ],
  usefulLinks: [
    {
      label: 'Syndicat Tri-Or',
      url: 'https://tri-or.fr/',
      description: 'Collecte, tri, déchetteries et informations déchets.',
      priority: 1,
    },
    {
      label: 'Service-Public.fr',
      url: 'https://www.service-public.fr/',
      description: 'Démarches administratives nationales.',
      priority: 2,
    },
    {
      label: 'Île-de-France Mobilités',
      url: 'https://www.iledefrance-mobilites.fr/',
      description: 'Horaires, itinéraires et informations transports en Île-de-France.',
      priority: 3,
    },
  ],
  updatedAt: new Date().toISOString(),
};

const ecoleEnfanceContent: JsonRecord = {
  title: 'École et enfance',
  intro:
    'Retrouvez les informations utiles pour les familles : école, inscriptions, restauration scolaire, accueil périscolaire, loisirs et documents pratiques. Les horaires et modalités doivent être confirmés par la mairie avant publication officielle.',
  schoolContact: {
    name: 'École Paul Cézanne',
    address: 'À confirmer par la mairie',
    phone: 'À confirmer par la mairie',
    email: 'À confirmer par la mairie',
    director: 'À confirmer par la mairie',
  },
  sections: [
    {
      key: 'petite-enfance',
      title: 'Petite enfance',
      content:
        'Cette rubrique peut présenter les solutions d’accueil pour les jeunes enfants, les contacts utiles, les démarches d’inscription et les relais d’information pour les familles. Les informations précises doivent être validées par la mairie.',
      priority: 1,
    },
    {
      key: 'ecole-primaire',
      title: 'École primaire',
      content:
        'L’école Paul Cézanne accueille les enfants de la commune. Cette rubrique doit présenter les horaires, les contacts, les modalités d’inscription, les documents utiles et les informations importantes de l’année scolaire. Les horaires et coordonnées doivent être confirmés avant publication officielle.',
      priority: 2,
    },
    {
      key: 'centre-de-loisirs',
      title: 'Accueil de loisirs / périscolaire',
      content:
        'Cette rubrique peut présenter l’accueil périscolaire, les temps d’accueil matin/soir, les modalités d’inscription, les contacts et les documents à télécharger. Les informations précises doivent être complétées par la mairie.',
      priority: 3,
    },
    {
      key: 'restauration-scolaire',
      title: 'Restauration scolaire',
      content:
        'La restauration scolaire permet aux familles de consulter les informations de cantine et le menu hebdomadaire. Le menu peut être publié sous forme de texte, image ou PDF depuis l’admin.',
      priority: 4,
    },
    {
      key: 'transport-scolaire',
      title: 'Transport scolaire',
      content:
        'Cette rubrique présente les informations utiles pour les trajets scolaires : inscriptions, horaires, circuits, consignes et liens vers les organismes compétents. Les données détaillées doivent être validées avant publication.',
      priority: 5,
    },
    {
      key: 'recensement',
      title: 'Recensement citoyen',
      content:
        'Les jeunes concernés par le recensement citoyen peuvent se rapprocher de la mairie ou consulter Service-Public.fr pour connaître les démarches à effectuer.',
      links: [
        {
          label: 'Voir les démarches sur Service-Public.fr',
          url: 'https://www.service-public.fr/',
        },
      ],
      priority: 6,
    },
  ],
  updatedAt: new Date().toISOString(),
};

const restaurationScolaireContent: JsonRecord = {
  title: 'Restauration scolaire',
  intro:
    'Retrouvez ici les informations de restauration scolaire et le menu de la semaine. La mairie peut mettre à jour le menu chaque semaine depuis l’admin.',
  menuCourant: {
    weekLabel: 'Menu de la semaine',
    format: 'TEXT',
    textContent: 'Menu à publier prochainement par la mairie.',
    updatedAt: new Date().toISOString(),
  },
  tarifs: 'Les tarifs et modalités de paiement doivent être confirmés par la mairie.',
  inscription: 'Les modalités d’inscription à la restauration scolaire doivent être précisées par la mairie.',
  allergies:
    'Pour toute allergie ou situation particulière, les familles doivent se rapprocher de la mairie et de l’école.',
  engagements:
    'La commune veille à proposer une information claire et régulièrement mise à jour pour les familles.',
  updatedAt: new Date().toISOString(),
};

type TransportSeed = {
  title: string;
  slug: string;
  summary: string;
  contentHtml: string;
  website?: string;
  operator?: string;
  status: ContentStatus;
};

const transportSeeds: TransportSeed[] = [
  {
    title: 'Transports en commun',
    slug: 'transports-en-commun-villiers-adam',
    summary:
      'Les habitants peuvent consulter les horaires, itinéraires et perturbations directement sur Île-de-France Mobilités.',
    contentHtml:
      '<p>Les habitants peuvent consulter les horaires, itinéraires et perturbations directement sur Île-de-France Mobilités.</p><p>Les lignes, arrêts et horaires précis desservant Villiers-Adam doivent être confirmés par la mairie avant publication officielle.</p><p><a href="https://www.iledefrance-mobilites.fr/" target="_blank" rel="noopener noreferrer">Consulter les horaires sur Île-de-France Mobilités</a></p>',
    website: 'https://www.iledefrance-mobilites.fr/',
    operator: 'Île-de-France Mobilités',
    status: ContentStatus.PUBLISHED,
  },
  {
    title: 'Gares et correspondances',
    slug: 'gares-et-correspondances-villiers-adam',
    summary:
      'Les habitants peuvent rejoindre les gares et correspondances des communes voisines selon les lignes disponibles.',
    contentHtml:
      '<p>Les habitants peuvent rejoindre les gares et correspondances des communes voisines selon les lignes disponibles.</p><p>Les informations précises sur les arrêts, horaires et correspondances doivent être validées par la mairie avant publication officielle.</p>',
    operator: 'Informations communales',
    status: ContentStatus.PUBLISHED,
  },
  {
    title: 'Transport scolaire',
    slug: 'transport-scolaire-informations',
    summary:
      'Les familles doivent vérifier les modalités d’inscription, les horaires et les circuits scolaires auprès des organismes compétents et de la mairie.',
    contentHtml:
      '<p>Les familles doivent vérifier les modalités d’inscription, les horaires et les circuits scolaires auprès des organismes compétents et de la mairie.</p><p>Cette rubrique peut accueillir les informations de rentrée, les liens d’inscription, les documents utiles et les consignes pour les élèves.</p><p><a href="https://www.iledefrance-mobilites.fr/" target="_blank" rel="noopener noreferrer">Informations transports scolaires</a></p>',
    website: 'https://www.iledefrance-mobilites.fr/',
    operator: 'Île-de-France Mobilités',
    status: ContentStatus.PUBLISHED,
  },
  {
    title: 'À vérifier avant la rentrée',
    slug: 'a-verifier-avant-la-rentree',
    summary:
      'Les horaires et circuits scolaires peuvent changer à chaque rentrée.',
    contentHtml:
      '<p>Les horaires et circuits scolaires peuvent changer à chaque rentrée.</p><p>La mairie doit mettre à jour cette rubrique dès réception des informations officielles.</p>',
    operator: 'Mairie de Villiers-Adam',
    status: ContentStatus.PUBLISHED,
  },
];

function ensureRecord(value: unknown): JsonRecord {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as JsonRecord;
  }
  return {};
}

async function resolveActorId() {
  const superAdmin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' },
    orderBy: { createdAt: 'asc' },
  });

  if (superAdmin) {
    return superAdmin.id;
  }

  const fallbackUser = await prisma.user.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  if (!fallbackUser) {
    throw new Error('No user found. Seed admin user before seeding content.');
  }

  return fallbackUser.id;
}

async function upsertSettingsContent() {
  const current = await prisma.settings.findUnique({ where: { id: 'default' } });

  if (!current) {
    throw new Error('Settings row with id=default not found. Run base seed first.');
  }

  const currentProfile = ensureRecord(current.municipalityProfile);
  const currentVieQuotidienne = ensureRecord(currentProfile.vieQuotidienne);

  const nextProfile: JsonRecord = {
    ...currentProfile,
    vieQuotidienne: {
      ...currentVieQuotidienne,
      infosPratiques: infosPratiquesContent,
      ecoleEnfance: ecoleEnfanceContent,
      restaurationScolaire: restaurationScolaireContent,
    },
  };

  await prisma.settings.update({
    where: { id: 'default' },
    data: {
      municipalityProfile: nextProfile as Prisma.InputJsonValue,
    },
  });
}

async function upsertTransportItems(actorId: string) {
  const actions: Array<{ title: string; action: 'created' | 'updated' }> = [];

  for (const seed of transportSeeds) {
    const normalizedSlug = slugify(seed.slug || seed.title);
    const existing = await prisma.transportInfo.findFirst({
      where: {
        OR: [{ slug: normalizedSlug }, { title: seed.title }],
      },
      select: { id: true, publishedAt: true },
    });

    const payload: Prisma.TransportInfoUncheckedCreateInput = {
      title: seed.title,
      slug: normalizedSlug,
      summary: seed.summary,
      content: seed.contentHtml,
      operator: seed.operator ?? null,
      website: seed.website ?? null,
      phone: null,
      status: seed.status,
      publishedAt: existing?.publishedAt ?? new Date(),
      scheduledAt: null,
      coverMediaId: null,
      createdById: actorId,
      updatedById: actorId,
    };

    if (existing) {
      await prisma.transportInfo.update({
        where: { id: existing.id },
        data: {
          ...payload,
          createdById: undefined,
        },
      });
      actions.push({ title: seed.title, action: 'updated' });
    } else {
      await prisma.transportInfo.create({ data: payload });
      actions.push({ title: seed.title, action: 'created' });
    }
  }

  return actions;
}

async function main() {
  const actorId = await resolveActorId();

  await upsertSettingsContent();
  const transportActions = await upsertTransportItems(actorId);

  console.log('Practical/school/transport content seed completed.');
  for (const action of transportActions) {
    console.log(`- [${action.action}] ${action.title}`);
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
