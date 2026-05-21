import type { Metadata } from 'next';
import api, { type Article, type PublicationType as ApiPublicationType } from '@/lib/api';
import { sortByDate, type NewsItem } from '@/lib/data/news';
import { PublicationsClient } from './publications-client';

export const metadata: Metadata = {
  title: 'Publications Administratives',
  description: 'Retrouvez l\'ensemble des documents officiels de Villiers-Adam : arrêtés municipaux, comptes-rendus des conseils municipaux et délibérations.',
};

const mapPublicationType = (value?: ApiPublicationType) => {
  switch (value) {
    case 'ARRETE':
      return 'arrete' as const;
    case 'COMPTE_RENDU':
      return 'compte-rendu' as const;
    case 'DELIBERATION':
      return 'deliberation' as const;
    default:
      return undefined;
  }
};

const mapArticleToNewsItem = (article: Article): NewsItem => ({
  id: article.id,
  slug: article.slug,
  title: article.title,
  type: 'publication',
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

export default async function PublicationsPage() {
  let publications: NewsItem[] = [];

  try {
    const articles = await api.articles.list({ type: 'PUBLICATION' });
    publications = sortByDate(articles.map(mapArticleToNewsItem));
  } catch (error) {
    console.error('Failed to load publications:', error);
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
              La Mairie
            </span>
            <h1 className="text-4xl lg:text-6xl font-heading font-semibold text-foreground mb-6">
              Publications <span className="display-italic">administratives</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Retrouvez l&apos;ensemble des documents officiels de la commune : arrêtés municipaux,
              comptes-rendus des conseils municipaux et délibérations.
            </p>
          </div>
        </div>
      </section>

      <PublicationsClient publications={publications} />
    </div>
  );
}
