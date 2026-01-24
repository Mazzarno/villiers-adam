'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Bus,
  ChevronLeft,
  Phone,
  Mail,
  ExternalLink,
  Clock,
  MapPin,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TransportScolairePage() {
  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-background dark:from-orange-950/20" />
        <div className="absolute inset-0 texture-grain opacity-30" />

        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
              <Link href="/vie-quotidienne/ecole">
                <ChevronLeft className="h-4 w-4" />
                Retour à École & Enfance
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
              <div className="w-16 h-16 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center dark:bg-orange-950/30 dark:border-orange-900">
                <Bus className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-1">
                  <span className="w-8 h-px bg-villiers-gold" />
                  École & Enfance
                </span>
                <h1 className="text-3xl lg:text-5xl font-heading font-semibold text-foreground">
                  Transport scolaire
                </h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Informations sur le transport scolaire pour les élèves de Villiers-Adam
              vers les collèges et lycées du secteur.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contenu */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contenu principal */}
            <div className="lg:col-span-2 space-y-8">
              {/* Inscription */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                  Inscription au transport scolaire
                </h2>
                <div className="bg-orange-50/50 border border-orange-200/50 rounded-organic p-6 dark:bg-orange-950/20 dark:border-orange-900/30">
                  <p className="text-muted-foreground mb-4">
                    Le transport scolaire en Île-de-France est géré par <strong className="text-foreground">Île-de-France Mobilités</strong>.
                    L&apos;inscription se fait en ligne sur leur plateforme.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0 dark:bg-orange-900/50">1</span>
                      <span className="text-muted-foreground">Créez un compte sur le site Île-de-France Mobilités</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0 dark:bg-orange-900/50">2</span>
                      <span className="text-muted-foreground">Remplissez le formulaire de demande de transport</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0 dark:bg-orange-900/50">3</span>
                      <span className="text-muted-foreground">Joignez les justificatifs demandés (domicile, scolarité)</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0 dark:bg-orange-900/50">4</span>
                      <span className="text-muted-foreground">Recevez la carte de transport par courrier</span>
                    </div>
                  </div>
                  <a
                    href="https://www.iledefrance-mobilites.fr/titres-et-tarifs/detail/imagine-r-scolaire"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-6 text-sm text-orange-600 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Accéder à la plateforme Île-de-France Mobilités
                  </a>
                </div>
              </motion.div>

              {/* Lignes desservies */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                  Lignes et établissements desservis
                </h2>
                <div className="space-y-4">
                  <div className="p-5 bg-background border border-border/50 rounded-organic">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-10 h-10 rounded-lg bg-villiers-blue/10 flex items-center justify-center text-villiers-blue font-bold text-sm">
                        L1
                      </span>
                      <div>
                        <h3 className="font-medium text-foreground">Ligne scolaire Villiers-Adam / L&apos;Isle-Adam</h3>
                        <p className="text-sm text-muted-foreground">Collège Pierre Perret</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Départ 7h30 - Retour 17h00</span>
                    </div>
                  </div>

                  <div className="p-5 bg-background border border-border/50 rounded-organic">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-10 h-10 rounded-lg bg-villiers-green/10 flex items-center justify-center text-villiers-green font-bold text-sm">
                        L2
                      </span>
                      <div>
                        <h3 className="font-medium text-foreground">Ligne scolaire Villiers-Adam / L&apos;Isle-Adam</h3>
                        <p className="text-sm text-muted-foreground">Lycée Fragonard</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Départ 7h15 - Retour 18h00</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Arrêts */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                  Points d&apos;arrêt à Villiers-Adam
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-organic">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-villiers-gold shrink-0 mt-1" />
                      <div>
                        <p className="font-medium text-foreground">Place de la Mairie</p>
                        <p className="text-sm text-muted-foreground">Arrêt principal</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-organic">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-villiers-gold shrink-0 mt-1" />
                      <div>
                        <p className="font-medium text-foreground">Rue Grande</p>
                        <p className="text-sm text-muted-foreground">Face à l&apos;église</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Tarifs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-villiers-gold/5 border border-villiers-gold/20 rounded-organic p-6"
              >
                <h3 className="font-heading font-semibold text-foreground mb-4">
                  Tarifs 2024-2025
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Carte Imagine R Scolaire</span>
                    <span className="font-mono font-medium text-foreground">350 €/an</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Aide Île-de-France</span>
                    <span className="font-mono font-medium text-villiers-green">-50%</span>
                  </div>
                  <hr className="border-border/50" />
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">Reste à charge</span>
                    <span className="font-mono font-semibold text-foreground">175 €/an</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Paiement possible en 3 ou 9 mensualités
                </p>
              </motion.div>

              {/* Alerte */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-amber-50 border border-amber-200 rounded-organic p-4 dark:bg-amber-950/20 dark:border-amber-900/30"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                      Inscription avant le 30 juin
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Pour bénéficier du service dès la rentrée, inscrivez-vous avant fin juin.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Contact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-background border border-border/50 rounded-organic p-6"
              >
                <h3 className="font-heading font-semibold text-foreground mb-4">
                  Contact
                </h3>
                <div className="space-y-3 text-sm">
                  <p className="font-medium text-foreground">Île-de-France Mobilités</p>
                  <a href="tel:0800948999" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <Phone className="h-4 w-4 text-villiers-gold" />
                    <span className="font-mono">0 800 948 999</span>
                    <span className="text-xs">(gratuit)</span>
                  </a>
                </div>
              </motion.div>

              {/* Documents */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-muted/30 rounded-organic p-6"
              >
                <h3 className="font-heading font-semibold text-foreground mb-4">
                  Documents utiles
                </h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                    <FileText className="h-3.5 w-3.5" />
                    Horaires des lignes scolaires
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                    <FileText className="h-3.5 w-3.5" />
                    Règlement du transport
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
