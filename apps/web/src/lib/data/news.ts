/**
 * Modèle de données unifié pour Actualités, Publications et Brèves
 * Ce fichier centralise toutes les données de contenu pour le site
 */

// Types de contenu
export type ContentType = 'actualite' | 'publication' | 'breve';

// Sous-types pour les publications administratives
export type PublicationType = 'arrete' | 'compte-rendu' | 'deliberation';

// Catégories d'actualités
export type NewsCategory =
  | 'vie-municipale'
  | 'culture'
  | 'environnement'
  | 'travaux'
  | 'evenement'
  | 'social'
  | 'urbanisme'
  | 'education';

// Interface principale pour tous les contenus
export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  type: ContentType;
  publicationType?: PublicationType;
  category?: NewsCategory;
  date: string; // ISO date string
  summary: string;
  content?: string;
  pdfUrl?: string;
  imageUrl?: string;
  tags: string[];
  featured?: boolean;
  // Métadonnées spécifiques aux publications
  documentNumber?: string; // Numéro de l'arrêté/délibération
  meetingDate?: string; // Date de la réunion du conseil
  year?: number; // Année de publication
}

// Labels pour l'affichage
export const contentTypeLabels: Record<ContentType, string> = {
  actualite: 'Actualité',
  publication: 'Publication',
  breve: 'Brève',
};

export const publicationTypeLabels: Record<PublicationType, string> = {
  arrete: 'Arrêté municipal',
  'compte-rendu': 'Compte-rendu du conseil',
  deliberation: 'Délibération',
};

export const categoryLabels: Record<NewsCategory, string> = {
  'vie-municipale': 'Vie municipale',
  culture: 'Culture',
  environnement: 'Environnement',
  travaux: 'Travaux',
  evenement: 'Événement',
  social: 'Social',
  urbanisme: 'Urbanisme',
  education: 'Éducation',
};

// Couleurs des catégories
export const categoryColors: Record<NewsCategory, string> = {
  'vie-municipale': 'villiers-blue',
  culture: 'villiers-gold',
  environnement: 'villiers-green',
  travaux: 'orange-500',
  evenement: 'villiers-gold',
  social: 'villiers-green',
  urbanisme: 'villiers-blue',
  education: 'villiers-blue',
};

// Icônes des types de publication
export const publicationTypeIcons: Record<PublicationType, string> = {
  arrete: 'FileWarning',
  'compte-rendu': 'FileText',
  deliberation: 'FileCheck',
};

// ============================================
// DONNÉES DE DÉMONSTRATION
// ============================================

