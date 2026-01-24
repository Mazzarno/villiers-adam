'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Building,
  ChevronLeft,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Bus,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Données des établissements
const etablissements = [
  {
    type: 'Collège',
    name: 'Collège Pierre Perret',
    address: '1 rue des Écoles, 95290 L\'Isle-Adam',
    phone: '01 34 69 05 50',
    email: 'ce.0951147r@ac-versailles.fr',
    website: 'http://www.clg-perret-lislaedam.ac-versailles.fr',
    distance: '5 km',
    transport: 'Ligne scolaire directe',
    color: 'bg-villiers-blue/10 border-villiers-blue/20 text-villiers-blue',
  },
  {
    type: 'Lycée général',
    name: 'Lycée Fragonard',
    address: '2 rue Fragonard, 95290 L\'Isle-Adam',
    phone: '01 34 69 31 32',
    email: 'ce.0951399k@ac-versailles.fr',
    website: 'http://www.lyc-fragonard-lisle-adam.ac-versailles.fr',
    distance: '6 km',
    transport: 'Ligne scolaire + bus régulier',
    color: 'bg-villiers-green/10 border-villiers-green/20 text-villiers-green',
  },
  {
    type: 'Lycée professionnel',
    name: 'Lycée Château d\'Épluches',
    address: '15 rue du Château, 95310 Saint-Ouen-l\'Aumône',
    phone: '01 34 32 47 47',
    email: 'ce.0951710z@ac-versailles.fr',
    website: 'http://www.lyc-chateau-epluches.ac-versailles.fr',
    distance: '15 km',
    transport: 'Bus régulier',
    color: 'bg-villiers-gold/10 border-villiers-gold/20 text-villiers-gold',
  },
];

export default function CollegeLyceePage() {
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
              <div className="w-16 h-16 rounded-xl bg-villiers-green/10 border border-villiers-green/20 flex items-center justify-center">
                <Building className="h-8 w-8 text-villiers-green" />
              </div>
              <div>
                <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-1">
                  <span className="w-8 h-px bg-villiers-gold" />
                  École & Enfance
                </span>
                <h1 className="text-3xl lg:text-5xl font-heading font-semibold text-foreground">
                  Collège et lycée
                </h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Les élèves de Villiers-Adam sont rattachés au collège de L&apos;Isle-Adam
              et aux lycées du secteur. Découvrez les établissements et les informations pratiques.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contenu */}
      <section className="py-12 lg:py-16">
        <div className="container">
          {/* Établissements */}
          <div className="space-y-6 mb-12">
            {etablissements.map((etab, index) => (
              <motion.div
                key={etab.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-background border border-border/50 rounded-organic overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* Info principale */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={cn(
                          'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border',
                          etab.color
                        )}>
                          <GraduationCap className="h-3.5 w-3.5" />
                          {etab.type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          À {etab.distance}
                        </span>
                      </div>

                      <h2 className="text-xl font-heading font-semibold text-foreground mb-3">
                        {etab.name}
                      </h2>

                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                          <span>{etab.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 shrink-0" />
                          <a href={`tel:${etab.phone.replace(/\s/g, '')}`} className="hover:text-primary transition-colors font-mono">
                            {etab.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 shrink-0" />
                          <a href={`mailto:${etab.email}`} className="hover:text-primary transition-colors truncate">
                            {etab.email}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 md:items-end">
                      <a
                        href={etab.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex"
                      >
                        <Button variant="outline" size="sm" className="gap-2">
                          <ExternalLink className="h-3.5 w-3.5" />
                          Site web
                        </Button>
                      </a>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                        <Bus className="h-3.5 w-3.5" />
                        {etab.transport}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Informations complémentaires */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Carte scolaire */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-muted/30 rounded-organic p-6"
            >
              <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                Sectorisation
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Villiers-Adam est rattachée au secteur du collège Pierre Perret de L&apos;Isle-Adam.
                Pour le lycée, les élèves peuvent choisir entre les établissements proposés
                selon leur filière.
              </p>
              <p className="text-sm text-muted-foreground">
                Les demandes de dérogation sont à effectuer auprès de la Direction des Services
                Départementaux de l&apos;Éducation Nationale (DSDEN) du Val-d&apos;Oise.
              </p>
            </motion.div>

            {/* Transport */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-background border border-border/50 rounded-organic p-6"
            >
              <h3 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Bus className="h-5 w-5 text-villiers-blue" />
                Transport scolaire
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Des lignes de transport scolaire desservent le collège et les lycées du secteur.
                L&apos;inscription se fait via la plateforme Île-de-France Mobilités.
              </p>
              <Link href="/vie-quotidienne/transports/transport-scolaire">
                <Button variant="outline" size="sm" className="gap-2">
                  En savoir plus
                  <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
                </Button>
              </Link>
            </motion.div>

            {/* Orientation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-villiers-blue/5 border border-villiers-blue/20 rounded-organic p-6"
            >
              <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                Orientation
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Pour toute question d&apos;orientation scolaire, vous pouvez consulter
                le Centre d&apos;Information et d&apos;Orientation (CIO) de Cergy-Pontoise.
              </p>
              <div className="text-sm">
                <p className="font-medium text-foreground">CIO de Cergy-Pontoise</p>
                <p className="text-muted-foreground">1 place des Arts - 95000 Cergy</p>
                <a href="tel:0134323026" className="text-primary hover:underline font-mono">
                  01 34 32 30 26
                </a>
              </div>
            </motion.div>

            {/* Bourses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-villiers-gold/5 border border-villiers-gold/20 rounded-organic p-6"
            >
              <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                Bourses scolaires
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Des bourses sont attribuées aux collégiens et lycéens selon les ressources
                de la famille. Les demandes se font en ligne via le portail Scolarité Services.
              </p>
              <a
                href="https://educonnect.education.gouv.fr"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="h-3.5 w-3.5" />
                  EduConnect
                </Button>
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
