'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, FileText } from 'lucide-react';
import { DocumentList } from '@/components/publications/document-card';
import { YearFilter } from '@/components/publications/year-filter';
import { Button } from '@/components/ui/button';
import api, { type Article, type PublicationType as ApiPublicationType } from '@/lib/api';
import { filterByYear, getAvailableYears, sortByDate, type NewsItem } from '@/lib/data/news';

export default function ComptesRendusPage() {
  const [selectedYear, setSelectedYear] = React.useState<number | null>(null);
  const [items, setItems] = React.useState<NewsItem[]>([]);

  const mapPublicationType = React.useCallback((value?: ApiPublicationType) => {
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
  }, []);

  const mapArticleToNewsItem = React.useCallback((article: Article): NewsItem => ({
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
  }), [mapPublicationType]);

  React.useEffect(() => {
    const load = async () => {
      try {
        const articles = await api.articles.list({
          type: 'PUBLICATION',
          publicationType: 'COMPTE_RENDU',
        });
        setItems(sortByDate(articles.map(mapArticleToNewsItem)));
      } catch (error) {
        console.error('Failed to load comptes-rendus:', error);
        setItems([]);
      }
    };

    load();
  }, [mapArticleToNewsItem]);

  // Récupérer tous les comptes-rendus
  const availableYears = getAvailableYears(items);

  // Filtrer par année si sélectionnée
  const filteredComptesRendus = selectedYear
    ? filterByYear(items, selectedYear)
    : items;

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-villiers-blue/5 to-background" />
        <div className="absolute inset-0 texture-grain opacity-30" />

        <div className="container relative">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
              <Link href="/mairie/publications">
                <ChevronLeft className="h-4 w-4" />
                Retour aux publications
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
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
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <p className="text-muted-foreground">
              <span className="font-mono text-foreground">{filteredComptesRendus.length}</span> compte(s)-rendu(s) disponible(s)
            </p>
            <YearFilter
              years={availableYears}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
            />
          </div>

          <DocumentList
            items={filteredComptesRendus}
            emptyMessage="Aucun compte-rendu disponible pour cette période."
          />
        </div>
      </section>
    </div>
  );
}
