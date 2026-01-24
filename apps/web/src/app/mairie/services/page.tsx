'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Briefcase,
  ChevronLeft,
  Mail,
  Phone,
  Clock,
  FileText,
  Users,
  Building2,
  AlertTriangle,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const services = [
  {
    id: 'poste',
    name: 'Services postaux',
    icon: Package,
    description: 'Retrait de colis et recommandés, affranchissement',
    color: 'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-900',
    featured: true,
    details: {
      horaires: [
        { jour: 'Lundi', heures: '9h–12h / 14h–17h' },
        { jour: 'Mardi', heures: 'Fermé' },
        { jour: 'Mercredi', heures: '10h–12h', note: 'Uniquement retrait colis et recommandé' },
        { jour: 'Jeudi', heures: '9h–12h / 14h–17h' },
        { jour: 'Vendredi', heures: 'Fermé' },
        { jour: 'Samedi', heures: '10h–12h', note: 'Fermé en juillet/août' },
      ],
      telephone: '01 34 69 28 17',
    },
  },
  {
    id: 'etat-civil',
    name: 'État civil',
    icon: FileText,
    description: 'Actes de naissance, mariage, décès, livret de famille',
    color: 'bg-villiers-blue/10 text-villiers-blue border-villiers-blue/20',
  },
  {
    id: 'elections',
    name: 'Élections',
    icon: Users,
    description: 'Inscription sur les listes électorales, carte d\'électeur',
    color: 'bg-villiers-gold/10 text-villiers-gold border-villiers-gold/20',
  },
  {
    id: 'urbanisme',
    name: 'Urbanisme',
    icon: Building2,
    description: 'Permis de construire, déclarations de travaux, cadastre',
    color: 'bg-villiers-green/10 text-villiers-green border-villiers-green/20',
    link: '/vie-quotidienne/urbanisme',
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-villiers-gold/5 to-background" />
        <div className="absolute inset-0 texture-grain opacity-30" />

        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
              <Link href="/mairie">
                <ChevronLeft className="h-4 w-4" />
                Retour à La Mairie
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
              <div className="w-16 h-16 rounded-xl bg-villiers-gold/10 border border-villiers-gold/20 flex items-center justify-center">
                <Briefcase className="h-8 w-8 text-villiers-gold" />
              </div>
              <div>
                <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-1">
                  <span className="w-8 h-px bg-villiers-gold" />
                  La Mairie
                </span>
                <h1 className="text-3xl lg:text-5xl font-heading font-semibold text-foreground">
                  Services municipaux
                </h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              La mairie de Villiers-Adam vous propose différents services de proximité :
              état civil, élections, urbanisme et services postaux.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <div className="space-y-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'bg-background border border-border/50 rounded-organic overflow-hidden',
                  service.featured && 'ring-2 ring-villiers-gold/20'
                )}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center border shrink-0',
                      service.color
                    )}>
                      <service.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="font-heading text-xl font-semibold text-foreground">
                          {service.name}
                        </h2>
                        {service.featured && (
                          <span className="px-2 py-0.5 bg-villiers-gold/10 text-villiers-gold text-xs font-medium rounded-full">
                            Agence postale
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground">
                        {service.description}
                      </p>

                      {/* Détails services postaux */}
                      {service.details && (
                        <div className="mt-6 space-y-4">
                          <div className="bg-muted/30 rounded-lg p-4">
                            <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                              <Clock className="h-4 w-4 text-villiers-gold" />
                              Horaires d'ouverture
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {service.details.horaires.map((h, i) => (
                                <div
                                  key={i}
                                  className={cn(
                                    'flex justify-between text-sm py-1.5 px-2 rounded',
                                    h.heures === 'Fermé'
                                      ? 'text-muted-foreground/50'
                                      : 'bg-background'
                                  )}
                                >
                                  <span className="text-foreground">{h.jour}</span>
                                  <span className={cn(
                                    'font-mono',
                                    h.heures === 'Fermé' ? 'text-muted-foreground/50' : 'text-muted-foreground'
                                  )}>
                                    {h.heures}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 space-y-1">
                              <p className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1.5">
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                <span>Le mercredi, uniquement retrait colis et recommandé.</span>
                              </p>
                              <p className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1.5">
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                <span>Fermé le samedi matin en juillet/août.</span>
                              </p>
                            </div>
                          </div>

                          <a
                            href={`tel:${service.details.telephone.replace(/\s/g, '')}`}
                            className="inline-flex items-center gap-2 text-sm hover:text-primary transition-colors"
                          >
                            <Phone className="h-4 w-4 text-villiers-gold" />
                            <span className="font-mono">{service.details.telephone}</span>
                          </a>
                        </div>
                      )}

                      {service.link && (
                        <Link
                          href={service.link}
                          className="inline-flex items-center gap-2 mt-4 text-sm text-primary hover:underline"
                        >
                          En savoir plus
                          <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact général */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <div className="bg-villiers-blue/5 border border-villiers-blue/20 rounded-organic p-6">
              <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                Contact général
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <a href="tel:0134699287" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                  <Phone className="h-4 w-4 text-villiers-gold" />
                  <span className="font-mono">01 34 69 92 87</span>
                </a>
                <a href="mailto:mairie@villiers-adam.fr" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                  <Mail className="h-4 w-4 text-villiers-gold" />
                  <span>mairie@villiers-adam.fr</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
