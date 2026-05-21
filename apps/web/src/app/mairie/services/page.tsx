import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Briefcase, ChevronLeft, Phone, Mail, Globe, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api, { type MunicipalService } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Services Municipaux',
  description: 'Retrouvez les services proposés par la mairie de Villiers-Adam et leurs modalités d\'accueil.',
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

export default async function ServicesPage() {
  let services: MunicipalService[] = [];
  let hasError = false;

  try {
    services = await api.municipalServices.list();
  } catch (error) {
    console.error('Failed to load services:', error);
    hasError = true;
  }
  const hasLiveData = services.length > 0;

  return (
    <div className="min-h-screen">
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-villiers-gold/5 to-background" />
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
              <div className="w-16 h-16 rounded-xl bg-villiers-gold/10 border border-villiers-gold/20 flex items-center justify-center">
                <Briefcase className="h-8 w-8 text-villiers-gold" />
              </div>
              <div>
                <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-1">
                  <span className="w-8 h-px bg-villiers-gold" />
                  La Mairie
                </span>
                <h1 className="text-3xl lg:text-5xl font-heading font-semibold text-foreground">
                  Services municipaux
                </h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Retrouvez les services proposés par la mairie et leurs modalités d&apos;accueil.
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
            {services.map((service) => (
                <Card key={service.id} className="group hover:shadow-lg transition-all">
                  {service.coverImage && (
                    <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg">
                      <Image
                        src={service.coverImage}
                        alt={service.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg leading-tight">{service.name}</CardTitle>
                    {service.category && (
                      <p className="text-xs text-muted-foreground">{service.category}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {service.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">{service.description}</p>
                    )}
                    <div className="space-y-2 text-sm">
                      {service.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <span>{service.address}</span>
                        </div>
                      )}
                      {service.phone && (
                        <div className="flex items-start gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <a href={`tel:${service.phone}`} className="hover:text-primary transition-colors">
                            {service.phone}
                          </a>
                        </div>
                      )}
                      {service.email && (
                        <div className="flex items-start gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <a href={`mailto:${service.email}`} className="hover:text-primary transition-colors">
                            {service.email}
                          </a>
                        </div>
                      )}
                      {service.website && (
                        <div className="flex items-start gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <Link href={service.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                            Site web
                          </Link>
                        </div>
                      )}
                      {formatOpeningHours(service.openingHours) && (
                        <div className="flex items-start gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <span>{formatOpeningHours(service.openingHours)}</span>
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
