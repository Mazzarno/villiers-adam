'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Calendar,
  ChevronRight,
  ChevronLeft,
  Share2,
  Printer,
  FileText,
  Download,
  Tag,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatDate } from '@/lib/utils';
import {
  categoryLabels,
  categoryColors,
  publicationTypeLabels,
  type NewsItem,
  type NewsCategory,
} from '@/lib/data/news';
import api, { type Article, type PublicationType as ApiPublicationType } from '@/lib/api';

// Composant pour afficher le badge de catégorie
function CategoryBadge({ category }: { category: NewsCategory }) {
  const color = categoryColors[category] || 'villiers-blue';
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
        `bg-${color}/10 text-${color} border border-${color}/20`
      )}
    >
      {categoryLabels[category]}
    </span>
  );
}

// Composant pour afficher un PDF intégré
function PDFViewer({ url, title }: { url: string; title: string }) {
  return (
    <div className="bg-muted/30 rounded-organic border border-border/50 overflow-hidden">
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <FileText className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="font-medium text-foreground text-sm">{title}</p>
            <p className="text-xs text-muted-foreground">Document PDF</p>
          </div>
        </div>
        <a
          href={url}
          download
          className="inline-flex items-center gap-2 px-4 py-2 bg-villiers-blue text-white rounded-lg text-sm font-medium hover:bg-villiers-blue/90 transition-colors"
        >
          <Download className="h-4 w-4" />
          Télécharger
        </a>
      </div>
      <div className="aspect-[3/4] max-h-[600px]">
        <iframe
          src={`${url}#view=FitH`}
          title={title}
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
}

// Composant pour les articles suggérés
function RelatedArticles({ items, title }: { items: NewsItem[]; title: string }) {
  if (items.length === 0) return null;

  return (
    <section className="py-12 bg-muted/30">
      <div className="container max-w-4xl">
          <h2 className="font-heading text-xl font-semibold text-foreground mb-6">
            {title}
          </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/actualites/${item.slug}`}
              className="group p-4 bg-background rounded-organic border border-border/50 hover:border-villiers-gold/30 transition-colors"
            >
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(item.date)}
              </p>
              <h3 className="font-medium text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {item.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

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
      } catch (error) {
        setItem(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  if (!loading && !item) {
    notFound();
  }

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (!item) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.summary,
          url: window.location.href,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative py-12 lg:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-villiers-blue/5 to-background" />
        <div className="absolute inset-0 texture-grain opacity-30" />

        <div className="container max-w-4xl relative">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
          >
            <Link href="/" className="hover:text-foreground transition-colors">
              Accueil
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/actualites" className="hover:text-foreground transition-colors">
              Actualités
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground truncate max-w-[200px]">{item.title}</span>
          </motion.nav>

          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
              <Link href="/actualites">
                <ChevronLeft className="h-4 w-4" />
                Retour aux actualités
              </Link>
            </Button>
          </motion.div>

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {item.category && <CategoryBadge category={item.category} />}
              {item.publicationType && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-villiers-gold/10 text-villiers-gold border border-villiers-gold/20">
                  {publicationTypeLabels[item.publicationType]}
                </span>
              )}
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(item.date)}
              </span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-heading font-semibold text-foreground mb-4">
              {item.title}
            </h1>

            {item.summary && (
              <p className="text-lg text-muted-foreground leading-relaxed">
                {item.summary}
              </p>
            )}
          </motion.header>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 lg:py-12">
        <div className="container max-w-4xl">
          {/* Featured image */}
          {item.imageUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative aspect-[16/9] rounded-organic overflow-hidden mb-8"
            >
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          )}

          {/* PDF Viewer for publications */}
          {item.pdfUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <PDFViewer url={item.pdfUrl} title={item.title} />
            </motion.div>
          )}

          {/* Article content */}
          {item.content && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="prose-villiers mb-8"
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
          )}

          {/* Document metadata for publications */}
          {(item.documentNumber || item.meetingDate) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-muted/30 rounded-organic p-4 mb-8"
            >
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Informations du document
              </h3>
              <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                {item.documentNumber && (
                  <div>
                    <dt className="text-muted-foreground">Numéro</dt>
                    <dd className="font-mono text-foreground">{item.documentNumber}</dd>
                  </div>
                )}
                {item.meetingDate && (
                  <div>
                    <dt className="text-muted-foreground">Date de réunion</dt>
                    <dd className="text-foreground">{formatDate(item.meetingDate)}</dd>
                  </div>
                )}
                {item.year && (
                  <div>
                    <dt className="text-muted-foreground">Année</dt>
                    <dd className="text-foreground">{item.year}</dd>
                  </div>
                )}
              </dl>
            </motion.div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-wrap items-center gap-2 mb-8"
            >
              <Tag className="h-4 w-4 text-muted-foreground" />
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-border/50"
          >
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Publié le {formatDate(item.date)}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Related articles */}
      <RelatedArticles
        items={relatedItems}
        title={
          item.type === 'publication'
            ? 'Autres publications'
            : item.type === 'breve'
              ? 'Autres brèves'
              : 'Autres actualités'
        }
      />

      {/* CTA */}
      <section className="py-12">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-villiers-blue/5 border border-villiers-blue/20 rounded-organic p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div>
              <h3 className="font-heading font-semibold text-foreground mb-1">
                Restez informé
              </h3>
              <p className="text-sm text-muted-foreground">
                Consultez régulièrement nos actualités pour suivre la vie de la commune.
              </p>
            </div>
            <Button asChild>
              <Link href="/actualites" className="gap-2">
                Toutes les actualités
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
