'use client';

import * as React from 'react';
import { useParams, notFound } from 'next/navigation';

import api, { type Article, type PublicationType as ApiPublicationType } from '@/lib/api';
import { type NewsItem } from '@/lib/data/news';
import { ArticleDetailView } from '@/components/content/article-detail-view';

export default function ArticleDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [item, setItem] = React.useState<NewsItem | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [relatedItems, setRelatedItems] = React.useState<NewsItem[]>([]);

  const mapPublicationType = React.useCallback((value?: ApiPublicationType) => {
    switch (value) {
      case 'ARRETE':
        return 'arrete';
      case 'COMPTE_RENDU':
        return 'compte-rendu';
      case 'DELIBERATION':
        return 'deliberation';
      default:
        return undefined;
    }
  }, []);

  const mapArticleType = React.useCallback((value?: Article['type']) => {
    switch (value) {
      case 'PUBLICATION':
        return 'publication';
      case 'BREVE':
        return 'breve';
      case 'ACTUALITE':
      default:
        return 'actualite';
    }
  }, []);

  const mapArticleToNewsItem = React.useCallback((article: Article): NewsItem => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    type: mapArticleType(article.type),
    publicationType: mapPublicationType(article.publicationType),
    date: article.publishedAt || article.createdAt,
    summary: article.excerpt || '',
    content: article.content || '',
    imageUrl: article.featuredImage,
    tags: article.tags || [],
    pdfUrl: article.documentUrl,
    documentNumber: article.documentNumber,
    meetingDate: article.meetingDate,
    year: article.publicationYear,
  }), [mapArticleType, mapPublicationType]);

  React.useEffect(() => {
    const load = async () => {
      try {
        const article = await api.articles.get(slug);
        const mapped = mapArticleToNewsItem(article);
        setItem(mapped);

        const related = await api.articles.list({ type: article.type });
        const relatedMapped = related
          .filter((entry) => entry.slug !== article.slug)
          .map(mapArticleToNewsItem)
          .slice(0, 3);
        setRelatedItems(relatedMapped);
      } catch {
        setItem(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug, mapArticleToNewsItem]);

  if (!loading && !item) {
    notFound();
  }

  if (loading || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <ArticleDetailView item={item} relatedItems={relatedItems} />;
}
