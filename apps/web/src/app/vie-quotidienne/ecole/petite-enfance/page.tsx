'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Baby,
  ChevronLeft,
  Phone,
  MapPin,
  Heart,
  Building2,
  FileText,
  ExternalLink,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Contacts PMI
const contactsPMI = [
  {
    name: 'Service P.M.I. — Beaumont-sur-Oise',
    description: 'Circonscription d\'Action Sociale et Médico-Sociale',
    address: '7 rue Léon Godin, 95260 Beaumont-sur-Oise',
    phone: '01 30 34 12 89',
  },
  {
    name: 'Centre de PMI de Mériel',
    address: 'Rue des Petits Près, 95630 Mériel',
  },
];

export default function PetiteEnfancePage() {
  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-pink-50/50 to-background dark:from-pink-950/20" />
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
              <div className="w-16 h-16 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center dark:bg-pink-950/30 dark:border-pink-900">
                <Baby className="h-8 w-8 text-pink-600" />
              </div>
              <div>
                <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-1">
                  <span className="w-8 h-px bg-villiers-gold" />
                  École & Enfance
                </span>
                <h1 className="text-3xl lg:text-5xl font-heading font-semibold text-foreground">
                  Petite enfance
                </h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Découvrez les solutions de garde pour les tout-petits à Villiers-Adam :
              assistantes maternelles agréées et structures d&apos;accueil à proximité.
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
              {/* Assistantes maternelles */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Heart className="h-6 w-6 text-pink-500" />
                  Assistantes maternelles agréées
                </h2>
                <div className="bg-pink-50/50 border border-pink-200/50 rounded-organic p-6 dark:bg-pink-950/20 dark:border-pink-900/30">
                  <p className="text-muted-foreground mb-4">
                    Pour obtenir la liste des assistantes maternelles agréées, vous pouvez :
                  </p>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-bold shrink-0 dark:bg-pink-900/50">1</span>
                      <span>Vous adresser au <strong className="text-foreground">secrétariat de la Mairie</strong></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-bold shrink-0 dark:bg-pink-900/50">2</span>
                      <span>Consulter le <a href="https://www.caf.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">site de la C.A.F.</a></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-bold shrink-0 dark:bg-pink-900/50">3</span>
                      <span>Vous rapprocher des <strong className="text-foreground">Centres de Protection Maternelle et Infantile (PMI)</strong> et de planification familiale</span>
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Contacts PMI */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-villiers-blue" />
                  Contacts PMI
                </h2>
                <div className="space-y-4">
                  {contactsPMI.map((contact, index) => (
                    <div
                      key={index}
                      className="p-5 bg-background border border-border/50 rounded-organic"
                    >
                      <h3 className="font-heading font-semibold text-foreground mb-1">
                        {contact.name}
                      </h3>
                      {contact.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {contact.description}
                        </p>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-villiers-gold shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{contact.address}</span>
                        </div>
                        {contact.phone && (
                          <a
                            href={`tel:${contact.phone.replace(/\s/g, '')}`}
                            className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                          >
                            <Phone className="h-4 w-4 text-villiers-gold" />
                            <span className="font-mono">{contact.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Relais Petite Enfance */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-muted/30 rounded-organic p-6"
              >
                <h3 className="font-heading text-xl font-semibold text-foreground mb-4">
                  Relais Petite Enfance (RPE)
                </h3>
                <p className="text-muted-foreground mb-4">
                  Le Relais Petite Enfance de la Communauté de Communes accompagne les parents
                  et les assistantes maternelles. Il propose :
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-1.5 shrink-0" />
                    Aide à la recherche d&apos;un mode de garde
                  </li>
                  <li className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-1.5 shrink-0" />
                    Information sur les aides financières (CAF, PAJE)
                  </li>
                  <li className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-1.5 shrink-0" />
                    Ateliers d&apos;éveil pour les enfants
                  </li>
                  <li className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-1.5 shrink-0" />
                    Conseils administratifs (contrat, déclaration)
                  </li>
                </ul>
              </motion.div>

              {/* Structures d'accueil */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                  Structures d&apos;accueil à proximité
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-background border border-border/50 rounded-organic">
                    <h4 className="font-medium text-foreground mb-2">Crèche de L&apos;Isle-Adam</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Multi-accueil municipal, 40 places
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      À 5 km de Villiers-Adam
                    </p>
                  </div>
                  <div className="p-4 bg-background border border-border/50 rounded-organic">
                    <h4 className="font-medium text-foreground mb-2">Micro-crèche Les Petits Pas</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Structure privée, 12 places
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      Beaumont-sur-Oise (8 km)
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Mairie */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-villiers-gold/5 border border-villiers-gold/20 rounded-organic p-6"
              >
                <div className="flex items-start gap-3 mb-4">
                  <Info className="h-5 w-5 text-villiers-gold shrink-0" />
                  <div>
                    <h3 className="font-heading font-semibold text-foreground">
                      Besoin d&apos;aide ?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      La mairie peut vous orienter vers les services adaptés.
                    </p>
                  </div>
                </div>
                <a href="tel:0134699287" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                  <Phone className="h-4 w-4 text-villiers-gold" />
                  <span className="font-mono">01 34 69 92 87</span>
                </a>
              </motion.div>

              {/* Liens utiles */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-muted/30 rounded-organic p-6"
              >
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                  Liens utiles
                </h3>
                <div className="space-y-2">
                  <a
                    href="https://www.caf.fr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    CAF - Aides à la garde
                  </a>
                  <a
                    href="https://www.pajemploi.urssaf.fr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Pajemploi
                  </a>
                  <a
                    href="https://www.monenfant.fr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Mon-enfant.fr
                  </a>
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
                    <FileText className="h-3.5 w-3.5" />
                    Guide des parents employeurs
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                    <FileText className="h-3.5 w-3.5" />
                    Modèle de contrat de travail
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
