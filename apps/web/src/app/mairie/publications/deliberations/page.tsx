import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api, { type Article, type PublicationType as ApiPublicationType } from '@/lib/api';
import { sortByDate, type NewsItem } from '@/lib/data/news';
import { DocumentListClient } from '../document-list-client';

export const metadata: Metadata = {
  title: 'Délibérations',
  description: 'Les délibérations de Villiers-Adam sont les décisions officielles votées par le Conseil municipal.',
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

export default async function DeliberationsPage() {
  let items: NewsItem[] = [];

  try {
    const articles = await api.articles.list({
      type: 'PUBLICATION',
      publicationType: 'DELIBERATION',
    });
    items = sortByDate(articles.map(mapArticleToNewsItem));
  } catch (error) {
    console.error('Failed to load deliberations:', error);
  }

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-villiers-green/5 to-background" />
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
              <div className="w-16 h-16 rounded-xl bg-villiers-green/10 border border-villiers-green/20 flex items-center justify-center">
                <FileCheck className="h-8 w-8 text-villiers-green" />
              </div>
              <div>
                <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-green mb-1">
                  <span className="w-8 h-px bg-villiers-green/50" />
                  Publications
                </span>
                <h1 className="text-3xl lg:text-5xl font-heading font-semibold text-foreground">
                  Délibérations
                </h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Les délibérations sont les décisions officielles votées par le Conseil municipal.
              Elles concernent le budget, les projets d&apos;aménagement, les conventions
              et toutes les affaires communales soumises au vote.
            </p>
          </div>
        </div>
      </section>

      <DocumentListClient
        items={items}
        emptyMessage="Aucune délibération disponible pour cette période."
        countLabel="délibération(s) disponible(s)"
      />
    </div>
  );
}
