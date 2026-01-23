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
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const quickAccessItems = [
  {
    icon: FileText,
    label: 'Démarches',
    description: 'État civil, urbanisme, élections',
    href: '/mairie/demarches',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  {
    icon: Calendar,
    label: 'Agenda',
    description: 'Événements et manifestations',
    href: '/agenda',
    color: 'bg-green-500/10 text-green-600 dark:text-green-400',
  },
  {
    icon: Users,
    label: 'Associations',
    description: 'Vie associative locale',
    href: '/culture-loisirs/associations',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
  {
    icon: Building,
    label: 'Urbanisme',
    description: 'Permis, PLU, cadastre',
    href: '/vie-quotidienne/urbanisme',
    color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  },
  {
    icon: BookOpen,
    label: 'Bibliothèque',
    description: 'Horaires et catalogue',
    href: '/culture-loisirs/bibliotheque',
    color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  },
  {
    icon: Heart,
    label: 'Social',
    description: 'Aides et accompagnement',
    href: '/vie-quotidienne/sante',
    color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  },
  {
    icon: MapPin,
    label: 'Plan interactif',
    description: 'Carte de la commune',
    href: '/plan',
    color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  },
  {
    icon: Phone,
    label: 'Contact',
    description: 'Nous joindre',
    href: '/contact',
    color: 'bg-red-500/10 text-red-600 dark:text-red-400',
  },
];

export function QuickAccess() {
  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl lg:text-4xl font-heading font-semibold text-foreground mb-2">
            Accès rapide
          </h2>
          <p className="text-muted-foreground">
            Retrouvez facilement les services les plus utilisés
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.05 },
            },
          }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {quickAccessItems.map((item) => (
            <motion.div
              key={item.href}
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1 },
              }}
            >
              <Link
                href={item.href}
                className="flex flex-col items-center p-6 bg-background rounded-xl border hover:border-primary/50 hover:shadow-md transition-all group"
              >
                <div
                  className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110',
                    item.color
                  )}
                >
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-1">
                  {item.label}
                </h3>
                <p className="text-xs text-muted-foreground text-center">
                  {item.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
