'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, FileCheck } from 'lucide-react';
import { DocumentList } from '@/components/publications/document-card';
import { YearFilter } from '@/components/publications/year-filter';
import { Button } from '@/components/ui/button';
import {
  demoNewsItems,
  filterByPublicationType,
  filterByYear,
  sortByDate,
  getAvailableYears,
} from '@/lib/data/news';

export default function DeliberationsPage() {
  const [selectedYear, setSelectedYear] = React.useState<number | null>(null);

  // Récupérer toutes les délibérations
  const allDeliberations = sortByDate(filterByPublicationType(demoNewsItems, 'deliberation'));
  const availableYears = getAvailableYears(allDeliberations);

  // Filtrer par année si sélectionnée
  const filteredDeliberations = selectedYear
    ? filterByYear(allDeliberations, selectedYear)
    : allDeliberations;

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-villiers-green/5 to-background" />
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
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <p className="text-muted-foreground">
              <span className="font-mono text-foreground">{filteredDeliberations.length}</span> délibération(s) disponible(s)
            </p>
            <YearFilter
              years={availableYears}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
            />
          </div>

          <DocumentList
            items={filteredDeliberations}
            emptyMessage="Aucune délibération disponible pour cette période."
          />
        </div>
      </section>
    </div>
  );
}
