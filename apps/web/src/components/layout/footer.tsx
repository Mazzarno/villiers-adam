'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowUpRight,
  Printer,
  Building2,
} from 'lucide-react';
import { usePublicSettings } from '@/hooks/use-public-settings';
import { formatHoraireJour, type HoraireJour } from '@/lib/config';
import { NewsletterSignup } from '@/components/newsletter-signup';
import { SITE_IDENTITY } from '@/lib/site-identity';

const quickLinks = [
  { label: 'Actualités', href: '/actualites' },
  { label: 'Mairie', href: '/mairie' },
  { label: 'Conseil municipal', href: '/conseil-municipal' },
  { label: 'Vie quotidienne', href: '/vie-quotidienne' },
  { label: 'Culture & Loisirs', href: '/culture-loisirs' },
];

const legalLinks = [
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'Politique de confidentialité', href: '/confidentialite' },
  { label: 'Accessibilité', href: '/accessibilite' },
  { label: 'Plan du site', href: '/plan-du-site' },
];

const usefulLinks = [
  { label: 'Service-Public.fr', href: 'https://www.service-public.fr', external: true },
  { label: 'PNR Vexin français', href: 'https://www.pnr-vexin-francais.fr', external: true },
  { label: 'Val-d\'Oise', href: 'https://www.valdoise.fr', external: true },
  { label: 'CAF', href: 'https://www.caf.fr', external: true },
];

