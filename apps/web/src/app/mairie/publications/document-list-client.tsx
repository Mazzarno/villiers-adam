'use client';

import * as React from 'react';
import { DocumentList } from '@/components/publications/document-card';
import { YearFilter } from '@/components/publications/year-filter';
import { filterByYear, getAvailableYears, type NewsItem } from '@/lib/data/news';

interface DocumentListClientProps {
  items: NewsItem[];
  emptyMessage: string;
  countLabel: string;
}

export function DocumentListClient({ items, emptyMessage, countLabel }: DocumentListClientProps) {
  const [selectedYear, setSelectedYear] = React.useState<number | null>(null);

  const availableYears = getAvailableYears(items);
  const filteredItems = selectedYear ? filterByYear(items, selectedYear) : items;

  return (
    <section className="py-12 lg:py-16">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <p className="text-muted-foreground">
            <span className="font-mono text-foreground">{filteredItems.length}</span> {countLabel}
          </p>
          <YearFilter
            years={availableYears}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        </div>

        <DocumentList items={filteredItems} emptyMessage={emptyMessage} />
      </div>
    </section>
  );
}
