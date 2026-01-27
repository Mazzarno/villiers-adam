'use client';

import * as React from 'react';
import { useParams, useSearchParams, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calendar,
  ChevronRight,
  MapPin,
  Clock,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import type { PageBlock } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002';

type ContentType = 'page' | 'article' | 'event';

interface PreviewData {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  content?: string;
  blocks?: PageBlock[] | null;
  status: string;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  coverMedia?: { url?: string } | null;
  // Article specific
  type?: string;
  isFlash?: boolean;
  // Event specific
  startsAt?: string;
  endsAt?: string;
  locationName?: string | null;
  address?: string | null;
}

function normalizeBlocks(value?: unknown): PageBlock[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as PageBlock[];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as PageBlock[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

async function fetchPreview(
  type: ContentType,
  id: string,
  token: string
): Promise<PreviewData | null> {
  const endpoints: Record<ContentType, string> = {
    page: `/pages/admin/${id}`,
    article: `/articles/admin/${id}`,
    event: `/events/admin/${id}`,
  };

  try {
    const response = await fetch(`${API_URL}${endpoints[type]}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // Normalize content
    let content = '';
    if (data.content) {
      if (typeof data.content === 'string') {
        content = data.content;
      } else {
        try {
          content = JSON.stringify(data.content);
        } catch {
          content = '';
        }
      }
    }

    return {
      ...data,
      content,
      blocks: normalizeBlocks(data.blocks),
    };
  } catch {
    return null;
  }
}

function resolveMediaUrl(url?: string) {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_URL}${url}`;
}

function renderBlock(block: PageBlock, index: number) {
  return (
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
            src={resolveMediaUrl(block.mediaUrl) || ''}
            alt={block.mediaAlt || block.title || 'Média'}
            fill
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
}

function PreviewBanner({ type, id }: { type: ContentType; id: string }) {
  const typeLabels: Record<ContentType, string> = {
    page: 'page',
    article: 'actualité',
    event: 'événement',
  };

  const editUrls: Record<ContentType, string> = {
    page: `${ADMIN_URL}/content/pages/${id}`,
    article: `${ADMIN_URL}/content/articles/${id}`,
    event: `${ADMIN_URL}/content/events/${id}`,
  };

  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-yellow-500 text-yellow-950">
      <div className="container flex items-center justify-between py-2 text-sm">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span className="font-medium">
            Mode prévisualisation - Cette {typeLabels[type]} n&apos;est pas encore publiée
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-yellow-950 hover:bg-yellow-400"
            onClick={() => window.open(editUrls[type], '_self')}
          >
            <ArrowLeft className="mr-1 h-3 w-3" />
            Retour à l&apos;édition
          </Button>
        </div>
      </div>
    </div>
  );
}

function PagePreview({ data }: { data: PreviewData }) {
  const hasBlocks = !!data.blocks && data.blocks.length > 0;

  return (
    <div className="min-h-screen pt-12">
      {/* Hero */}
      <section className="relative py-12 lg:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-villiers-blue/5 to-background" />
        <div className="container max-w-4xl relative">
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
          >
            <span>Accueil</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{data.title}</span>
          </motion.nav>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl lg:text-4xl font-heading font-semibold text-foreground mb-4"
          >
            {data.title}
          </motion.h1>

          {data.summary && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground"
            >
              {data.summary}
            </motion.p>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="py-8 lg:py-12">
        <div className="container max-w-4xl">
          {data.coverMedia?.url && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-[16/9] rounded-xl overflow-hidden mb-8"
            >
              <Image
                src={resolveMediaUrl(data.coverMedia.url) || ''}
                alt={data.title}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          )}

          {hasBlocks ? (
            <div className="space-y-8">
              {data.blocks?.map((block, index) => renderBlock(block, index))}
            </div>
          ) : (
            data.content && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="prose-villiers"
                dangerouslySetInnerHTML={{ __html: data.content }}
              />
            )
          )}
        </div>
      </section>
    </div>
  );
}

function ArticlePreview({ data }: { data: PreviewData }) {
  const typeLabels: Record<string, string> = {
    ACTUALITE: 'Actualité',
    PUBLICATION: 'Publication',
    BREVE: 'Brève',
  };

  return (
    <div className="min-h-screen pt-12">
      {/* Hero */}
      <section className="relative py-12 lg:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-villiers-blue/5 to-background" />
        <div className="container max-w-4xl relative">
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
          >
            <span>Accueil</span>
            <ChevronRight className="h-4 w-4" />
            <span>Actualités</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground truncate max-w-[200px]">{data.title}</span>
          </motion.nav>

          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {data.type && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-villiers-blue/10 text-villiers-blue border border-villiers-blue/20">
                  {typeLabels[data.type] || data.type}
                </span>
              )}
              {data.isFlash && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                  Flash info
                </span>
              )}
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(data.publishedAt || data.createdAt)}
              </span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-heading font-semibold text-foreground mb-4">
              {data.title}
            </h1>

            {data.summary && (
              <p className="text-lg text-muted-foreground leading-relaxed">
                {data.summary}
              </p>
            )}
          </motion.header>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 lg:py-12">
        <div className="container max-w-4xl">
          {data.coverMedia?.url && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-[16/9] rounded-xl overflow-hidden mb-8"
            >
              <Image
                src={resolveMediaUrl(data.coverMedia.url) || ''}
                alt={data.title}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          )}

          {data.content && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="prose-villiers"
              dangerouslySetInnerHTML={{ __html: data.content }}
            />
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 pt-6 mt-8 border-t text-sm text-muted-foreground"
          >
            <Clock className="h-4 w-4" />
            <span>Publié le {formatDate(data.publishedAt || data.createdAt)}</span>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function EventPreview({ data }: { data: PreviewData }) {
  return (
    <div className="min-h-screen pt-12">
      {/* Hero */}
      <section className="relative py-12 lg:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-villiers-blue/5 to-background" />
        <div className="container max-w-4xl relative">
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
          >
            <span>Accueil</span>
            <ChevronRight className="h-4 w-4" />
            <span>Agenda</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground truncate max-w-[200px]">{data.title}</span>
          </motion.nav>

          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl lg:text-4xl font-heading font-semibold text-foreground mb-4">
              {data.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              {data.startsAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>
                    {formatDate(data.startsAt)}
                    {data.endsAt && ` - ${formatDate(data.endsAt)}`}
                  </span>
                </div>
              )}
              {data.locationName && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{data.locationName}</span>
                </div>
              )}
            </div>

            {data.summary && (
              <p className="text-lg text-muted-foreground leading-relaxed mt-4">
                {data.summary}
              </p>
            )}
          </motion.header>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 lg:py-12">
        <div className="container max-w-4xl">
          {data.coverMedia?.url && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-[16/9] rounded-xl overflow-hidden mb-8"
            >
              <Image
                src={resolveMediaUrl(data.coverMedia.url) || ''}
                alt={data.title}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          )}

          {/* Event details card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-muted/30 rounded-xl p-6 mb-8"
          >
            <h2 className="font-heading font-semibold text-lg mb-4">
              Informations pratiques
            </h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              {data.startsAt && (
                <div>
                  <dt className="text-sm text-muted-foreground">Date de début</dt>
                  <dd className="font-medium">{formatDate(data.startsAt)}</dd>
                </div>
              )}
              {data.endsAt && (
                <div>
                  <dt className="text-sm text-muted-foreground">Date de fin</dt>
                  <dd className="font-medium">{formatDate(data.endsAt)}</dd>
                </div>
              )}
              {data.locationName && (
                <div>
                  <dt className="text-sm text-muted-foreground">Lieu</dt>
                  <dd className="font-medium">{data.locationName}</dd>
                </div>
              )}
              {data.address && (
                <div>
                  <dt className="text-sm text-muted-foreground">Adresse</dt>
                  <dd className="font-medium">{data.address}</dd>
                </div>
              )}
            </dl>
          </motion.div>

          {data.content && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="prose-villiers"
              dangerouslySetInnerHTML={{ __html: data.content }}
            />
          )}
        </div>
      </section>
    </div>
  );
}

export default function PreviewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [data, setData] = React.useState<PreviewData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const type = params.type as ContentType;
  const id = params.id as string;
  const token = searchParams.get('token');

  React.useEffect(() => {
    const load = async () => {
      if (!token) {
        setError('Token de prévisualisation manquant');
        setLoading(false);
        return;
      }

      if (!['page', 'article', 'event'].includes(type)) {
        setError('Type de contenu invalide');
        setLoading(false);
        return;
      }

      const result = await fetchPreview(type, id, token);
      if (!result) {
        setError('Contenu introuvable ou accès non autorisé');
      } else {
        setData(result);
      }
      setLoading(false);
    };

    load();
  }, [type, id, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Prévisualisation impossible</h1>
          <p className="text-muted-foreground mb-6">{error || 'Contenu introuvable'}</p>
          <Button onClick={() => window.close()}>Fermer</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PreviewBanner type={type} id={id} />
      {type === 'page' && <PagePreview data={data} />}
      {type === 'article' && <ArticlePreview data={data} />}
      {type === 'event' && <EventPreview data={data} />}
    </>
  );
}
