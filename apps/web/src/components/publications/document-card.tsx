'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Download, Eye, Calendar, FileWarning, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  type NewsItem,
  type PublicationType,
  publicationTypeLabels,
} from '@/lib/data/news';

interface DocumentCardProps {
  item: NewsItem;
  index?: number;
}

const publicationTypeStyles: Record<PublicationType, { icon: React.ElementType; color: string }> = {
  arrete: { icon: FileWarning, color: 'text-orange-600 bg-orange-50' },
  'compte-rendu': { icon: FileText, color: 'text-villiers-blue bg-villiers-blue/10' },
  deliberation: { icon: FileCheck, color: 'text-villiers-green bg-villiers-green/10' },
};

export function DocumentCard({ item, index = 0 }: DocumentCardProps) {
  const pubType = item.publicationType || 'compte-rendu';
  const { icon: Icon, color } = publicationTypeStyles[pubType];
  const formattedDate = new Date(item.date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <div className="relative flex gap-4 p-5 bg-background border border-border/50 rounded-organic transition-all duration-300 hover:border-villiers-gold/30 hover:shadow-villiers">
        {/* Icône du type de document */}
        <div className={cn('shrink-0 w-12 h-12 rounded-lg flex items-center justify-center', color)}>
          <Icon className="h-5 w-5" />
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          {/* Badge type + Date */}
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-muted text-muted-foreground">
              {publicationTypeLabels[pubType]}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formattedDate}
            </span>
          </div>

          {/* Titre */}
          <h3 className="font-heading font-semibold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {item.title}
          </h3>

          {/* Résumé */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {item.summary}
          </p>

          {/* Numéro de document si présent */}
          {item.documentNumber && (
            <p className="text-xs font-mono text-muted-foreground mb-3">
              N° {item.documentNumber}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {item.pdfUrl && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-1.5 text-xs"
              >
                <a href={item.pdfUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-3.5 w-3.5" />
                  Télécharger
                </a>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Link href={`/actualites/${item.slug}`}>
                <Eye className="h-3.5 w-3.5" />
                Voir détails
              </Link>
            </Button>
          </div>
        </div>

        {/* Indicateur hover */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-villiers-gold origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-organic" />
      </div>
    </motion.article>
  );
}

interface DocumentListProps {
  items: NewsItem[];
  emptyMessage?: string;
}

export function DocumentList({ items, emptyMessage = 'Aucun document disponible.' }: DocumentListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <DocumentCard key={item.id} item={item} index={index} />
      ))}
    </div>
  );
}