export const demoNewsItems: NewsItem[] = [
  // ACTUALITÉS
  {
    id: 'actu-1',
    slug: 'voeux-du-maire-2025',
    title: 'Cérémonie des vœux du Maire 2025',
    type: 'actualite',
    category: 'vie-municipale',
    date: '2025-01-15',
    summary:
      'Le Maire et le Conseil municipal vous convient à la traditionnelle cérémonie des vœux qui aura lieu le samedi 25 janvier à 18h30 à la salle des fêtes.',
    content: `
      <p>Madame, Monsieur,</p>
      <p>Le Maire et le Conseil municipal ont le plaisir de vous convier à la traditionnelle cérémonie des vœux qui aura lieu :</p>
      <ul>
        <li><strong>Date :</strong> Samedi 25 janvier 2025</li>
        <li><strong>Heure :</strong> 18h30</li>
        <li><strong>Lieu :</strong> Salle des fêtes de Villiers-Adam</li>
      </ul>
      <p>Ce moment convivial sera l'occasion de présenter les projets de l'année à venir et d'échanger autour du verre de l'amitié.</p>
      <p>Nous vous attendons nombreux !</p>
    `,
    imageUrl: '/images/mairie_eclairé.jpg',
    tags: ['voeux', 'ceremonie', 'mairie'],
    featured: true,
  },
  {
    id: 'actu-2',
    slug: 'travaux-rue-grande',
    title: 'Travaux de voirie rue Grande',
    type: 'actualite',
    category: 'travaux',
    date: '2025-01-10',
    summary:
      'Des travaux de réfection de la chaussée auront lieu rue Grande du 20 janvier au 15 février. Circulation alternée.',
    content: `
      <p>La commune engage des travaux de réfection de la chaussée rue Grande.</p>
      <h3>Informations pratiques</h3>
      <ul>
        <li><strong>Période :</strong> Du 20 janvier au 15 février 2025</li>
        <li><strong>Circulation :</strong> Alternée par feux tricolores</li>
        <li><strong>Stationnement :</strong> Interdit sur la zone de travaux</li>
      </ul>
      <p>Nous vous remercions de votre compréhension.</p>
    `,
    imageUrl: '/images/Villiers-Adam_-_Mairie.jpg',
    tags: ['travaux', 'voirie', 'circulation'],
    featured: false,
  },
  {
    id: 'actu-3',
    slug: 'inscriptions-ecole-2025',
    title: 'Inscriptions scolaires 2025-2026',
    type: 'actualite',
    category: 'education',
    date: '2025-01-08',
    summary:
      'Les inscriptions pour la rentrée scolaire 2025-2026 sont ouvertes. Rendez-vous en mairie avec les documents nécessaires.',
    content: `
      <p>Les inscriptions pour l'année scolaire 2025-2026 sont ouvertes en mairie.</p>
      <h3>Documents à fournir</h3>
      <ul>
        <li>Livret de famille</li>
        <li>Justificatif de domicile de moins de 3 mois</li>
        <li>Carnet de santé (pages vaccinations)</li>
        <li>Certificat de radiation (si changement d'école)</li>
      </ul>
      <h3>Horaires d'accueil</h3>
      <p>Du lundi au vendredi : 9h-12h et 14h-17h</p>
    `,
    imageUrl: '/images/ecole_neige.jpg',
    tags: ['ecole', 'inscription', 'rentree'],
    featured: true,
  },

  // PUBLICATIONS - ARRÊTÉS
  {
    id: 'pub-arr-1',
    slug: 'arrete-2025-001-circulation',
    title: 'Arrêté portant réglementation temporaire de la circulation',
    type: 'publication',
    publicationType: 'arrete',
    date: '2025-01-12',
    summary:
      'Réglementation temporaire de la circulation rue Grande pour travaux de voirie.',
    pdfUrl: '/documents/arretes/2025/arrete-2025-001.pdf',
    documentNumber: '2025-001',
    year: 2025,
    tags: ['circulation', 'travaux', 'rue-grande'],
  },
  {
    id: 'pub-arr-2',
    slug: 'arrete-2024-042-stationnement',
    title: 'Arrêté portant interdiction de stationnement',
    type: 'publication',
    publicationType: 'arrete',
    date: '2024-12-15',
    summary: 'Interdiction de stationnement place de la Mairie le 25 janvier 2025.',
    pdfUrl: '/documents/arretes/2024/arrete-2024-042.pdf',
    documentNumber: '2024-042',
    year: 2024,
    tags: ['stationnement', 'place-mairie'],
  },
  {
    id: 'pub-arr-3',
    slug: 'arrete-2024-041-bruit',
    title: 'Arrêté portant réglementation des bruits de voisinage',
    type: 'publication',
    publicationType: 'arrete',
    date: '2024-11-20',
    summary:
      'Réglementation des horaires autorisés pour les travaux de bricolage et jardinage.',
    pdfUrl: '/documents/arretes/2024/arrete-2024-041.pdf',
    documentNumber: '2024-041',
    year: 2024,
    tags: ['bruit', 'voisinage', 'reglementation'],
  },

  // PUBLICATIONS - COMPTES-RENDUS
  {
    id: 'pub-cr-1',
    slug: 'compte-rendu-conseil-2024-12',
    title: 'Compte-rendu du Conseil municipal du 12 décembre 2024',
    type: 'publication',
    publicationType: 'compte-rendu',
    date: '2024-12-20',
    summary:
      'Ordre du jour : Budget primitif 2025, travaux voirie, subventions associations.',
    pdfUrl: '/documents/comptes-rendus/2024/cr-conseil-2024-12.pdf',
    meetingDate: '2024-12-12',
    year: 2024,
    tags: ['conseil-municipal', 'budget', 'subventions'],
  },
  {
    id: 'pub-cr-2',
    slug: 'compte-rendu-conseil-2024-10',
    title: 'Compte-rendu du Conseil municipal du 10 octobre 2024',
    type: 'publication',
    publicationType: 'compte-rendu',
    date: '2024-10-18',
    summary: 'Ordre du jour : Rentrée scolaire, festivités de fin d\'année, PLU.',
    pdfUrl: '/documents/comptes-rendus/2024/cr-conseil-2024-10.pdf',
    meetingDate: '2024-10-10',
    year: 2024,
    tags: ['conseil-municipal', 'ecole', 'plu'],
  },
  {
    id: 'pub-cr-3',
    slug: 'compte-rendu-conseil-2024-09',
    title: 'Compte-rendu du Conseil municipal du 5 septembre 2024',
    type: 'publication',
    publicationType: 'compte-rendu',
    date: '2024-09-12',
    summary: 'Ordre du jour : Décisions modificatives budget, convention EPCI.',
    pdfUrl: '/documents/comptes-rendus/2024/cr-conseil-2024-09.pdf',
    meetingDate: '2024-09-05',
    year: 2024,
    tags: ['conseil-municipal', 'budget', 'epci'],
  },

  // PUBLICATIONS - DÉLIBÉRATIONS
  {
    id: 'pub-del-1',
    slug: 'deliberation-2024-045-budget',
    title: 'Délibération n°2024-045 : Vote du budget primitif 2025',
    type: 'publication',
    publicationType: 'deliberation',
    date: '2024-12-12',
    summary: 'Adoption du budget primitif 2025 de la commune.',
    pdfUrl: '/documents/deliberations/2024/delib-2024-045.pdf',
    documentNumber: '2024-045',
    meetingDate: '2024-12-12',
    year: 2024,
    tags: ['budget', 'finances'],
  },
  {
    id: 'pub-del-2',
    slug: 'deliberation-2024-044-subventions',
    title: 'Délibération n°2024-044 : Attribution des subventions aux associations',
    type: 'publication',
    publicationType: 'deliberation',
    date: '2024-12-12',
    summary: 'Répartition des subventions aux associations pour l\'année 2025.',
    pdfUrl: '/documents/deliberations/2024/delib-2024-044.pdf',
    documentNumber: '2024-044',
    meetingDate: '2024-12-12',
    year: 2024,
    tags: ['associations', 'subventions'],
  },
  {
    id: 'pub-del-3',
    slug: 'deliberation-2024-040-voirie',
    title: 'Délibération n°2024-040 : Programme de travaux de voirie 2025',
    type: 'publication',
    publicationType: 'deliberation',
    date: '2024-10-10',
    summary: 'Approbation du programme pluriannuel de travaux de voirie.',
    pdfUrl: '/documents/deliberations/2024/delib-2024-040.pdf',
    documentNumber: '2024-040',
    meetingDate: '2024-10-10',
    year: 2024,
    tags: ['voirie', 'travaux'],
  },

  // BRÈVES
  {
    id: 'breve-1',
    slug: 'collecte-encombrants-janvier',
    title: 'Collecte des encombrants - 25 janvier',
    type: 'breve',
    date: '2025-01-05',
    summary:
      'La prochaine collecte des encombrants aura lieu le samedi 25 janvier. Inscriptions en mairie.',
    tags: ['encombrants', 'dechets', 'collecte'],
  },
  {
    id: 'breve-2',
    slug: 'fermeture-mairie-pont',
    title: 'Fermeture exceptionnelle de la mairie',
    type: 'breve',
    date: '2025-01-03',
    summary:
      'La mairie sera exceptionnellement fermée le vendredi 31 janvier (pont). Réouverture le lundi 3 février.',
    tags: ['mairie', 'fermeture', 'horaires'],
  },
  {
    id: 'breve-3',
    slug: 'vaccination-grippe',
    title: 'Campagne de vaccination grippe',
    type: 'breve',
    date: '2024-12-01',
    summary:
      'La campagne de vaccination contre la grippe se poursuit. Contactez votre médecin ou pharmacien.',
    tags: ['sante', 'vaccination', 'grippe'],
  },
];

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Filtrer les items par type de contenu
 */
