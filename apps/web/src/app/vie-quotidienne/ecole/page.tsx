'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Baby,
  School,
  Utensils,
  PartyPopper,
  Building,
  ChevronRight,
  Phone,
  MapPin,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Sous-pages École et Enfance
const educationPages = [
  {
    slug: 'petite-enfance',
    title: 'Petite enfance',
    description: 'Crèche, assistantes maternelles et modes de garde pour les 0-3 ans',
    icon: Baby,
    color: 'bg-pink-50 text-pink-600 border-pink-200',
  },
  {
    slug: 'ecole-primaire',
    title: 'École primaire',
    description: 'Maternelle et élémentaire : inscriptions, équipe pédagogique, projets',
    icon: School,
    color: 'bg-villiers-blue/10 text-villiers-blue border-villiers-blue/20',
  },
  {
    slug: 'restauration-scolaire',
    title: 'Restauration scolaire',
    description: 'Menus, tarifs et inscriptions à la cantine',
    icon: Utensils,
    color: 'bg-orange-50 text-orange-600 border-orange-200',
  },
  {
    slug: 'centre-de-loisirs',
    title: 'Centre de loisirs',
    description: 'Accueil périscolaire, mercredis et vacances scolaires',
    icon: PartyPopper,
    color: 'bg-villiers-gold/10 text-villiers-gold border-villiers-gold/20',
  },
  {
    slug: 'college-lycee',
    title: 'Collège et lycée',
    description: 'Établissements de secteur et informations pratiques',
    icon: Building,
    color: 'bg-villiers-green/10 text-villiers-green border-villiers-green/20',
  },
];

export default function EcolePage() {
  return (
    <div className="min-h-screen">
      {/* Hero section */}
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
            <h1 className="text-4xl lg:text-6xl font-heading font-semibold text-foreground mb-6">
              École & <span className="display-italic">Enfance</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Toutes les informations sur les structures d&apos;accueil et l&apos;éducation à Villiers-Adam :
              de la petite enfance au lycée, en passant par la restauration et les activités périscolaires.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Grille des sous-pages */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {educationPages.map((page, index) => (
              <motion.div
                key={page.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link
                  href={`/vie-quotidienne/ecole/${page.slug}`}
                  className="group block p-6 bg-background border border-border/50 rounded-organic transition-all duration-300 hover:border-villiers-gold/30 hover:shadow-villiers-lg h-full"
                >
                  <div className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center mb-4 border transition-transform group-hover:scale-110',
                    page.color
                  )}>
                    <page.icon className="h-6 w-6" />
                  </div>
                  <h2 className="font-heading text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                    {page.title}
                    <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {page.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact école */}
      <section className="py-12 lg:py-16 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto">
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
                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    École de Villiers-Adam
                  </h2>
                  <p className="text-muted-foreground">École maternelle et élémentaire</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-villiers-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Adresse</p>
                      <p className="text-sm text-muted-foreground">
                        Rue de l&apos;École<br />
                        95840 Villiers-Adam
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-villiers-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Téléphone</p>
                      <a href="tel:0134089010" className="text-sm text-primary hover:underline">
                        01 34 08 90 10
                      </a>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-villiers-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Horaires</p>
                      <p className="text-sm text-muted-foreground">
                        Lundi, mardi, jeudi, vendredi<br />
                        8h30 - 11h30 / 13h30 - 16h30
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <GraduationCap className="h-5 w-5 text-villiers-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Direction</p>
                      <p className="text-sm text-muted-foreground">
                        Mme Martin, Directrice
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  Pour les inscriptions scolaires, veuillez d&apos;abord vous rendre en mairie avec les documents requis,
                  puis contacter l&apos;école pour finaliser l&apos;inscription.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
