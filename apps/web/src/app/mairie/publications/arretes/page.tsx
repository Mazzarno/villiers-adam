import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, FileWarning } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api, { type Article, type PublicationType as ApiPublicationType } from '@/lib/api';
import { sortByDate, type NewsItem } from '@/lib/data/news';
import { DocumentListClient } from '../document-list-client';

export const metadata: Metadata = {
  title: 'Arrêtés Municipaux',
  description: 'Les arrêtés municipaux de Villiers-Adam : décisions administratives prises par le Maire dans le cadre de ses pouvoirs de police.',
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

export default async function ArretesPage() {
  let items: NewsItem[] = [];

  try {
    const articles = await api.articles.list({
      type: 'PUBLICATION',
      publicationType: 'ARRETE',
    });
    items = sortByDate(articles.map(mapArticleToNewsItem));
  } catch (error) {
    console.error('Failed to load arretes:', error);
  }

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-background" />
        <div className="absolute inset-0 texture-grain opacity-30" />

        <div className="container relative">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
              <Link href="/publications">
                <ChevronLeft className="h-4 w-4" />
                Retour aux publications
              </Link>
            </Button>
          </div>

          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center">
                <FileWarning className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <span className="inline-flex items-center gap-2 text-sm font-mono text-orange-600 mb-1">
                  <span className="w-8 h-px bg-orange-400" />
                  Publications
                </span>
                <h1 className="text-3xl lg:text-5xl font-heading font-semibold text-foreground">
                  Arrêtés municipaux
                </h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Les arrêtés municipaux sont des décisions administratives prises par le Maire
              dans le cadre de ses pouvoirs de police. Ils réglementent la vie quotidienne
              de la commune (circulation, stationnement, salubrité, etc.).
            </p>
          </div>
        </div>
      </section>

      <DocumentListClient
        items={items}
        emptyMessage="Aucun arrêté disponible pour cette période."
        countLabel="arrêté(s) disponible(s)"
      />
    </div>
  );
}
