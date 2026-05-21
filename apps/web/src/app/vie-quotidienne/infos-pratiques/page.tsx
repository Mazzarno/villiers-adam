'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Bus,
  Calendar,
  ChevronRight,
  ExternalLink,
  FileText,
  Link as LinkIcon,
  MapPin,
  Phone,
  Trash2,
  Volume2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api, { type TransportInfo } from '@/lib/api';
import { usePublicSettings } from '@/hooks/use-public-settings';
import type {
  InfosPratiquesContent,
  InfosPratiquesDocument,
  InfosPratiquesEmergencyNumber,
  InfosPratiquesLocalRule,
  InfosPratiquesUsefulLink,
  InfosPratiquesWasteItem,
} from '@/lib/settings';

function sortByPriority<T extends { priority?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
}

function normalizeEmergencyNumbers(content: InfosPratiquesContent | undefined): InfosPratiquesEmergencyNumber[] {
  const list = content?.emergencyNumbers || [];
  return sortByPriority(list).filter((item) => item.label.trim() && item.value.trim());
}

function normalizeWasteItems(content: InfosPratiquesContent | undefined): InfosPratiquesWasteItem[] {
  const list = content?.waste || [];
  return sortByPriority(list).filter((item) => item.title.trim());
}

function normalizeLocalRules(content: InfosPratiquesContent | undefined): InfosPratiquesLocalRule[] {
  const list = content?.localRules || [];
  return sortByPriority(list).filter((item) => item.title.trim() && item.description.trim());
}

function normalizeUsefulLinks(content: InfosPratiquesContent | undefined): InfosPratiquesUsefulLink[] {
  const list = content?.usefulLinks || [];
  return sortByPriority(list).filter((item) => item.label.trim() && item.url.trim());
}

function normalizeDocuments(content: InfosPratiquesContent | undefined): InfosPratiquesDocument[] {
  const list = content?.documents || [];
  return sortByPriority(list).filter((item) => item.title.trim());
}

