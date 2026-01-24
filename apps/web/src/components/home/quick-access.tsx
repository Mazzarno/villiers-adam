'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileText,
  Calendar,
  Users,
  Building,
  Phone,
  MapPin,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const quickAccessItems = [
  {
    icon: FileText,
    label: 'Démarches',
    description: 'État civil, urbanisme, élections',
    href: '/mairie/demarches',
    accent: 'villiers-blue',
  },
  {
    icon: Calendar,
    label: 'Agenda',
    description: 'Événements et manifestations',
    href: '/agenda',
    accent: 'villiers-gold',
  },
  {
    icon: Users,
    label: 'Associations',
    description: 'Vie associative locale',
    href: '/culture-loisirs/associations',
    accent: 'villiers-green',
  },
  {
    icon: Building,
    label: 'Urbanisme',
    description: 'Permis, PLU, cadastre',
    href: '/vie-quotidienne/urbanisme',
    accent: 'villiers-blue',
  },
  {
    icon: GraduationCap,
    label: 'École',
    description: 'Inscriptions et infos scolaires',
    href: '/vie-quotidienne/ecole',
    accent: 'villiers-gold',
  },
  {
    icon: BookOpen,
    label: 'Publications',
    description: 'Arrêtés et délibérations',
    href: '/mairie/publications',
    accent: 'villiers-green',
  },
  {
    icon: MapPin,
    label: 'Plan interactif',
    description: 'Carte de la commune',
    href: '/carte',
    accent: 'villiers-blue',
  },
  {
    icon: Phone,
    label: 'Contact',
    description: 'Nous joindre',
    href: '/contact',
    accent: 'villiers-gold',
  },
];

const accentStyles = {
  'villiers-blue': {
    bg: 'bg-villiers-blue/10',
    text: 'text-villiers-blue',
    border: 'border-villiers-blue/20',
    hoverBg: 'group-hover:bg-villiers-blue/15',
  },
  'villiers-gold': {
    bg: 'bg-villiers-gold/10',
    text: 'text-villiers-gold',
    border: 'border-villiers-gold/20',
    hoverBg: 'group-hover:bg-villiers-gold/15',
  },
  'villiers-green': {
    bg: 'bg-villiers-green/10',
    text: 'text-villiers-green',
    border: 'border-villiers-green/20',
    hoverBg: 'group-hover:bg-villiers-green/15',
  },
};

export function QuickAccess() {
  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      {/* Fond avec texture subtile */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-muted/50 to-muted/30" />
      <div className="absolute inset-0 bg-stone-texture opacity-30" />

      {/* Formes décoratives */}
      <div className="absolute top-10 left-[5%] w-40 h-40 border border-villiers-gold/10 rounded-full" />
      <div className="absolute bottom-10 right-[10%] w-28 h-28 border border-villiers-blue/10 rounded-full" />

      <div className="container relative">
        {/* Header avec style éditorial */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl mb-14"
        >
          <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-4">
            <span className="w-8 h-px bg-villiers-gold" />
            Services
          </span>
          <h2 className="text-3xl lg:text-5xl font-heading font-semibold text-foreground mb-4">
            Accès <span className="display-italic">rapide</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Retrouvez facilement les services les plus consultés par nos habitants
          </p>
        </motion.div>

        {/* Grille décalée asymétrique */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {quickAccessItems.map((item, index) => {
            const styles = accentStyles[item.accent as keyof typeof accentStyles];
            const isOffset = index % 2 === 1;

            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={cn(isOffset && 'md:mt-8')}
              >
                <Link href={item.href} className="block group">
                  <motion.div
                    className="relative flex flex-col items-center p-6 lg:p-8 bg-background rounded-organic border border-border/50 transition-all duration-500 ease-organic overflow-hidden"
                    whileHover={{
                      y: -8,
                      rotate: index % 2 === 0 ? 1 : -1,
                      boxShadow: '0 20px 40px rgba(30, 58, 95, 0.12)',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    {/* Cercle décoratif en arrière-plan */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br from-transparent to-muted/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Icône avec conteneur stylisé */}
                    <motion.div
                      className={cn(
                        'relative w-14 h-14 lg:w-16 lg:h-16 rounded-xl flex items-center justify-center mb-5 transition-all duration-300',
                        styles.bg,
                        styles.hoverBg
                      )}
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    >
                      <item.icon
                        className={cn(
                          'h-6 w-6 lg:h-7 lg:w-7 transition-colors duration-300',
                          styles.text
                        )}
                        strokeWidth={1.5}
                      />
                    </motion.div>

                    {/* Contenu textuel */}
                    <h3 className="font-heading font-semibold text-foreground mb-1 text-center">
                      {item.label}
                    </h3>
                    <p className="text-xs lg:text-sm text-muted-foreground text-center leading-relaxed">
                      {item.description}
                    </p>

                    {/* Indicateur hover */}
                    <div className={cn(
                      'absolute bottom-0 left-0 right-0 h-1 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-organic',
                      item.accent === 'villiers-blue' && 'bg-villiers-blue',
                      item.accent === 'villiers-gold' && 'bg-villiers-gold',
                      item.accent === 'villiers-green' && 'bg-villiers-green'
                    )} />
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
