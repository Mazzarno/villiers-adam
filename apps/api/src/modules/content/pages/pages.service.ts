import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { slugify } from '@villiers-adam/shared';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { VersionService } from '../../audit/version.service';
import { AuditContext } from '../../audit/audit.types';
import { SearchService } from '../../search/search.service';
import { PageCreateInput, PageScheduleInput, PageUpdateInput } from './dto/page.schemas';

@Injectable()
export class PagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly versionService: VersionService,
    private readonly searchService: SearchService,
  ) {}

  async listPublished() {
    return this.prisma.page.findMany({
      where: {
        status: ContentStatus.PUBLISHED,
        publishedAt: { lte: new Date() },
      },
      orderBy: { publishedAt: 'desc' },
      include: { coverMedia: true },
    });
  }

  async listAll(params: { status?: ContentStatus; search?: string }) {
    const where: Prisma.PageWhereInput = {};
    if (params.status) {
      where.status = params.status;
    }
    if (params.search) {
      where.title = { contains: params.search, mode: 'insensitive' };
    }

    return this.prisma.page.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getById(id: string) {
    const page = await this.prisma.page.findUnique({
      where: { id },
      include: { coverMedia: true },
    });
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    return page;
  }

  async getBySlug(slug: string) {
    const page = await this.prisma.page.findUnique({
      where: { slug },
      include: { coverMedia: true },
    });
    if (!page || page.status !== ContentStatus.PUBLISHED) {
      throw new NotFoundException('Page not found');
    }
    return page;
  }

  async create(input: PageCreateInput, actor: AuditContext) {
    const baseSlug = input.slug?.trim() ? input.slug.trim() : input.title;
    const slug = await this.ensureUniqueSlug(slugify(baseSlug));
    const { status, publishedAt, scheduledAt } = this.normalizeStatus(input);

    const page = await this.prisma.page.create({
      data: {
        title: input.title,
        slug,
        summary: input.summary ?? null,
        content: input.content,
        blocks: input.blocks ?? null,
        metaTitle: input.metaTitle ?? null,
        metaDescription: input.metaDescription ?? null,
        menuTitle: input.menuTitle ?? null,
        showInMenu: input.showInMenu ?? false,
        menuOrder: input.menuOrder ?? 0,
        parentId: input.parentId ?? null,
        template: input.template ?? null,
        status,
        publishedAt,
        scheduledAt,
        coverMediaId: input.coverMediaId ?? null,
        createdById: actor.userId,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('Page', page, actor.userId);
    await this.auditService.log({
      action: 'CREATE',
      entity: 'Page',
      entityId: page.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    await this.searchService.upsertPage(page);

    return page;
  }

  async update(id: string, input: PageUpdateInput, actor: AuditContext) {
    const page = await this.prisma.page.findUnique({ where: { id } });
    if (!page) {
      throw new NotFoundException('Page not found');
    }

    const slugSource = input.slug?.trim()
      ? input.slug.trim()
      : input.title
        ? input.title
        : undefined;
    const slug = slugSource
      ? await this.ensureUniqueSlug(slugify(slugSource), id)
      : undefined;
    const { status, publishedAt, scheduledAt } = this.normalizeStatus(input, page);

    const updated = await this.prisma.page.update({
      where: { id },
      data: {
        title: input.title ?? page.title,
        slug: slug ?? page.slug,
        summary: input.summary !== undefined ? input.summary : page.summary,
        content: input.content !== undefined ? input.content : page.content,
        blocks: input.blocks !== undefined ? input.blocks : page.blocks,
        metaTitle: input.metaTitle !== undefined ? input.metaTitle : page.metaTitle,
        metaDescription:
          input.metaDescription !== undefined ? input.metaDescription : page.metaDescription,
        menuTitle: input.menuTitle !== undefined ? input.menuTitle : page.menuTitle,
        showInMenu: input.showInMenu !== undefined ? input.showInMenu : page.showInMenu,
        menuOrder: input.menuOrder !== undefined ? input.menuOrder : page.menuOrder,
        parentId: input.parentId !== undefined ? input.parentId : page.parentId,
        template: input.template !== undefined ? input.template : page.template,
        status,
        publishedAt,
        scheduledAt,
        coverMediaId:
          input.coverMediaId !== undefined ? input.coverMediaId : page.coverMediaId,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('Page', updated, actor.userId);
    await this.auditService.log({
      action: 'UPDATE',
      entity: 'Page',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    await this.searchService.upsertPage(updated);

    return updated;
  }

  async remove(id: string, actor: AuditContext) {
    const page = await this.prisma.page.findUnique({ where: { id } });
    if (!page) {
      throw new NotFoundException('Page not found');
    }

    await this.auditService.log({
      action: 'DELETE',
      entity: 'Page',
      entityId: page.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    await this.searchService.remove('pages', page.id);

    return this.prisma.page.delete({ where: { id } });
  }

  async publish(id: string, actor: AuditContext) {
    await this.ensureExists(id);
    const updated = await this.prisma.page.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        scheduledAt: null,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('Page', updated, actor.userId);
    await this.auditService.log({
      action: 'PUBLISH',
      entity: 'Page',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    await this.searchService.upsertPage(updated);

    return updated;
  }

  async schedule(id: string, input: PageScheduleInput, actor: AuditContext) {
    await this.ensureExists(id);
    const updated = await this.prisma.page.update({
      where: { id },
      data: {
        status: ContentStatus.SCHEDULED,
        scheduledAt: new Date(input.scheduledAt),
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('Page', updated, actor.userId);
    await this.auditService.log({
      action: 'UPDATE',
      entity: 'Page',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    await this.searchService.upsertPage(updated);

    return updated;
  }

  async archive(id: string, actor: AuditContext) {
    await this.ensureExists(id);
    const updated = await this.prisma.page.update({
      where: { id },
      data: {
        status: ContentStatus.ARCHIVED,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('Page', updated, actor.userId);
    await this.auditService.log({
      action: 'ARCHIVE',
      entity: 'Page',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    await this.searchService.remove('pages', updated.id);

    return updated;
  }

  async publishScheduled() {
    const now = new Date();
    await this.prisma.page.updateMany({
      where: { status: ContentStatus.SCHEDULED, scheduledAt: { lte: now } },
      data: { status: ContentStatus.PUBLISHED, publishedAt: now, scheduledAt: null },
    });
  }

  private async ensureExists(id: string) {
    const page = await this.prisma.page.findUnique({ where: { id } });
    if (!page) {
      throw new NotFoundException('Page not found');
    }
  }

  private normalizeStatus(
    input: PageCreateInput | PageUpdateInput,
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
      const existing = await this.prisma.page.findUnique({ where: { slug: candidate } });
      if (!existing || existing.id === excludeId) {
        return candidate;
      }
      candidate = `${slug}-${counter}`;
      counter += 1;
    }
  }
}
