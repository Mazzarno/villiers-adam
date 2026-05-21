import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MeiliSearch } from 'meilisearch';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

type IndexName = 'articles' | 'events' | 'directory' | 'procedures';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly client?: MeiliSearch;

  constructor(private readonly config: ConfigService, private readonly prisma: PrismaService) {
    const host = this.config.get<string>('MEILI_HOST');
    const apiKey = this.config.get<string>('MEILI_MASTER_KEY');

    if (host) {
      this.client = new MeiliSearch({ host, apiKey });
    }
  }

  async search(query: string, type?: IndexName, limit = 20) {
    if (!this.client) {
      return {
        articles: [],
        events: [],
        directory: [],
        procedures: [],
        total: 0,
      };
    }

    if (type) {
      return this.client.index(type).search(query, { limit });
    }

    const rawResults = await this.client.multiSearch({
      queries: [
        { indexUid: 'articles', q: query, limit },
        { indexUid: 'events', q: query, limit },
        { indexUid: 'directory', q: query, limit },
        { indexUid: 'procedures', q: query, limit },
      ],
    });

    const articles = (rawResults.results.find((r) => r.indexUid === 'articles')?.hits || []).map((hit) =>
      this.normalizeArticleHit(hit as Record<string, unknown>),
    );
    const events = (rawResults.results.find((r) => r.indexUid === 'events')?.hits || []).map((hit) =>
      this.normalizeEventHit(hit as Record<string, unknown>),
    );
    const directory = (rawResults.results.find((r) => r.indexUid === 'directory')?.hits || []).map((hit) =>
      this.normalizeDirectoryHit(hit as Record<string, unknown>),
    );
    const procedures = (rawResults.results.find((r) => r.indexUid === 'procedures')?.hits || []).map((hit) =>
      this.normalizeProcedureHit(hit as Record<string, unknown>),
    );

    return {
      articles,
      events,
      directory,
      procedures,
      total: articles.length + events.length + directory.length + procedures.length,
    };
  }

  async reindexAll() {
    if (!this.client) {
      this.logger.warn('Meilisearch not configured');
      return;
    }

    await this.ensureIndexes();

    const [articles, events, directory, procedures] = await Promise.all([
      this.prisma.article.findMany({
        where: { status: 'PUBLISHED', publishedAt: { lte: new Date() } },
      }),
      this.prisma.event.findMany({
        where: { status: 'PUBLISHED', publishedAt: { lte: new Date() } },
      }),
      this.prisma.directoryEntry.findMany({
        where: { status: 'PUBLISHED', publishedAt: { lte: new Date() } },
      }),
      this.prisma.procedure.findMany({
        where: { status: 'PUBLISHED', publishedAt: { lte: new Date() } },
      }),
    ]);

    await Promise.all([
      this.client.index('articles').addDocuments(articles.map((article) => this.mapArticle(article))),
      this.client.index('events').addDocuments(events.map((event) => this.mapEvent(event))),
      this.client.index('directory').addDocuments(directory.map((entry) => this.mapDirectory(entry))),
      this.client
        .index('procedures')
        .addDocuments(procedures.map((procedure) => this.mapProcedure(procedure))),
    ]);
  }

  async upsertArticle(article: { id: string }) {
    return this.upsert('articles', await this.prisma.article.findUnique({ where: { id: article.id } }),
      (value) => this.mapArticle(value));
  }

  async upsertEvent(event: { id: string }) {
    return this.upsert('events', await this.prisma.event.findUnique({ where: { id: event.id } }),
      (value) => this.mapEvent(value));
  }

  async upsertDirectory(entry: { id: string }) {
    return this.upsert('directory', await this.prisma.directoryEntry.findUnique({ where: { id: entry.id } }),
      (value) => this.mapDirectory(value));
  }

  async upsertProcedure(procedure: { id: string }) {
    return this.upsert(
      'procedures',
      await this.prisma.procedure.findUnique({ where: { id: procedure.id } }),
      (value) => this.mapProcedure(value),
    );
  }

  async remove(type: IndexName, id: string) {
    if (!this.client) {
      return;
    }
    await this.client.index(type).deleteDocument(id);
  }

  private async upsert<T extends { id: string; status?: string; publishedAt?: Date | null }>(
    type: IndexName,
    entity: T | null,
    map: (value: T) => Record<string, unknown>,
  ) {
    if (!this.client || !entity) {
      return;
    }

    if (entity.status !== 'PUBLISHED') {
      await this.remove(type, entity.id);
      return;
    }

    await this.client.index(type).addDocuments([map(entity)]);
  }

  private async ensureIndexes() {
    if (!this.client) {
      return;
    }

    await Promise.all([
      this.ensureIndex('articles'),
      this.ensureIndex('events'),
      this.ensureIndex('directory'),
      this.ensureIndex('procedures'),
    ]);
  }

  private async ensureIndex(index: IndexName) {
    if (!this.client) {
      return;
    }
    const idx = this.client.index(index);
    await idx.updateSettings({
      searchableAttributes: ['title', 'name', 'content', 'summary', 'excerpt', 'description'],
      filterableAttributes: ['type', 'status', 'publishedAt'],
      sortableAttributes: ['publishedAt', 'createdAt', 'title', 'name'],
    });
  }

  private mapArticle(article: {
    id: string;
    title: string;
    summary: string | null;
    content: Prisma.JsonValue;
    slug: string;
    publishedAt: Date | null;
    createdAt: Date;
  }) {
    return {
      id: article.id,
      title: article.title,
      excerpt: article.summary,
      content: this.extractText(article.content),
      slug: article.slug,
      publishedAt: article.publishedAt?.toISOString() ?? null,
      createdAt: article.createdAt.toISOString(),
      type: 'article',
    };
  }

  private mapEvent(event: {
    id: string;
    title: string;
    summary: string | null;
    content: Prisma.JsonValue;
    slug: string;
    publishedAt: Date | null;
    createdAt: Date;
    startsAt: Date;
  }) {
    return {
      id: event.id,
      title: event.title,
      description: event.summary,
      content: this.extractText(event.content),
      slug: event.slug,
      publishedAt: event.publishedAt?.toISOString() ?? null,
      createdAt: event.createdAt.toISOString(),
      startDate: event.startsAt.toISOString(),
      type: 'event',
    };
  }

  private mapDirectory(entry: {
    id: string;
    name: string;
    description: string | null;
    slug: string;
    publishedAt: Date | null;
    createdAt: Date;
    type: string;
  }) {
    return {
      id: entry.id,
      name: entry.name,
      title: entry.name,
      description: entry.description,
      slug: entry.slug,
      publishedAt: entry.publishedAt?.toISOString() ?? null,
      createdAt: entry.createdAt.toISOString(),
      category: entry.type,
      type: 'directory',
    };
  }

  private mapProcedure(procedure: {
    id: string;
    title: string;
    summary: string | null;
    content: Prisma.JsonValue;
    slug: string;
    publishedAt: Date | null;
    createdAt: Date;
  }) {
    return {
      id: procedure.id,
      title: procedure.title,
      excerpt: procedure.summary,
      content: this.extractText(procedure.content),
      slug: procedure.slug,
      publishedAt: procedure.publishedAt?.toISOString() ?? null,
      createdAt: procedure.createdAt.toISOString(),
      type: 'procedure',
    };
  }

  private normalizeArticleHit(hit: Record<string, unknown>) {
    const publishedAt = this.getString(hit, 'publishedAt');
    return {
      id: this.getString(hit, 'id') ?? '',
      type: 'article',
      title: this.getString(hit, 'title') ?? '',
      slug: this.getString(hit, 'slug') ?? '',
      excerpt: this.getString(hit, 'excerpt') ?? this.getString(hit, 'summary'),
      publishedAt,
      createdAt: this.getString(hit, 'createdAt') ?? publishedAt,
    };
  }

  private normalizeEventHit(hit: Record<string, unknown>) {
    const publishedAt = this.getString(hit, 'publishedAt');
    return {
      id: this.getString(hit, 'id') ?? '',
      type: 'event',
      title: this.getString(hit, 'title') ?? '',
      slug: this.getString(hit, 'slug') ?? '',
      description: this.getString(hit, 'description') ?? this.getString(hit, 'summary'),
      startDate:
        this.getString(hit, 'startDate') ??
        this.getString(hit, 'startsAt') ??
        this.getString(hit, 'createdAt') ??
        publishedAt,
      publishedAt,
      createdAt: this.getString(hit, 'createdAt') ?? publishedAt,
    };
  }

  private normalizeDirectoryHit(hit: Record<string, unknown>) {
    const publishedAt = this.getString(hit, 'publishedAt');
    return {
      id: this.getString(hit, 'id') ?? '',
      type: 'directory',
      name: this.getString(hit, 'name') ?? this.getString(hit, 'title') ?? '',
      slug: this.getString(hit, 'slug') ?? '',
      description: this.getString(hit, 'description') ?? this.getString(hit, 'summary'),
      category: this.getString(hit, 'category') ?? this.getString(hit, 'type'),
      publishedAt,
      createdAt: this.getString(hit, 'createdAt') ?? publishedAt,
    };
  }

  private normalizeProcedureHit(hit: Record<string, unknown>) {
    const publishedAt = this.getString(hit, 'publishedAt');
    return {
      id: this.getString(hit, 'id') ?? '',
      type: 'procedure',
      title: this.getString(hit, 'title') ?? '',
      slug: this.getString(hit, 'slug') ?? '',
      excerpt: this.getString(hit, 'excerpt') ?? this.getString(hit, 'summary'),
      publishedAt,
      createdAt: this.getString(hit, 'createdAt') ?? publishedAt,
    };
  }

  private getString(record: Record<string, unknown>, key: string): string | undefined {
    const value = record[key];
    return typeof value === 'string' ? value : undefined;
  }

  private extractText(value: Prisma.JsonValue) {
    if (!value) {
      return '';
    }
    if (typeof value === 'string') {
      return value;
    }
    try {
      return JSON.stringify(value);
    } catch {
      return '';
    }
  }
}
