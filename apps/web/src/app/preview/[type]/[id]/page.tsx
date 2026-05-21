import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

import { ArticleDetailView } from '@/components/content/article-detail-view';
import { EventDetailView } from '@/components/content/event-detail-view';
import type { NewsItem } from '@/lib/data/news';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002';

type PreviewArticleDraft = {
  type: 'article';
  sourceId: string | null;
  editPath: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  articleType: 'ACTUALITE' | 'PUBLICATION' | 'BREVE';
  publicationType: 'ARRETE' | 'COMPTE_RENDU' | 'DELIBERATION' | null;
  documentNumber: string | null;
  meetingDate: string | null;
  publicationYear: number | null;
  isFlash: boolean;
  coverMediaUrl: string | null;
  documentUrl: string | null;
};

type PreviewEventDraft = {
  type: 'event';
  sourceId: string | null;
  editPath: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  locationName: string | null;
  address: string | null;
  startsAt: string | null;
  endsAt: string | null;
  coverMediaUrl: string | null;
};

type PreviewDraftResponse = {
  expiresAt: string;
  draft: PreviewArticleDraft | PreviewEventDraft;
};

interface PreviewPageProps {
  params: Promise<{ type: string; id: string }>;
  searchParams: Promise<{ draftToken?: string }>;
}

export const metadata: Metadata = {
  title: 'Prévisualisation',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

async function getPreviewDraft(token: string): Promise<PreviewDraftResponse | null> {
  try {
    const response = await fetch(`${API_URL}/preview-drafts/${encodeURIComponent(token)}`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch {
    return null;
  }
}

function resolveMediaUrl(url?: string | null) {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_URL}${url}`;
}

function mapPreviewArticleToNewsItem(draft: PreviewArticleDraft): NewsItem {
  return {
    id: draft.sourceId ?? 'preview',
    slug: draft.slug,
    title: draft.title,
    type:
      draft.articleType === 'PUBLICATION'
        ? 'publication'
        : draft.articleType === 'BREVE'
          ? 'breve'
          : 'actualite',
    publicationType:
      draft.publicationType === 'ARRETE'
        ? 'arrete'
        : draft.publicationType === 'COMPTE_RENDU'
          ? 'compte-rendu'
          : draft.publicationType === 'DELIBERATION'
            ? 'deliberation'
            : undefined,
    date: draft.publishedAt ?? draft.createdAt,
    summary: draft.summary ?? '',
    content: draft.content ?? '',
    imageUrl: resolveMediaUrl(draft.coverMediaUrl),
    tags: [],
    pdfUrl: resolveMediaUrl(draft.documentUrl),
    documentNumber: draft.documentNumber ?? undefined,
    meetingDate: draft.meetingDate ?? undefined,
    year: draft.publicationYear ?? undefined,
  };
}

function PreviewBanner({ editPath }: { editPath: string }) {
  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-yellow-500 text-yellow-950 border-b border-yellow-600/60">
      <div className="container flex items-center justify-between py-2 text-sm">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span className="font-medium">Prévisualisation — contenu non publié</span>
        </div>
        <Link
          href={`${ADMIN_URL}${editPath}`}
          className="inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-yellow-400/70 transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Retour à l’édition
        </Link>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-xl text-center space-y-3">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
        <h1 className="text-2xl font-semibold">Prévisualisation indisponible</h1>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

export default async function PreviewPage({ params, searchParams }: PreviewPageProps) {
  const { type, id } = await params;
  const { draftToken } = await searchParams;

  if (type !== 'article' && type !== 'event') {
    notFound();
  }

  if (!draftToken) {
    return (
      <ErrorState message="Jeton de prévisualisation manquant. Relancez la prévisualisation depuis l’administration." />
    );
  }

  const payload = await getPreviewDraft(draftToken);
  if (!payload) {
    return (
      <ErrorState message="Jeton invalide ou expiré. Relancez la prévisualisation depuis l’administration." />
    );
  }

  const draft = payload.draft;
  if (draft.type !== type) {
    return (
      <ErrorState message="Jeton non valide pour ce type de contenu." />
    );
  }

  const expectedId = draft.sourceId ?? 'new';
  if (id !== expectedId) {
    return (
      <ErrorState message="Identifiant de prévisualisation invalide pour ce brouillon." />
    );
  }

  const banner = <PreviewBanner editPath={draft.editPath} />;

  if (draft.type === 'article') {
    const item = mapPreviewArticleToNewsItem(draft);
    return (
      <div className="pt-10">
        <ArticleDetailView item={item} relatedItems={[]} showRelated={false} previewBanner={banner} />
      </div>
    );
  }

  return (
    <div className="pt-10">
      <EventDetailView
        event={{
          title: draft.title,
          description: draft.summary ?? undefined,
          content: draft.content ?? undefined,
          featuredImage: resolveMediaUrl(draft.coverMediaUrl),
          location: draft.locationName ?? undefined,
          address: draft.address ?? undefined,
          startDate: draft.startsAt ?? new Date().toISOString(),
          endDate: draft.endsAt ?? undefined,
        }}
        previewBanner={banner}
        backHref={`${ADMIN_URL}${draft.editPath}`}
        backLabel="Retour à l’édition"
      />
    </div>
  );
}
