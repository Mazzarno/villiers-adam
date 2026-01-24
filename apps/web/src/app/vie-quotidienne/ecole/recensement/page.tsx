'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  UserCheck,
  ChevronLeft,
  Phone,
  Mail,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RecensementPage() {
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
              <div className="w-16 h-16 rounded-xl bg-villiers-blue/10 border border-villiers-blue/20 flex items-center justify-center">
                <UserCheck className="h-8 w-8 text-villiers-blue" />
              </div>
              <div>
                <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-1">
                  <span className="w-8 h-px bg-villiers-gold" />
                  École & Enfance
                </span>
                <h1 className="text-3xl lg:text-5xl font-heading font-semibold text-foreground">
                  Recensement citoyen
                </h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Le recensement citoyen est obligatoire pour tous les jeunes Français
              dès l&apos;âge de 16 ans. Il permet de participer à la Journée Défense et Citoyenneté (JDC).
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
              {/* Qui est concerné */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                  Qui est concerné ?
                </h2>
                <div className="bg-muted/30 rounded-organic p-6">
                  <p className="text-muted-foreground mb-4">
                    Tout jeune Français, garçon ou fille, doit se faire recenser à la mairie
                    de son domicile, ou par internet, dans les <strong className="text-foreground">3 mois
                    suivant son 16e anniversaire</strong>.
                  </p>
                  <div className="flex items-start gap-3 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg dark:bg-amber-950/30 dark:text-amber-300">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>
                      Le défaut de recensement peut entraîner des difficultés pour s&apos;inscrire
                      aux concours et examens publics (bac, permis de conduire, etc.).
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Démarche */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                  Comment se faire recenser ?
                </h2>
                <div className="space-y-4">
                  <div className="p-5 bg-background border border-border/50 rounded-organic">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-villiers-blue/10 flex items-center justify-center shrink-0">
                        <Building2 className="h-5 w-5 text-villiers-blue" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground mb-2">En mairie</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Présentez-vous en mairie avec les documents nécessaires.
                          La démarche est immédiate.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Lun-Ven : 9h-12h / 14h-17h</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-background border border-border/50 rounded-organic">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-villiers-green/10 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-villiers-green" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground mb-2">En ligne</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Effectuez la démarche sur le site Service-Public.fr.
                        </p>
                        <a
                          href="https://www.service-public.fr/particuliers/vosdroits/R2054"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          Accéder au service en ligne
                          <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Documents */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                  Documents à fournir
                </h2>
                <div className="bg-villiers-blue/5 border border-villiers-blue/20 rounded-organic p-6">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-villiers-green shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        <strong className="text-foreground">Carte nationale d&apos;identité</strong> ou passeport
                        du jeune (original + copie)
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-villiers-green shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        <strong className="text-foreground">Livret de famille</strong> à jour
                        (original + copie)
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-villiers-green shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        <strong className="text-foreground">Justificatif de domicile</strong> de moins
                        de 3 mois
                      </span>
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Après le recensement */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                  Après le recensement
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-organic">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-villiers-gold/20 text-villiers-gold flex items-center justify-center text-xs font-bold shrink-0">1</span>
                      <div>
                        <p className="font-medium text-foreground">Attestation de recensement</p>
                        <p className="text-sm text-muted-foreground">
                          Remise immédiatement. À conserver précieusement.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-organic">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-villiers-gold/20 text-villiers-gold flex items-center justify-center text-xs font-bold shrink-0">2</span>
                      <div>
                        <p className="font-medium text-foreground">Convocation à la JDC</p>
                        <p className="text-sm text-muted-foreground">
                          Envoyée par courrier avant vos 18 ans.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-organic">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-villiers-gold/20 text-villiers-gold flex items-center justify-center text-xs font-bold shrink-0">3</span>
                      <div>
                        <p className="font-medium text-foreground">Certificat JDC</p>
                        <p className="text-sm text-muted-foreground">
                          Remis à l&apos;issue de la journée. Obligatoire pour les examens.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Dates clés */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-villiers-gold/5 border border-villiers-gold/20 rounded-organic p-6"
              >
                <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-villiers-gold" />
                  Dates clés
                </h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-medium text-foreground">16 ans</p>
                    <p className="text-muted-foreground">Recensement obligatoire (sous 3 mois)</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">16-25 ans</p>
                    <p className="text-muted-foreground">Participation à la JDC</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">18 ans</p>
                    <p className="text-muted-foreground">Inscription automatique sur les listes électorales</p>
                  </div>
                </div>
              </motion.div>

              {/* Contact mairie */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-background border border-border/50 rounded-organic p-6"
              >
                <h3 className="font-heading font-semibold text-foreground mb-4">
                  Contact mairie
                </h3>
                <div className="space-y-3">
                  <a href="tel:0134699287" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                    <Phone className="h-4 w-4 text-villiers-gold" />
                    <span className="font-mono">01 34 69 92 87</span>
                  </a>
                  <a href="mailto:mairie@villiers-adam.fr" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                    <Mail className="h-4 w-4 text-villiers-gold" />
                    <span>mairie@villiers-adam.fr</span>
                  </a>
                </div>
              </motion.div>

              {/* Liens utiles */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-muted/30 rounded-organic p-6"
              >
                <h3 className="font-heading font-semibold text-foreground mb-4">
                  Liens utiles
                </h3>
                <div className="space-y-2">
                  <a
                    href="https://www.service-public.fr/particuliers/vosdroits/F870"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
                    Fiche Service-Public.fr
                  </a>
                  <a
                    href="https://www.defense.gouv.fr/jdc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
                    Site officiel de la JDC
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
