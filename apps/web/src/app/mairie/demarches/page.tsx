import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ClipboardList, ChevronLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SafeHTML } from '@/components/ui/safe-html';
import api, { type Procedure } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Démarches Administratives',
  description: 'Retrouvez les démarches administratives disponibles à Villiers-Adam et les documents nécessaires.',
};

export default async function DemarchesPage() {
  let items: Procedure[] = [];
  let hasError = false;

  try {
    items = await api.demarches.list();
  } catch (error) {
    console.error('Failed to load demarches:', error);
    hasError = true;
  }
  const hasLiveData = items.length > 0;

  return (
    <div className="min-h-screen">
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-villiers-green/5 to-background" />
        <div className="absolute inset-0 texture-grain opacity-30" />

        <div className="container relative">
          <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
            <Link href="/mairie">
              <ChevronLeft className="h-4 w-4" />
              Retour à La Mairie
            </Link>
          </Button>

          <div className="mt-6 max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-villiers-green/10 border border-villiers-green/20 flex items-center justify-center">
                <ClipboardList className="h-8 w-8 text-villiers-green" />
              </div>
              <div>
                <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-1">
                  <span className="w-8 h-px bg-villiers-gold" />
                  La Mairie
                </span>
                <h1 className="text-3xl lg:text-5xl font-heading font-semibold text-foreground">
                  Démarches administratives
                </h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Retrouvez les démarches disponibles et les documents nécessaires.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="container">
          {hasError && (
            <div className="mb-8 p-4 rounded-organic border border-villiers-gold/25 bg-villiers-gold/5 text-sm text-muted-foreground">
              Les informations sont temporairement indisponibles.
            </div>
          )}
          {!hasError && !hasLiveData && (
            <div className="mb-8 p-4 rounded-organic border border-villiers-gold/25 bg-villiers-gold/5 text-sm text-muted-foreground">
              Aucune donnee publiee pour le moment.
            </div>
          )}
          {!hasError && hasLiveData && (
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
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {item.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-3">{item.summary}</p>
                    )}
                    {item.content && (
                      <SafeHTML
                        html={item.content}
                        className="prose prose-sm max-w-none text-muted-foreground"
                      />
                    )}
                    {item.externalUrl && (
                      <Link
                        href={item.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Accéder à la démarche
                      </Link>
                    )}
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
