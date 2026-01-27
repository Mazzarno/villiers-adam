import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MeiliSearch } from 'meilisearch';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

type IndexName = 'pages' | 'articles' | 'events' | 'directory' | 'procedures';

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
        pages: [],
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
        { indexUid: 'pages', q: query, limit },
        { indexUid: 'articles', q: query, limit },
        { indexUid: 'events', q: query, limit },
        { indexUid: 'directory', q: query, limit },
        { indexUid: 'procedures', q: query, limit },
      ],
    });

    // Mapper au format attendu par le client
    const articles = rawResults.results.find((r) => r.indexUid === 'articles')?.hits || [];
    const pages = rawResults.results.find((r) => r.indexUid === 'pages')?.hits || [];
    const events = rawResults.results.find((r) => r.indexUid === 'events')?.hits || [];
    const directory = rawResults.results.find((r) => r.indexUid === 'directory')?.hits || [];
    const procedures = rawResults.results.find((r) => r.indexUid === 'procedures')?.hits || [];

    return {
      articles,
      pages,
      events,
      directory,
      procedures,
      total: articles.length + pages.length + events.length + directory.length + procedures.length,
    };
  }

  async reindexAll() {
    if (!this.client) {
      this.logger.warn('Meilisearch not configured');
      return;
    }

    await this.ensureIndexes();

    const [pages, articles, events, directory, procedures] = await Promise.all([
      this.prisma.page.findMany({
        where: { status: 'PUBLISHED', publishedAt: { lte: new Date() } },
      }),
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
      this.client.index('pages').addDocuments(pages.map((page) => this.mapPage(page))),
      this.client.index('articles').addDocuments(articles.map((article) => this.mapArticle(article))),
      this.client.index('events').addDocuments(events.map((event) => this.mapEvent(event))),
      this.client.index('directory').addDocuments(directory.map((entry) => this.mapDirectory(entry))),
      this.client
        .index('procedures')
        .addDocuments(procedures.map((procedure) => this.mapProcedure(procedure))),
    ]);
  }

  async upsertPage(page: { id: string }) {
    return this.upsert('pages', await this.prisma.page.findUnique({ where: { id: page.id } }),
      (value) => this.mapPage(value));
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
      this.ensureIndex('pages'),
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
      searchableAttributes: ['title', 'content', 'summary', 'name'],
      filterableAttributes: ['type', 'status', 'publishedAt'],
      sortableAttributes: ['publishedAt', 'title', 'name'],
    });
  }

  private mapPage(page: { id: string; title: string; summary: string | null; content: Prisma.JsonValue; slug: string; publishedAt: Date | null }) {
    return {
      id: page.id,
      title: page.title,
      summary: page.summary,
      content: this.extractText(page.content),
      slug: page.slug,
      publishedAt: page.publishedAt?.toISOString() ?? null,
      type: 'page',
    };
  }

  private mapArticle(article: { id: string; title: string; summary: string | null; content: Prisma.JsonValue; slug: string; publishedAt: Date | null }) {
    return {
      id: article.id,
      title: article.title,
      summary: article.summary,
      content: this.extractText(article.content),
      slug: article.slug,
      publishedAt: article.publishedAt?.toISOString() ?? null,
      type: 'article',
    };
  }

  private mapEvent(event: { id: string; title: string; summary: string | null; content: Prisma.JsonValue; slug: string; publishedAt: Date | null }) {
    return {
      id: event.id,
      title: event.title,
      summary: event.summary,
      content: this.extractText(event.content),
      slug: event.slug,
      publishedAt: event.publishedAt?.toISOString() ?? null,
      type: 'event',
    };
  }

  private mapDirectory(entry: { id: string; name: string; description: string | null; slug: string; publishedAt: Date | null }) {
    return {
      id: entry.id,
      title: entry.name,
      summary: entry.description,
      slug: entry.slug,
      publishedAt: entry.publishedAt?.toISOString() ?? null,
      type: 'directory',
    };
  }

  private mapProcedure(procedure: { id: string; title: string; summary: string | null; content: Prisma.JsonValue; slug: string; publishedAt: Date | null }) {
    return {
      id: procedure.id,
      title: procedure.title,
      summary: procedure.summary,
      content: this.extractText(procedure.content),
      slug: procedure.slug,
      publishedAt: procedure.publishedAt?.toISOString() ?? null,
      type: 'procedure',
    };
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
