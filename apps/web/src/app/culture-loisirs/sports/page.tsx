'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Dumbbell,
  ChevronLeft,
  MapPin,
  TreePine,
  Bike,
  Footprints,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const equipements = [
  {
    name: 'Terrain multisports',
    description: 'Football, basketball et activités sportives en plein air',
    icon: Dumbbell,
    lieu: 'Derrière la mairie',
  },
];

const activites = [
  {
    name: 'Randonnée',
    description: 'Nombreux sentiers balisés (GR et PR) dans la forêt de L\'Isle-Adam',
    icon: Footprints,
    color: 'bg-villiers-green/10 text-villiers-green border-villiers-green/20',
  },
  {
    name: 'Vélo',
    description: 'Pistes cyclables et voies vertes vers L\'Isle-Adam et le Vexin',
    icon: Bike,
    color: 'bg-villiers-blue/10 text-villiers-blue border-villiers-blue/20',
  },
  {
    name: 'Nature',
    description: 'Découverte de la faune et la flore du Parc naturel régional',
    icon: TreePine,
    color: 'bg-villiers-gold/10 text-villiers-gold border-villiers-gold/20',
  },
];

export default function SportsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero section */}
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
                Retour à Culture & Loisirs
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
                  Sports
                </h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Profitez du cadre naturel exceptionnel de Villiers-Adam pour pratiquer
              des activités sportives en plein air : randonnée, vélo, et sports collectifs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contenu */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Équipements */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-6">
                  Équipements sportifs
                </h2>
                <div className="space-y-4">
                  {equipements.map((equip, index) => (
                    <div
                      key={index}
                      className="p-4 bg-background border border-border/50 rounded-organic"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-villiers-green/10 flex items-center justify-center shrink-0">
                          <equip.icon className="h-5 w-5 text-villiers-green" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground mb-1">{equip.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{equip.description}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {equip.lieu}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Activités plein air */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-6">
                  Activités de plein air
                </h2>
                <div className="space-y-4">
                  {activites.map((activite, index) => (
                    <div
                      key={index}
                      className="p-4 bg-background border border-border/50 rounded-organic"
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border',
                          activite.color
                        )}>
                          <activite.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground mb-1">{activite.name}</h3>
                          <p className="text-sm text-muted-foreground">{activite.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Encart forêt */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <div className="bg-villiers-green/5 border border-villiers-green/20 rounded-organic p-6">
              <div className="flex items-start gap-4">
                <TreePine className="h-6 w-6 text-villiers-green shrink-0" />
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                    Forêt domaniale de L'Isle-Adam
                  </h3>
                  <p className="text-muted-foreground">
                    Avec plus de 1 500 hectares, la forêt de L'Isle-Adam offre un terrain de jeu
                    idéal pour les amateurs de nature. Chênes centenaires, sentiers balisés,
                    et faune préservée vous attendent à quelques pas du village.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
