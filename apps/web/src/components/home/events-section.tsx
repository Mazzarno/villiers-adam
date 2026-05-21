'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, MapPin, Calendar, Users, PartyPopper, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/utils';
import type { Event } from '@/lib/api';

interface EventsSectionProps {
  events: Event[];
}

const fallbackEvents = [
  {
    icon: Building2,
    title: 'Conseil municipal',
    description: 'Seances regulieres du conseil municipal, ouvertes au public.',
    type: 'Recurrent',
  },
  {
    icon: Users,
    title: 'Vie associative',
    description: 'Manifestations organisees par les associations de la commune.',
    type: 'Manifestations',
  },
  {
    icon: PartyPopper,
    title: 'Fetes communales',
    description: 'Evenements saisonniers et festivites traditionnelles du village.',
    type: 'Saisonnier',
  },
];

export function EventsSection({ events }: EventsSectionProps) {
  const isEmpty = events.length === 0;

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      {/* Fond avec gradient subtil */}
      <div className="absolute inset-0 bg-gradient-to-br from-villiers-blue/[0.02] via-transparent to-villiers-gold/[0.02]" />

      <div className="container relative">
        {/* Header éditorial */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14"
        >
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-4">
              <span className="w-8 h-px bg-villiers-gold" />
              Prochains rendez-vous
            </span>
            <h2 className="text-3xl lg:text-5xl font-heading font-semibold text-foreground">
              Evenements
            </h2>
          </div>
          <Button
            asChild
            variant="outline"
            className="self-start lg:self-auto rounded-organic border-villiers-blue/20 hover:border-villiers-gold hover:bg-villiers-gold/5 transition-all duration-300 group"
          >
            <Link href="/evenements">
              Tous les evenements
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>

        {/* Timeline Events */}
        <div className="relative">
          {!isEmpty && (
            /* Ligne de connexion verticale */
            <div className="absolute left-6 lg:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-villiers-gold via-villiers-blue to-villiers-green hidden sm:block" />
          )}

          {isEmpty ? (
            /* Fallback statique enrichi */
            <div className="relative">
              {/* Timeline decorative */}
              <div className="absolute left-6 lg:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-border/50 via-border/30 to-border/10 hidden sm:block" />

              <div className="space-y-4 lg:space-y-6">
                {fallbackEvents.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: -40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-50px' }}
                      transition={{
                        duration: 0.6,
                        delay: index * 0.1,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <div className="relative flex gap-4 sm:gap-6 lg:gap-8">
                        {/* Point sur la timeline */}
                        <div className="hidden sm:flex flex-col items-center shrink-0">
                          <div className="w-12 lg:w-16 h-12 lg:h-16 rounded-full bg-background border-2 border-dashed border-border/50 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-muted-foreground/50" />
                          </div>
                        </div>

                        {/* Card placeholder */}
                        <div className="flex-1 p-5 lg:p-6 rounded-organic border-2 border-dashed border-border/40 bg-muted/20">
                          <div className="flex items-start gap-4">
                            <div className="sm:hidden w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
                              <Icon className="h-4 w-4 text-muted-foreground/50" />
                            </div>
                            <div className="flex-1">
                              <span className="px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground/60 rounded-full">
                                {item.type}
                              </span>
                              <h3 className="text-lg font-heading font-semibold text-muted-foreground/70 mt-2">
                                {item.title}
                              </h3>
                              <p className="text-sm text-muted-foreground/50 mt-1">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Message et CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col items-center justify-center p-10 mt-8 rounded-organic bg-muted/30 border border-border/50"
              >
                <div className="w-14 h-14 rounded-full bg-villiers-gold/10 flex items-center justify-center mb-4">
                  <Calendar className="h-7 w-7 text-villiers-gold" />
                </div>
                <p className="text-muted-foreground font-heading text-center">
                  Les prochains evenements seront affiches ici
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1 text-center">
                  Revenez bientot pour decouvrir les prochaines activites de la commune
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="mt-6 rounded-organic border-villiers-blue/20 hover:border-villiers-gold hover:bg-villiers-gold/5"
                >
                  <Link href="/evenements">
                    Consulter les evenements
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          ) : (
            /* Events list avec style timeline */
            <div className="space-y-4 lg:space-y-6">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <Link href={`/evenements/${event.slug}`} className="block group">
                    <article className="relative flex gap-4 sm:gap-6 lg:gap-8">
                      {/* Point sur la timeline */}
                      <div className="hidden sm:flex flex-col items-center shrink-0">
                        <div className="w-12 lg:w-16 h-12 lg:h-16 rounded-full bg-background border-2 border-villiers-gold flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:border-villiers-blue transition-all duration-300">
                          <span className="text-xl lg:text-2xl font-heading font-bold text-villiers-blue">
                            {new Date(event.startDate).getDate()}
                          </span>
                        </div>
                        {/* Mois en dessous du point */}
                        <span className="mt-1 text-[10px] lg:text-xs font-mono uppercase text-muted-foreground tracking-wider">
                          {new Date(event.startDate).toLocaleDateString('fr-FR', {
                            month: 'short',
                          })}
                        </span>
                      </div>

                      {/* Card principale */}
                      <motion.div
                        className="flex-1 p-5 lg:p-6 bg-background rounded-organic border border-border/50 transition-all duration-500 ease-organic"
                        whileHover={{
                          y: -4,
                          boxShadow: '0 20px 40px rgba(30, 58, 95, 0.12)',
                        }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          {/* Date mobile */}
                          <div className="sm:hidden flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-full bg-villiers-gold/10 flex items-center justify-center">
                              <span className="text-lg font-heading font-bold text-villiers-gold">
                                {new Date(event.startDate).getDate()}
                              </span>
                            </div>
                            <div>
                              <span className="text-xs font-mono uppercase text-muted-foreground">
                                {new Date(event.startDate).toLocaleDateString('fr-FR', {
                                  month: 'long',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Contenu */}
                          <div className="flex-1 space-y-3">
                            {/* Badges */}
                            <div className="flex flex-wrap items-center gap-2">
                              {event.category && (
                                <span className="px-2.5 py-1 text-[10px] font-medium bg-villiers-blue/10 text-villiers-blue rounded-full">
                                  {event.category}
                                </span>
                              )}
                              {event.status === 'cancelled' && (
                                <span className="px-2.5 py-1 text-[10px] font-medium bg-destructive/10 text-destructive rounded-full">
                                  Annule
                                </span>
                              )}
                            </div>

                            {/* Titre */}
                            <h3 className="text-lg lg:text-xl font-heading font-semibold text-foreground group-hover:text-primary transition-colors">
                              {event.title}
                            </h3>

                            {/* Métadonnées */}
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-villiers-gold" />
                                <span className="font-mono text-xs">
                                  {event.allDay ? 'Toute la journee' : formatTime(event.startDate)}
                                </span>
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-villiers-gold" />
                                  <span className="text-xs">{event.location}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Flèche */}
                          <div className="hidden sm:flex items-center self-center">
                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-villiers-gold group-hover:translate-x-2 transition-all duration-300" />
                          </div>
                        </div>
                      </motion.div>
                    </article>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
