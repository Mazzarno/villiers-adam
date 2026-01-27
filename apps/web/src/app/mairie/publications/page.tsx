'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, FileWarning, FileCheck, ChevronRight } from 'lucide-react';
import { DocumentList } from '@/components/publications/document-card';
import { YearFilter } from '@/components/publications/year-filter';
import api, { type Article, type PublicationType as ApiPublicationType } from '@/lib/api';
import { filterByYear, getAvailableYears, sortByDate, type NewsItem } from '@/lib/data/news';
import { cn } from '@/lib/utils';

const publicationCategories = [
  {
    slug: 'arretes',
    title: 'Arrêtés municipaux',
    description: 'Décisions du Maire portant réglementation locale',
    icon: FileWarning,
    color: 'bg-orange-50 text-orange-600 border-orange-200',
  },
  {
    slug: 'comptes-rendus',
    title: 'Comptes-rendus du conseil',
    description: 'Procès-verbaux des séances du Conseil municipal',
    icon: FileText,
    color: 'bg-villiers-blue/10 text-villiers-blue border-villiers-blue/20',
  },
  {
    slug: 'deliberations',
    title: 'Délibérations',
    description: 'Décisions votées par le Conseil municipal',
    icon: FileCheck,
    color: 'bg-villiers-green/10 text-villiers-green border-villiers-green/20',
  },
];

export default function PublicationsPage() {
  const [selectedYear, setSelectedYear] = React.useState<number | null>(null);
  const [publications, setPublications] = React.useState<NewsItem[]>([]);

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
        const articles = await api.articles.list({ type: 'PUBLICATION' });
        setPublications(sortByDate(articles.map(mapArticleToNewsItem)));
      } catch (error) {
        console.error('Failed to load publications:', error);
        setPublications([]);
      }
    };

    load();
  }, [mapArticleToNewsItem]);

  // Récupérer toutes les publications
  const availableYears = getAvailableYears(publications);

  // Filtrer par année si sélectionnée
  const filteredPublications = selectedYear
    ? filterByYear(publications, selectedYear)
    : publications;

  // Dernières publications (5 max)
  const recentPublications = filteredPublications.slice(0, 5);

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
        <div className="absolute inset-0 texture-grain opacity-30" />

        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
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
          </motion.div>
        </div>
      </section>

      {/* Categories cards */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {publicationCategories.map((category, index) => (
              <motion.div
                key={category.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link
                  href={`/mairie/publications/${category.slug}`}
                  className="group block p-6 bg-background border border-border/50 rounded-organic transition-all duration-300 hover:border-villiers-gold/30 hover:shadow-villiers-lg"
                >
                  <div
                    className={cn(
                      'w-14 h-14 rounded-xl flex items-center justify-center mb-4 border',
                      category.color
                    )}
                  >
                    <category.icon className="h-6 w-6" />
                  </div>
                  <h2 className="font-heading text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                    {category.title}
                    <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent publications */}
      <section className="py-12 lg:py-16 bg-muted/30">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-heading font-semibold text-foreground mb-2">
                Dernières publications
              </h2>
              <p className="text-muted-foreground">
                Les documents les plus récents de la commune
              </p>
            </div>
            <YearFilter
              years={availableYears}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
            />
          </div>

          <DocumentList
            items={recentPublications}
            emptyMessage="Aucune publication pour cette année."
          />

          {filteredPublications.length > 5 && (
            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground">
                {filteredPublications.length - 5} autre(s) publication(s) disponible(s).
                Consultez les sections ci-dessus pour voir tous les documents.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
