'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Landmark,
  Users,
  Dumbbell,
  BookOpen,
  ChevronRight,
  TreePine,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sections = [
  {
    slug: 'patrimoine',
    title: 'Patrimoine',
    description: 'Histoire de Villiers-Adam, église Saint-Sulpice et personnalités illustres',
    icon: Landmark,
    color: 'bg-villiers-gold/10 text-villiers-gold border-villiers-gold/20',
    featured: true,
  },
  {
    slug: 'associations',
    title: 'Associations',
    description: 'Vie associative, clubs et activités pour tous les âges',
    icon: Users,
    color: 'bg-villiers-blue/10 text-villiers-blue border-villiers-blue/20',
  },
  {
    slug: 'sports',
    title: 'Sports',
    description: 'Équipements sportifs et associations sportives',
    icon: Dumbbell,
    color: 'bg-villiers-green/10 text-villiers-green border-villiers-green/20',
  },
  {
    slug: 'bibliotheque',
    title: 'Bibliothèque',
    description: 'Bibliothèque municipale, horaires et catalogue',
    icon: BookOpen,
    color: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/30 dark:border-orange-900',
  },
];

export default function CultureLoisirsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero section avec image */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-villiers-green/5 to-background" />
        <div className="absolute inset-0 texture-grain opacity-30" />

        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-4">
                <span className="w-8 h-px bg-villiers-gold" />
                Découvrir
              </span>
              <h1 className="text-4xl lg:text-6xl font-heading font-semibold text-foreground mb-6">
                Culture & <span className="display-italic">Loisirs</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Découvrez le riche patrimoine de Villiers-Adam, sa vie associative dynamique
                et les nombreuses activités culturelles et sportives proposées.
              </p>

              {/* Encart PNR */}
              <div className="bg-villiers-green/5 border border-villiers-green/20 rounded-organic p-4">
                <div className="flex items-start gap-3">
                  <TreePine className="h-5 w-5 text-villiers-green shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Parc naturel régional du Vexin français</p>
                    <p className="text-sm text-muted-foreground">
                      Villiers-Adam fait partie du PNR du Vexin français depuis 1995,
                      garantissant la préservation de son patrimoine naturel et bâti.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative aspect-[4/3] rounded-organic-lg overflow-hidden shadow-organic-lg"
            >
              <Image
                src="/images/eglise.jpg"
                alt="Église Saint-Sulpice de Villiers-Adam"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white text-sm font-medium">
                  Église Saint-Sulpice
                </p>
                <p className="text-white/70 text-xs">
                  Monument historique classé — XVe-XVIe siècle
                </p>
              </div>
            </motion.div>
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
                className={section.featured ? 'md:col-span-2' : ''}
              >
                <Link
                  href={`/culture-loisirs/${section.slug}`}
                  className={cn(
                    'group block p-6 bg-background border border-border/50 rounded-organic transition-all duration-300 hover:border-villiers-gold/30 hover:shadow-organic-hover h-full',
                    section.featured && 'bg-gradient-to-r from-villiers-gold/5 to-background'
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
