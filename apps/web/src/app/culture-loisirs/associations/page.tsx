'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  ChevronLeft,
  Heart,
  Music,
  Palette,
  TreePine,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const associations = [
  {
    name: 'Comité des Fêtes',
    description: 'Organisation des événements festifs de la commune : vœux du maire, fête du village, brocante...',
    icon: Calendar,
    color: 'bg-villiers-gold/10 text-villiers-gold border-villiers-gold/20',
    contact: 'comitedesfetes@villiers-adam.fr',
  },
  {
    name: 'Les Amis de Villiers-Adam',
    description: 'Association de sauvegarde et de mise en valeur du patrimoine local.',
    icon: Heart,
    color: 'bg-villiers-blue/10 text-villiers-blue border-villiers-blue/20',
  },
  {
    name: 'Association des Parents d\'Élèves',
    description: 'Représentation des parents auprès de l\'école et organisation d\'activités périscolaires.',
    icon: Users,
    color: 'bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-950/30 dark:border-pink-900',
  },
];

export default function AssociationsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-villiers-blue/5 to-background" />
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
              <div className="w-16 h-16 rounded-xl bg-villiers-blue/10 border border-villiers-blue/20 flex items-center justify-center">
                <Users className="h-8 w-8 text-villiers-blue" />
              </div>
              <div>
                <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-1">
                  <span className="w-8 h-px bg-villiers-gold" />
                  Culture & Loisirs
                </span>
                <h1 className="text-3xl lg:text-5xl font-heading font-semibold text-foreground">
                  Associations
                </h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              La vie associative de Villiers-Adam est animée par des bénévoles passionnés
              qui organisent événements culturels, fêtes et activités tout au long de l'année.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Liste des associations */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto space-y-6">
            {associations.map((asso, index) => (
              <motion.div
                key={asso.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-background border border-border/50 rounded-organic p-6"
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center border shrink-0',
                    asso.color
                  )}>
                    <asso.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-heading text-xl font-semibold text-foreground mb-2">
                      {asso.name}
                    </h2>
                    <p className="text-muted-foreground mb-3">
                      {asso.description}
                    </p>
                    {asso.contact && (
                      <a
                        href={`mailto:${asso.contact}`}
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {asso.contact}
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Créer une association */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto mt-12"
          >
            <div className="bg-villiers-gold/5 border border-villiers-gold/20 rounded-organic p-6 text-center">
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                Vous souhaitez créer une association ?
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Contactez la mairie pour enregistrer votre association et bénéficier
                du soutien logistique de la commune.
              </p>
              <Button asChild>
                <Link href="/contact">
                  Nous contacter
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
