'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ExternalLink, FileText, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePublicSettings } from '@/hooks/use-public-settings';
import type { RestaurationScolaireContent } from '@/lib/settings';

function hasRestaurationContent(content: RestaurationScolaireContent | undefined): boolean {
  if (!content) return false;

  return Boolean(
    content.title?.trim() ||
      content.intro?.trim() ||
      content.menuCourant ||
      content.tarifs?.trim() ||
      content.inscription?.trim() ||
      content.allergies?.trim() ||
      content.engagements?.trim() ||
      (content.documents && content.documents.length > 0),
  );
}

function hasMenu(menu: RestaurationScolaireContent['menuCourant']): boolean {
  if (!menu) return false;

  return Boolean(
    menu.weekLabel?.trim() ||
      menu.validFrom?.trim() ||
      menu.validTo?.trim() ||
      menu.format ||
      menu.textContent?.trim() ||
      menu.imageUrl?.trim() ||
      menu.imageMediaId?.trim() ||
      menu.pdfUrl?.trim() ||
      menu.pdfMediaId?.trim(),
  );
}

export function RestaurationScolairePageContent() {
  const { settings, isLoading } = usePublicSettings();
  const restauration = settings?.municipalityProfile?.vieQuotidienne?.restaurationScolaire;

  const settingsUnavailable = !isLoading && !settings;
  const isEmpty = !settingsUnavailable && !isLoading && !hasRestaurationContent(restauration);
  const hasCurrentMenu = hasMenu(restauration?.menuCourant);

  const title = restauration?.title?.trim() || 'Restauration scolaire';
  const intro = restauration?.intro?.trim();

  return (
    <div className="min-h-screen">
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-background" />
        <div className="absolute inset-0 texture-grain opacity-30" />

        <div className="container relative">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
            <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
              <Link href="/ecole">
                <ChevronLeft className="h-4 w-4" />
                Retour a Ecole & Enfance
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center">
                <Utensils className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <span className="text-sm font-mono text-villiers-gold">Ecole & Enfance</span>
                <h1 className="text-3xl lg:text-5xl font-heading font-semibold text-foreground">{title}</h1>
              </div>
            </div>
            {intro ? (
              <p className="text-lg text-muted-foreground">{intro}</p>
            ) : (
              <p className="text-lg text-muted-foreground">
                Informations de restauration scolaire et menu hebdomadaire.
              </p>
            )}
          </motion.div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="container space-y-8">
          {settingsUnavailable && (
            <div className="p-4 rounded-organic border border-villiers-gold/25 bg-villiers-gold/5 text-sm text-muted-foreground">
              Les informations sont temporairement indisponibles.
            </div>
          )}

          {isEmpty && (
            <div className="p-4 rounded-organic border border-villiers-gold/25 bg-villiers-gold/5 text-sm text-muted-foreground">
              Aucune donnee publiee pour le moment.
            </div>
          )}

          {!settingsUnavailable && !isEmpty && (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-background border border-border/50 rounded-organic p-6"
                >
                  <h2 className="font-heading text-xl font-semibold text-foreground mb-4">Menu courant</h2>

                  {hasCurrentMenu ? (
                    <div className="space-y-4 text-sm">
                      <div className="flex flex-wrap gap-2 text-muted-foreground">
                        {restauration?.menuCourant?.weekLabel && (
                          <span className="rounded-full border border-border/60 px-3 py-1">
                            {restauration.menuCourant.weekLabel}
                          </span>
                        )}
                        {restauration?.menuCourant?.validFrom && (
                          <span className="rounded-full border border-border/60 px-3 py-1">
                            Du {new Date(restauration.menuCourant.validFrom).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                        {restauration?.menuCourant?.validTo && (
                          <span className="rounded-full border border-border/60 px-3 py-1">
                            Au {new Date(restauration.menuCourant.validTo).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                        {restauration?.menuCourant?.format && (
                          <span className="rounded-full border border-border/60 px-3 py-1">
                            Format {restauration.menuCourant.format}
                          </span>
                        )}
                      </div>

                      {restauration?.menuCourant?.textContent?.trim() ? (
                        <div className="rounded-lg border border-border/60 p-4 text-muted-foreground whitespace-pre-line leading-relaxed">
                          {restauration.menuCourant.textContent}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Aucun texte de menu publie.</p>
                      )}

                      <div className="flex flex-wrap gap-3">
                        {restauration?.menuCourant?.imageUrl && (
                          <a
                            href={restauration.menuCourant.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-primary hover:underline"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Ouvrir image du menu
                          </a>
                        )}
                        {restauration?.menuCourant?.pdfUrl && (
                          <a
                            href={restauration.menuCourant.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-primary hover:underline"
                          >
                            <FileText className="h-4 w-4" />
                            Ouvrir PDF du menu
                          </a>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground space-y-1">
                        {!restauration?.menuCourant?.imageUrl && restauration?.menuCourant?.imageMediaId && (
                          <p>Image mediaId: {restauration.menuCourant.imageMediaId}</p>
                        )}
                        {!restauration?.menuCourant?.pdfUrl && restauration?.menuCourant?.pdfMediaId && (
                          <p>PDF mediaId: {restauration.menuCourant.pdfMediaId}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucun menu courant publie pour le moment.</p>
                  )}
                </motion.div>

                {restauration?.tarifs?.trim() && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-background border border-border/50 rounded-organic p-6"
                  >
                    <h2 className="font-heading text-xl font-semibold text-foreground mb-4">Tarifs</h2>
                    <p className="text-muted-foreground whitespace-pre-line">{restauration.tarifs}</p>
                  </motion.div>
                )}

                {restauration?.inscription?.trim() && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-background border border-border/50 rounded-organic p-6"
                  >
                    <h2 className="font-heading text-xl font-semibold text-foreground mb-4">Inscription</h2>
                    <p className="text-muted-foreground whitespace-pre-line">{restauration.inscription}</p>
                  </motion.div>
                )}

                {restauration?.documents && restauration.documents.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-background border border-border/50 rounded-organic p-6"
                  >
                    <h2 className="font-heading text-xl font-semibold text-foreground mb-4">Documents</h2>
                    <div className="space-y-3">
                      {restauration.documents.map((document) => (
                        <div key={`${document.title}-${document.url || document.mediaId || ''}`} className="rounded-lg border border-border/60 p-4">
                          <p className="font-medium text-foreground">{document.title}</p>
                          {document.description && (
                            <p className="text-sm text-muted-foreground mt-1">{document.description}</p>
                          )}
                          <div className="mt-3 flex flex-wrap gap-3 text-sm">
                            {document.url && (
                              <a
                                href={document.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-primary hover:underline"
                              >
                                <FileText className="h-4 w-4" />
                                Ouvrir
                              </a>
                            )}
                            {document.mediaId && <span className="text-muted-foreground">mediaId: {document.mediaId}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="space-y-6">
                {restauration?.allergies?.trim() && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-muted/30 rounded-organic p-6"
                  >
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-3">Allergies</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{restauration.allergies}</p>
                  </motion.div>
                )}

                {restauration?.engagements?.trim() && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-muted/30 rounded-organic p-6"
                  >
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-3">Engagements</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{restauration.engagements}</p>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
