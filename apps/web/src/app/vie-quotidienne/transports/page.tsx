'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Bus,
  Train,
  Car,
  Bike,
  ChevronRight,
  ExternalLink,
  MapPin,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Sous-pages transports
const transportPages = [
  {
    slug: 'transport-scolaire',
    title: 'Transport scolaire',
    description: 'Lignes de bus vers les collèges et lycées, inscriptions Imagine R',
    icon: Bus,
    color: 'bg-blue-50 text-blue-600 border-blue-200',
  },
];

// Infos transports en commun
const transportsCommun = [
  {
    name: 'Bus Ligne 95-19',
    trajet: 'Villiers-Adam ↔ L\'Isle-Adam ↔ Persan-Beaumont',
    horaires: 'Lun-Sam, 6h-20h',
    info: 'Arrêt : Mairie',
  },
  {
    name: 'Gare SNCF L\'Isle-Adam - Parmain',
    trajet: 'Ligne H vers Paris-Nord',
    horaires: 'Tous les jours',
    info: 'À 5 km de Villiers-Adam',
  },
];

export default function TransportsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-background" />
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
              <span className="display-italic">Transports</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Retrouvez toutes les informations sur les transports à Villiers-Adam :
              bus, trains, transport scolaire et mobilité douce.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sous-pages */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <h2 className="font-heading text-2xl font-semibold text-foreground mb-6">
            Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {transportPages.map((page, index) => (
              <motion.div
                key={page.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link
                  href={`/vie-quotidienne/transports/${page.slug}`}
                  className="group block p-6 bg-background border border-border/50 rounded-organic transition-all duration-300 hover:border-villiers-gold/30 hover:shadow-villiers-lg h-full"
                >
                  <div className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center mb-4 border transition-transform group-hover:scale-110',
                    page.color
                  )}>
                    <page.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                    {page.title}
                    <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {page.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Transports en commun */}
      <section className="py-12 lg:py-16 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Train className="h-6 w-6 text-villiers-gold" />
              <h2 className="text-2xl lg:text-3xl font-heading font-semibold text-foreground">
                Transports en commun
              </h2>
            </div>
            <p className="text-muted-foreground">
              Villiers-Adam est desservie par une ligne de bus et se situe à proximité
              de la gare de L&apos;Isle-Adam - Parmain.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {transportsCommun.map((transport, index) => (
              <motion.div
                key={transport.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-background border border-border/50 rounded-organic p-6"
              >
                <h3 className="font-heading font-semibold text-foreground mb-3">
                  {transport.name}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{transport.trajet}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>{transport.horaires}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 pl-6">
                    {transport.info}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8"
          >
            <a
              href="https://www.iledefrance-mobilites.fr"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Île-de-France Mobilités
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Mobilité douce */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-4">
              <Bike className="h-6 w-6 text-villiers-green" />
              <h2 className="text-2xl lg:text-3xl font-heading font-semibold text-foreground">
                Mobilité douce
              </h2>
            </div>
            <div className="bg-villiers-green/5 border border-villiers-green/20 rounded-organic p-6">
              <p className="text-muted-foreground mb-4">
                Villiers-Adam encourage les déplacements doux grâce à son cadre rural préservé.
                De nombreux chemins de randonnée traversent la commune et permettent de rejoindre
                les villages voisins à pied ou à vélo.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-villiers-green/10 flex items-center justify-center shrink-0">
                    <Bike className="h-4 w-4 text-villiers-green" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground text-sm">Pistes cyclables</h4>
                    <p className="text-xs text-muted-foreground">
                      Liaison vers L&apos;Isle-Adam via voie verte
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-villiers-green/10 flex items-center justify-center shrink-0">
                    <Car className="h-4 w-4 text-villiers-green" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground text-sm">Covoiturage</h4>
                    <p className="text-xs text-muted-foreground">
                      Aire de covoiturage à l&apos;entrée du village
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
