'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Building,
  ChevronLeft,
  FileText,
  Hammer,
  TreePine,
  Phone,
  Mail,
  Clock,
  Download,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const demarches = [
  {
    title: 'Permis de construire',
    description: 'Construction neuve, extension > 20m², surélévation, changement d\'affectation',
    icon: Building,
  },
  {
    title: 'Déclaration préalable',
    description: 'Clôtures, ravalement de façade, extension < 20m², modifications mineures',
    icon: FileText,
  },
  {
    title: 'Permis de démolir',
    description: 'Toute démolition totale ou partielle d\'un bâtiment',
    icon: Hammer,
  },
];

export default function UrbanismePage() {
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
              <Link href="/vie-quotidienne">
                <ChevronLeft className="h-4 w-4" />
                Retour à Vie quotidienne
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
                  Vie quotidienne
                </span>
                <h1 className="text-3xl lg:text-5xl font-heading font-semibold text-foreground">
                  Urbanisme
                </h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Villiers-Adam fait partie du Parc naturel régional du Vexin français.
              Toute construction ou modification est soumise à des règles spécifiques
              visant à préserver le patrimoine architectural et paysager.
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
              {/* PNR */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-villiers-green/5 border border-villiers-green/20 rounded-organic p-6"
              >
                <div className="flex items-start gap-4">
                  <TreePine className="h-6 w-6 text-villiers-green shrink-0" />
                  <div>
                    <h2 className="font-heading text-lg font-semibold text-foreground mb-2">
                      Commune du Parc naturel régional du Vexin français
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Les projets de construction sont soumis à l&apos;avis de l&apos;Architecte des Bâtiments de France
                      et doivent respecter les prescriptions du PNR en matière de matériaux, couleurs et volumétrie.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Démarches */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-6">
                  Démarches d&apos;urbanisme
                </h2>
                <div className="space-y-4">
                  {demarches.map((demarche, index) => (
                    <div
                      key={index}
                      className="p-4 bg-background border border-border/50 rounded-organic flex items-start gap-4"
                    >
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <demarche.icon className="h-5 w-5 text-villiers-green" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground mb-1">{demarche.title}</h3>
                        <p className="text-sm text-muted-foreground">{demarche.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Règles de dépôt */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-muted/30 rounded-organic p-6"
              >
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                  Dépôt de matériaux sur la voie publique
                </h3>
                <p className="text-muted-foreground mb-4">
                  Tout dépôt de sable, gravats, matériaux, etc., ainsi que d&apos;une benne à gravats,
                  doit faire l&apos;objet d&apos;une <strong className="text-foreground">demande d&apos;autorisation en Mairie</strong>.
                </p>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-3.5 w-3.5" />
                  Formulaire de demande
                </Button>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact urbanisme */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-background border border-border/50 rounded-organic p-6"
              >
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                  Service urbanisme
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 text-sm">
                    <Clock className="h-4 w-4 text-villiers-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Sur rendez-vous</p>
                      <p className="text-muted-foreground">Consultations le jeudi matin</p>
                    </div>
                  </div>
                  <a href="tel:0134699287" className="flex items-center gap-3 text-sm hover:text-primary transition-colors group">
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
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                  Liens utiles
                </h3>
                <div className="space-y-2">
                  <a
                    href="https://www.service-public.fr/particuliers/vosdroits/N319"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Service-public.fr – Urbanisme
                  </a>
                  <a
                    href="https://www.pnr-vexin-francais.fr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    PNR Vexin français
                  </a>
                  <a
                    href="https://www.geoportail-urbanisme.gouv.fr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Géoportail de l&apos;urbanisme
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
                  Documents à télécharger
                </h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                    <Download className="h-3.5 w-3.5" />
                    Cerfa Permis de construire
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                    <Download className="h-3.5 w-3.5" />
                    Cerfa Déclaration préalable
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                    <Download className="h-3.5 w-3.5" />
                    Cerfa Permis de démolir
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
