'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Quote } from 'lucide-react';

export function MayorMessage() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src="/images/mairie.jpg"
                alt="Mairie de Villiers-Adam"
                fill
                className="object-cover"
              />
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-secondary/20 rounded-2xl -z-10" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-6">
              <Quote className="h-6 w-6" />
            </div>

            <h2 className="text-3xl lg:text-4xl font-heading font-semibold text-foreground mb-6">
              Le mot du Maire
            </h2>

            <blockquote className="text-lg text-muted-foreground leading-relaxed mb-6">
              <p className="mb-4">
                Chers habitants, chers visiteurs,
              </p>
              <p className="mb-4">
                C&apos;est avec plaisir que je vous accueille sur le site officiel de
                Villiers-Adam. Notre commune, nichée au cœur du Parc naturel régional
                du Vexin français, conjugue harmonieusement qualité de vie et dynamisme.
              </p>
              <p>
                Ce portail est conçu pour vous accompagner dans vos démarches et vous
                tenir informés de la vie locale. N&apos;hésitez pas à nous contacter pour
                toute question.
              </p>
            </blockquote>

            <p className="font-heading font-semibold text-foreground mb-1">
              Le Maire de Villiers-Adam
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              et l&apos;équipe municipale
            </p>

            <Button asChild>
              <Link href="/mairie/conseil-municipal">
                Découvrir l&apos;équipe municipale
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
