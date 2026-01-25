import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import type { Page } from '@/lib/api';
import api from '@/lib/api';

export const revalidate = 0;

interface PageProps {
  params: { slug: string[] };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slug = params.slug.join('/');
  const page = await api.pages.get(slug).catch(() => null);

  if (!page) {
    return {
      title: 'Page non trouvée',
    };
  }

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || page.excerpt,
  };
}

function getBreadcrumbs(slugParts: string[]): { label: string; href: string }[] {
  const breadcrumbs: { label: string; href: string }[] = [];
  let currentPath = '';

  const formatLabel = (value: string) =>
    value
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

  for (let i = 0; i < slugParts.length; i++) {
    currentPath += '/' + slugParts[i];
    breadcrumbs.push({
      label: formatLabel(slugParts[i]),
      href: currentPath,
    });
  }

  return breadcrumbs;
}

export default async function DynamicPage({ params }: PageProps) {
  const slug = params.slug.join('/');
  const page = await api.pages.get(slug).catch(() => null);

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
        {page.blocks && page.blocks.length > 0 ? (
          <div className="space-y-8">
            {page.blocks.map((block, index) => (
              <div key={block.id || index} className="rounded-organic border border-border/50 p-6">
                {block.title && (
                  <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
                    {block.title}
                  </h2>
                )}
                {block.type === 'section' && block.body && (
                  <div
                    className="prose prose-villiers max-w-none"
                    dangerouslySetInnerHTML={{ __html: block.body }}
                  />
                )}
                {block.type === 'cta' && (
                  <div className="space-y-4">
                    {block.body && (
                      <p className="text-muted-foreground">{block.body}</p>
                    )}
                    {block.linkUrl && (
                      <Link
                        href={block.linkUrl}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium"
                      >
                        {block.linkLabel || 'En savoir plus'}
                      </Link>
                    )}
                  </div>
                )}
                {block.type === 'media' && block.mediaUrl && (
                  <div className="relative aspect-[16/9] rounded-organic overflow-hidden">
                    <Image
                      src={block.mediaUrl}
                      alt={block.mediaAlt || block.title || 'Média'}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div
            className="prose-villiers"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        )}
      </div>
    </div>
  );
}
