'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Mail, MapPin, Phone, School } from 'lucide-react';
import { usePublicSettings } from '@/hooks/use-public-settings';
import { cn } from '@/lib/utils';
import type { EcoleEnfanceSection } from '@/lib/settings';
import { ECOLE_SECTION_META, ECOLE_SECTION_ORDER, isEcoleSectionKey, type EcoleSectionKey } from './ecole-shared';

type ResolvedSection = {
  key: EcoleSectionKey;
  section: EcoleEnfanceSection;
};

function resolveSections(sections: EcoleEnfanceSection[] | undefined): ResolvedSection[] {
  if (!sections || sections.length === 0) return [];

  const sorted = [...sections].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
  const map = new Map<EcoleSectionKey, EcoleEnfanceSection>();

  for (const section of sorted) {
    const normalizedKey = section.key.trim().toLowerCase();
    if (!isEcoleSectionKey(normalizedKey)) continue;
    if (!section.title.trim()) continue;
    if (!map.has(normalizedKey)) {
      map.set(normalizedKey, section);
    }
  }

  return ECOLE_SECTION_ORDER
    .filter((key) => map.has(key))
    .map((key) => ({
      key,
      section: map.get(key) as EcoleEnfanceSection,
    }));
}

export function EcoleOverviewPageContent() {
  const { settings, isLoading } = usePublicSettings();
  const ecoleEnfance = settings?.municipalityProfile?.vieQuotidienne?.ecoleEnfance;

  const resolvedSections = React.useMemo(
    () => resolveSections(ecoleEnfance?.sections),
    [ecoleEnfance?.sections],
  );

  const pageTitle = ecoleEnfance?.title?.trim() || 'Ecole & enfance';
  const intro = ecoleEnfance?.intro?.trim();
  const schoolContact = ecoleEnfance?.schoolContact;
  const hasSchoolContact = Boolean(
    schoolContact?.name || schoolContact?.address || schoolContact?.phone || schoolContact?.email || schoolContact?.director,
  );

  const settingsUnavailable = !isLoading && !settings;
  const hasContent = Boolean(intro || hasSchoolContact || resolvedSections.length > 0);
  const isEmpty = !settingsUnavailable && !isLoading && !hasContent;

  return (
    <div className="min-h-screen">
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-villiers-blue/5 to-background" />
        <div className="absolute inset-0 texture-grain opacity-30" />

        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-4">
              <span className="w-8 h-px bg-villiers-gold" />
              Vie quotidienne
            </span>
            <h1 className="text-4xl lg:text-6xl font-heading font-semibold text-foreground mb-6">{pageTitle}</h1>
            {intro ? (
              <p className="text-lg text-muted-foreground leading-relaxed">{intro}</p>
            ) : (
              <p className="text-lg text-muted-foreground leading-relaxed">
                Informations publiques dediees aux services ecole et enfance.
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

          {!settingsUnavailable && resolvedSections.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resolvedSections.map(({ key, section }, index) => {
                const meta = ECOLE_SECTION_META[key];
                const Icon = meta.icon;

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                  >
                    <Link
                      href={`/ecole/${key}`}
                      className="group block p-6 bg-background border border-border/50 rounded-organic transition-all duration-300 hover:border-villiers-gold/30 hover:shadow-villiers-lg h-full"
                    >
                      <div
                        className={cn(
                          'w-14 h-14 rounded-xl flex items-center justify-center mb-4 border transition-transform group-hover:scale-110',
                          meta.iconWrapperClassName,
                        )}
                      >
                        <Icon className={cn('h-6 w-6', meta.iconClassName)} />
                      </div>
                      <h2 className="font-heading text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                        {section.title}
                        <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {section.description?.trim() || meta.defaultDescription}
                      </p>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}

          {!settingsUnavailable && hasSchoolContact && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-background rounded-organic-lg border border-border/50 p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-villiers-blue/10 border border-villiers-blue/20 flex items-center justify-center">
                  <School className="h-7 w-7 text-villiers-blue" />
                </div>
                <div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground">{schoolContact?.name || 'Contact ecole'}</h2>
                  {schoolContact?.director && (
                    <p className="text-muted-foreground">Direction: {schoolContact.director}</p>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 text-sm">
                {schoolContact?.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-villiers-gold shrink-0 mt-0.5" />
                    <p className="text-muted-foreground whitespace-pre-line">{schoolContact.address}</p>
                  </div>
                )}
                {schoolContact?.phone && (
                  <a
                    href={`tel:${schoolContact.phone.replace(/\s/g, '')}`}
                    className="flex items-start gap-3 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Phone className="h-5 w-5 text-villiers-gold shrink-0 mt-0.5" />
                    {schoolContact.phone}
                  </a>
                )}
                {schoolContact?.email && (
                  <a
                    href={`mailto:${schoolContact.email}`}
                    className="flex items-start gap-3 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Mail className="h-5 w-5 text-villiers-gold shrink-0 mt-0.5" />
                    {schoolContact.email}
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
