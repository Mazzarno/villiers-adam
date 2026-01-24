'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  School,
  ChevronLeft,
  Users,
  Calendar,
  FileText,
  Phone,
  Mail,
  Clock,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EcolePrimairePage() {
  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-villiers-blue/5 to-background" />
        <div className="absolute inset-0 texture-grain opacity-30" />

        <div className="container relative">
          {/* Breadcrumb */}
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
                <School className="h-8 w-8 text-villiers-blue" />
              </div>
              <div>
                <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-1">
                  <span className="w-8 h-px bg-villiers-gold" />
                  École & Enfance
                </span>
                <h1 className="text-3xl lg:text-5xl font-heading font-semibold text-foreground">
                  École primaire
                </h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              L&apos;école de Villiers-Adam accueille les enfants de la petite section de maternelle
              au CM2. Elle offre un cadre d&apos;apprentissage privilégié dans un environnement rural préservé.
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
              {/* Présentation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="prose prose-slate max-w-none"
              >
                <h2 className="font-heading text-2xl font-semibold text-foreground">
                  Présentation de l&apos;école
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  L&apos;école de Villiers-Adam est un établissement public qui regroupe les classes
                  de maternelle (petite, moyenne et grande section) et d&apos;élémentaire (du CP au CM2).
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Avec des effectifs réduits, l&apos;équipe pédagogique assure un suivi personnalisé
                  de chaque élève dans un cadre bienveillant et stimulant.
                </p>
              </motion.div>

              {/* Organisation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-muted/30 rounded-organic p-6"
              >
                <h3 className="font-heading text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-villiers-gold" />
                  Organisation scolaire
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Jours de classe</h4>
                    <p className="text-sm text-muted-foreground">
                      Lundi, mardi, jeudi, vendredi
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Horaires</h4>
                    <p className="text-sm text-muted-foreground">
                      8h30 - 11h30 / 13h30 - 16h30
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Équipe */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h3 className="font-heading text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-villiers-gold" />
                  Équipe pédagogique
                </h3>
                <div className="space-y-3">
                  <div className="p-4 bg-background border border-border/50 rounded-organic">
                    <p className="font-medium text-foreground">Mme Martin</p>
                    <p className="text-sm text-muted-foreground">Directrice - Classe CE2/CM1</p>
                  </div>
                  <div className="p-4 bg-background border border-border/50 rounded-organic">
                    <p className="font-medium text-foreground">Mme Dupont</p>
                    <p className="text-sm text-muted-foreground">Classe PS/MS/GS (Maternelle)</p>
                  </div>
                  <div className="p-4 bg-background border border-border/50 rounded-organic">
                    <p className="font-medium text-foreground">M. Bernard</p>
                    <p className="text-sm text-muted-foreground">Classe CP/CE1</p>
                  </div>
                </div>
              </motion.div>

              {/* Inscriptions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h3 className="font-heading text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-villiers-gold" />
                  Inscriptions
                </h3>
                <div className="bg-villiers-blue/5 border border-villiers-blue/20 rounded-organic p-6">
                  <p className="text-muted-foreground mb-4">
                    Les inscriptions se font en deux étapes :
                  </p>
                  <ol className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-villiers-blue text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
                      <span><strong className="text-foreground">En mairie</strong> : avec livret de famille, justificatif de domicile et carnet de santé</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-villiers-blue text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
                      <span><strong className="text-foreground">À l&apos;école</strong> : finalisation de l&apos;inscription avec la directrice</span>
                    </li>
                  </ol>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
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
                <div className="space-y-4">
                  <a href="tel:0134089010" className="flex items-center gap-3 text-sm hover:text-primary transition-colors group">
                    <span className="w-8 h-8 rounded-full bg-villiers-gold/10 flex items-center justify-center group-hover:bg-villiers-gold/20 transition-colors">
                      <Phone className="h-4 w-4 text-villiers-gold" />
                    </span>
                    <span className="font-mono">01 34 08 90 10</span>
                  </a>
                  <a href="mailto:ecole@villiers-adam.fr" className="flex items-center gap-3 text-sm hover:text-primary transition-colors group">
                    <span className="w-8 h-8 rounded-full bg-villiers-gold/10 flex items-center justify-center group-hover:bg-villiers-gold/20 transition-colors">
                      <Mail className="h-4 w-4 text-villiers-gold" />
                    </span>
                    <span>ecole@villiers-adam.fr</span>
                  </a>
                  <div className="flex items-start gap-3 text-sm">
                    <span className="w-8 h-8 rounded-full bg-villiers-gold/10 flex items-center justify-center shrink-0">
                      <Clock className="h-4 w-4 text-villiers-gold" />
                    </span>
                    <div>
                      <p className="font-medium text-foreground">Accueil</p>
                      <p className="text-muted-foreground">8h20 - 8h30 et 13h20 - 13h30</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Documents */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-background border border-border/50 rounded-organic p-6"
              >
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                  Documents utiles
                </h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                    <Download className="h-3.5 w-3.5" />
                    Fiche d&apos;inscription
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                    <Download className="h-3.5 w-3.5" />
                    Règlement intérieur
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                    <Download className="h-3.5 w-3.5" />
                    Calendrier scolaire
                  </Button>
                </div>
              </motion.div>

              {/* Liens rapides */}
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
                  <Link href="/vie-quotidienne/ecole/restauration-scolaire" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    → Restauration scolaire
                  </Link>
                  <Link href="/vie-quotidienne/ecole/centre-de-loisirs" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    → Centre de loisirs
                  </Link>
                  <Link href="/vie-quotidienne/ecole/transport-scolaire" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    → Transport scolaire
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
