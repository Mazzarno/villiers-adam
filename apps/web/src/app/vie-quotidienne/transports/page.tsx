import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Bus, ChevronLeft, ExternalLink, Phone, Car, Train, GraduationCap, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SafeHTML } from '@/components/ui/safe-html';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapEmbed } from '@/components/map/map-embed';
import api, { type TransportInfo } from '@/lib/api';
import { getPublicSettings } from '@/lib/settings';

export const metadata: Metadata = {
  title: 'Transports',
  description: 'Informations sur les transports publics a Villiers-Adam, lignes disponibles et contacts utiles.',
};

export default async function TransportsPage() {
  let items: TransportInfo[] = [];
  let hasError = false;

  try {
    items = await api.transports.list();
  } catch (error) {
    console.error('Failed to load transports:', error);
    hasError = true;
  }

  const publicSettings = await getPublicSettings();
  const coordinates = publicSettings?.municipalityProfile?.coordinates;
  const settingsUnavailable = publicSettings === null;
  const hasLiveData = items.length > 0;

  return (
    <div className="min-h-screen">
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-villiers-blue/5 to-background" />
        <div className="absolute inset-0 texture-grain opacity-30" />

        <div className="container relative">
          <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
            <Link href="/vie-quotidienne">
              <ChevronLeft className="h-4 w-4" />
              Retour a Vie quotidienne
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
              Informations sur les transports publics, acces routier et moyens de deplacement a Villiers-Adam.
            </p>
          </div>
        </div>
      </section>

      {/* Contenu statique permanent */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Acces routier */}
            <div className="p-6 bg-background border border-border/50 rounded-organic">
              <div className="w-12 h-12 rounded-full bg-villiers-blue/10 flex items-center justify-center mb-4">
                <Car className="h-5 w-5 text-villiers-blue" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                Acces routier
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Villiers-Adam est accessible par l&apos;A115 (sortie Meriel/Villiers-Adam)
                et par les routes departementales D922 et D78. La commune se situe a environ
                30 km au nord de Paris.
              </p>
            </div>

            {/* Gare la plus proche */}
            <div className="p-6 bg-background border border-border/50 rounded-organic">
              <div className="w-12 h-12 rounded-full bg-villiers-gold/10 flex items-center justify-center mb-4">
                <Train className="h-5 w-5 text-villiers-gold" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                Gare la plus proche
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                La gare de Meriel (ligne H du Transilien) se trouve a environ 3 km.
                Elle dessert Paris Gare du Nord et les communes du Val-d&apos;Oise.
              </p>
              <a
                href="https://www.transilien.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline mt-3"
              >
                <ExternalLink className="h-4 w-4" />
                Transilien
              </a>
            </div>

            {/* Transport scolaire */}
            <div className="p-6 bg-background border border-border/50 rounded-organic">
              <div className="w-12 h-12 rounded-full bg-villiers-green/10 flex items-center justify-center mb-4">
                <GraduationCap className="h-5 w-5 text-villiers-green" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                Transport scolaire
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Un service de transport scolaire est organise pour les eleves de la commune.
                Renseignez-vous en mairie pour les inscriptions et les horaires.
              </p>
              <Link
                href="/vie-quotidienne/transports/transport-scolaire"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline mt-3"
              >
                En savoir plus
              </Link>
            </div>
          </div>

          {/* Lien Ile-de-France Mobilites */}
          <div className="p-6 bg-villiers-blue/5 border border-villiers-blue/20 rounded-organic mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-heading text-lg font-semibold text-foreground mb-1">
                  Ile-de-France Mobilites
                </h3>
                <p className="text-sm text-muted-foreground">
                  Consultez les horaires, itineraires et perturbations des transports en commun de la region.
                </p>
              </div>
              <a
                href="https://www.iledefrance-mobilites.fr"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="rounded-organic gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Acceder au site
                </Button>
              </a>
            </div>
          </div>

          {/* Donnees dynamiques de l'API */}
          <div className="mb-12">
            {hasError && (
              <div className="mb-6 p-4 rounded-organic border border-villiers-gold/25 bg-villiers-gold/5 text-sm text-muted-foreground">
                Les informations sont temporairement indisponibles.
              </div>
            )}
            {!hasError && !hasLiveData && (
              <div className="mb-6 p-4 rounded-organic border border-villiers-gold/25 bg-villiers-gold/5 text-sm text-muted-foreground">
                Aucune donnee publiee pour le moment.
              </div>
            )}
            <h2 className="font-heading text-2xl font-semibold text-foreground mb-6">
              Lignes et services
            </h2>
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
                    {item.operator && (
                      <p className="text-xs text-muted-foreground">Operateur : {item.operator}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {item.summary && (
                      <p className="text-sm text-muted-foreground">{item.summary}</p>
                    )}
                    {item.content && (
                      <SafeHTML
                        html={item.content}
                        className="prose prose-sm max-w-none text-muted-foreground"
                      />
                    )}
                    <div className="space-y-2 text-sm">
                      {item.website && (
                        <Link href={item.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
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

          {/* Carte interactive */}
          <div className="rounded-organic-lg overflow-hidden border border-border/50">
            <div className="p-4 bg-background border-b border-border/50">
              <h3 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
                <MapPin className="h-5 w-5 text-villiers-gold" />
                Localisation de la commune
              </h3>
            </div>
            <div className="aspect-[21/9]">
              {coordinates ? (
                <MapEmbed
                  lat={coordinates.lat}
                  lng={coordinates.lng}
                  label="Villiers-Adam"
                  className="h-full w-full"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-muted/20 px-6 text-center text-sm text-muted-foreground">
                  {settingsUnavailable
                    ? 'Les informations sont temporairement indisponibles.'
                    : 'Aucune donnee publiee pour le moment.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
