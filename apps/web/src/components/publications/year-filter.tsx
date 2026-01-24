'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface YearFilterProps {
  years: number[];
  selectedYear: number | null;
  onYearChange: (year: number | null) => void;
}

export function YearFilter({ years, selectedYear, onYearChange }: YearFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground mr-2">Année :</span>
      <button
        onClick={() => onYearChange(null)}
        className={cn(
          'relative px-3 py-1.5 text-sm font-medium rounded-full transition-colors',
          selectedYear === null
            ? 'text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        )}
      >
        {selectedYear === null && (
          <motion.span
            layoutId="yearFilter"
            className="absolute inset-0 bg-primary rounded-full"
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
        <span className="relative z-10">Toutes</span>
      </button>
      {years.map((year) => (
        <button
          key={year}
          onClick={() => onYearChange(year)}
          className={cn(
            'relative px-3 py-1.5 text-sm font-medium rounded-full transition-colors font-mono',
            selectedYear === year
              ? 'text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          {selectedYear === year && (
            <motion.span
              layoutId="yearFilter"
              className="absolute inset-0 bg-primary rounded-full"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative z-10">{year}</span>
        </button>
      ))}
    </div>
  );
}
