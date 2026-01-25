'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Users, ChevronLeft, MapPin, Mail, Phone, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api, { type DirectoryEntry } from '@/lib/api';

export default function AssociationsPage() {
  const [items, setItems] = React.useState<DirectoryEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      try {
        const data = await api.directory.list({ type: 'ASSOCIATION' });
        setItems(data);
      } catch (error) {
        console.error('Failed to load associations:', error);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen">
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-villiers-gold/5 to-background" />
        <div className="absolute inset-0 texture-grain opacity-30" />

        <div className="container relative">
          <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
            <Link href="/culture-loisirs">
              <ChevronLeft className="h-4 w-4" />
              Retour à Culture & Loisirs
            </Link>
          </Button>

          <div className="mt-6 max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-villiers-gold/10 border border-villiers-gold/20 flex items-center justify-center">
                <Users className="h-8 w-8 text-villiers-gold" />
              </div>
              <div>
                <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-1">
                  <span className="w-8 h-px bg-villiers-gold" />
                  Culture & Loisirs
                </span>
                <h1 className="text-3xl lg:text-5xl font-heading font-semibold text-foreground">
                  Associations
                </h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Retrouvez les associations culturelles, sportives et solidaires de la commune.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="container">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center text-muted-foreground">
              Aucune association publiée pour le moment.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <Card key={item.id} className="group hover:shadow-lg transition-all">
                  {item.featuredImage && (
                    <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg">
                      <Image
                        src={item.featuredImage}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg leading-tight">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
                    )}
                    <div className="space-y-2 text-sm">
                      {item.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <span>{item.address}</span>
                        </div>
                      )}
                      {item.email && (
                        <div className="flex items-start gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <a href={`mailto:${item.email}`} className="hover:text-primary transition-colors">
                            {item.email}
                          </a>
                        </div>
                      )}
                      {item.phone && (
                        <div className="flex items-start gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <a href={`tel:${item.phone}`} className="hover:text-primary transition-colors">
                            {item.phone}
                          </a>
                        </div>
                      )}
                      {item.website && (
                        <div className="flex items-start gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <Link href={item.website} target="_blank" className="hover:text-primary transition-colors">
                            Site web
                          </Link>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
