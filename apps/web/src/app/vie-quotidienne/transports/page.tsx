'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bus, ChevronLeft, ExternalLink, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api, { type TransportInfo } from '@/lib/api';

export default function TransportsPage() {
  const [items, setItems] = React.useState<TransportInfo[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      try {
        const data = await api.transports.list();
        setItems(data);
      } catch (error) {
        console.error('Failed to load transports:', error);
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
        <div className="absolute inset-0 bg-gradient-to-b from-villiers-blue/5 to-background" />
        <div className="absolute inset-0 texture-grain opacity-30" />

        <div className="container relative">
          <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
            <Link href="/vie-quotidienne">
              <ChevronLeft className="h-4 w-4" />
              Retour à Vie quotidienne
            </Link>
          </Button>

          <div className="mt-6 max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-villiers-blue/10 border border-villiers-blue/20 flex items-center justify-center">
                <Bus className="h-8 w-8 text-villiers-blue" />
              </div>
              <div>
                <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-1">
                  <span className="w-8 h-px bg-villiers-gold" />
                  Vie quotidienne
                </span>
                <h1 className="text-3xl lg:text-5xl font-heading font-semibold text-foreground">
                  Transports
                </h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Informations sur les transports publics, lignes disponibles et contacts utiles.
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
              Aucune information de transport publiée.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <Card key={item.id} className="group hover:shadow-lg transition-all">
                  {item.coverImage && (
                    <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg">
                      <Image
                        src={item.coverImage}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg leading-tight">{item.title}</CardTitle>
                    {item.operator && (
                      <p className="text-xs text-muted-foreground">Opérateur : {item.operator}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {item.summary && (
                      <p className="text-sm text-muted-foreground">{item.summary}</p>
                    )}
                    {item.content && (
                      <div
                        className="prose prose-sm max-w-none text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: item.content }}
                      />
                    )}
                    <div className="space-y-2 text-sm">
                      {item.website && (
                        <Link href={item.website} target="_blank" className="inline-flex items-center gap-2 text-primary hover:underline">
                          <ExternalLink className="h-4 w-4" />
                          Site officiel
                        </Link>
                      )}
                      {item.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a href={`tel:${item.phone}`} className="hover:text-primary transition-colors">
                            {item.phone}
                          </a>
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
