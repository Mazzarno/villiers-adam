'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ChevronLeft,
  Dumbbell,
  ExternalLink,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api, { type DirectoryEntry, type MunicipalService } from '@/lib/api';
import { usePublicSettings } from '@/hooks/use-public-settings';
import type { SportsContent, SportsDocument, SportsHighlight, SportsUsefulLink } from '@/lib/settings';

const SPORTS_SERVICE_CATEGORY = 'SPORT';

function sortByPriority<T extends { priority?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
}

function normalizeHighlights(content: SportsContent | undefined): SportsHighlight[] {
  const list = content?.highlights || [];
  return sortByPriority(list).filter((item) => item.title.trim());
}

function normalizeUsefulLinks(content: SportsContent | undefined): SportsUsefulLink[] {
  const list = content?.usefulLinks || [];
  return sortByPriority(list).filter((item) => item.label.trim() && item.url.trim());
}

function normalizeDocuments(content: SportsContent | undefined): SportsDocument[] {
  const list = content?.documents || [];
  return sortByPriority(list).filter((item) => item.title.trim());
}

function normalizeAssociationIds(content: SportsContent | undefined): string[] {
  const list = content?.associationIds || [];
  const seen = new Set<string>();
  const ids: string[] = [];

  for (const item of list) {
    if (typeof item !== 'string') continue;
    const trimmed = item.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    ids.push(trimmed);
  }

  return ids;
}

function hasEditorialContent(content: SportsContent | undefined): boolean {
  if (!content) return false;

  return Boolean(
    content.title?.trim() ||
      content.intro?.trim() ||
      content.description?.trim() ||
      content.equipmentTitle?.trim() ||
      content.associationsTitle?.trim() ||
      (content.highlights && content.highlights.length > 0) ||
      (content.usefulLinks && content.usefulLinks.length > 0) ||
      (content.documents && content.documents.length > 0),
  );
}

