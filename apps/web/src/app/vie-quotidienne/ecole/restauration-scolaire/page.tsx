'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Utensils, ChevronLeft, Euro, Calendar, Leaf, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RestaurationScolairePage() {
  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-background" />
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
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center">
                <Utensils className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <span className="text-sm font-mono text-villiers-gold">École & Enfance</span>
                <h1 className="text-3xl lg:text-5xl font-heading font-semibold text-foreground">
                  Restauration scolaire
                </h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground">
              La cantine de l&apos;école propose des repas équilibrés préparés sur place,
              avec une attention particulière aux produits locaux et de saison.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
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
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-2 font-medium text-foreground">Quotient familial</th>
                        <th className="text-right py-2 font-medium text-foreground">Prix du repas</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border/30">
                        <td className="py-2">Inférieur à 600€</td>
                        <td className="text-right font-mono">3,50 €</td>
                      </tr>
                      <tr className="border-b border-border/30">
                        <td className="py-2">De 600€ à 1000€</td>
                        <td className="text-right font-mono">4,20 €</td>
                      </tr>
                      <tr className="border-b border-border/30">
                        <td className="py-2">Supérieur à 1000€</td>
                        <td className="text-right font-mono">5,00 €</td>
                      </tr>
                      <tr>
                        <td className="py-2">Extérieur</td>
                        <td className="text-right font-mono">6,50 €</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Engagement qualité */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-villiers-green" />
                  Nos engagements
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { title: 'Produits locaux', desc: 'Approvisionnement auprès de producteurs du Vexin' },
                    { title: 'Fait maison', desc: 'Repas préparés sur place par notre cuisinière' },
                    { title: 'Bio régulier', desc: 'Au moins un composant bio par repas' },
                    { title: 'Anti-gaspi', desc: 'Sensibilisation des enfants au tri et au gaspillage' },
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-background border border-border/50 rounded-organic">
                      <h3 className="font-medium text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Menus */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-villiers-gold" />
                  Menus du mois
                </h2>
                <div className="bg-villiers-gold/5 border border-villiers-gold/20 rounded-organic p-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    Les menus sont affichés à l&apos;entrée de l&apos;école et disponibles en téléchargement.
                  </p>
                  <Button className="gap-2">
                    <Download className="h-4 w-4" />
                    Télécharger les menus
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-background border border-border/50 rounded-organic p-6"
              >
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                  Inscription
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  L&apos;inscription à la cantine se fait en mairie. Vous pouvez inscrire
                  votre enfant pour l&apos;année ou au trimestre.
                </p>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Download className="h-3.5 w-3.5" />
                  Fiche d&apos;inscription
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-muted/30 rounded-organic p-6"
              >
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                  Allergies alimentaires
                </h3>
                <p className="text-sm text-muted-foreground">
                  En cas d&apos;allergie ou de régime alimentaire particulier,
                  un PAI (Projet d&apos;Accueil Individualisé) peut être mis en place.
                  Contactez la directrice de l&apos;école.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
