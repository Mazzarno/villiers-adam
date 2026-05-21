import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { ContentStatus } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';
import { PreviewDraftCreateInput } from './dto/preview-draft.schemas';

type PreviewArticleDraft = {
  type: 'article';
  sourceId: string | null;
  editPath: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  status: ContentStatus;
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
  status: ContentStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  locationName: string | null;
  address: string | null;
  startsAt: string | null;
  endsAt: string | null;
  coverMediaUrl: string | null;
};

type PreviewDraft = PreviewArticleDraft | PreviewEventDraft;

type StoredPreviewDraft = {
  expiresAtMs: number;
  draft: PreviewDraft;
};

const PREVIEW_TTL_MS = 10 * 60 * 1000;
const PREVIEW_CLEANUP_INTERVAL_MS = 60 * 1000;
const TOKEN_REGEX = /^[a-f0-9]{64}$/;

@Injectable()
export class PreviewDraftsService {
  private readonly drafts = new Map<string, StoredPreviewDraft>();

  constructor(private readonly prisma: PrismaService) {
    const timer = setInterval(() => this.cleanupExpiredDrafts(), PREVIEW_CLEANUP_INTERVAL_MS);
    timer.unref?.();
  }

  async createDraft(input: PreviewDraftCreateInput) {
    const token = randomBytes(32).toString('hex');
    const now = Date.now();
    const expiresAtMs = now + PREVIEW_TTL_MS;
    const draft = await this.buildDraft(input);

    this.drafts.set(token, {
      expiresAtMs,
      draft,
    });

    return {
      draftToken: token,
      expiresAt: new Date(expiresAtMs).toISOString(),
      previewUrlPath: `/preview/${draft.type}/${draft.sourceId ?? 'new'}?draftToken=${token}`,
    };
  }

  getDraftByToken(token: string) {
    if (!TOKEN_REGEX.test(token)) {
      throw new NotFoundException('Jeton de prévisualisation invalide');
    }

    const stored = this.drafts.get(token);
    if (!stored) {
      throw new NotFoundException('Jeton de prévisualisation invalide ou expiré');
    }

    if (stored.expiresAtMs <= Date.now()) {
      this.drafts.delete(token);
      throw new NotFoundException('Jeton de prévisualisation invalide ou expiré');
    }

    return {
      expiresAt: new Date(stored.expiresAtMs).toISOString(),
      draft: stored.draft,
    };
  }

  private cleanupExpiredDrafts() {
    const now = Date.now();
    for (const [token, draft] of this.drafts.entries()) {
      if (draft.expiresAtMs <= now) {
        this.drafts.delete(token);
      }
    }
  }

  private async resolveMediaUrl(mediaId?: string | null) {
    if (!mediaId) return null;
    const media = await this.prisma.media.findUnique({
      where: { id: mediaId },
      select: { url: true },
    });
    return media?.url ?? null;
  }

  private async buildDraft(input: PreviewDraftCreateInput): Promise<PreviewDraft> {
    const nowIso = new Date().toISOString();

    if (input.type === 'article') {
      const coverMediaUrl = await this.resolveMediaUrl(input.data.coverMediaId);
      const documentUrl = await this.resolveMediaUrl(input.data.documentMediaId);
      const sourceId = input.sourceId ?? null;

      return {
        type: 'article',
        sourceId,
        editPath: sourceId ? `/content/articles/${sourceId}` : '/content/articles/new',
        title: input.data.title,
        slug: input.data.slug ?? `preview-${nowIso}`,
        summary: input.data.summary ?? null,
        content: input.data.content ?? '',
        status: input.data.status ?? ContentStatus.DRAFT,
        publishedAt: input.data.publishedAt ?? null,
        createdAt: input.data.createdAt ?? nowIso,
        updatedAt: input.data.updatedAt ?? nowIso,
        articleType: input.data.type ?? 'ACTUALITE',
        publicationType: input.data.publicationType ?? null,
        documentNumber: input.data.documentNumber ?? null,
        meetingDate: input.data.meetingDate ?? null,
        publicationYear: input.data.publicationYear ?? null,
        isFlash: input.data.isFlash ?? false,
        coverMediaUrl,
        documentUrl,
      };
    }

    const coverMediaUrl = await this.resolveMediaUrl(input.data.coverMediaId);
    const sourceId = input.sourceId ?? null;

    return {
      type: 'event',
      sourceId,
      editPath: sourceId ? `/content/events/${sourceId}` : '/content/events/new',
      title: input.data.title,
      slug: input.data.slug ?? `preview-${nowIso}`,
      summary: input.data.summary ?? null,
      content: input.data.content ?? '',
      status: input.data.status ?? ContentStatus.DRAFT,
      publishedAt: input.data.publishedAt ?? null,
      createdAt: input.data.createdAt ?? nowIso,
      updatedAt: input.data.updatedAt ?? nowIso,
      locationName: input.data.locationName ?? null,
      address: input.data.address ?? null,
      startsAt: input.data.startsAt ?? null,
      endsAt: input.data.endsAt ?? null,
      coverMediaUrl,
    };
  }
}
