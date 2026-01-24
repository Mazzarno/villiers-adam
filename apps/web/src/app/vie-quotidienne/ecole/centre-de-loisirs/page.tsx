'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  PartyPopper,
  ChevronLeft,
  Clock,
  Euro,
  Calendar,
  Phone,
  Mail,
  Download,
  Sun,
  Snowflake,
  Leaf,
  Flower2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Données des activités par période
const activities = [
  {
    period: 'Été',
    icon: Sun,
    color: 'text-yellow-500 bg-yellow-50 border-yellow-200',
    items: ['Sorties nature', 'Baignade', 'Grands jeux', 'Ateliers créatifs'],
  },
  {
    period: 'Automne',
    icon: Leaf,
    color: 'text-orange-500 bg-orange-50 border-orange-200',
    items: ['Cueillette', 'Land art', 'Cuisine d\'automne', 'Halloween'],
  },
  {
    period: 'Hiver',
    icon: Snowflake,
    color: 'text-blue-500 bg-blue-50 border-blue-200',
    items: ['Bricolages de Noël', 'Spectacles', 'Jeux de société', 'Patinoire'],
  },
  {
    period: 'Printemps',
    icon: Flower2,
    color: 'text-pink-500 bg-pink-50 border-pink-200',
    items: ['Jardinage', 'Chasse aux œufs', 'Sorties vélo', 'Jeux sportifs'],
  },
];

