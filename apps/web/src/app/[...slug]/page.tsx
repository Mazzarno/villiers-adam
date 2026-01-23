import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import type { Page } from '@/lib/api';

// Données de démonstration - pages statiques
const demoPages: Record<string, Page> = {
  'mentions-legales': {
    id: '1',
    title: 'Mentions légales',
    slug: 'mentions-legales',
    content: `
      <h2>Éditeur du site</h2>
      <p>Mairie de Villiers-Adam<br>
      Place de la Mairie<br>
      95840 Villiers-Adam<br>
      Tél : 01 34 08 90 00<br>
      Email : mairie@villiers-adam.fr</p>

      <h2>Directeur de la publication</h2>
      <p>Le Maire de Villiers-Adam</p>

      <h2>Hébergement</h2>
      <p>Ce site est hébergé par la commune de Villiers-Adam sur ses propres serveurs.</p>

      <h2>Propriété intellectuelle</h2>
      <p>L'ensemble du contenu de ce site (textes, images, vidéos) est protégé par le droit d'auteur. Toute reproduction est interdite sans autorisation préalable.</p>
    `,
    status: 'published',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  'confidentialite': {
    id: '2',
    title: 'Politique de confidentialité',
    slug: 'confidentialite',
    content: `
      <h2>Collecte des données</h2>
      <p>Les informations personnelles collectées sur ce site sont uniquement destinées à la gestion des demandes des usagers.</p>

      <h2>Cookies</h2>
      <p>Ce site utilise des cookies techniques nécessaires à son fonctionnement. Aucun cookie publicitaire n'est utilisé.</p>

      <h2>Vos droits</h2>
      <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour exercer ces droits, contactez-nous à mairie@villiers-adam.fr</p>
    `,
    status: 'published',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  'accessibilite': {
    id: '3',
    title: 'Accessibilité',
    slug: 'accessibilite',
    content: `
      <h2>Déclaration d'accessibilité</h2>
      <p>La commune de Villiers-Adam s'engage à rendre son site internet accessible conformément à l'article 47 de la loi n° 2005-102 du 11 février 2005.</p>

      <h2>Fonctionnalités d'accessibilité</h2>
      <ul>
        <li><strong>Mode senior</strong> : agrandit les textes pour une meilleure lisibilité</li>
        <li><strong>Mode dyslexique</strong> : utilise une police adaptée aux personnes dyslexiques</li>
        <li><strong>Mode sombre</strong> : réduit la fatigue visuelle</li>
      </ul>

      <h2>Contact</h2>
      <p>Si vous rencontrez des difficultés d'accessibilité sur ce site, contactez-nous à mairie@villiers-adam.fr</p>
    `,
    status: 'published',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  'mairie/conseil-municipal': {
    id: '4',
    title: 'Le Conseil Municipal',
    slug: 'mairie/conseil-municipal',
    content: `
      <h2>Le Maire et ses adjoints</h2>
      <p>L'équipe municipale, élue en 2020, œuvre quotidiennement pour le bien-être des habitants de Villiers-Adam.</p>

      <h2>Composition du conseil</h2>
      <p>Le conseil municipal est composé de 15 élus.</p>

      <h2>Délégations</h2>
      <ul>
        <li>Urbanisme et environnement</li>
        <li>Finances et administration</li>
        <li>Vie scolaire et jeunesse</li>
        <li>Culture et vie associative</li>
        <li>Voirie et travaux</li>
      </ul>
    `,
    status: 'published',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  'mairie/services': {
    id: '5',
    title: 'Services municipaux',
    slug: 'mairie/services',
    content: `
      <h2>Accueil de la mairie</h2>
      <p>La mairie vous accueille du lundi au vendredi de 9h à 12h et de 14h à 17h.</p>

      <h2>Services proposés</h2>
      <ul>
        <li>État civil (naissances, mariages, décès)</li>
        <li>Urbanisme (permis de construire, déclarations préalables)</li>
        <li>Élections</li>
        <li>Cimetière</li>
        <li>Location de salles</li>
      </ul>

      <h2>Contact</h2>
      <p>Tél : 01 34 08 90 00<br>
      Email : mairie@villiers-adam.fr</p>
    `,
    status: 'published',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  'mairie/demarches': {
    id: '6',
    title: 'Démarches administratives',
    slug: 'mairie/demarches',
    content: `
      <h2>État civil</h2>
      <ul>
        <li>Acte de naissance</li>
        <li>Acte de mariage</li>
        <li>Acte de décès</li>
        <li>Livret de famille</li>
      </ul>

      <h2>Urbanisme</h2>
      <ul>
        <li>Permis de construire</li>
        <li>Déclaration préalable de travaux</li>
        <li>Certificat d'urbanisme</li>
      </ul>

      <h2>Élections</h2>
      <ul>
        <li>Inscription sur les listes électorales</li>
        <li>Procuration</li>
      </ul>

      <h2>En ligne</h2>
      <p>De nombreuses démarches peuvent être effectuées en ligne sur <a href="https://www.service-public.fr" target="_blank" rel="noopener">Service-Public.fr</a></p>
    `,
    status: 'published',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
};

interface PageProps {
  params: { slug: string[] };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slug = params.slug.join('/');
  const page = demoPages[slug];

  if (!page) {
    return {
      title: 'Page non trouvée',
    };
  }

  return {
    title: page.title,
    description: page.excerpt,
  };
}

function getBreadcrumbs(slugParts: string[]): { label: string; href: string }[] {
  const breadcrumbs: { label: string; href: string }[] = [];
  let currentPath = '';

  for (let i = 0; i < slugParts.length; i++) {
    currentPath += '/' + slugParts[i];
    const page = demoPages[slugParts.slice(0, i + 1).join('/')];
    breadcrumbs.push({
      label: page?.title || slugParts[i].charAt(0).toUpperCase() + slugParts[i].slice(1),
      href: currentPath,
    });
  }

  return breadcrumbs;
}

export default async function DynamicPage({ params }: PageProps) {
  const slug = params.slug.join('/');
  const page = demoPages[slug];

  if (!page) {
    notFound();
  }

  const breadcrumbs = getBreadcrumbs(params.slug);

  return (
    <div className="py-12">
      <div className="container max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8 flex-wrap">
          <Link href="/" className="hover:text-foreground">
            Accueil
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.href} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4" />
              {index === breadcrumbs.length - 1 ? (
                <span className="text-foreground">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-foreground">
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-heading font-semibold text-foreground mb-4">
            {page.title}
          </h1>
          {page.excerpt && (
            <p className="text-lg text-muted-foreground">
              {page.excerpt}
            </p>
          )}
        </header>

        {/* Featured image */}
        {page.featuredImage && (
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-8">
            <Image
              src={page.featuredImage}
              alt={page.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose-villiers"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  );
}
