'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Phone, MapPin } from 'lucide-react';

export function Hero() {
  const containerRef = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '8%']);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[700px] lg:min-h-[800px] flex items-center overflow-hidden"
    >
      {/* Background image avec parallaxe */}
      <motion.div className="absolute inset-0 z-0" style={{ y: imageY }}>
        <Image
          src="/images/mairie-villiers-adam.jpg"
          alt="Mairie de Villiers-Adam"
          fill
          className="object-cover scale-110"
          priority
        />
        {/* Overlay gradient asymétrique */}
        <div className="absolute inset-0 bg-gradient-to-br from-villiers-blue/95 via-villiers-blue/75 to-transparent" />
        {/* Texture grain overlay */}
        <div className="absolute inset-0 texture-grain" />
      </motion.div>

      {/* Formes décoratives */}
      <div className="absolute top-20 right-[15%] w-64 h-64 rounded-full bg-villiers-gold/10 blur-3xl" />
      <div className="absolute bottom-20 left-[10%] w-48 h-48 rounded-full bg-villiers-green/10 blur-3xl" />
      <div className="absolute top-1/2 right-[5%] w-32 h-32 border border-villiers-gold/20 rounded-full" />
      <div className="absolute bottom-[20%] right-[20%] w-20 h-20 border border-white/10 rounded-full" />

      {/* Content avec layout asymétrique */}
      <motion.div className="container relative z-10 py-24" style={{ y: contentY }}>
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Texte principal - côté gauche */}
          <div className="lg:col-span-7 xl:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 40, clipPath: 'inset(100% 0% 0% 0%)' }}
              animate={{ opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)' }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-villiers-gold bg-villiers-gold/10 rounded-organic-sm border border-villiers-gold/20 mb-8">
                <span className="w-2 h-2 rounded-full bg-villiers-gold animate-pulse-soft" />
                Bienvenue en Val-d&apos;Oise
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40, clipPath: 'inset(100% 0% 0% 0%)' }}
              animate={{ opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)' }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6"
            >
              <span className="block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-heading text-white leading-[1.1]">
                Villiers-
              </span>
              <span className="block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-heading text-white leading-[1.1] display-italic">
                Adam
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 40, clipPath: 'inset(100% 0% 0% 0%)' }}
              animate={{ opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)' }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg lg:text-xl text-white/85 mb-10 max-w-lg leading-relaxed"
            >
              Commune du Parc naturel régional du Vexin français, où patrimoine
              historique, espaces naturels préservés et qualité de vie
              s&apos;entremêlent harmonieusement.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 40, clipPath: 'inset(100% 0% 0% 0%)' }}
              animate={{ opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)' }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap gap-4"
            >
              <Button
                asChild
                size="xl"
                className="bg-villiers-gold text-villiers-blue hover:bg-villiers-gold-soft rounded-organic transition-all duration-300 hover:scale-[1.02] hover:shadow-organic-hover"
              >
                <Link href="/mairie/demarches">
                  Vos démarches
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="xl"
                className="border-white/30 text-white hover:bg-white/10 rounded-organic backdrop-blur-sm"
              >
                <Link href="/contact">Nous contacter</Link>
              </Button>
            </motion.div>

            {/* Quick info */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap gap-8 mt-14 pt-8 border-t border-white/15"
            >
              <a
                href="tel:+33134089000"
                className="flex items-center gap-3 text-white/80 hover:text-white transition-colors group"
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 group-hover:bg-villiers-gold/20 transition-colors">
                  <Phone className="h-4 w-4" />
                </span>
                <span className="font-mono text-sm">01 34 08 90 00</span>
              </a>
              <div className="flex items-center gap-3 text-white/80">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10">
                  <MapPin className="h-4 w-4" />
                </span>
                <span className="text-sm">Place de la Mairie, 95840</span>
              </div>
            </motion.div>
          </div>

          {/* Espace pour l'image décalée - côté droit */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              {/* Image secondaire décalée */}
              <div className="relative aspect-[4/5] rounded-organic-lg overflow-hidden shadow-organic-lg ml-auto max-w-md">
                <Image
                  src="/images/Villiers-Adam_-_Mairie.jpg"
                  alt="Mairie de Villiers-Adam"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-villiers-blue/40 to-transparent" />
              </div>
              {/* Badge flottant */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="absolute -bottom-6 -left-6 bg-white rounded-organic p-4 shadow-organic-lg"
              >
                <p className="text-villiers-slate font-heading font-semibold">Depuis 1793</p>
                <p className="text-xs text-muted-foreground">Commune indépendante</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ height: ['20%', '40%', '20%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1 bg-white/50 rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
