import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Calendar, ChevronRight, ArrowLeft, Share2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils';
import type { Article } from '@/lib/api';

// Données de démonstration
const demoArticles: Article[] = [
  {
    id: '1',
    title: 'Travaux de voirie : réfection de la rue principale',
    slug: 'travaux-voirie-rue-principale',
    content: `
      <p>La commune de Villiers-Adam entreprend d'importants travaux de réfection de la chaussée de la rue principale. Ces travaux, prévus du 15 au 30 janvier 2025, visent à améliorer la qualité de la voirie et la sécurité des usagers.</p>

      <h2>Travaux prévus</h2>
      <p>Les travaux comprendront :</p>
      <ul>
        <li>La reprise du revêtement de la chaussée sur 500 mètres</li>
        <li>La réfection des bordures et caniveaux</li>
        <li>L'amélioration du système d'évacuation des eaux pluviales</li>
        <li>La mise en conformité des accès PMR</li>
      </ul>

      <h2>Impact sur la circulation</h2>
      <p>Durant toute la durée des travaux, une circulation alternée sera mise en place. Des déviations seront indiquées pour les véhicules lourds.</p>

      <p>Nous vous remercions de votre compréhension et vous prions de nous excuser pour la gêne occasionnée.</p>
    `,
    excerpt: 'La commune entreprend des travaux de réfection de la chaussée rue principale.',
    featuredImage: '/images/placeholder-news.jpg',
    category: { id: '1', name: 'Travaux', slug: 'travaux' },
    tags: ['travaux', 'voirie'],
    author: { id: '1', email: 'mairie@villiers-adam.fr', firstName: 'Mairie', lastName: 'Villiers-Adam' },
    authorId: '1',
    status: 'published',
    publishedAt: '2025-01-10T10:00:00Z',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-10T10:00:00Z',
  },
];

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = demoArticles.find((a) => a.slug === params.slug);

  if (!article) {
    return {
      title: 'Article non trouvé',
    };
  }

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.publishedAt,
      images: article.featuredImage ? [article.featuredImage] : [],
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const article = demoArticles.find((a) => a.slug === params.slug);

  if (!article) {
    notFound();
  }

  return (
    <article className="py-12">
      <div className="container max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground">
            Accueil
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/actualites" className="hover:text-foreground">
            Actualités
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground truncate">{article.title}</span>
        </nav>

        {/* Back link */}
        <Link
          href="/actualites"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux actualités
        </Link>

        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {article.category && (
              <Badge variant="secondary">{article.category.name}</Badge>
            )}
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(article.publishedAt || article.createdAt)}
            </span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-heading font-semibold text-foreground mb-4">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-lg text-muted-foreground">
              {article.excerpt}
            </p>
          )}
        </header>

        {/* Featured image */}
        {article.featuredImage && (
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-8">
            <Image
              src={article.featuredImage}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose-villiers"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <Separator className="my-8" />

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Partager
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
