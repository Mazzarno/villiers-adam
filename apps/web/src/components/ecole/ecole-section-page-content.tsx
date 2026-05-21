'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ExternalLink, FileText, Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePublicSettings } from '@/hooks/use-public-settings';
import type { EcoleEnfanceSection } from '@/lib/settings';
import { cn } from '@/lib/utils';
import { ECOLE_SECTION_META, type EcoleSectionKey } from './ecole-shared';

function resolveSection(sections: EcoleEnfanceSection[] | undefined, key: EcoleSectionKey): EcoleEnfanceSection | undefined {
  if (!sections || sections.length === 0) return undefined;

  const normalized = sections
    .map((section) => ({
      ...section,
      key: section.key.trim().toLowerCase(),
    }))
    .filter((section) => section.key === key && section.title.trim().length > 0)
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

  return normalized[0];
}

export function EcoleSectionPageContent({ sectionKey }: { sectionKey: EcoleSectionKey }) {
  const { settings, isLoading } = usePublicSettings();
  const ecoleEnfance = settings?.municipalityProfile?.vieQuotidienne?.ecoleEnfance;

  const section = React.useMemo(
    () => resolveSection(ecoleEnfance?.sections, sectionKey),
    [ecoleEnfance?.sections, sectionKey],
  );

  const meta = ECOLE_SECTION_META[sectionKey];
  const Icon = meta.icon;
  const settingsUnavailable = !isLoading && !settings;

  const hasSectionContent = Boolean(
    section?.description?.trim() ||
      section?.content?.trim() ||
      (section?.links && section.links.length > 0) ||
      (section?.documents && section.documents.length > 0),
  );

  return (
    <div className="min-h-screen">
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
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
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div
                className={cn(
                  'w-16 h-16 rounded-xl border flex items-center justify-center',
                  meta.iconWrapperClassName,
                )}
              >
                <Icon className={cn('h-8 w-8', meta.iconClassName)} />
              </div>
              <div>
                <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-1">
                  <span className="w-8 h-px bg-villiers-gold" />
                  Ecole & Enfance
                </span>
                <h1 className="text-3xl lg:text-5xl font-heading font-semibold text-foreground">
                  {section?.title || meta.title}
                </h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {section?.description?.trim() || meta.defaultDescription}
            </p>
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

          {!settingsUnavailable && !section && (
            <div className="p-4 rounded-organic border border-villiers-gold/25 bg-villiers-gold/5 text-sm text-muted-foreground">
              Aucune donnee publiee pour le moment.
            </div>
          )}

          {!settingsUnavailable && section && !hasSectionContent && (
            <div className="p-4 rounded-organic border border-villiers-gold/25 bg-villiers-gold/5 text-sm text-muted-foreground">
              Aucune donnee publiee pour le moment.
            </div>
          )}

          {!settingsUnavailable && section && hasSectionContent && (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {section.content?.trim() && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-background border border-border/50 rounded-organic p-6"
                  >
                    <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{section.content}</p>
                  </motion.div>
                )}

                {section.links && section.links.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="space-y-4"
                  >
                    <h2 className="font-heading text-xl font-semibold text-foreground">Liens utiles</h2>
                    <div className="space-y-3">
                      {section.links.map((link) => (
                        <a
                          key={`${link.label}-${link.url}`}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-3 p-4 bg-background border border-border/50 rounded-organic hover:border-villiers-blue/30 transition-colors"
                        >
                          <span className="text-sm text-foreground">{link.label}</span>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </a>
                      ))}
                    </div>
                  </motion.div>
                )}

                {section.documents && section.documents.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="space-y-4"
                  >
                    <h2 className="font-heading text-xl font-semibold text-foreground">Documents</h2>
                    <div className="space-y-3">
                      {section.documents.map((document) => (
                        <div key={`${document.title}-${document.url || document.mediaId || ''}`} className="p-4 bg-background border border-border/50 rounded-organic">
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
                            {document.mediaId && (
                              <span className="text-muted-foreground">mediaId: {document.mediaId}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="space-y-6">
                {(ecoleEnfance?.schoolContact?.name ||
                  ecoleEnfance?.schoolContact?.address ||
                  ecoleEnfance?.schoolContact?.phone ||
                  ecoleEnfance?.schoolContact?.email ||
                  ecoleEnfance?.schoolContact?.director) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="bg-background border border-border/50 rounded-organic p-6"
                    >
                      <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                        Contact ecole
                      </h3>
                      <div className="space-y-3 text-sm">
                        {ecoleEnfance?.schoolContact?.name && (
                          <p className="font-medium text-foreground">{ecoleEnfance.schoolContact.name}</p>
                        )}
                        {ecoleEnfance?.schoolContact?.director && (
                          <p className="text-muted-foreground">Direction: {ecoleEnfance.schoolContact.director}</p>
                        )}
                        {ecoleEnfance?.schoolContact?.address && (
                          <div className="flex items-start gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                            <span className="whitespace-pre-line">{ecoleEnfance.schoolContact.address}</span>
                          </div>
                        )}
                        {ecoleEnfance?.schoolContact?.phone && (
                          <a
                            href={`tel:${ecoleEnfance.schoolContact.phone.replace(/\s/g, '')}`}
                            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Phone className="h-4 w-4" />
                            {ecoleEnfance.schoolContact.phone}
                          </a>
                        )}
                        {ecoleEnfance?.schoolContact?.email && (
                          <a
                            href={`mailto:${ecoleEnfance.schoolContact.email}`}
                            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Mail className="h-4 w-4" />
                            {ecoleEnfance.schoolContact.email}
                          </a>
                        )}
                      </div>
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