export default function CentreDeLoisrirsPage() {
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
              <div className="w-16 h-16 rounded-xl bg-villiers-gold/10 border border-villiers-gold/20 flex items-center justify-center">
                <PartyPopper className="h-8 w-8 text-villiers-gold" />
              </div>
              <div>
                <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-1">
                  <span className="w-8 h-px bg-villiers-gold" />
                  École & Enfance
                </span>
                <h1 className="text-3xl lg:text-5xl font-heading font-semibold text-foreground">
                  Centre de loisirs
                </h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Le centre de loisirs accueille les enfants de 3 à 11 ans les mercredis
              et pendant les vacances scolaires pour des activités ludiques et éducatives.
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
              {/* Accueil périscolaire */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-muted/30 rounded-organic p-6"
              >
                <h2 className="font-heading text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-villiers-gold" />
                  Accueil périscolaire
                </h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-foreground mb-2">Matin</h3>
                    <p className="text-sm text-muted-foreground">
                      7h30 - 8h20<br />
                      Accueil des enfants avant l&apos;école
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-2">Soir</h3>
                    <p className="text-sm text-muted-foreground">
                      16h30 - 18h30<br />
                      Goûter, activités, aide aux devoirs
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Mercredis */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-villiers-gold" />
                  Mercredis loisirs
                </h2>
                <div className="bg-background border border-border/50 rounded-organic p-6">
                  <div className="grid sm:grid-cols-2 gap-6 mb-4">
                    <div>
                      <h3 className="font-medium text-foreground mb-2">Journée complète</h3>
                      <p className="text-sm text-muted-foreground">
                        7h30 - 18h30<br />
                        Repas inclus
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-2">Demi-journée</h3>
                      <p className="text-sm text-muted-foreground">
                        7h30 - 13h30 (avec repas)<br />
                        13h30 - 18h30 (sans repas)
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Programme varié : activités manuelles, sportives, sorties culturelles,
                    jeux collectifs...
                  </p>
                </div>
              </motion.div>

              {/* Vacances */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
                  Vacances scolaires
                </h2>
                <p className="text-muted-foreground mb-6">
                  Le centre de loisirs fonctionne pendant toutes les vacances scolaires
                  (sauf Noël) avec un programme adapté à chaque saison.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {activities.map((activity, i) => (
                    <div
                      key={i}
                      className={cn(
                        'p-4 rounded-organic border',
                        activity.color.split(' ').slice(1).join(' ')
                      )}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <activity.icon className={cn('h-5 w-5', activity.color.split(' ')[0])} />
                        <h3 className="font-medium text-foreground">{activity.period}</h3>
                      </div>
                      <ul className="space-y-1">
                        {activity.items.map((item, j) => (
                          <li key={j} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Tarifs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Euro className="h-5 w-5 text-villiers-gold" />
                  Tarifs 2024-2025
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-2 font-medium text-foreground">Prestation</th>
                        <th className="text-right py-2 font-medium text-foreground">QF &lt; 600€</th>
                        <th className="text-right py-2 font-medium text-foreground">QF 600-1000€</th>
                        <th className="text-right py-2 font-medium text-foreground">QF &gt; 1000€</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border/30">
                        <td className="py-2">Périscolaire matin</td>
                        <td className="text-right font-mono">1,50 €</td>
                        <td className="text-right font-mono">2,00 €</td>
                        <td className="text-right font-mono">2,50 €</td>
                      </tr>
                      <tr className="border-b border-border/30">
                        <td className="py-2">Périscolaire soir</td>
                        <td className="text-right font-mono">3,00 €</td>
                        <td className="text-right font-mono">4,00 €</td>
                        <td className="text-right font-mono">5,00 €</td>
                      </tr>
                      <tr className="border-b border-border/30">
                        <td className="py-2">Mercredi journée</td>
                        <td className="text-right font-mono">12,00 €</td>
                        <td className="text-right font-mono">16,00 €</td>
                        <td className="text-right font-mono">20,00 €</td>
                      </tr>
                      <tr>
                        <td className="py-2">Vacances journée</td>
                        <td className="text-right font-mono">14,00 €</td>
                        <td className="text-right font-mono">18,00 €</td>
                        <td className="text-right font-mono">22,00 €</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  * QF : Quotient Familial CAF. Repas inclus pour les journées complètes.
                </p>
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
                  <a href="tel:0134089015" className="flex items-center gap-3 text-sm hover:text-primary transition-colors group">
                    <span className="w-8 h-8 rounded-full bg-villiers-gold/10 flex items-center justify-center group-hover:bg-villiers-gold/20 transition-colors">
                      <Phone className="h-4 w-4 text-villiers-gold" />
                    </span>
                    <span className="font-mono">01 34 08 90 15</span>
                  </a>
                  <a href="mailto:centreloisirs@villiers-adam.fr" className="flex items-center gap-3 text-sm hover:text-primary transition-colors group">
                    <span className="w-8 h-8 rounded-full bg-villiers-gold/10 flex items-center justify-center group-hover:bg-villiers-gold/20 transition-colors">
                      <Mail className="h-4 w-4 text-villiers-gold" />
                    </span>
                    <span className="text-xs">centreloisirs@villiers-adam.fr</span>
                  </a>
                </div>
              </motion.div>

              {/* Inscription */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-villiers-gold/5 border border-villiers-gold/20 rounded-organic p-6"
              >
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                  Inscription
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Les inscriptions se font en mairie. Pièces à fournir :
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                  <li className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-villiers-gold mt-1.5 shrink-0" />
                    Fiche d&apos;inscription complétée
                  </li>
                  <li className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-villiers-gold mt-1.5 shrink-0" />
                    Attestation CAF avec QF
                  </li>
                  <li className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-villiers-gold mt-1.5 shrink-0" />
                    Carnet de vaccination à jour
                  </li>
                </ul>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Download className="h-3.5 w-3.5" />
                  Fiche d&apos;inscription
                </Button>
              </motion.div>

              {/* Programme */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-muted/30 rounded-organic p-6"
              >
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                  Programme des vacances
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Téléchargez le programme des prochaines vacances scolaires.
                </p>
                <Button className="w-full gap-2">
                  <Download className="h-4 w-4" />
                  Programme vacances d&apos;hiver
                </Button>
              </motion.div>

              {/* Liens */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-background border border-border/50 rounded-organic p-6"
              >
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                  Voir aussi
                </h3>
                <div className="space-y-2">
                  <Link href="/vie-quotidienne/ecole/restauration-scolaire" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    → Restauration scolaire
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
