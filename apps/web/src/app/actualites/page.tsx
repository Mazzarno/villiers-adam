'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  FileText,
  Download,
  X,
  Newspaper,
  FileWarning,
  FileCheck,
  Bell,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, formatDate, truncate } from '@/lib/utils';
import api, { type Article, type PublicationType as ApiPublicationType } from '@/lib/api';
import {
  type NewsItem,
  type ContentType,
  type PublicationType,
  contentTypeLabels,
  publicationTypeLabels,
  sortByDate,
} from '@/lib/data/news';

// Configuration des filtres
const contentTypeFilters: { type: ContentType | 'all'; label: string; icon: React.ElementType }[] = [
  { type: 'all', label: 'Tous', icon: Newspaper },
  { type: 'actualite', label: 'Actualités', icon: Newspaper },
  { type: 'publication', label: 'Publications', icon: FileText },
  { type: 'breve', label: 'Brèves', icon: Bell },
];

const publicationTypeFilters: { type: PublicationType; label: string; icon: React.ElementType }[] = [
  { type: 'arrete', label: 'Arrêtés', icon: FileWarning },
  { type: 'compte-rendu', label: 'Comptes-rendus', icon: FileText },
  { type: 'deliberation', label: 'Délibérations', icon: FileCheck },
];

const mapPublicationType = (value?: ApiPublicationType): PublicationType | undefined => {
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
};

const mapArticleType = (value?: Article['type']): ContentType => {
  switch (value) {
    case 'PUBLICATION':
      return 'publication';
    case 'BREVE':
      return 'breve';
    case 'ACTUALITE':
    default:
      return 'actualite';
  }
};

const mapArticleToNewsItem = (article: Article): NewsItem => ({
  id: article.id,
  slug: article.slug,
  title: article.title,
  type: mapArticleType(article.type),
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


function ActualitesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [items, setItems] = React.useState<NewsItem[]>([]);

  // États des filtres
  const [selectedType, setSelectedType] = React.useState<ContentType | 'all'>('all');
  const [selectedPubType, setSelectedPubType] = React.useState<PublicationType | null>(null);

  // Initialiser depuis les params URL
  React.useEffect(() => {
    const type = searchParams.get('type') as ContentType | null;
    const pubType = searchParams.get('pubType') as PublicationType | null;

    if (type && ['actualite', 'publication', 'breve'].includes(type)) {
      setSelectedType(type);
    }
    if (pubType && ['arrete', 'compte-rendu', 'deliberation'].includes(pubType)) {
      setSelectedPubType(pubType);
    }
  }, [searchParams]);

  React.useEffect(() => {
    const loadArticles = async () => {
      try {
        const articles = await api.articles.list();
        const mapped = articles.map((article) => mapArticleToNewsItem(article));
        setItems(sortByDate(mapped));
      } catch (error) {
        console.error('Failed to load articles:', error);
        setItems([]);
      }
    };

    loadArticles();
  }, []);

  // Mettre à jour l'URL quand les filtres changent
  const updateFilters = (type: ContentType | 'all', pubType: PublicationType | null) => {
    const params = new URLSearchParams();
    if (type !== 'all') params.set('type', type);
    if (pubType) params.set('pubType', pubType);

    const url = params.toString() ? `/actualites?${params.toString()}` : '/actualites';
    router.push(url, { scroll: false });

    setSelectedType(type);
    setSelectedPubType(pubType);
  };

  // Filtrer les items
  const filteredItems = React.useMemo(() => {
    let itemsToFilter = items;

    if (selectedType !== 'all') {
      itemsToFilter = itemsToFilter.filter((item) => item.type === selectedType);
    }

    if (selectedType === 'publication' && selectedPubType) {
      itemsToFilter = itemsToFilter.filter((item) => item.publicationType === selectedPubType);
    }

    return itemsToFilter;
  }, [items, selectedType, selectedPubType]);

  // Compteurs
  const counts = React.useMemo(() => ({
    all: items.length,
    actualite: items.filter((i) => i.type === 'actualite').length,
    publication: items.filter((i) => i.type === 'publication').length,
    breve: items.filter((i) => i.type === 'breve').length,
  }), [items]);

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
              Informations
            </span>
            <h1 className="text-4xl lg:text-6xl font-heading font-semibold text-foreground mb-6">
              Actualités & <span className="display-italic">Publications</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Retrouvez toutes les informations de votre commune : actualités, arrêtés municipaux,
              comptes-rendus du conseil et brèves.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filtres */}
      <section className="sticky top-20 z-30 py-4 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Filtres principaux */}
            <div className="flex flex-wrap gap-2">
              {contentTypeFilters.map((filter) => (
                <button
                  key={filter.type}
                  onClick={() => updateFilters(filter.type, filter.type === 'publication' ? selectedPubType : null)}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all',
                    selectedType === filter.type
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <filter.icon className="h-4 w-4" />
                  {filter.label}
                  <span className={cn(
                    'px-1.5 py-0.5 text-xs rounded-full',
                    selectedType === filter.type
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted-foreground/20'
                  )}>
                    {counts[filter.type as keyof typeof counts] || 0}
                  </span>
                </button>
              ))}
            </div>

            {/* Sous-filtres pour publications */}
            <AnimatePresence>
              {selectedType === 'publication' && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-2 md:ml-4 md:pl-4 md:border-l border-border/50"
                >
                  <span className="text-xs text-muted-foreground">Filtrer :</span>
                  {publicationTypeFilters.map((filter) => (
                    <button
                      key={filter.type}
                      onClick={() => updateFilters('publication', selectedPubType === filter.type ? null : filter.type)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all',
                        selectedPubType === filter.type
                          ? 'bg-villiers-gold text-white'
                          : 'bg-villiers-gold/10 text-villiers-gold hover:bg-villiers-gold/20'
                      )}
                    >
                      <filter.icon className="h-3 w-3" />
                      {filter.label}
                    </button>
                  ))}
                  {selectedPubType && (
                    <button
                      onClick={() => updateFilters('publication', null)}
                      className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Effacer le filtre"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Liste des items */}
      <section className="py-12 lg:py-16">
        <div className="container">
          {/* Compteur de résultats */}
          <p className="text-sm text-muted-foreground mb-8">
            <span className="font-mono text-foreground">{filteredItems.length}</span> résultat(s)
            {selectedType !== 'all' && ` dans ${contentTypeLabels[selectedType]}`}
            {selectedPubType && ` - ${publicationTypeLabels[selectedPubType]}`}
          </p>

          {/* Grille */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => (
                <NewsCard key={item.id} item={item} index={index} />
              ))}
            </AnimatePresence>
          </div>

          {/* État vide */}
          {filteredItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Aucun contenu ne correspond à vos critères de recherche.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => updateFilters('all', null)}
              >
                Afficher tout
              </Button>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function ActualitesPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <ActualitesContent />
    </React.Suspense>
  );
}

