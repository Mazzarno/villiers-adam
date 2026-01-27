'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Info,
  GraduationCap,
  Bus,
  Building,
  ChevronRight,
  AlertTriangle,
  Trash2,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sections = [
  {
    slug: 'infos-pratiques',
    title: 'Infos pratiques',
    description: 'Numéros d\'urgence, collecte des déchets, transports et réglementation',
    icon: Info,
    color: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:border-red-900',
    featured: true,
  },
  {
    slug: 'ecole',
    title: 'École et enfance',
    description: 'Petite enfance, école primaire, restauration, centre de loisirs, collège et lycée',
    icon: GraduationCap,
    color: 'bg-villiers-blue/10 text-villiers-blue border-villiers-blue/20',
  },
  {
    slug: 'transports',
    title: 'Transports',
    description: 'Transport scolaire, bus, trains et mobilité douce',
    icon: Bus,
    color: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900',
  },
  {
    slug: 'commerces',
    title: 'Commerces & entreprises',
    description: 'Annuaire des commerces et sociétés locales',
    icon: Building,
    color: 'bg-villiers-gold/10 text-villiers-gold border-villiers-gold/20',
  },
  {
    slug: 'urbanisme',
    title: 'Urbanisme',
    description: 'Permis de construire, autorisations de travaux et PLU',
    icon: Building,
    color: 'bg-villiers-green/10 text-villiers-green border-villiers-green/20',
  },
];

const quickInfos = [
  {
    icon: AlertTriangle,
    title: 'Urgences',
    content: 'SAMU 15 • Pompiers 18 • Police 17 • Européen 112',
    color: 'text-red-600',
  },
  {
    icon: Trash2,
    title: 'Collecte des déchets',
    content: 'Ordures ménagères : mardi • Tri sélectif : vendredi',
    color: 'text-villiers-green',
  },
  {
    icon: MapPin,
    title: 'Déchèterie',
    content: 'Déchèterie de Mériel – Ouverte du lundi au samedi',
    color: 'text-villiers-blue',
  },
];

export default function VieQuotidiennePage() {
  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-villiers-gold/5 to-background" />
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
              Au quotidien
            </span>
            <h1 className="text-4xl lg:text-6xl font-heading font-semibold text-foreground mb-6">
              Vie <span className="display-italic">quotidienne</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Toutes les informations pratiques pour votre vie à Villiers-Adam :
              services de proximité, école, transports et démarches d&apos;urbanisme.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Infos rapides */}
      <section className="py-8 bg-muted/30 border-y border-border/50">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6">
            {quickInfos.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className={cn('shrink-0', info.color)}>
                  <info.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground text-sm">{info.title}</h3>
                  <p className="text-sm text-muted-foreground">{info.content}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-6">
            {sections.map((section, index) => (
              <motion.div
                key={section.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={cn(section.featured && 'md:col-span-2')}
              >
                <Link
                  href={`/vie-quotidienne/${section.slug}`}
                  className={cn(
                    'group block p-6 bg-background border border-border/50 rounded-organic transition-all duration-300 hover:border-villiers-gold/30 hover:shadow-organic-hover h-full',
                    section.featured && 'bg-gradient-to-r from-red-50/50 to-background dark:from-red-950/20'
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'w-14 h-14 rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110 shrink-0',
                      section.color
                    )}>
                      <section.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h2 className="font-heading text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                        {section.title}
                        <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
