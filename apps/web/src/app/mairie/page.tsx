'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Building2,
  Users,
  FileText,
  Briefcase,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatHoraireJour, type HoraireJour } from '@/lib/config';
import { usePublicSettings } from '@/hooks/use-public-settings';

const sections = [
  {
    slug: 'conseil-municipal',
    title: 'Le Maire et le Conseil',
    description: 'Découvrez l\'équipe municipale élue et ses délégations',
    icon: Users,
    color: 'bg-villiers-blue/10 text-villiers-blue border-villiers-blue/20',
    href: '/conseil-municipal',
  },
  {
    slug: 'services',
    title: 'Services municipaux',
    description: 'État civil, urbanisme, services postaux et démarches courantes',
    icon: Briefcase,
    color: 'bg-villiers-gold/10 text-villiers-gold border-villiers-gold/20',
    href: '/services-municipaux',
  },
  {
    slug: 'publications',
    title: 'Publications administratives',
    description: 'Arrêtés municipaux, comptes-rendus du conseil et délibérations',
    icon: FileText,
    color: 'bg-villiers-green/10 text-villiers-green border-villiers-green/20',
    href: '/publications',
  },
];

export default function MairiePage() {
  const { settings, isLoading } = usePublicSettings();
  const siteName = settings?.siteName || 'Mairie';
  const municipalityProfile = settings?.municipalityProfile;
  const contactPhone = municipalityProfile?.contact?.telephone || settings?.contactPhone;
  const contactEmail = municipalityProfile?.contact?.email || settings?.contactEmail;
  const addressLine = municipalityProfile?.contact?.adresse || settings?.address?.street;
  const horaires = municipalityProfile?.horaires;
  const settingsUnavailable = !isLoading && !settings;
  const hasHoraires = Boolean(horaires && Object.keys(horaires).length > 0);

  return (
    <div className="min-h-screen">
      {/* Hero section avec image de la mairie */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-villiers-blue/5 to-background" />
        <div className="absolute inset-0 texture-grain opacity-30" />

        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-4">
                <span className="w-8 h-px bg-villiers-gold" />
                Votre commune
              </span>
              <h1 className="text-4xl lg:text-6xl font-heading font-semibold text-foreground mb-6">
                La <span className="display-italic">Mairie</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                La mairie de {siteName} vous accueille pour toutes vos démarches administratives.
                Retrouvez ici les informations sur l&apos;équipe municipale, les services et les publications officielles.
              </p>

              {/* Horaires d'ouverture */}
              <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-organic p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-villiers-gold" />
                  <span className="font-medium text-foreground text-sm">Horaires d&apos;ouverture</span>
                </div>
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Chargement des horaires...</p>
                ) : hasHoraires ? (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-muted-foreground">
                    {(['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'] as const).map((jour) => {
                      const schedule = (horaires?.[jour] ?? null) as HoraireJour;
                      return (
                        <React.Fragment key={jour}>
                          <span className="capitalize">{jour}</span>
                          <span className={cn('font-mono text-xs', !schedule && 'text-muted-foreground/50')}>
                            {formatHoraireJour(schedule)}
                          </span>
                        </React.Fragment>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {settingsUnavailable
                      ? 'Les informations sont temporairement indisponibles.'
                      : 'Aucune donnee publiee pour le moment.'}
                  </p>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative aspect-[4/3] rounded-organic-lg overflow-hidden shadow-organic-lg"
            >
              <Image
                src="/images/mairie-villiers-adam.jpg"
                alt={`Mairie de ${siteName}`}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6">
            {sections.map((section, index) => (
              <motion.div
                key={section.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link
                  href={section.href}
                  className="group block p-6 bg-background border border-border/50 rounded-organic transition-all duration-300 hover:border-villiers-gold/30 hover:shadow-organic-hover h-full"
                >
                  <div className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center mb-4 border transition-transform duration-300 group-hover:scale-110',
                    section.color
                  )}>
                    <section.icon className="h-6 w-6" />
                  </div>
                  <h2 className="font-heading text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                    {section.title}
                    <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {section.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-12 lg:py-16 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-background rounded-organic-lg border border-border/50 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-villiers-blue/10 border border-villiers-blue/20 flex items-center justify-center">
                  <Building2 className="h-7 w-7 text-villiers-blue" />
                </div>
                <div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    Contactez-nous
                  </h2>
                  <p className="text-muted-foreground">Mairie de {siteName}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-villiers-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Adresse</p>
                      <p className="text-sm text-muted-foreground">
                        {addressLine
                          ? addressLine
                          : settingsUnavailable
                            ? 'Les informations sont temporairement indisponibles.'
                            : 'Aucune donnee publiee pour le moment.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-villiers-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Téléphone</p>
                      {contactPhone ? (
                        <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="text-sm text-primary hover:underline font-mono">
                          {contactPhone}
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {settingsUnavailable
                            ? 'Les informations sont temporairement indisponibles.'
                            : 'Aucune donnee publiee pour le moment.'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-villiers-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Email</p>
                      {contactEmail ? (
                        <a href={`mailto:${contactEmail}`} className="text-sm text-primary hover:underline">
                          {contactEmail}
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {settingsUnavailable
                            ? 'Les informations sont temporairement indisponibles.'
                            : 'Aucune donnee publiee pour le moment.'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
