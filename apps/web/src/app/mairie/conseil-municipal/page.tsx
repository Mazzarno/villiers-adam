'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Crown,
  Users,
  Mail,
  Phone,
  Building2,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Équipe municipale complète
const maire = {
  nom: 'Bruno MACE',
  role: 'Maire',
  delegations: 'Finances & Gestion du Personnel',
  mandats: [
    'Vice-Président de la CCVO3F (assainissement, eaux pluviales, GEMAPI)',
    'Vice-Président du TRI OR (traitement des déchets)',
    'Vice-Président du SIAVOS (AEP)',
  ],
};

const adjoints = [
  {
    nom: 'Eric MONTAGNIER',
    role: '1er Adjoint',
    delegations: 'Grands Travaux & Urbanisme',
  },
  {
    nom: 'Céline LEGRAND-HAMON',
    role: '2ème Adjointe',
    delegations: 'Événements festifs, cimetière',
  },
  {
    nom: 'Guillaume LEGER',
    role: '3ème Adjoint',
    delegations: 'Environnement, délégué PNR Vexin',
  },
  {
    nom: 'Milène ROUSSEAU',
    role: '4ème Adjointe',
    delegations: 'Relations habitants et associations',
  },
];

const conseillereDeleguee = {
  nom: 'Marion MOURA-CASSIA',
  role: 'Conseillère Déléguée',
  delegations: 'Citoyenneté, Cérémonies officielles',
};

const conseillers = [
  { nom: 'Sandra LOPES' },
  { nom: 'Edwige LAFAY-MERTENS' },
  { nom: 'Christian CAPMAN' },
  { nom: 'Rémy PONCHEL' },
  { nom: 'Maria PASSARO' },
];

export default function ConseilMunicipalPage() {
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
              <div className="w-16 h-16 rounded-xl bg-villiers-blue/10 border border-villiers-blue/20 flex items-center justify-center">
                <Users className="h-8 w-8 text-villiers-blue" />
              </div>
              <div>
                <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-1">
                  <span className="w-8 h-px bg-villiers-gold" />
                  La Mairie
                </span>
                <h1 className="text-3xl lg:text-5xl font-heading font-semibold text-foreground">
                  Le Conseil Municipal
                </h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Découvrez l'équipe municipale de Villiers-Adam, élue pour vous représenter
              et gérer les affaires de la commune.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Le Maire */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="bg-gradient-to-br from-villiers-blue/5 to-villiers-gold/5 border border-villiers-gold/20 rounded-organic overflow-hidden">
              <div className="p-8 lg:p-10">
                <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                  {/* Photo placeholder */}
                  <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-xl bg-villiers-blue/10 border border-villiers-blue/20 flex items-center justify-center shrink-0">
                    <Crown className="h-12 w-12 text-villiers-gold" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-villiers-gold/10 text-villiers-gold text-sm font-medium rounded-full">
                        Maire
                      </span>
                    </div>
                    <h2 className="font-heading text-3xl font-semibold text-foreground mb-2">
                      {maire.nom}
                    </h2>
                    <p className="text-lg text-villiers-blue dark:text-villiers-gold font-medium mb-4">
                      {maire.delegations}
                    </p>

                    {/* Mandats intercommunaux */}
                    <div className="mt-6 p-4 bg-background/50 rounded-lg border border-border/50">
                      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-villiers-gold" />
                        Mandats intercommunaux
                      </h3>
                      <ul className="space-y-2">
                        {maire.mandats.map((mandat, index) => (
                          <li key={index} className="flex gap-2 text-sm text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-villiers-gold mt-1.5 shrink-0" />
                            {mandat}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Adjoints */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="font-heading text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
              <Briefcase className="h-6 w-6 text-villiers-blue" />
              Les Adjoints au Maire
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {adjoints.map((adjoint, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-5 bg-background border border-border/50 rounded-organic hover:border-villiers-blue/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-villiers-blue/10 flex items-center justify-center shrink-0">
                      <span className="text-villiers-blue font-heading font-bold">
                        {adjoint.nom.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-villiers-gold uppercase tracking-wide">
                        {adjoint.role}
                      </span>
                      <h3 className="font-heading font-semibold text-foreground mt-1">
                        {adjoint.nom}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {adjoint.delegations}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Conseillère Déléguée */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="font-heading text-2xl font-semibold text-foreground mb-6">
              Conseillère Déléguée
            </h2>
            <div className="p-5 bg-villiers-gold/5 border border-villiers-gold/20 rounded-organic max-w-md">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-villiers-gold/10 flex items-center justify-center shrink-0">
                  <span className="text-villiers-gold font-heading font-bold">
                    {conseillereDeleguee.nom.charAt(0)}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-medium text-villiers-gold uppercase tracking-wide">
                    {conseillereDeleguee.role}
                  </span>
                  <h3 className="font-heading font-semibold text-foreground mt-1">
                    {conseillereDeleguee.nom}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {conseillereDeleguee.delegations}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Conseillers Municipaux */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
              <Users className="h-6 w-6 text-villiers-green" />
              Conseillers Municipaux
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {conseillers.map((conseiller, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-background border border-border/50 rounded-organic hover:border-villiers-green/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-villiers-green/10 flex items-center justify-center shrink-0">
                      <span className="text-villiers-green font-heading font-bold text-sm">
                        {conseiller.nom.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Conseiller(ère)
                      </span>
                      <h3 className="font-medium text-foreground">
                        {conseiller.nom}
                      </h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <div className="bg-muted/30 border border-border/50 rounded-organic p-6">
              <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                Contacter la mairie
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
