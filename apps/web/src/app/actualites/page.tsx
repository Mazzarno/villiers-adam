import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, truncate } from '@/lib/utils';
import type { Article, Category } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Actualités',
  description: 'Toutes les actualités de la commune de Villiers-Adam',
};

// Données de démonstration
const demoArticles: Article[] = [
  {
    id: '1',
    title: 'Travaux de voirie : réfection de la rue principale',
    slug: 'travaux-voirie-rue-principale',
    content: '',
    excerpt: 'La commune entreprend des travaux de réfection de la chaussée rue principale. Circulation alternée prévue du 15 au 30 janvier.',
    featuredImage: '/images/placeholder-news.jpg',
    category: { id: '1', name: 'Travaux', slug: 'travaux' },
    tags: ['travaux', 'voirie'],
    authorId: '1',
    status: 'published',
    publishedAt: '2025-01-10T10:00:00Z',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-10T10:00:00Z',
  },
  {
    id: '2',
    title: 'Nouveau service de navette vers la gare',
    slug: 'nouveau-service-navette',
    content: '',
    excerpt: 'À partir du 1er février, une navette gratuite reliera le village à la gare de Presles-Courcelles.',
    featuredImage: '/images/placeholder-news.jpg',
    category: { id: '2', name: 'Transports', slug: 'transports' },
    tags: ['transports', 'mobilité'],
    authorId: '1',
    status: 'published',
    publishedAt: '2025-01-08T14:00:00Z',
    createdAt: '2025-01-08T14:00:00Z',
    updatedAt: '2025-01-08T14:00:00Z',
  },
  {
    id: '3',
    title: 'Concours photo : notre village en hiver',
    slug: 'concours-photo-hiver',
    content: '',
    excerpt: 'Participez au concours photo organisé par la mairie et tentez de gagner des lots offerts par les commerçants locaux.',
    featuredImage: '/images/placeholder-news.jpg',
    category: { id: '3', name: 'Culture', slug: 'culture' },
    tags: ['culture', 'concours'],
    authorId: '1',
    status: 'published',
    publishedAt: '2025-01-05T09:00:00Z',
    createdAt: '2025-01-05T09:00:00Z',
    updatedAt: '2025-01-05T09:00:00Z',
  },
];

const demoCategories: Category[] = [
  { id: '1', name: 'Travaux', slug: 'travaux' },
  { id: '2', name: 'Transports', slug: 'transports' },
  { id: '3', name: 'Culture', slug: 'culture' },
  { id: '4', name: 'Vie locale', slug: 'vie-locale' },
];

export default async function ActualitesPage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string };
}) {
  const articles = demoArticles;
  const categories = demoCategories;
  const currentCategory = searchParams.category;

  const filteredArticles = currentCategory
    ? articles.filter((a) => a.category?.slug === currentCategory)
    : articles;

  return (
    <div className="py-12">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground">
            Accueil
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Actualités</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-heading font-semibold text-foreground mb-4">
            Actualités
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Retrouvez toutes les informations et actualités de votre commune
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link href="/actualites">
            <Badge
              variant={!currentCategory ? 'default' : 'outline'}
              className="cursor-pointer"
            >
              Toutes
            </Badge>
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/actualites?category=${category.slug}`}
            >
              <Badge
                variant={currentCategory === category.slug ? 'default' : 'outline'}
                className="cursor-pointer"
              >
                {category.name}
              </Badge>
            </Link>
          ))}
        </div>

        {/* Articles grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <Link key={article.id} href={`/actualites/${article.slug}`}>
              <Card className="h-full overflow-hidden card-hover group">
                {article.featuredImage && (
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={article.featuredImage}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    {article.category && (
                      <Badge variant="secondary">{article.category.name}</Badge>
                    )}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(article.publishedAt || article.createdAt)}
                    </span>
                  </div>
                  <h2 className="text-lg font-heading font-semibold leading-tight group-hover:text-primary transition-colors">
                    {article.title}
                  </h2>
                </CardHeader>
                <CardContent>
                  {article.excerpt && (
                    <p className="text-sm text-muted-foreground">
                      {truncate(article.excerpt, 120)}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Aucune actualité dans cette catégorie
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
