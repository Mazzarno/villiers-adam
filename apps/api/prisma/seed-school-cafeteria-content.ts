import { Prisma, PrismaClient } from '@prisma/client';

type JsonRecord = Record<string, unknown>;

const prisma = new PrismaClient();

function asRecord(value: unknown): JsonRecord {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as JsonRecord;
  }
  return {};
}

function buildEcoleEnfanceContent(nowIso: string): JsonRecord {
  return {
    title: 'École et enfance',
    intro:
      'Cette page rassemble les informations pratiques utiles aux familles de Villiers-Adam : école, repères liés à l’enfance et à la scolarité, transport scolaire, démarches d’inscription, cantine et contacts utiles. Les contenus administratifs publiés ici ont vocation à orienter les familles et peuvent être enrichis ou mis à jour par la mairie selon les informations validées disponibles.',
    schoolContact: {
      name: 'École primaire publique Paul Cézanne',
      address: '1 rue Aristide Briand, 95840 Villiers-Adam',
      phone: '01 34 69 47 88',
      email: 'ce.0950220Y@ac-versailles.fr',
      director: null,
    },
    sections: [
      {
        key: 'ecole-primaire',
        title: 'École primaire Paul Cézanne',
        description:
          'L’école Paul Cézanne accueille les enfants de la commune dans un cadre de proximité, au cœur du village.',
        content:
          'L’école primaire publique Paul Cézanne est l’établissement scolaire de référence de Villiers-Adam. Les familles peuvent contacter directement l’école pour les informations liées à la scolarité, à la vie de classe et aux démarches courantes. Les informations administratives publiées sur ce site sont données pour faciliter l’orientation des familles et peuvent être complétées par la mairie ou l’école.',
        links: [],
        documents: [],
        priority: 10,
      },
      {
        key: 'petite-enfance',
        title: 'Petite enfance',
        description: 'Informations pratiques à destination des jeunes familles.',
        content:
          'Les informations relatives à la petite enfance, aux modes de garde et aux démarches familiales peuvent être complétées par la mairie selon les services disponibles et les partenariats locaux. Cette rubrique a vocation à centraliser les contacts utiles pour les parents de jeunes enfants. Les éléments publiés ici doivent être compris comme un contenu administratif éditable et non comme un état exhaustif ou certifié de l’offre locale.',
        links: [],
        documents: [],
        priority: 20,
      },
      {
        key: 'inscriptions',
        title: 'Inscriptions scolaires',
        description: 'Les démarches d’inscription sont à vérifier auprès de la mairie.',
        content:
          'Pour une inscription scolaire, les familles sont invitées à se rapprocher de la mairie afin de connaître les pièces à fournir, les périodes d’inscription et les modalités applicables. Les informations publiées ici constituent un repère pratique administrable par la mairie et peuvent être mises à jour chaque année avant la rentrée scolaire.',
        links: [],
        documents: [],
        priority: 30,
      },
      {
        key: 'centre-de-loisirs',
        title: 'Accueil périscolaire et loisirs',
        description: 'Une rubrique à compléter avec les informations validées par la mairie.',
        content:
          'Cette rubrique peut présenter les informations relatives à l’accueil périscolaire, aux activités proposées aux enfants et aux modalités d’organisation en dehors du temps scolaire. Les informations doivent être complétées ou validées par la mairie avant publication définitive. En l’état, il s’agit d’un contenu de démonstration éditable destiné à structurer les futures informations municipales.',
        links: [],
        documents: [],
        priority: 40,
      },
      {
        key: 'transport-scolaire',
        title: 'Transport scolaire',
        description: 'Informations à vérifier avant chaque rentrée.',
        content:
          'Les familles concernées par le transport scolaire sont invitées à vérifier les horaires, les points de montée et les modalités d’inscription avant chaque rentrée. Les informations peuvent évoluer selon les lignes, les correspondances et l’organisation annuelle. Cette rubrique sert de base administrative éditable et doit être confirmée avant toute communication définitive.',
        links: [],
        documents: [],
        priority: 50,
      },
      {
        key: 'restauration-scolaire',
        title: 'Restauration scolaire',
        description: 'Menu hebdomadaire et informations pratiques de la cantine.',
        content:
          'La restauration scolaire permet aux enfants de déjeuner sur place les jours de classe, avec une cantine présente sur le site de l’école. Le menu hebdomadaire peut être publié ici par la mairie sous forme de texte, d’image ou de document PDF. Le contenu affiché peut être administré puis remplacé par les informations officielles communiquées par la mairie ou le prestataire.',
        links: [],
        documents: [],
        priority: 60,
      },
    ],
    updatedAt: nowIso,
  };
}

