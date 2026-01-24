'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Bus,
  ChevronLeft,
  Clock,
  MapPin,
  Euro,
  FileText,
  ExternalLink,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Données des lignes
const lignesScolaires = [
  {
    id: 'college',
    name: 'Ligne Villiers-Adam → Collège Pierre Perret',
    destination: 'L\'Isle-Adam',
    horaires: {
      aller: '7h45',
      retour: '17h00',
    },
    arrets: ['Mairie', 'Église', 'Les Tilleuls'],
    jours: 'Lun, Mar, Jeu, Ven',
  },
  {
    id: 'lycee',
    name: 'Ligne Villiers-Adam → Lycée Fragonard',
    destination: 'L\'Isle-Adam',
    horaires: {
      aller: '7h30',
      retour: '17h30 / 18h30',
    },
    arrets: ['Mairie'],
    jours: 'Lun, Mar, Mer, Jeu, Ven',
  },
];

export default function TransportScolairePage() {
  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-background" />
        <div className="absolute inset-0 texture-grain opacity-30" />

        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
              <Link href="/vie-quotidienne/transports">
                <ChevronLeft className="h-4 w-4" />
                Retour aux Transports
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
              <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                <Bus className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-1">
                  <span className="w-8 h-px bg-villiers-gold" />
                  Transports
                </span>
                <h1 className="text-3xl lg:text-5xl font-heading font-semibold text-foreground">
                  Transport scolaire
                </h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Les élèves de Villiers-Adam bénéficient de lignes de transport scolaire
              vers le collège et les lycées du secteur, gérées par Île-de-France Mobilités.
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
              {/* Lignes scolaires */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-6">
                  Lignes de transport scolaire
                </h2>

                <div className="space-y-4">
                  {lignesScolaires.map((ligne) => (
                    <div
                      key={ligne.id}
                      className="bg-background border border-border/50 rounded-organic p-6"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                          <Bus className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-heading font-semibold text-foreground mb-2">
                            {ligne.name}
                          </h3>

                          <div className="grid sm:grid-cols-2 gap-4 mt-4">
                            <div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <Clock className="h-4 w-4" />
                                <span className="font-medium text-foreground">Horaires</span>
                              </div>
                              <p className="text-sm text-muted-foreground ml-6">
                                Aller : <span className="font-mono">{ligne.horaires.aller}</span><br />
                                Retour : <span className="font-mono">{ligne.horaires.retour}</span>
                              </p>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <Calendar className="h-4 w-4" />
                                <span className="font-medium text-foreground">Jours</span>
                              </div>
                              <p className="text-sm text-muted-foreground ml-6">
                                {ligne.jours}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <MapPin className="h-4 w-4" />
                              <span className="font-medium text-foreground">Points d&apos;arrêt</span>
                            </div>
                            <div className="flex flex-wrap gap-2 ml-6">
                              {ligne.arrets.map((arret) => (
                                <span
                                  key={arret}
                                  className="inline-flex items-center px-2 py-1 bg-muted text-xs rounded-full"
                                >
                                  {arret}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Tarifs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-muted/30 rounded-organic p-6"
              >
                <h2 className="font-heading text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Euro className="h-5 w-5 text-villiers-gold" />
                  Tarifs 2024-2025
                </h2>
                <p className="text-muted-foreground mb-4">
                  Le transport scolaire en Île-de-France est gratuit pour les élèves
                  du primaire, collège et lycée résidant à plus de 3 km de leur établissement.
                </p>
                <div className="bg-background border border-border/50 rounded-organic p-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-foreground">Carte Imagine R Scolaire :</span>
                    <span className="font-mono text-villiers-blue">Gratuit*</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    * La gratuité s&apos;applique aux élèves domiciliés en Île-de-France et scolarisés
                    dans un établissement public ou privé sous contrat, sous conditions de distance.
                  </p>
                </div>
              </motion.div>

              {/* Inscription */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-villiers-gold" />
                  Comment s&apos;inscrire ?
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-villiers-blue text-white flex items-center justify-center text-sm font-bold shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-1">Créer un compte</h3>
                      <p className="text-sm text-muted-foreground">
                        Rendez-vous sur le site Île-de-France Mobilités pour créer votre compte famille.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-villiers-blue text-white flex items-center justify-center text-sm font-bold shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-1">Faire la demande</h3>
                      <p className="text-sm text-muted-foreground">
                        Remplissez le formulaire en ligne avec les informations de l&apos;élève
                        et téléchargez les justificatifs demandés.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-villiers-blue text-white flex items-center justify-center text-sm font-bold shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-1">Recevoir la carte</h3>
                      <p className="text-sm text-muted-foreground">
                        La carte Imagine R est envoyée à domicile sous 3 semaines.
                        Un titre provisoire peut être délivré en attendant.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <a
                    href="https://www.iledefrance-mobilites.fr/titres-et-tarifs/detail/imagine-r-scolaire"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      S&apos;inscrire en ligne
                    </Button>
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Alerte */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-amber-50 border border-amber-200 rounded-organic p-6"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-heading font-semibold text-amber-900 mb-2">
                      Important
                    </h3>
                    <p className="text-sm text-amber-800">
                      Les inscriptions pour l&apos;année scolaire 2025-2026 ouvrent en juin.
                      Pensez à renouveler votre demande chaque année.
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
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                  Contact
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-foreground">Île-de-France Mobilités</p>
                    <p className="text-muted-foreground">Service transport scolaire</p>
                  </div>
                  <p className="text-muted-foreground">
                    <span className="font-mono">0 800 94 80 94</span><br />
                    <span className="text-xs">(appel gratuit)</span>
                  </p>
                </div>
              </motion.div>

              {/* Documents */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-muted/30 rounded-organic p-6"
              >
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                  Documents à fournir
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    Justificatif de domicile
                  </li>
                  <li className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    Certificat de scolarité
                  </li>
                  <li className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    Photo d&apos;identité récente
                  </li>
                  <li className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    RIB (si paiement)
                  </li>
                </ul>
              </motion.div>

              {/* Liens */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-background border border-border/50 rounded-organic p-6"
              >
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                  Liens utiles
                </h3>
                <div className="space-y-2">
                  <a
                    href="https://www.iledefrance-mobilites.fr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Île-de-France Mobilités
                  </a>
                  <a
                    href="https://www.transdev-idf.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Transdev (opérateur)
                  </a>
                </div>
              </motion.div>

              {/* Voir aussi */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-muted/30 rounded-organic p-6"
              >
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                  Voir aussi
                </h3>
                <div className="space-y-2">
                  <Link href="/vie-quotidienne/ecole/college-lycee" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    → Collège et lycée
                  </Link>
                  <Link href="/vie-quotidienne/ecole/ecole-primaire" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    → École primaire
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
