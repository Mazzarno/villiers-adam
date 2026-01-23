'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Phone, MapPin } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-village.jpg"
          alt="Vue du village de Villiers-Adam"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="container relative z-10 py-20">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1 text-sm font-medium text-secondary bg-secondary/10 rounded-full border border-secondary/20 mb-6">
              Bienvenue à Villiers-Adam
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl lg:text-5xl xl:text-6xl font-heading font-semibold text-white leading-tight mb-6"
          >
            Un village d&apos;exception au cœur du{' '}
            <span className="text-secondary">Vexin français</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-white/90 mb-8 max-w-xl"
          >
            Commune du Val-d&apos;Oise, Villiers-Adam allie patrimoine historique,
            espaces naturels préservés et qualité de vie en Île-de-France.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <Button asChild size="xl" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              <Link href="/mairie/demarches">
                Vos démarches
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl" className="border-white text-white hover:bg-white/10">
              <Link href="/contact">
                Nous contacter
              </Link>
            </Button>
          </motion.div>

          {/* Quick info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap gap-6 mt-12 pt-8 border-t border-white/20"
          >
            <a
              href="tel:+33134089000"
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <Phone className="h-5 w-5" />
              <span>01 34 08 90 00</span>
            </a>
            <div className="flex items-center gap-2 text-white/80">
              <MapPin className="h-5 w-5" />
              <span>Place de la Mairie, 95840 Villiers-Adam</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/50 flex items-start justify-center p-1">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-3 bg-white/80 rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}
