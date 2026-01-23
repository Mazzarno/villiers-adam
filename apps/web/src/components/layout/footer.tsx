import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  ExternalLink,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const quickLinks = [
  { label: 'Actualités', href: '/actualites' },
  { label: 'Agenda', href: '/agenda' },
  { label: 'Annuaire', href: '/annuaire' },
  { label: 'Démarches', href: '/mairie/demarches' },
  { label: 'Contact', href: '/contact' },
];

const legalLinks = [
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'Politique de confidentialité', href: '/confidentialite' },
  { label: 'Accessibilité', href: '/accessibilite' },
  { label: 'Plan du site', href: '/plan-du-site' },
];

const usefulLinks = [
  { label: 'Service-Public.fr', href: 'https://www.service-public.fr', external: true },
  { label: 'Val-d\'Oise', href: 'https://www.valdoise.fr', external: true },
  { label: 'Préfecture', href: 'https://www.val-doise.gouv.fr', external: true },
  { label: 'CAF', href: 'https://www.caf.fr', external: true },
];

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/images/blason.svg"
                alt="Blason de Villiers-Adam"
                width={40}
                height={48}
                className="h-12 w-auto brightness-0 invert"
              />
              <div>
                <span className="font-heading text-lg font-semibold">Villiers-Adam</span>
                <p className="text-xs text-primary-foreground/70">Val-d&apos;Oise</p>
              </div>
            </Link>
            <p className="text-sm text-primary-foreground/80">
              Commune du Val-d&apos;Oise située dans le Parc naturel régional du Vexin français.
              Un village authentique alliant patrimoine et qualité de vie.
            </p>
            <div className="flex gap-2">
              <a
                href="https://facebook.com/villiersadam"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Contact info */}
          <div className="space-y-4">
            <h3 className="font-heading text-lg font-semibold">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  Place de la Mairie<br />
                  95840 Villiers-Adam
                </span>
              </li>
              <li>
                <a href="tel:+33134089000" className="flex items-center gap-2 hover:underline">
                  <Phone className="h-4 w-4 shrink-0" />
                  01 34 08 90 00
                </a>
              </li>
              <li>
                <a href="mailto:mairie@villiers-adam.fr" className="flex items-center gap-2 hover:underline">
                  <Mail className="h-4 w-4 shrink-0" />
                  mairie@villiers-adam.fr
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <p>Lundi - Vendredi</p>
                  <p className="text-primary-foreground/70">9h-12h / 14h-17h</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h3 className="font-heading text-lg font-semibold">Accès rapide</h3>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Useful links */}
          <div className="space-y-4">
            <h3 className="font-heading text-lg font-semibold">Liens utiles</h3>
            <ul className="space-y-2 text-sm">
              {usefulLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:underline"
                  >
                    {link.label}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Separator className="bg-primary-foreground/20" />

      {/* Bottom bar */}
      <div className="container py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/70">
          <p>&copy; {new Date().getFullYear()} Mairie de Villiers-Adam. Tous droits réservés.</p>
          <nav className="flex flex-wrap items-center justify-center gap-4">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-primary-foreground hover:underline">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
