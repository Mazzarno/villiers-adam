'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Phone, MapPin } from 'lucide-react';
import { usePublicSettings } from '@/hooks/use-public-settings';

export function Hero() {
  const { settings, isLoading } = usePublicSettings();
  const siteName = settings?.siteName || 'Mairie';
  const municipalityProfile = settings?.municipalityProfile;
  const communeDepartement = municipalityProfile?.commune?.departement;
  const communeCodePostal = municipalityProfile?.commune?.codePostal || settings?.address?.postalCode;
  const addressLine = municipalityProfile?.contact?.adresse || settings?.address?.street;
  const contactPhone = municipalityProfile?.contact?.telephone || settings?.contactPhone;
  const settingsUnavailable = !isLoading && !settings;
  const communeLine = communeDepartement && communeCodePostal
    ? `Commune du ${communeDepartement} · ${communeCodePostal}`
    : settingsUnavailable
      ? 'Informations communales temporairement indisponibles'
      : 'Aucune donnee publiee pour le moment';

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/images/mairie-villiers-adam.jpg"
          alt={`Mairie de ${siteName}`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-villiers-blue/90 via-villiers-blue/75 to-villiers-blue/40" />
        <div className="absolute inset-0 texture-grain" />
      </div>

      <div className="container relative z-10 py-20 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-villiers-gold bg-villiers-gold/10 rounded-organic-sm border border-villiers-gold/20 mb-6">
            {communeLine}
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading text-white leading-[1.1] mb-5">
            Mairie de <span className="display-italic">{siteName}</span>
          </h1>

          <p className="text-base sm:text-lg text-white/85 leading-relaxed mb-8">
            Informations officielles, démarches, événements et vie locale. Retrouvez ici tout ce qui
            concerne votre commune.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-villiers-gold text-villiers-blue hover:bg-villiers-gold-soft rounded-organic transition-all duration-300"
            >
              <Link href="/demarches">
                Accéder aux démarches
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="border border-white/60 text-white bg-white/10 hover:bg-white/20 rounded-organic"
            >
              <Link href="/contact">Contacter la mairie</Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 text-sm text-white/80">
            {contactPhone ? (
              <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="flex items-center gap-2 hover:text-white">
                <Phone className="h-4 w-4" />
                <span className="font-mono">{contactPhone}</span>
              </a>
            ) : (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>
                  {settingsUnavailable
                    ? 'Les informations sont temporairement indisponibles.'
                    : 'Aucun telephone publie pour le moment.'}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 max-w-full">
              <MapPin className="h-4 w-4" />
              <span className="break-words">
                {addressLine
                  ? addressLine
                  : settingsUnavailable
                    ? 'Les informations sont temporairement indisponibles.'
                    : 'Aucune adresse publiee pour le moment.'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