// Composant Card pour les news
function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  const isPublication = item.type === 'publication';
  const isBreve = item.type === 'breve';

  const formattedDate = formatDate(item.date);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/actualites/${item.slug}`}>
        <Card className={cn(
          'h-full overflow-hidden group transition-all duration-300',
          'hover:border-villiers-gold/30 hover:shadow-villiers',
          isPublication && 'border-l-4 border-l-villiers-blue',
          isBreve && 'border-l-4 border-l-villiers-gold'
        )}>
          {/* Image pour actualités */}
          {item.imageUrl && !isPublication && !isBreve && (
            <div className="relative aspect-[16/9] overflow-hidden">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          )}

          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {/* Badge type */}
              <Badge
                variant="secondary"
                className={cn(
                  'text-xs',
                  item.type === 'actualite' && 'bg-villiers-green/10 text-villiers-green',
                  item.type === 'publication' && 'bg-villiers-blue/10 text-villiers-blue',
                  item.type === 'breve' && 'bg-villiers-gold/10 text-villiers-gold'
                )}
              >
                {contentTypeLabels[item.type]}
              </Badge>

              {/* Sous-type pour publications */}
              {item.publicationType && (
                <Badge variant="outline" className="text-xs">
                  {publicationTypeLabels[item.publicationType]}
                </Badge>
              )}

              {/* Date */}
              <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                <Calendar className="h-3 w-3" />
                {formattedDate}
              </span>
            </div>

            <h2 className="text-lg font-heading font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {item.title}
            </h2>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {truncate(item.summary, 120)}
            </p>

            {/* Numéro de document */}
            {item.documentNumber && (
              <p className="text-xs font-mono text-muted-foreground mb-3">
                N° {item.documentNumber}
              </p>
            )}

            {/* Bouton PDF pour publications */}
            {item.pdfUrl && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs mt-2"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(item.pdfUrl, '_blank');
                }}
              >
                <Download className="h-3.5 w-3.5" />
                Télécharger PDF
              </Button>
            )}
          </CardContent>

          {/* Indicateur hover */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-villiers-gold origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
        </Card>
      </Link>
    </motion.div>
  );
}
