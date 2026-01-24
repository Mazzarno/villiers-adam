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
  Facebook,
  ArrowUpRight,
} from 'lucide-react';

const quickLinks = [
  { label: 'Actualités', href: '/actualites' },
  { label: 'Mairie', href: '/mairie' },
  { label: 'Conseil municipal', href: '/mairie/conseil-municipal' },
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
  return (
    <footer className="relative bg-villiers-blue text-white overflow-hidden">
      {/* Texture grain overlay */}
      <div className="absolute inset-0 texture-grain opacity-50" />

      {/* Formes décoratives */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-villiers-gold/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-villiers-green/5 blur-3xl translate-y-1/2 -translate-x-1/2" />

      {/* Ligne décorative supérieure */}
      <div className="h-1 bg-gradient-to-r from-transparent via-villiers-gold to-transparent" />

      <div className="container relative py-16 lg:py-20">
        {/* Layout asymétrique principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Colonne principale - Logo et description (plus large) */}
          <div className="lg:col-span-5 space-y-6">
            <Link href="/" className="inline-flex items-center gap-4 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: -3 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Image
                  src="/images/logo.png"
                  alt="Logo de Villiers-Adam"
                  width={56}
                  height={64}
                  className="h-16 w-auto"
                />
              </motion.div>
              <div>
                <span className="block font-heading text-2xl font-semibold tracking-tight">
                  Villiers-Adam
                </span>
                <span className="block text-sm text-white/60 font-mono">
                  Val-d&apos;Oise • 95840
                </span>
              </div>
            </Link>

            <p className="text-white/70 leading-relaxed max-w-md">
              Commune du Val-d&apos;Oise située dans le Parc naturel régional du Vexin français.
              Un village authentique où patrimoine historique et qualité de vie se conjuguent harmonieusement.
            </p>

            {/* Réseaux sociaux */}
            <div className="flex gap-3">
              <motion.a
                href="https://facebook.com/villiersadam"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-villiers-gold/20 transition-colors group"
                aria-label="Facebook"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Facebook className="h-4 w-4 group-hover:text-villiers-gold transition-colors" />
              </motion.a>
            </div>

            {/* Contact principal */}
            <div className="pt-6 space-y-4">
              <h3 className="font-heading text-lg font-semibold text-villiers-gold">
                Contact
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 shrink-0 mt-0.5">
                    <MapPin className="h-4 w-4 text-villiers-gold" />
                  </span>
                  <span className="text-white/80">
                    Place de la Mairie<br />
                    95840 Villiers-Adam
                  </span>
                </li>
                <li>
                  <a
                    href="tel:+33134699287"
                    className="flex items-center gap-3 hover:text-villiers-gold transition-colors group"
                  >
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 group-hover:bg-villiers-gold/10 transition-colors">
                      <Phone className="h-4 w-4 text-villiers-gold" />
                    </span>
                    <span className="font-mono">01 34 69 92 87</span>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:mairie@villiers-adam.fr"
                    className="flex items-center gap-3 hover:text-villiers-gold transition-colors group"
                  >
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 group-hover:bg-villiers-gold/10 transition-colors">
                      <Mail className="h-4 w-4 text-villiers-gold" />
                    </span>
                    <span>mairie@villiers-adam.fr</span>
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 shrink-0 mt-0.5">
                    <Clock className="h-4 w-4 text-villiers-gold" />
                  </span>
                  <div className="text-white/80">
                    <p className="font-medium text-white">Lundi - Vendredi</p>
                    <p className="text-sm">9h-12h / 14h-17h</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Colonnes liens - décalage asymétrique */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8 lg:pl-8">
            {/* Accès rapide */}
            <div className="space-y-4">
              <h3 className="font-heading text-lg font-semibold text-villiers-gold">
                Accès rapide
              </h3>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-villiers-gold/40 group-hover:bg-villiers-gold transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Liens utiles */}
            <div className="space-y-4">
              <h3 className="font-heading text-lg font-semibold text-villiers-gold">
                Liens utiles
              </h3>
              <ul className="space-y-2">
                {usefulLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-villiers-gold/40 group-hover:bg-villiers-gold transition-colors" />
                      {link.label}
                      <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter / Info supplémentaire */}
            <div className="space-y-4">
              <h3 className="font-heading text-lg font-semibold text-villiers-gold">
                À propos
              </h3>
              <div className="text-sm text-white/70 space-y-3">
                <p>
                  Site officiel de la commune de Villiers-Adam, dans le Val-d&apos;Oise.
                </p>
                <p className="font-mono text-xs text-white/50">
                  Population : ~950 habitants
                </p>
                <p className="font-mono text-xs text-white/50">
                  Superficie : 5,75 km²
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre inférieure avec séparateur stylisé */}
      <div className="relative border-t border-white/10">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/50">
            <p>
              &copy; {new Date().getFullYear()} Mairie de Villiers-Adam. Tous droits réservés.
            </p>
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Élément décoratif flottant (forme abstraite stylisée) */}
      <div className="absolute bottom-20 right-10 w-40 h-40 border border-white/5 rounded-full hidden lg:block" />
      <div className="absolute bottom-32 right-24 w-24 h-24 border border-villiers-gold/10 rounded-full hidden lg:block" />
    </footer>
  );
}