export function Footer() {
  const { settings, isLoading } = usePublicSettings();
  const [logoFailed, setLogoFailed] = React.useState(false);
  const municipalityProfile = settings?.municipalityProfile;
  const identityTitle = SITE_IDENTITY.name;
  const identitySubtitle = SITE_IDENTITY.subtitle;
  const logoUrl = SITE_IDENTITY.logoSrc;
  const addressLine = municipalityProfile?.contact?.adresse || settings?.address?.street;
  const contactPhone = municipalityProfile?.contact?.telephone || settings?.contactPhone;
  const contactEmail = municipalityProfile?.contact?.email || settings?.contactEmail;
  const contactFax = municipalityProfile?.contact?.fax;
  const horaires = municipalityProfile?.horaires;
  const infoUnavailable = 'Information indisponible';

  const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] as const;
  const dayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const openingHours = horaires
    ? days.map((day, index) => {
      const value = (horaires[day] ?? null) as HoraireJour;
      return {
        day: dayLabels[index],
        hours: formatHoraireJour(value),
        isOpen: value !== null,
      };
    })
    : [];

  const saturdaySchedule = horaires?.samedi as HoraireJour | undefined;
  const openingHoursNote =
    saturdaySchedule && typeof saturdaySchedule === 'object' && saturdaySchedule.note
      ? saturdaySchedule.note
      : undefined;

  const intercommunalite = municipalityProfile?.commune?.intercommunalite;

  return (
    <footer className="relative bg-villiers-blue text-white overflow-hidden overflow-x-clip">
      {/* Texture grain */}
      <div className="absolute inset-0 texture-grain opacity-50" />

      {/* Formes décoratives */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden [contain:paint]">
        <div className="absolute top-0 right-0 h-80 w-80 sm:h-96 sm:w-96 rounded-full bg-villiers-gold/5 blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 h-56 w-56 sm:h-64 sm:w-64 rounded-full bg-villiers-green/8 blur-3xl -translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Ligne décorative supérieure */}
      <div className="h-1 bg-gradient-to-r from-transparent via-villiers-gold to-transparent" />

      <div className="container relative py-12 lg:py-16">
        {/* Grid responsive : 1 col → 2 cols (md) → 4 cols (lg) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* ── Identité ── */}
          <div className="space-y-4 min-w-0">
            <Link href="/" className="inline-flex min-w-0 items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: -3 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                {logoUrl && !logoFailed ? (
                  <Image
                    src={logoUrl}
                    alt={`Logo de ${identityTitle}`}
                    width={48}
                    height={56}
                    className="h-14 w-auto"
                    onError={() => setLogoFailed(true)}
                  />
                ) : (
                  <div className="h-14 w-12 rounded-xl border border-white/20 bg-white/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-white/70" />
                  </div>
                )}
              </motion.div>
              <div className="min-w-0">
                <span className="block font-heading text-xl font-semibold tracking-tight break-words">
                  {identityTitle}
                </span>
                <span className="block text-xs text-white/60 font-mono">
                  {identitySubtitle}
                </span>
              </div>
            </Link>

            <p className="text-sm text-white/70 leading-relaxed">
              Commune du Val-d&apos;Oise située dans le Parc naturel régional du Vexin
              français. Un village authentique où patrimoine et qualité de vie se conjuguent.
            </p>

            {intercommunalite && (
              <a
                href="https://www.ccvo3f.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-villiers-gold transition-colors"
              >
                {intercommunalite}
                <ArrowUpRight className="h-3 w-3" />
              </a>
            )}
          </div>

          {/* ── Contact & Horaires ── */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-heading text-base font-semibold text-villiers-gold">
                Contact
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-villiers-gold shrink-0 mt-0.5" />
                  <span className="text-white/80 break-words">
                    {addressLine
                      ? addressLine
                      : infoUnavailable}
                  </span>
                </li>
                <li>
                  {contactPhone ? (
                    <a
                      href={`tel:${contactPhone.replace(/\s/g, '')}`}
                      className="inline-flex min-w-0 items-center gap-2 min-h-11 py-1 hover:text-villiers-gold transition-colors"
                    >
                      <Phone className="h-4 w-4 text-villiers-gold shrink-0" />
                      <span className="font-mono break-words">{contactPhone}</span>
                    </a>
                  ) : (
                    <span className="inline-flex min-w-0 items-center gap-2 min-h-11 py-1 text-white/80">
                      <Phone className="h-4 w-4 text-villiers-gold shrink-0" />
                      <span className="break-words">{infoUnavailable}</span>
                    </span>
                  )}
                </li>
                <li>
                  {contactEmail ? (
                    <a
                      href={`mailto:${contactEmail}`}
                      className="inline-flex min-w-0 items-center gap-2 min-h-11 py-1 hover:text-villiers-gold transition-colors"
                    >
                      <Mail className="h-4 w-4 text-villiers-gold shrink-0" />
                      <span className="break-all">{contactEmail}</span>
                    </a>
                  ) : (
                    <span className="inline-flex min-w-0 items-center gap-2 min-h-11 py-1 text-white/80">
                      <Mail className="h-4 w-4 text-villiers-gold shrink-0" />
                      <span className="break-words">{infoUnavailable}</span>
                    </span>
                  )}
                </li>
                {contactFax && (
                  <li className="flex items-center gap-2 text-white/60">
                    <Printer className="h-4 w-4 text-villiers-gold shrink-0" />
                    <span className="font-mono">Fax : {contactFax}</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Horaires - grille compacte */}
            <div className="space-y-3">
              <h3 className="font-heading text-base font-semibold text-villiers-gold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horaires
              </h3>
              {isLoading ? (
                <p className="text-sm text-white/70">Chargement des horaires...</p>
              ) : openingHours.length > 0 ? (
                <>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                    {openingHours.map((slot) => (
                      <React.Fragment key={slot.day}>
                        <dt className="font-medium text-white/90">{slot.day}</dt>
                        <dd className={slot.isOpen ? 'text-white/70 break-words' : 'text-white/40 break-words'}>
                          {slot.hours}
                        </dd>
                      </React.Fragment>
                    ))}
                  </dl>
                  {openingHoursNote && <p className="text-xs text-white/40 italic">{openingHoursNote}</p>}
                </>
              ) : (
                <p className="text-sm text-white/70">{infoUnavailable}</p>
              )}
            </div>
          </div>

          {/* ── Navigation ── */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-8">
            <div className="space-y-3">
              <h3 className="font-heading text-base font-semibold text-villiers-gold">
                Accès rapide
              </h3>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex min-w-0 items-center gap-2 min-h-11 py-1 text-sm text-white/70 hover:text-white transition-colors"
                    >
                      <span className="w-1 h-1 rounded-full bg-villiers-gold/40 group-hover:bg-villiers-gold transition-colors" />
                      <span className="break-words">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-heading text-base font-semibold text-villiers-gold">
                Liens utiles
              </h3>
              <ul className="space-y-2">
                {usefulLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex min-w-0 items-center gap-2 min-h-11 py-1 text-sm text-white/70 hover:text-white transition-colors"
                    >
                      <span className="w-1 h-1 rounded-full bg-villiers-gold/40 group-hover:bg-villiers-gold transition-colors" />
                      <span className="break-words">{link.label}</span>
                      <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Newsletter ── */}
          <div>
            <NewsletterSignup variant="dark" />
          </div>
        </div>
      </div>

      {/* Barre inférieure */}
      <div className="relative border-t border-white/10">
        <div className="container py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-white/50">
            <p className="text-center sm:text-left">
              &copy; {new Date().getFullYear()} Mairie de {identityTitle}. Tous droits réservés.
            </p>
            <nav className="flex flex-wrap items-center justify-center sm:justify-end gap-x-1 gap-y-1">
              {legalLinks.map((link, index) => (
                <React.Fragment key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center min-h-11 px-2 py-1 text-center break-words hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                  {index < legalLinks.length - 1 && (
                    <span className="text-white/20" aria-hidden="true">|</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>
        </div>
      </div>

    </footer>
  );
}
