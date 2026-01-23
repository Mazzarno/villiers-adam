import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { slugify } from '@villiers-adam/shared';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { VersionService } from '../../audit/version.service';
import { AuditContext } from '../../audit/audit.types';
import { SearchService } from '../../search/search.service';
import {
  ArticleCreateInput,
  ArticleScheduleInput,
  ArticleUpdateInput,
} from './dto/article.schemas';

@Injectable()
export class ArticlesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly versionService: VersionService,
    private readonly searchService: SearchService,
  ) {}

  async listPublished() {
    return this.prisma.article.findMany({
      where: { status: ContentStatus.PUBLISHED, publishedAt: { lte: new Date() } },
      orderBy: { publishedAt: 'desc' },
    });
  }

  async listAll(params: { status?: ContentStatus; search?: string }) {
    const where: Prisma.ArticleWhereInput = {};
    if (params.status) {
      where.status = params.status;
    }
    if (params.search) {
      where.title = { contains: params.search, mode: 'insensitive' };
    }
    return this.prisma.article.findMany({ where, orderBy: { updatedAt: 'desc' } });
  }

  async getBySlug(slug: string) {
    const article = await this.prisma.article.findUnique({ where: { slug } });
    if (!article || article.status !== ContentStatus.PUBLISHED) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }

  async create(input: ArticleCreateInput, actor: AuditContext) {
    const slug = await this.ensureUniqueSlug(slugify(input.title));
    const { status, publishedAt, scheduledAt } = this.normalizeStatus(input);

    const article = await this.prisma.article.create({
      data: {
        title: input.title,
        slug,
        summary: input.summary ?? null,
        content: input.content,
        isFlash: input.isFlash ?? false,
        status,
        publishedAt,
        scheduledAt,
        coverMediaId: input.coverMediaId ?? null,
        createdById: actor.userId,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('Article', article, actor.userId);
    await this.auditService.log({
      action: 'CREATE',
      entity: 'Article',
      entityId: article.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    await this.searchService.upsertArticle(article);

    return article;
  }

  async update(id: string, input: ArticleUpdateInput, actor: AuditContext) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const slug = input.title ? await this.ensureUniqueSlug(slugify(input.title), id) : undefined;
    const { status, publishedAt, scheduledAt } = this.normalizeStatus(input, article);

    const updated = await this.prisma.article.update({
      where: { id },
      data: {
        title: input.title ?? article.title,
        slug: slug ?? article.slug,
        summary: input.summary !== undefined ? input.summary : article.summary,
        content: input.content !== undefined ? input.content : article.content,
        isFlash: input.isFlash ?? article.isFlash,
        status,
        publishedAt,
        scheduledAt,
        coverMediaId:
          input.coverMediaId !== undefined ? input.coverMediaId : article.coverMediaId,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('Article', updated, actor.userId);
    await this.auditService.log({
      action: 'UPDATE',
      entity: 'Article',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    await this.searchService.upsertArticle(updated);

    return updated;
  }

  async remove(id: string, actor: AuditContext) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    await this.auditService.log({
      action: 'DELETE',
      entity: 'Article',
      entityId: article.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    await this.searchService.remove('articles', article.id);

    return this.prisma.article.delete({ where: { id } });
  }

  async publish(id: string, actor: AuditContext) {
    await this.ensureExists(id);
    const updated = await this.prisma.article.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        scheduledAt: null,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('Article', updated, actor.userId);
    await this.auditService.log({
      action: 'PUBLISH',
      entity: 'Article',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    await this.searchService.upsertArticle(updated);

    return updated;
  }

  async schedule(id: string, input: ArticleScheduleInput, actor: AuditContext) {
    await this.ensureExists(id);
    const updated = await this.prisma.article.update({
      where: { id },
      data: {
        status: ContentStatus.SCHEDULED,
        scheduledAt: new Date(input.scheduledAt),
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('Article', updated, actor.userId);
    await this.auditService.log({
      action: 'UPDATE',
      entity: 'Article',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    await this.searchService.upsertArticle(updated);

    return updated;
  }

  async archive(id: string, actor: AuditContext) {
    await this.ensureExists(id);
    const updated = await this.prisma.article.update({
      where: { id },
      data: {
        status: ContentStatus.ARCHIVED,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('Article', updated, actor.userId);
    await this.auditService.log({
      action: 'ARCHIVE',
      entity: 'Article',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    await this.searchService.remove('articles', updated.id);

    return updated;
  }

  async publishScheduled() {
    const now = new Date();
    await this.prisma.article.updateMany({
      where: { status: ContentStatus.SCHEDULED, scheduledAt: { lte: now } },
      data: { status: ContentStatus.PUBLISHED, publishedAt: now, scheduledAt: null },
    });
  }

  private async ensureExists(id: string) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
  }

  private normalizeStatus(
    input: ArticleCreateInput | ArticleUpdateInput,
    current?: { status: ContentStatus; publishedAt: Date | null; scheduledAt: Date | null },
  ) {
    const status = input.status ?? current?.status ?? ContentStatus.DRAFT;
    const publishedAt = input.publishedAt ? new Date(input.publishedAt) : undefined;
    const scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : undefined;

    if (status === ContentStatus.SCHEDULED && !scheduledAt) {
      throw new BadRequestException('scheduledAt is required for SCHEDULED content');
    }

    const resolvedPublishedAt =
      status === ContentStatus.PUBLISHED
        ? publishedAt ?? current?.publishedAt ?? new Date()
        : null;

    const resolvedScheduledAt =
      status === ContentStatus.SCHEDULED
        ? scheduledAt ?? current?.scheduledAt ?? null
        : null;

    return {
      status,
      publishedAt: resolvedPublishedAt,
      scheduledAt: resolvedScheduledAt,
    };
  }

  private async ensureUniqueSlug(slug: string, excludeId?: string) {
    let candidate = slug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.article.findUnique({ where: { slug: candidate } });
      if (!existing || existing.id === excludeId) {
        return candidate;
      }
      candidate = `${slug}-${counter}`;
      counter += 1;
    }
  }
}
