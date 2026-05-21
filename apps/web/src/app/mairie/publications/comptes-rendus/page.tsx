import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api, { type Article, type PublicationType as ApiPublicationType } from '@/lib/api';
import { sortByDate, type NewsItem } from '@/lib/data/news';
import { DocumentListClient } from '../document-list-client';

export const metadata: Metadata = {
  title: 'Comptes-rendus du Conseil',
  description: 'Les comptes-rendus des séances du Conseil municipal de Villiers-Adam retracent les débats et les décisions prises lors des réunions.',
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

export default async function ComptesRendusPage() {
  let items: NewsItem[] = [];

  try {
    const articles = await api.articles.list({
      type: 'PUBLICATION',
      publicationType: 'COMPTE_RENDU',
    });
    items = sortByDate(articles.map(mapArticleToNewsItem));
  } catch (error) {
    console.error('Failed to load comptes-rendus:', error);
  }

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-villiers-blue/5 to-background" />
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
              <div className="w-16 h-16 rounded-xl bg-villiers-blue/10 border border-villiers-blue/20 flex items-center justify-center">
                <FileText className="h-8 w-8 text-villiers-blue" />
              </div>
              <div>
                <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-blue mb-1">
                  <span className="w-8 h-px bg-villiers-blue/50" />
                  Publications
                </span>
                <h1 className="text-3xl lg:text-5xl font-heading font-semibold text-foreground">
                  Comptes-rendus du conseil
                </h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Les comptes-rendus des séances du Conseil municipal retracent les débats
              et les décisions prises lors des réunions. Ils sont rendus publics dans
              un souci de transparence de la vie municipale.
            </p>
          </div>
        </div>
      </section>

      <DocumentListClient
        items={items}
        emptyMessage="Aucun compte-rendu disponible pour cette période."
        countLabel="compte(s)-rendu(s) disponible(s)"
      />
    </div>
  );
}
