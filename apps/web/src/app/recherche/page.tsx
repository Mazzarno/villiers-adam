'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  FileText,
  Calendar,
  Building2,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, truncate, cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: 'article' | 'page' | 'event' | 'directory';
  title: string;
  slug: string;
  excerpt?: string;
  date?: string;
  category?: string;
}

// Données de démonstration
const demoResults: SearchResult[] = [
  {
    id: '1',
    type: 'article',
    title: 'Travaux de voirie : réfection de la rue principale',
    slug: 'actualites/travaux-voirie-rue-principale',
    excerpt: 'La commune entreprend des travaux de réfection de la chaussée rue principale.',
    date: '2025-01-10T10:00:00Z',
    category: 'Travaux',
  },
  {
    id: '2',
    type: 'event',
    title: 'Voeux du Maire à la population',
    slug: 'agenda/voeux-maire-2025',
    excerpt: 'La municipalité vous convie à la cérémonie des voeux du Maire.',
    date: '2025-01-26T18:00:00Z',
    category: 'Cérémonie',
  },
  {
    id: '3',
    type: 'page',
    title: 'Démarches administratives',
    slug: 'mairie/demarches',
    excerpt: 'Retrouvez toutes les démarches administratives : état civil, urbanisme, élections...',
  },
  {
    id: '4',
    type: 'directory',
    title: 'Bibliothèque municipale',
    slug: 'annuaire',
    excerpt: 'Prêt de livres, BD, magazines. Espace multimédia et animations.',
    category: 'Service public',
  },
];

const typeConfig: Record<
  string,
  { label: string; icon: typeof FileText; color: string }
> = {
  article: {
    label: 'Actualité',
    icon: FileText,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  page: {
    label: 'Page',
    icon: FileText,
    color: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
  },
  event: {
    label: 'Événement',
    icon: Calendar,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  directory: {
    label: 'Annuaire',
    icon: Building2,
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  },
};

const filterOptions = [
  { value: 'all', label: 'Tous les résultats' },
  { value: 'article', label: 'Actualités' },
  { value: 'page', label: 'Pages' },
  { value: 'event', label: 'Événements' },
  { value: 'directory', label: 'Annuaire' },
];

export default function RecherchePage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    // Simulation de recherche avec les données de démo
    await new Promise((resolve) => setTimeout(resolve, 500));

    const filtered = demoResults.filter(
      (result) =>
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setResults(filtered);
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const filteredResults =
    filter === 'all' ? results : results.filter((r) => r.type === filter);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero with search */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Recherche
          </h1>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl">
            Trouvez rapidement l'information que vous cherchez sur le site de Villiers-Adam.
          </p>

          <form onSubmit={handleSubmit} className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher des actualités, événements, démarches..."
                className="h-14 pl-12 pr-4 text-lg bg-background text-foreground"
              />
              <Button
                type="submit"
                size="lg"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Rechercher'
                )}
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Filters */}
      {searched && (
        <section className="border-b bg-background sticky top-[7.5rem] z-40">
          <div className="container py-4">
            <div className="flex flex-wrap items-center gap-2">
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={filter === option.value ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-full"
                  onClick={() => setFilter(option.value)}
                >
                  {option.label}
                  {option.value !== 'all' && (
                    <span className="ml-1 text-xs">
                      ({results.filter((r) => r.type === option.value).length})
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      <section className="container py-12">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : searched ? (
          <>
            {/* Results count */}
            <p className="text-muted-foreground mb-6">
              {filteredResults.length} résultat{filteredResults.length !== 1 ? 's' : ''}{' '}
              {query && `pour "${query}"`}
            </p>

            {/* Results list */}
            {filteredResults.length > 0 ? (
              <div className="space-y-4">
                {filteredResults.map((result) => {
                  const config = typeConfig[result.type];
                  const Icon = config.icon;

                  return (
                    <Link key={result.id} href={`/${result.slug}`}>
                      <Card className="group hover:shadow-lg transition-all hover:-translate-y-0.5">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="shrink-0">
                              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                                <Icon className="h-6 w-6 text-muted-foreground" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Badge className={cn('font-normal', config.color)}>
                                  {config.label}
                                </Badge>
                                {result.category && (
                                  <Badge variant="outline">{result.category}</Badge>
                                )}
                                {result.date && (
                                  <span className="text-sm text-muted-foreground">
                                    {formatDate(result.date)}
                                  </span>
                                )}
                              </div>
                              <h2 className="font-heading text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                                {result.title}
                              </h2>
                              {result.excerpt && (
                                <p className="text-muted-foreground line-clamp-2">
                                  {result.excerpt}
                                </p>
                              )}
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <Search className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Aucun résultat</h2>
                <p className="text-muted-foreground mb-6">
                  Aucun résultat ne correspond à votre recherche.
                  <br />
                  Essayez avec d'autres mots-clés.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button variant="outline" onClick={() => setQuery('démarches')}>
                    Démarches
                  </Button>
                  <Button variant="outline" onClick={() => setQuery('événements')}>
                    Événements
                  </Button>
                  <Button variant="outline" onClick={() => setQuery('contact')}>
                    Contact
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Search className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Effectuez une recherche</h2>
            <p className="text-muted-foreground mb-6">
              Entrez un ou plusieurs mots-clés pour rechercher
              <br />
              dans le contenu du site.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="text-sm text-muted-foreground">Suggestions :</span>
              <Button
                variant="link"
                size="sm"
                onClick={() => {
                  setQuery('travaux');
                  performSearch('travaux');
                }}
              >
                travaux
              </Button>
              <Button
                variant="link"
                size="sm"
                onClick={() => {
                  setQuery('association');
                  performSearch('association');
                }}
              >
                association
              </Button>
              <Button
                variant="link"
                size="sm"
                onClick={() => {
                  setQuery('école');
                  performSearch('école');
                }}
              >
                école
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
