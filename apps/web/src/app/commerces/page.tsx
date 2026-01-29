import type { Metadata } from 'next';
import { Store, MapPin, Phone, Mail, Globe, Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

export const metadata: Metadata = {
  title: 'Commerces',
  description: 'Découvrez les commerces et artisans de Villiers-Adam',
};

type OpeningHours = {
  [key: string]: string;
};

function formatOpeningHours(hours: unknown): OpeningHours | null {
  if (!hours || typeof hours !== 'object') return null;
  return hours as OpeningHours;
}

function OpeningHoursDisplay({ hours }: { hours: unknown }) {
  const formattedHours = formatOpeningHours(hours);

  if (!formattedHours) return null;

  const daysOrder = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const sortedDays = Object.keys(formattedHours).sort(
    (a, b) => daysOrder.indexOf(a) - daysOrder.indexOf(b)
  );

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm font-medium mb-2">
        <Clock className="h-4 w-4 text-villiers-gold" />
        <span>Horaires d&apos;ouverture</span>
      </div>
      <div className="text-sm space-y-1 pl-6">
        {sortedDays.map((day) => (
          <div key={day} className="flex justify-between">
            <span className="text-muted-foreground">{day}</span>
            <span className="font-medium">{formattedHours[day]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function CommercesPage() {
  let commerces = [];

  try {
    const allEntries = await api.annuaire.list();
    commerces = allEntries.filter(
      (entry) => entry.type === 'COMMERCE' && entry.status === 'PUBLISHED'
    );
  } catch (error) {
    console.error('Erreur lors du chargement des commerces:', error);
  }

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
        <div className="absolute inset-0 texture-grain opacity-30" />

        <div className="container relative">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-4">
              <span className="w-8 h-px bg-villiers-gold" />
              Vie économique
            </span>
            <h1 className="text-4xl lg:text-6xl font-heading font-semibold text-foreground mb-6">
              Commerces & <span className="display-italic">Artisans</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Découvrez les commerces de proximité et artisans de Villiers-Adam.
              Privilégier le commerce local, c&apos;est soutenir l&apos;économie de notre commune
              et préserver le lien social.
            </p>
          </div>
        </div>
      </section>

      {/* Commerces grid */}
      <section className="py-12 lg:py-16">
        <div className="container">
          {commerces.length === 0 ? (
            <div className="text-center py-16">
              <Store className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Aucun commerce n&apos;est actuellement référencé.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-8">
                <span className="font-mono text-foreground">{commerces.length}</span>{' '}
                commerce{commerces.length > 1 ? 's' : ''} référencé{commerces.length > 1 ? 's' : ''}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {commerces.map((commerce) => {
                  const hasAddress = commerce.addressLine1 || commerce.city;
                  const cityLine = [commerce.postalCode, commerce.city]
                    .filter(Boolean)
                    .join(' ');
                  const fullAddress = [
                    commerce.addressLine1,
                    commerce.addressLine2,
                    cityLine,
                  ]
                    .filter(Boolean)
                    .join(', ');

                  return (
                    <Card
                      key={commerce.id}
                      className="overflow-hidden group hover:border-villiers-gold/30 hover:shadow-villiers transition-all duration-300"
                    >
                      {commerce.coverMedia?.url && (
                        <div className="relative aspect-[16/9] overflow-hidden">
                          <Image
                            src={commerce.coverMedia.url}
                            alt={commerce.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                      )}

                      <CardHeader>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <CardTitle className="text-xl group-hover:text-primary transition-colors">
                            {commerce.name}
                          </CardTitle>
                          <Badge variant="secondary" className="bg-villiers-gold/10 text-villiers-gold">
                            <Store className="h-3 w-3 mr-1" />
                            Commerce
                          </Badge>
                        </div>
                        {commerce.description && (
                          <CardDescription className="line-clamp-2">
                            {commerce.description}
                          </CardDescription>
                        )}
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Contact info */}
                        <div className="space-y-2">
                          {hasAddress && (
                            <div className="flex items-start gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">{fullAddress}</span>
                            </div>
                          )}
                          {commerce.phone && (
                            <a
                              href={`tel:${commerce.phone}`}
                              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Phone className="h-4 w-4 flex-shrink-0" />
                              <span>{commerce.phone}</span>
                            </a>
                          )}
                          {commerce.email && (
                            <a
                              href={`mailto:${commerce.email}`}
                              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Mail className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{commerce.email}</span>
                            </a>
                          )}
                          {commerce.website && (
                            <a
                              href={commerce.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-villiers-gold hover:text-villiers-gold/80 transition-colors"
                            >
                              <Globe className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">Voir le site web</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>

                        {/* Opening hours */}
                        {commerce.openingHours && (
                          <div className="pt-4 border-t border-border/50">
                            <OpeningHoursDisplay hours={commerce.openingHours} />
                          </div>
                        )}

                        {/* Map link if coordinates */}
                        {commerce.latitude && commerce.longitude && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            asChild
                          >
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${commerce.latitude},${commerce.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MapPin className="h-4 w-4 mr-2" />
                              Voir sur la carte
                              <ExternalLink className="h-3 w-3 ml-2" />
                            </a>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}

          {/* CTA */}
          <div className="mt-12 p-8 bg-muted/50 rounded-organic border border-border/50">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-heading font-semibold mb-4">
                Vous êtes commerçant ou artisan ?
              </h2>
              <p className="text-muted-foreground mb-6">
                Faites-vous connaître auprès des habitants de Villiers-Adam en rejoignant
                notre annuaire des commerces locaux.
              </p>
              <Button asChild>
                <Link href="/contact">
                  Nous contacter
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
