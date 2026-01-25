'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  MapPin,
  Phone,
  Mail,
  Globe,
  Building2,
  Users,
  Store,
  Briefcase,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import api, { type DirectoryEntry } from '@/lib/api';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'all', label: 'Tous', icon: Building2 },
  { id: 'ASSOCIATION', label: 'Associations', icon: Users },
  { id: 'COMMERCE', label: 'Commerces', icon: Store },
  { id: 'ENTERPRISE', label: 'Entreprises', icon: Briefcase },
];

const categoryLabels: Record<string, string> = {
  ASSOCIATION: 'Association',
  COMMERCE: 'Commerce',
  ENTERPRISE: 'Entreprise',
};

const categoryColors: Record<string, string> = {
  ASSOCIATION: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  COMMERCE: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  ENTERPRISE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const formatOpeningHours = (hours?: unknown) => {
  if (!hours) return undefined;
  if (typeof hours === 'string') return hours;
  if (Array.isArray(hours)) return hours.join(' · ');
  if (typeof hours === 'object') {
    return Object.entries(hours as Record<string, string>)
      .map(([day, value]) => `${day}: ${value}`)
      .join(' · ');
  }
  return undefined;
};

export default function AnnuairePage() {
  const [entries, setEntries] = React.useState<DirectoryEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  React.useEffect(() => {
    const load = async () => {
      try {
        const data = await api.directory.list();
        setEntries(data);
      } catch (error) {
        console.error('Failed to load directory:', error);
        setEntries([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const filteredEntries = React.useMemo(() => {
    let filtered = entries;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((entry) => entry.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((entry) =>
        [entry.name, entry.description, entry.address]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [entries, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Annuaire
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl">
            Retrouvez les associations, commerces et services de Villiers-Adam.
          </p>
        </div>
      </section>

      {/* Search and filters */}
      <section className="border-b bg-background sticky top-[7.5rem] z-40">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = category.id === selectedCategory;
                return (
                  <Button
                    key={category.id}
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className="rounded-full"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {category.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Directory list */}
      <section className="container py-12">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center text-muted-foreground">
            Aucun résultat pour cette recherche.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntries.map((entry) => (
              <Card key={entry.id} className="group hover:shadow-lg transition-all">
                {entry.featuredImage && (
                  <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg">
                    <Image
                      src={entry.featuredImage}
                      alt={entry.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-tight">
                      {entry.name}
                    </CardTitle>
                    {entry.category && (
                      <Badge
                        className={cn(
                          'shrink-0',
                          categoryColors[entry.category] || 'bg-muted',
                        )}
                      >
                        {categoryLabels[entry.category] || entry.category}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {entry.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {entry.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm">
                    {entry.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span>{entry.address}</span>
                      </div>
                    )}
                    {entry.phone && (
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <a href={`tel:${entry.phone}`} className="hover:text-primary transition-colors">
                          {entry.phone}
                        </a>
                      </div>
                    )}
                    {entry.email && (
                      <div className="flex items-start gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <a href={`mailto:${entry.email}`} className="hover:text-primary transition-colors">
                          {entry.email}
                        </a>
                      </div>
                    )}
                    {entry.website && (
                      <div className="flex items-start gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <Link href={entry.website} target="_blank" className="hover:text-primary transition-colors">
                          Site web
                        </Link>
                      </div>
                    )}
                    {formatOpeningHours(entry.openingHours) && (
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span>{formatOpeningHours(entry.openingHours)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
