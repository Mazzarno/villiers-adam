'use client';

import * as React from 'react';
import Link from 'next/link';
import { FileText, FileWarning, FileCheck, ChevronRight } from 'lucide-react';
import { DocumentList } from '@/components/publications/document-card';
import { YearFilter } from '@/components/publications/year-filter';
import { filterByYear, getAvailableYears, type NewsItem } from '@/lib/data/news';
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

interface PublicationsClientProps {
  publications: NewsItem[];
}

export function PublicationsClient({ publications }: PublicationsClientProps) {
  const [selectedYear, setSelectedYear] = React.useState<number | null>(null);

  const availableYears = getAvailableYears(publications);
  const filteredPublications = selectedYear
    ? filterByYear(publications, selectedYear)
    : publications;
  const recentPublications = filteredPublications.slice(0, 5);

  return (
    <>
      {/* Categories cards */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {publicationCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/publications/${category.slug}`}
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
    </>
  );
}