function buildRestaurationContent(nowIso: string): JsonRecord {
  return {
    title: 'Restauration scolaire',
    intro:
      'Retrouvez les informations pratiques de la cantine scolaire ainsi que le menu de la semaine.',
    menuCourant: {
      weekLabel: 'Menu fictif — semaine du 1er au 5 juin 2026',
      validFrom: '2026-06-01',
      validTo: '2026-06-05',
      format: 'TEXT',
      textContent: `Lundi
Entrée : Carottes râpées
Plat : Émincé de volaille sauce crème
Accompagnement : Riz pilaf
Laitage : Yaourt nature
Dessert : Pomme

Mardi
Entrée : Salade de tomates
Plat : Omelette aux fines herbes
Accompagnement : Pommes de terre vapeur
Laitage : Fromage
Dessert : Compote de poires

Mercredi
Entrée : Concombre vinaigrette
Plat : Boulettes de bœuf sauce tomate
Accompagnement : Semoule
Laitage : Petit-suisse
Dessert : Fruit de saison

Jeudi
Entrée : Betteraves vinaigrette
Plat : Filet de poisson pané
Accompagnement : Haricots verts
Laitage : Fromage blanc
Dessert : Gâteau maison

Vendredi
Entrée : Salade verte
Plat : Gratin de pâtes aux légumes
Accompagnement : —
Laitage : Fromage
Dessert : Banane

Menu fictif ajouté pour démonstration. À remplacer par le menu officiel communiqué par la mairie ou le prestataire.`,
      imageUrl: null,
      imageMediaId: null,
      pdfUrl: null,
      pdfMediaId: null,
      updatedAt: nowIso,
    },
    tarifs:
      'Les tarifs de restauration scolaire sont à compléter par la mairie selon les modalités en vigueur.',
    inscription:
      'Pour toute inscription ou modification liée à la restauration scolaire, les familles sont invitées à contacter la mairie.',
    allergies:
      'En cas d’allergie ou de régime alimentaire spécifique, les familles doivent se rapprocher de la mairie et de l’école afin de connaître les modalités d’accueil applicables.',
    engagements:
      'Les menus peuvent évoluer selon les livraisons, les contraintes d’approvisionnement ou les ajustements du prestataire.',
    documents: [],
    updatedAt: nowIso,
  };
}

async function main() {
  const settings = await prisma.settings.findUnique({ where: { id: 'default' } });

  if (!settings) {
    throw new Error('Settings row id=default missing. Run base seed first.');
  }

  const nowIso = new Date().toISOString();

  const currentProfile = asRecord(settings.municipalityProfile);
  const currentVieQuotidienne = asRecord(currentProfile.vieQuotidienne);

  const nextProfile: JsonRecord = {
    ...currentProfile,
    vieQuotidienne: {
      ...currentVieQuotidienne,
      ecoleEnfance: buildEcoleEnfanceContent(nowIso),
      restaurationScolaire: buildRestaurationContent(nowIso),
    },
  };

  await prisma.settings.update({
    where: { id: 'default' },
    data: {
      municipalityProfile: nextProfile as Prisma.InputJsonValue,
    },
  });

  console.log('School/cafeteria content seed completed.');
  console.log('- ecoleEnfance updated');
  console.log('- restaurationScolaire updated');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
