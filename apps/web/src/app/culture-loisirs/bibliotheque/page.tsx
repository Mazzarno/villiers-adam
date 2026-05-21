'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  ChevronLeft,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  BookMarked,
  Baby,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api, { type MunicipalService } from '@/lib/api';
import { formatOpeningHours } from '@/lib/utils';

export default function BibliothequePage() {
  const [services, setServices] = React.useState<MunicipalService[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const load = async () => {
      try {
        const data = await api.municipalServices.list();
        setServices(
          data.filter(
            (s) =>
              s.category?.toUpperCase() === 'BIBLIOTHEQUE' ||
              s.category?.toUpperCase() === 'MEDIATHEQUE'
          )
        );
      } catch (error) {
        console.error('Erreur lors du chargement de la bibliothèque:', error);
        setServices([]);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const libraryService = services[0];
  const hasLibraryData = services.length > 0;
  const openingHours = formatOpeningHours(libraryService?.openingHours);
  const addressLine = libraryService?.address;
  const contactPhone = libraryService?.phone;
  const contactEmail = libraryService?.email;
  const contactWebsite = libraryService?.website;

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-background dark:from-orange-950/20" />
        <div className="absolute inset-0 texture-grain opacity-30" />

        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
              <Link href="/culture-loisirs">
                <ChevronLeft className="h-4 w-4" />
                Retour à Culture & Loisirs
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center dark:bg-orange-950/30 dark:border-orange-900">
                <BookOpen className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-1">
                  <span className="w-8 h-px bg-villiers-gold" />
                  Culture & Loisirs
                </span>
                <h1 className="text-3xl lg:text-5xl font-heading font-semibold text-foreground">
                  Bibliothèque
                </h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              La bibliothèque municipale de Villiers-Adam propose un espace de lecture
              et de prêt pour tous les âges. Découvrez notre collection de livres,
              revues et activités culturelles.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contenu */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contenu principal */}
            <div className="lg:col-span-2 space-y-8">
              {hasError && (
                <div className="p-4 rounded-organic border border-villiers-gold/25 bg-villiers-gold/5 text-sm text-muted-foreground">
                  Les informations sont temporairement indisponibles.
                </div>
              )}
              {!hasError && !isLoading && !hasLibraryData && (
                <div className="p-4 rounded-organic border border-villiers-gold/25 bg-villiers-gold/5 text-sm text-muted-foreground">
                  Aucune donnee publiee pour le moment.
                </div>
              )}

              {/* Services */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-6">
                  Nos services
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-background border border-border/50 rounded-organic">
                    <div className="flex items-center gap-3 mb-2">
                      <BookMarked className="h-5 w-5 text-orange-600" />
                      <h3 className="font-medium text-foreground">Prêt de livres</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Romans, documentaires, BD et magazines pour tous les âges.
                      Prêt gratuit pour les habitants.
                    </p>
                  </div>
                  <div className="p-4 bg-background border border-border/50 rounded-organic">
                    <div className="flex items-center gap-3 mb-2">
                      <Baby className="h-5 w-5 text-orange-600" />
                      <h3 className="font-medium text-foreground">Espace enfants</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Coin lecture dédié aux enfants avec albums, contes
                      et premiers romans.
                    </p>
                  </div>
                  <div className="p-4 bg-background border border-border/50 rounded-organic">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="h-5 w-5 text-orange-600" />
                      <h3 className="font-medium text-foreground">Animations</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Heures du conte, ateliers créatifs et rencontres littéraires
                      ponctuelles.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Inscription */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-orange-50/50 border border-orange-200/50 rounded-organic p-6 dark:bg-orange-950/20 dark:border-orange-900/30"
              >
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                  Comment s&apos;inscrire ?
                </h3>
                <p className="text-muted-foreground mb-4">
                  L&apos;inscription est gratuite pour les habitants de Villiers-Adam.
                  Présentez-vous à la bibliothèque avec :
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                    Une pièce d&apos;identité
                  </li>
                  <li className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                    Un justificatif de domicile
                  </li>
                </ul>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Horaires */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-background border border-border/50 rounded-organic p-6"
              >
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-villiers-gold" />
                  Horaires d&apos;ouverture
                </h3>
                <div className="space-y-2 text-sm">
                  {isLoading ? (
                    <p className="text-muted-foreground">Chargement des horaires...</p>
                  ) : openingHours ? (
                    openingHours.map((row) => (
                      <div key={row.label} className="flex justify-between gap-4">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="font-mono text-foreground text-right">{row.value}</span>
                      </div>
                    ))
                  ) : hasError ? (
                    <p className="text-muted-foreground">Les informations sont temporairement indisponibles.</p>
                  ) : (
                    <p className="text-muted-foreground">Aucun horaire publie pour le moment.</p>
                  )}
                </div>
                {!openingHours && !hasError && (
                  <p className="text-xs text-muted-foreground mt-4">
                    Les horaires seront affiches des qu&apos;ils seront publies.
                  </p>
                )}
              </motion.div>

              {/* Localisation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-muted/30 rounded-organic p-6"
              >
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-villiers-gold" />
                  Localisation
                </h3>
                {addressLine ? (
                  <p className="text-sm text-muted-foreground">
                    {addressLine}
                  </p>
                ) : hasError ? (
                  <p className="text-sm text-muted-foreground">
                    Les informations sont temporairement indisponibles.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Aucune adresse publiee pour le moment.
                  </p>
                )}
              </motion.div>

              {/* Contact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-background border border-border/50 rounded-organic p-6"
              >
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                  Contact
                </h3>
                {contactPhone ? (
                  <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="flex items-center gap-3 text-sm hover:text-primary transition-colors group">
                    <Phone className="h-4 w-4 text-villiers-gold" />
                    <span className="font-mono">{contactPhone}</span>
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {hasError
                      ? 'Les informations sont temporairement indisponibles.'
                      : 'Aucun telephone publie pour le moment.'}
                  </p>
                )}
                {contactEmail && (
                  <a
                    href={`mailto:${contactEmail}`}
                    className="flex items-center gap-3 text-sm hover:text-primary transition-colors group mt-3"
                  >
                    <Mail className="h-4 w-4 text-villiers-gold" />
                    <span>{contactEmail}</span>
                  </a>
                )}
                {contactWebsite && (
                  <a
                    href={contactWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm hover:text-primary transition-colors group mt-3"
                  >
                    <Globe className="h-4 w-4 text-villiers-gold" />
                    <span>Site web</span>
                  </a>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