export function filterByType(items: NewsItem[], type: ContentType): NewsItem[] {
  return items.filter((item) => item.type === type);
}

/**
 * Filtrer les publications par sous-type
 */
export function filterByPublicationType(
  items: NewsItem[],
  pubType: PublicationType
): NewsItem[] {
  return items.filter(
    (item) => item.type === 'publication' && item.publicationType === pubType
  );
}

/**
 * Filtrer par année
 */
export function filterByYear(items: NewsItem[], year: number): NewsItem[] {
  return items.filter((item) => {
    const itemYear = new Date(item.date).getFullYear();
    return itemYear === year || item.year === year;
  });
}

/**
 * Filtrer par catégorie
 */
export function filterByCategory(
  items: NewsItem[],
  category: NewsCategory
): NewsItem[] {
  return items.filter((item) => item.category === category);
}

/**
 * Obtenir les items mis en avant
 */
export function getFeaturedItems(items: NewsItem[]): NewsItem[] {
  return items.filter((item) => item.featured);
}

/**
 * Trier par date (plus récent en premier)
 */
export function sortByDate(items: NewsItem[], ascending = false): NewsItem[] {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
}

/**
 * Obtenir les années disponibles dans les items
 */
export function getAvailableYears(items: NewsItem[]): number[] {
  const years = new Set<number>();
  items.forEach((item) => {
    years.add(item.year || new Date(item.date).getFullYear());
  });
  return Array.from(years).sort((a, b) => b - a);
}

/**
 * Rechercher dans les items
 */
export function searchItems(items: NewsItem[], query: string): NewsItem[] {
  const lowerQuery = query.toLowerCase();
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.summary.toLowerCase().includes(lowerQuery) ||
      item.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Obtenir un item par son slug
 */
export function getItemBySlug(items: NewsItem[], slug: string): NewsItem | undefined {
  return items.find((item) => item.slug === slug);
}

/**
 * Obtenir les N derniers items
 */
export function getRecentItems(items: NewsItem[], count: number): NewsItem[] {
  return sortByDate(items).slice(0, count);
}

/**
 * Compter les items par type
 */
export function countByType(items: NewsItem[]): Record<ContentType, number> {
  return {
    actualite: filterByType(items, 'actualite').length,
    publication: filterByType(items, 'publication').length,
    breve: filterByType(items, 'breve').length,
  };
}
