import type { Metadata } from 'next';
import { Suspense } from 'react';
import api, { type Article, type PublicationType as ApiPublicationType } from '@/lib/api';
import {
  type NewsItem,
  type ContentType,
  type PublicationType,
  sortByDate,
} from '@/lib/data/news';
import { ActualitesClient } from './actualites-client';

export const metadata: Metadata = {
  title: 'Actualités & Publications',
  description: 'Retrouvez toutes les informations de Villiers-Adam : actualités, arrêtés municipaux, comptes-rendus du conseil et brèves.',
};

const mapPublicationType = (value?: ApiPublicationType): PublicationType | undefined => {
  switch (value) {
    case 'ARRETE':
      return 'arrete';
    case 'COMPTE_RENDU':
      return 'compte-rendu';
    case 'DELIBERATION':
      return 'deliberation';
    default:
      return undefined;
  }
};

const mapArticleType = (value?: Article['type']): ContentType => {
  switch (value) {
    case 'PUBLICATION':
      return 'publication';
    case 'BREVE':
      return 'breve';
    case 'ACTUALITE':
    default:
      return 'actualite';
  }
};

const mapArticleToNewsItem = (article: Article): NewsItem => ({
  id: article.id,
  slug: article.slug,
  title: article.title,
  type: mapArticleType(article.type),
  publicationType: mapPublicationType(article.publicationType),
  date: article.publishedAt || article.createdAt,
  summary: article.excerpt || '',
  content: article.content || '',
  imageUrl: article.featuredImage,
  tags: article.tags || [],
  pdfUrl: article.documentUrl,
  documentNumber: article.documentNumber,
  meetingDate: article.meetingDate,
  year: article.publicationYear,
});

export default async function ActualitesPage() {
  let items: NewsItem[] = [];

  try {
    const articles = await api.articles.list();
    items = sortByDate(articles.map(mapArticleToNewsItem));
  } catch (error) {
    console.error('Failed to load articles:', error);
  }

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
        <div className="absolute inset-0 texture-grain opacity-30" />

        <div className="container relative">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-4">
              <span className="w-8 h-px bg-villiers-gold" />
              Informations
            </span>
            <h1 className="text-4xl lg:text-6xl font-heading font-semibold text-foreground mb-6">
              Actualités & <span className="display-italic">Publications</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Retrouvez toutes les informations de votre commune : actualités, arrêtés municipaux,
              comptes-rendus du conseil et brèves.
            </p>
          </div>
        </div>
      </section>

      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        }
      >
        <ActualitesClient initialItems={items} />
      </Suspense>
    </div>
  );
}
