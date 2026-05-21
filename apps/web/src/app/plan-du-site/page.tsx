import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Plan du site',
  description: 'Plan du site officiel de la commune de Villiers-Adam.',
};

type SiteSection = {
  title: string;
  links: Array<{ href: string; label: string }>;
};

const sections: SiteSection[] = [
  {
    title: 'Pages principales',
    links: [
      { href: '/', label: 'Accueil' },
      { href: '/actualites', label: 'Actualités' },
      { href: '/evenements', label: 'Événements' },
      { href: '/annuaire', label: 'Annuaire' },
      { href: '/carte', label: 'Carte interactive' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Mairie',
    links: [
      { href: '/mairie', label: 'Mairie' },
      { href: '/mairie/conseil-municipal', label: 'Conseil municipal' },
      { href: '/mairie/services', label: 'Services municipaux' },
      { href: '/mairie/demarches', label: 'Démarches' },
      { href: '/mairie/publications', label: 'Publications' },
    ],
  },
  {
    title: 'Vie quotidienne',
    links: [
      { href: '/vie-quotidienne', label: 'Vie quotidienne' },
      { href: '/vie-quotidienne/infos-pratiques', label: 'Infos pratiques' },
      { href: '/vie-quotidienne/transports', label: 'Transports' },
      { href: '/vie-quotidienne/commerces', label: 'Commerces' },
      { href: '/vie-quotidienne/urbanisme', label: 'Urbanisme' },
      { href: '/vie-quotidienne/ecole', label: 'École & Enfance' },
    ],
  },
  {
    title: 'Culture & Loisirs',
    links: [
      { href: '/culture-loisirs', label: 'Culture & Loisirs' },
      { href: '/culture-loisirs/associations', label: 'Associations' },
      { href: '/culture-loisirs/sports', label: 'Sports' },
      { href: '/culture-loisirs/patrimoine', label: 'Patrimoine' },
      { href: '/culture-loisirs/bibliotheque', label: 'Bibliothèque' },
    ],
  },
  {
    title: 'Informations légales',
    links: [
      { href: '/mentions-legales', label: 'Mentions légales' },
      { href: '/confidentialite', label: 'Politique de confidentialité' },
      { href: '/accessibilite', label: 'Accessibilité' },
    ],
  },
];

export default function PlanDuSitePage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">Plan du site</h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl">
            Accès rapide aux principales rubriques du site communal.
          </p>
        </div>
      </section>

      <section className="container py-10">
        <div className="grid gap-6 md:grid-cols-2">
          {sections.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-primary hover:underline">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