export default function SportsPage() {
  const { settings, isLoading: isLoadingSettings } = usePublicSettings();
  const sports = settings?.municipalityProfile?.cultureLoisirs?.sports;

  const [services, setServices] = React.useState<MunicipalService[]>([]);
  const [associations, setAssociations] = React.useState<DirectoryEntry[]>([]);
  const [isLoadingServices, setIsLoadingServices] = React.useState(true);
  const [isLoadingAssociations, setIsLoadingAssociations] = React.useState(true);
  const [servicesError, setServicesError] = React.useState(false);
  const [associationsError, setAssociationsError] = React.useState(false);

  const highlights = React.useMemo(() => normalizeHighlights(sports), [sports]);
  const usefulLinks = React.useMemo(() => normalizeUsefulLinks(sports), [sports]);
  const documents = React.useMemo(() => normalizeDocuments(sports), [sports]);
  const associationIds = React.useMemo(() => normalizeAssociationIds(sports), [sports]);

  const pageTitle = sports?.title?.trim() || 'Sports';
  const intro = sports?.intro?.trim();
  const description = sports?.description?.trim();
  const equipmentTitle = sports?.equipmentTitle?.trim() || 'Equipements sportifs';
  const associationsTitle = sports?.associationsTitle?.trim() || 'Associations sportives';

  const settingsUnavailable = !isLoadingSettings && !settings;

  React.useEffect(() => {
    let active = true;

    const loadServices = async () => {
      setIsLoadingServices(true);
      setServicesError(false);
      try {
        const data = await api.municipalServices.list({ category: SPORTS_SERVICE_CATEGORY });
        if (!active) return;
        setServices(data);
      } catch (error) {
        console.error('Erreur lors du chargement des equipements sportifs:', error);
        if (!active) return;
        setServices([]);
        setServicesError(true);
      } finally {
        if (active) {
          setIsLoadingServices(false);
        }
      }
    };

    loadServices();

    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    let active = true;

    const loadAssociations = async () => {
      if (isLoadingSettings) {
        return;
      }

      if (settingsUnavailable) {
        setAssociations([]);
        setAssociationsError(false);
        setIsLoadingAssociations(false);
        return;
      }

      if (associationIds.length === 0) {
        setAssociations([]);
        setAssociationsError(false);
        setIsLoadingAssociations(false);
        return;
      }

      setIsLoadingAssociations(true);
      setAssociationsError(false);

      try {
        const entries = await api.directory.list({ type: 'ASSOCIATION' });
        if (!active) return;

        const map = new Map(entries.map((entry) => [entry.id, entry]));
        const selected = associationIds
          .map((associationId) => map.get(associationId))
          .filter((entry): entry is DirectoryEntry => Boolean(entry));

        setAssociations(selected);
      } catch (error) {
        console.error('Erreur lors du chargement des associations sportives:', error);
        if (!active) return;
        setAssociations([]);
        setAssociationsError(true);
      } finally {
        if (active) {
          setIsLoadingAssociations(false);
        }
      }
    };

    loadAssociations();

    return () => {
      active = false;
    };
  }, [associationIds, isLoadingSettings, settingsUnavailable]);

  const missingAssociationCount = React.useMemo(() => {
    if (associationIds.length === 0 || associations.length === 0) {
      return associationIds.length;
    }

    const publishedIds = new Set(associations.map((association) => association.id));
    return associationIds.filter((associationId) => !publishedIds.has(associationId)).length;
  }, [associationIds, associations]);

  const hasAnyContent = Boolean(
    hasEditorialContent(sports) || services.length > 0 || associations.length > 0,
  );

  const globalUnavailable = settingsUnavailable && servicesError;
  const isEmpty =
    !globalUnavailable &&
    !isLoadingSettings &&
    !isLoadingServices &&
    !isLoadingAssociations &&
    !settingsUnavailable &&
    !servicesError &&
    !associationsError &&
    !hasAnyContent;

  return (
    <div className="min-h-screen">
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-villiers-green/5 to-background" />
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
                Retour a Culture & Loisirs
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
              <div className="w-16 h-16 rounded-xl bg-villiers-green/10 border border-villiers-green/20 flex items-center justify-center">
                <Dumbbell className="h-8 w-8 text-villiers-green" />
              </div>
              <div>
                <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-1">
                  <span className="w-8 h-px bg-villiers-gold" />
                  Culture & Loisirs
                </span>
                <h1 className="text-3xl lg:text-5xl font-heading font-semibold text-foreground">
                  {pageTitle}
                </h1>
              </div>
            </div>
            {intro ? (
              <p className="text-lg text-muted-foreground leading-relaxed">{intro}</p>
            ) : (
              <p className="text-lg text-muted-foreground leading-relaxed">
                Informations sportives de la commune.
              </p>
            )}
          </motion.div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="container space-y-10">
          {(globalUnavailable || settingsUnavailable) && (
            <div className="p-4 rounded-organic border border-villiers-gold/25 bg-villiers-gold/5 text-sm text-muted-foreground">
              Les informations sont temporairement indisponibles.
            </div>
          )}

          {isEmpty && (
            <div className="p-4 rounded-organic border border-villiers-gold/25 bg-villiers-gold/5 text-sm text-muted-foreground">
              Aucune donnee publiee pour le moment.
            </div>
          )}

          {description && !settingsUnavailable && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-organic border border-border/50 bg-background p-6"
            >
              <p className="text-muted-foreground whitespace-pre-line">{description}</p>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-6">
                  {equipmentTitle}
                </h2>

                {isLoadingServices ? (
                  <div className="p-4 rounded-organic border border-border/50 text-sm text-muted-foreground">
                    Chargement des equipements...
                  </div>
                ) : servicesError ? (
                  <div className="p-4 rounded-organic border border-villiers-gold/25 bg-villiers-gold/5 text-sm text-muted-foreground">
                    Les informations sont temporairement indisponibles.
                  </div>
                ) : services.length === 0 ? (
                  <div className="p-4 rounded-organic border border-border/50 text-sm text-muted-foreground">
                    Aucun equipement sportif publie pour le moment.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="p-4 bg-background border border-border/50 rounded-organic"
                      >
                        <h3 className="font-medium text-foreground mb-1">{service.name}</h3>
                        {service.description && (
                          <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                        )}
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          {service.address && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {service.address}
                            </span>
                          )}
                          {service.phone && (
                            <a href={`tel:${service.phone}`} className="inline-flex items-center gap-1 hover:text-villiers-blue">
                              <Phone className="h-3 w-3" />
                              {service.phone}
                            </a>
                          )}
                          {service.email && (
                            <a href={`mailto:${service.email}`} className="inline-flex items-center gap-1 hover:text-villiers-blue">
                              <Mail className="h-3 w-3" />
                              Email
                            </a>
                          )}
                          {service.website && (
                            <a
                              href={service.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 hover:text-villiers-blue"
                            >
                              <Globe className="h-3 w-3" />
                              Site web
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
                  <Users className="h-6 w-6 text-villiers-blue" />
                  {associationsTitle}
                </h2>

                {settingsUnavailable ? (
                  <div className="p-4 rounded-organic border border-villiers-gold/25 bg-villiers-gold/5 text-sm text-muted-foreground">
                    Les informations sont temporairement indisponibles.
                  </div>
                ) : isLoadingAssociations ? (
                  <div className="p-4 rounded-organic border border-border/50 text-sm text-muted-foreground">
                    Chargement des associations...
                  </div>
                ) : associationsError ? (
                  <div className="p-4 rounded-organic border border-villiers-gold/25 bg-villiers-gold/5 text-sm text-muted-foreground">
                    Les informations sont temporairement indisponibles.
                  </div>
                ) : associationIds.length === 0 ? (
                  <div className="p-4 rounded-organic border border-border/50 text-sm text-muted-foreground">
                    Aucune association sportive selectionnee pour le moment.
                  </div>
                ) : associations.length === 0 ? (
                  <div className="p-4 rounded-organic border border-border/50 text-sm text-muted-foreground">
                    Aucune association sportive publiee pour la selection actuelle.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {associations.map((association) => (
                      <div
                        key={association.id}
                        className="p-4 bg-background border border-border/50 rounded-organic"
                      >
                        <div className="flex gap-4">
                          {association.featuredImage && (
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                              <Image
                                src={association.featuredImage}
                                alt={association.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground mb-1">{association.name}</h3>
                            {association.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {association.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                              {association.phone && (
                                <a href={`tel:${association.phone}`} className="inline-flex items-center gap-1 hover:text-villiers-blue">
                                  <Phone className="h-3 w-3" />
                                  {association.phone}
                                </a>
                              )}
                              {association.email && (
                                <a href={`mailto:${association.email}`} className="inline-flex items-center gap-1 hover:text-villiers-blue">
                                  <Mail className="h-3 w-3" />
                                  Email
                                </a>
                              )}
                              {association.website && (
                                <a
                                  href={association.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 hover:text-villiers-blue"
                                >
                                  <Globe className="h-3 w-3" />
                                  Site web
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!settingsUnavailable && !associationsError && associationIds.length > 0 && missingAssociationCount > 0 && (
                  <div className="mt-4 p-4 rounded-organic border border-villiers-gold/25 bg-villiers-gold/5 text-sm text-muted-foreground flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    {missingAssociationCount} association(s) selectionnee(s) ne sont pas publiee(s) ou indisponible(s).
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {!settingsUnavailable && highlights.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-6">Points forts</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {highlights.map((item) => (
                  <div key={`${item.title}-${item.priority ?? 0}`} className="rounded-organic border border-border/50 bg-background p-4">
                    <h3 className="font-medium text-foreground">{item.title}</h3>
                    {item.description && <p className="text-sm text-muted-foreground mt-2">{item.description}</p>}
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {!settingsUnavailable && usefulLinks.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-6">Liens utiles</h2>
              <div className="space-y-3">
                {usefulLinks.map((item) => (
                  <div key={`${item.label}-${item.url}`} className="rounded-organic border border-border/50 bg-background p-4">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {item.label}
                    </a>
                    {item.description && <p className="text-sm text-muted-foreground mt-2">{item.description}</p>}
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {!settingsUnavailable && documents.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-6">Documents</h2>
              <div className="space-y-3">
                {documents.map((document) => (
                  <div key={`${document.title}-${document.url || document.mediaId || ''}`} className="rounded-organic border border-border/50 bg-background p-4">
                    <p className="font-medium text-foreground">{document.title}</p>
                    {document.description && <p className="text-sm text-muted-foreground mt-1">{document.description}</p>}
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
                      {document.mediaId && !document.url && (
                        <span className="text-muted-foreground">mediaId: {document.mediaId}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </section>
    </div>
  );
}
