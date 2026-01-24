'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function MayorMessage() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ['10%', '-10%']);

  return (
    <section
      ref={sectionRef}
      className="py-20 lg:py-28 relative overflow-hidden bg-gradient-to-b from-muted/30 to-background"
    >
      {/* Formes décoratives */}
      <div className="absolute top-10 right-[10%] w-60 h-60 rounded-full border border-villiers-gold/10" />
      <div className="absolute bottom-20 left-[5%] w-40 h-40 rounded-full border border-villiers-blue/10" />

      <div className="container relative">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Image avec effet parallaxe */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="relative">
              {/* Image principale avec parallaxe */}
              <div className="relative aspect-[4/5] rounded-organic-lg overflow-hidden shadow-organic-lg">
                <motion.div className="absolute inset-0" style={{ y: imageY }}>
                  <Image
                    src="/images/Villiers-Adam_-_Mairie.jpg"
                    alt="Mairie de Villiers-Adam"
                    fill
                    className="object-cover scale-110"
                  />
                </motion.div>
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-villiers-blue/30 via-transparent to-transparent" />
              </div>

              {/* Élément décoratif - cadre décalé */}
              <div className="absolute -bottom-6 -right-6 w-full h-full border-2 border-villiers-gold/20 rounded-organic-lg -z-10" />

              {/* Badge flottant */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="absolute -top-4 -left-4 bg-villiers-gold text-villiers-blue px-4 py-2 rounded-organic shadow-lg"
              >
                <span className="font-mono text-xs">Depuis 1793</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Contenu style lettre */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7"
          >
            {/* Header */}
            <div className="mb-8">
              <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-4">
                <span className="w-8 h-px bg-villiers-gold" />
                Le mot du Maire
              </span>
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-heading font-semibold text-foreground">
                Bienvenue à{' '}
                <span className="display-italic text-villiers-blue">Villiers-Adam</span>
              </h2>
            </div>

            {/* Citation avec guillemets décoratifs */}
            <div className="relative pl-8 lg:pl-12 mb-8">
              {/* Guillemet décoratif */}
              <span className="absolute left-0 top-0 text-6xl lg:text-8xl font-heading text-villiers-gold/20 leading-none select-none">
                &ldquo;
              </span>

              <blockquote className="space-y-4 text-lg lg:text-xl text-muted-foreground leading-relaxed">
                <p>
                  Chers habitants, chers visiteurs,
                </p>
                <p>
                  C&apos;est avec plaisir que je vous accueille sur le site officiel de
                  notre commune. Nichée au cœur du{' '}
                  <span className="text-foreground font-medium">
                    Parc naturel régional du Vexin français
                  </span>,
                  Villiers-Adam conjugue harmonieusement qualité de vie et dynamisme.
                </p>
                <p>
                  Ce portail est conçu pour vous accompagner dans vos démarches et vous
                  tenir informés de la vie locale. N&apos;hésitez pas à nous contacter pour
                  toute question.
                </p>
              </blockquote>

              {/* Guillemet fermant */}
              <span className="absolute right-0 bottom-0 text-6xl lg:text-8xl font-heading text-villiers-gold/20 leading-none select-none transform translate-y-4">
                &rdquo;
              </span>
            </div>

            {/* Signature stylisée */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 pt-6 border-t border-border/50">
              <div>
                <p className="font-heading text-xl font-semibold text-foreground mb-1">
                  Le Maire de Villiers-Adam
                </p>
                <p className="text-sm text-muted-foreground">
                  et l&apos;équipe municipale
                </p>
                {/* Signature manuscrite stylisée */}
                <div className="mt-3 font-heading text-2xl italic text-villiers-gold/70">
                  ~
                </div>
              </div>

              <Button
                asChild
                className="bg-villiers-blue hover:bg-villiers-blue-light text-white rounded-organic transition-all duration-300 hover:scale-[1.02] hover:shadow-organic-hover group"
              >
                <Link href="/mairie/conseil-municipal">
                  Découvrir l&apos;équipe
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