export default function InfosPratiquesPage() {
  const { settings, isLoading: isLoadingSettings } = usePublicSettings();
  const [activeSection, setActiveSection] = React.useState<string | null>(null);
  const [transports, setTransports] = React.useState<TransportInfo[]>([]);
  const [isLoadingTransports, setIsLoadingTransports] = React.useState(true);
  const [hasTransportError, setHasTransportError] = React.useState(false);

  const infosPratiques = settings?.municipalityProfile?.vieQuotidienne?.infosPratiques;

  const emergencyNumbers = React.useMemo(
    () => normalizeEmergencyNumbers(infosPratiques),
    [infosPratiques],
  );

  const wasteItems = React.useMemo(
    () => normalizeWasteItems(infosPratiques),
    [infosPratiques],
  );

  const localRules = React.useMemo(
    () => normalizeLocalRules(infosPratiques),
    [infosPratiques],
  );

  const usefulLinks = React.useMemo(
    () => normalizeUsefulLinks(infosPratiques),
    [infosPratiques],
  );

  const documents = React.useMemo(
    () => normalizeDocuments(infosPratiques),
    [infosPratiques],
  );

  const pageTitle = infosPratiques?.title?.trim() || 'Infos pratiques';
  const intro = infosPratiques?.intro?.trim();
  const settingsUnavailable = !isLoadingSettings && !settings;

  const hasInfosContent = Boolean(
    intro ||
      emergencyNumbers.length ||
      wasteItems.length ||
      localRules.length ||
      usefulLinks.length ||
      documents.length,
  );

  const infosEmpty = !settingsUnavailable && !isLoadingSettings && !hasInfosContent;

  React.useEffect(() => {
    let active = true;

    const loadTransports = async () => {
      setIsLoadingTransports(true);
      setHasTransportError(false);
      try {
        const data = await api.transports.list();
        if (!active) return;
        setTransports(data);
      } catch (error) {
        console.error('Erreur lors du chargement des transports:', error);
        if (!active) return;
        setTransports([]);
        setHasTransportError(true);
      } finally {
        if (active) {
          setIsLoadingTransports(false);
        }
      }
    };

    loadTransports();

    return () => {
      active = false;
    };
  }, []);

  const sections = React.useMemo(
    () => [
      { id: 'urgences', label: 'Urgences', icon: AlertTriangle, visible: emergencyNumbers.length > 0 },
      { id: 'dechets', label: 'Dechets', icon: Trash2, visible: wasteItems.length > 0 },
      { id: 'transports', label: 'Transports', icon: Bus, visible: true },
      { id: 'regles', label: 'Regles de vie', icon: Volume2, visible: localRules.length > 0 },
      { id: 'liens', label: 'Liens utiles', icon: LinkIcon, visible: usefulLinks.length > 0 },
      { id: 'documents', label: 'Documents', icon: FileText, visible: documents.length > 0 },
    ].filter((section) => section.visible),
    [documents.length, emergencyNumbers.length, localRules.length, usefulLinks.length, wasteItems.length],
  );

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-100px 0px -50% 0px' },
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="min-h-screen">
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
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
            <h1 className="text-4xl lg:text-6xl font-heading font-semibold text-foreground mb-6">
              {pageTitle}
            </h1>
            {intro ? (
              <p className="text-lg text-muted-foreground leading-relaxed">{intro}</p>
            ) : (
              <p className="text-lg text-muted-foreground leading-relaxed">
                Informations pratiques de la commune.
              </p>
            )}
          </motion.div>
        </div>
      </section>

      <div className="container pb-16">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-24">
              <nav className="p-4 bg-muted/30 rounded-organic border border-border/50">
                <h2 className="font-heading font-semibold text-foreground mb-4">
                  Sommaire
                </h2>
                <ul className="space-y-1">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors',
                          activeSection === section.id
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                        )}
                      >
                        <section.icon className="h-4 w-4" />
                        {section.label}
                        <ChevronRight
                          className={cn(
                            'h-3 w-3 ml-auto transition-transform',
                            activeSection === section.id && 'translate-x-1',
                          )}
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>

          <main className="lg:col-span-9 space-y-16">
            {settingsUnavailable && (
              <div className="p-4 rounded-organic border border-villiers-gold/25 bg-villiers-gold/5 text-sm text-muted-foreground">
                Les informations sont temporairement indisponibles.
              </div>
            )}

            {infosEmpty && (
              <div className="p-4 rounded-organic border border-villiers-gold/25 bg-villiers-gold/5 text-sm text-muted-foreground">
                Aucune donnee publiee pour le moment.
              </div>
            )}

            {!settingsUnavailable && !infosEmpty && emergencyNumbers.length > 0 && (
              <section id="urgences" className="scroll-mt-24">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-heading font-semibold text-foreground">
                      Numeros d&apos;urgence
                    </h2>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {emergencyNumbers.map((item) => (
                      <a
                        key={`${item.label}-${item.value}`}
                        href={`tel:${item.value.replace(/\s/g, '')}`}
                        className="group p-4 bg-background border border-border/50 rounded-organic hover:border-red-200 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-foreground group-hover:text-red-600 transition-colors">
                              {item.label}
                            </p>
                            {item.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                            )}
                          </div>
                          <Phone className="h-4 w-4 text-muted-foreground group-hover:text-red-600 transition-colors" />
                        </div>
                        <p className="font-mono text-xl font-bold text-red-600 mt-3">{item.value}</p>
                      </a>
                    ))}
                  </div>
                </motion.div>
              </section>
            )}

            {!settingsUnavailable && !infosEmpty && wasteItems.length > 0 && (
              <section id="dechets" className="scroll-mt-24">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-villiers-green/10 border border-villiers-green/20 flex items-center justify-center">
                      <Trash2 className="h-6 w-6 text-villiers-green" />
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-heading font-semibold text-foreground">
                      Collecte des dechets
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {wasteItems.map((item) => (
                      <div
                        key={`${item.title}-${item.priority ?? 0}`}
                        className="p-4 bg-background border border-border/50 rounded-organic"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-foreground">{item.title}</h3>
                            {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
                          </div>
                          {item.schedule && (
                            <span className="flex items-center gap-1 text-sm font-medium text-villiers-green">
                              <Calendar className="h-3.5 w-3.5" />
                              {item.schedule}
                            </span>
                          )}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-4 text-sm">
                          {item.location && (
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5" />
                              {item.location}
                            </span>
                          )}
                          {item.linkUrl && (
                            <a
                              href={item.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-primary hover:underline"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              {item.linkLabel || 'Consulter'}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </section>
            )}

            <section id="transports" className="scroll-mt-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-villiers-blue/10 border border-villiers-blue/20 flex items-center justify-center">
                    <Bus className="h-6 w-6 text-villiers-blue" />
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-heading font-semibold text-foreground">
                    Transports
                  </h2>
                </div>

                {isLoadingTransports ? (
                  <div className="p-4 bg-background border border-border/50 rounded-organic text-sm text-muted-foreground">
                    Chargement des informations transports...
                  </div>
                ) : hasTransportError ? (
                  <div className="p-4 bg-background border border-border/50 rounded-organic text-sm text-muted-foreground">
                    Les informations sont temporairement indisponibles.
                  </div>
                ) : transports.length === 0 ? (
                  <div className="p-4 bg-background border border-border/50 rounded-organic text-sm text-muted-foreground">
                    Aucune donnee publiee pour le moment.
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {transports.map((transport) => (
                      <div key={transport.id} className="p-5 bg-background border border-border/50 rounded-organic">
                        <h3 className="font-semibold text-foreground mb-3">{transport.title}</h3>
                        {transport.summary && (
                          <p className="text-sm text-muted-foreground mb-3">{transport.summary}</p>
                        )}
                        <div className="flex flex-wrap gap-3 text-sm">
                          {transport.operator && (
                            <span className="text-muted-foreground">Operateur : {transport.operator}</span>
                          )}
                          {transport.website && (
                            <a
                              href={transport.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-villiers-blue hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Site web
                            </a>
                          )}
                          {transport.phone && (
                            <a
                              href={`tel:${transport.phone.replace(/\s/g, '')}`}
                              className="flex items-center gap-1 text-villiers-blue hover:underline"
                            >
                              <Phone className="h-3 w-3" />
                              {transport.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </section>

            {!settingsUnavailable && !infosEmpty && localRules.length > 0 && (
              <section id="regles" className="scroll-mt-24">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-villiers-gold/10 border border-villiers-gold/20 flex items-center justify-center">
                      <Volume2 className="h-6 w-6 text-villiers-gold" />
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-heading font-semibold text-foreground">
                      Regles de vie
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {localRules.map((rule) => (
                      <div key={`${rule.title}-${rule.priority ?? 0}`} className="p-5 bg-background border border-border/50 rounded-organic">
                        <h3 className="font-semibold text-foreground mb-2">{rule.title}</h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{rule.description}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </section>
            )}

            {!settingsUnavailable && !infosEmpty && usefulLinks.length > 0 && (
              <section id="liens" className="scroll-mt-24">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-villiers-blue/10 border border-villiers-blue/20 flex items-center justify-center">
                      <LinkIcon className="h-6 w-6 text-villiers-blue" />
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-heading font-semibold text-foreground">
                      Liens utiles
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {usefulLinks.map((link) => (
                      <a
                        key={`${link.label}-${link.url}`}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 bg-background border border-border/50 rounded-organic hover:border-villiers-blue/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-foreground">{link.label}</p>
                            {link.description && <p className="text-sm text-muted-foreground mt-1">{link.description}</p>}
                          </div>
                          <ExternalLink className="h-4 w-4 text-villiers-blue" />
                        </div>
                      </a>
                    ))}
                  </div>
                </motion.div>
              </section>
            )}

            {!settingsUnavailable && !infosEmpty && documents.length > 0 && (
              <section id="documents" className="scroll-mt-24">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center">
                      <FileText className="h-6 w-6 text-foreground" />
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-heading font-semibold text-foreground">
                      Documents utiles
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {documents.map((document) => (
                      <div key={`${document.title}-${document.url || document.mediaId || ''}`} className="p-4 bg-background border border-border/50 rounded-organic">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-foreground">{document.title}</p>
                            {document.description && (
                              <p className="text-sm text-muted-foreground mt-1">{document.description}</p>
                            )}
                            {document.mediaId && (
                              <p className="text-xs text-muted-foreground mt-2">mediaId: {document.mediaId}</p>
                            )}
                          </div>
                          {document.url && (
                            <a
                              href={document.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Ouvrir
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </section>
            )}

            {!settingsUnavailable && !infosEmpty && infosPratiques?.updatedAt && (
              <p className="text-xs text-muted-foreground">
                Derniere mise a jour: {new Date(infosPratiques.updatedAt).toLocaleDateString('fr-FR')}
              </p>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
