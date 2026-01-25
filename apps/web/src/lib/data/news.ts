/**
 * Modèle de données unifié pour Actualités, Publications et Brèves
 * Ce fichier contient uniquement les types et helpers.
 */

export type ContentType = 'actualite' | 'publication' | 'breve';

export type PublicationType = 'arrete' | 'compte-rendu' | 'deliberation';

export type NewsCategory =
  | 'vie-municipale'
  | 'culture'
  | 'environnement'
  | 'travaux'
  | 'evenement'
  | 'social'
  | 'urbanisme'
  | 'education';

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  type: ContentType;
  publicationType?: PublicationType;
  category?: NewsCategory;
  date: string;
  summary: string;
  content?: string;
  pdfUrl?: string;
  imageUrl?: string;
  tags: string[];
  featured?: boolean;
  documentNumber?: string;
  meetingDate?: string;
  year?: number;
}

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

export const publicationTypeIcons: Record<PublicationType, string> = {
  arrete: 'FileWarning',
  'compte-rendu': 'FileText',
  deliberation: 'FileCheck',
};

export const demoNewsItems: NewsItem[] = [];

export const sortByDate = (items: NewsItem[]) =>
  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const filterByType = (items: NewsItem[], type: ContentType) =>
  items.filter((item) => item.type === type);

export const filterByPublicationType = (items: NewsItem[], type: PublicationType) =>
  items.filter((item) => item.publicationType === type);

export const filterByYear = (items: NewsItem[], year: number) =>
  items.filter((item) => (item.year ?? new Date(item.date).getFullYear()) === year);

export const getAvailableYears = (items: NewsItem[]) =>
  Array.from(
    new Set(items.map((item) => item.year ?? new Date(item.date).getFullYear())),
  ).sort((a, b) => b - a);
