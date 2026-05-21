import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ContentStatus, Prisma } from '@prisma/client';
import { slugify } from '@villiers-adam/shared';

import { sanitizeHttpUrl } from '../../common/security/url-sanitizer';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { VersionService } from '../audit/version.service';
import { AuditContext } from '../audit/audit.types';
import {
  TransportCreateInput,
  TransportScheduleInput,
  TransportUpdateInput,
} from './dto/transports.schemas';

@Injectable()
export class TransportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly versionService: VersionService,
  ) {}

  private sanitizeWebsite<T extends { website: string | null }>(info: T): T {
    return {
      ...info,
      website: sanitizeHttpUrl(info.website),
    };
  }

  async listPublished() {
    const now = new Date();
    const transportInfos = await this.prisma.transportInfo.findMany({
      where: {
        status: ContentStatus.PUBLISHED,
        OR: [{ publishedAt: { lte: now } }, { publishedAt: null }],
      },
      orderBy: { updatedAt: 'desc' },
      include: { coverMedia: true },
    });
    return transportInfos.map((info) => this.sanitizeWebsite(info));
  }

  async listAll(params: { status?: ContentStatus; search?: string }) {
    const where: Prisma.TransportInfoWhereInput = {};
    if (params.status) {
      where.status = params.status;
    }
    if (params.search) {
      where.title = { contains: params.search, mode: 'insensitive' };
    }
    const transportInfos = await this.prisma.transportInfo.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: { coverMedia: true },
    });
    return transportInfos.map((info) => this.sanitizeWebsite(info));
  }

  async getById(id: string) {
    const info = await this.prisma.transportInfo.findUnique({
      where: { id },
      include: { coverMedia: true },
    });
    if (!info) {
      throw new NotFoundException('Transport info not found');
    }
    return this.sanitizeWebsite(info);
  }

  async getBySlug(slug: string) {
    const info = await this.prisma.transportInfo.findUnique({
      where: { slug },
      include: { coverMedia: true },
    });
    if (!info || info.status !== ContentStatus.PUBLISHED) {
      throw new NotFoundException('Transport info not found');
    }
    return this.sanitizeWebsite(info);
  }

  async create(input: TransportCreateInput, actor: AuditContext) {
    const baseSlug = input.slug?.trim() ? input.slug.trim() : input.title;
    const slug = await this.ensureUniqueSlug(slugify(baseSlug));
    const { status, publishedAt, scheduledAt } = this.normalizeStatus(input);

    const info = await this.prisma.transportInfo.create({
      data: {
        title: input.title,
        slug,
        summary: input.summary ?? null,
        content: input.content,
        operator: input.operator ?? null,
        website: sanitizeHttpUrl(input.website),
        phone: input.phone ?? null,
        status,
        publishedAt,
        scheduledAt,
        coverMediaId: input.coverMediaId ?? null,
        createdById: actor.userId,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('TransportInfo', info, actor.userId);
    await this.auditService.log({
      action: 'CREATE',
      entity: 'TransportInfo',
      entityId: info.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    return this.sanitizeWebsite(info);
  }

  async update(id: string, input: TransportUpdateInput, actor: AuditContext) {
    const info = await this.prisma.transportInfo.findUnique({ where: { id } });
    if (!info) {
      throw new NotFoundException('Transport info not found');
    }

    const slugSource = input.slug?.trim()
      ? input.slug.trim()
      : input.title
        ? input.title
        : undefined;
    const slug = slugSource
      ? await this.ensureUniqueSlug(slugify(slugSource), id)
      : undefined;
    const { status, publishedAt, scheduledAt } = this.normalizeStatus(input, info);

    const updated = await this.prisma.transportInfo.update({
      where: { id },
      data: {
        title: input.title ?? info.title,
        slug: slug ?? info.slug,
        summary: input.summary !== undefined ? input.summary : info.summary,
        content: input.content !== undefined ? input.content : info.content,
        operator: input.operator !== undefined ? input.operator : info.operator,
        website:
          input.website !== undefined
            ? sanitizeHttpUrl(input.website)
            : sanitizeHttpUrl(info.website),
        phone: input.phone !== undefined ? input.phone : info.phone,
        status,
        publishedAt,
        scheduledAt,
        coverMediaId:
          input.coverMediaId !== undefined ? input.coverMediaId : info.coverMediaId,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('TransportInfo', updated, actor.userId);
    await this.auditService.log({
      action: 'UPDATE',
      entity: 'TransportInfo',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    return this.sanitizeWebsite(updated);
  }

  async remove(id: string, actor: AuditContext) {
    const info = await this.prisma.transportInfo.findUnique({ where: { id } });
    if (!info) {
      throw new NotFoundException('Transport info not found');
    }

    await this.auditService.log({
      action: 'DELETE',
      entity: 'TransportInfo',
      entityId: info.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    return this.prisma.transportInfo.delete({ where: { id } });
  }

  async publish(id: string, actor: AuditContext) {
    await this.ensureExists(id);
    const updated = await this.prisma.transportInfo.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        scheduledAt: null,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('TransportInfo', updated, actor.userId);
    await this.auditService.log({
      action: 'PUBLISH',
      entity: 'TransportInfo',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    return updated;
  }

  async schedule(id: string, input: TransportScheduleInput, actor: AuditContext) {
    await this.ensureExists(id);
    const updated = await this.prisma.transportInfo.update({
      where: { id },
      data: {
        status: ContentStatus.SCHEDULED,
        scheduledAt: new Date(input.scheduledAt),
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('TransportInfo', updated, actor.userId);
    await this.auditService.log({
      action: 'UPDATE',
      entity: 'TransportInfo',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    return updated;
  }

  async archive(id: string, actor: AuditContext) {
    await this.ensureExists(id);
    const updated = await this.prisma.transportInfo.update({
      where: { id },
      data: {
        status: ContentStatus.ARCHIVED,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('TransportInfo', updated, actor.userId);
    await this.auditService.log({
      action: 'ARCHIVE',
      entity: 'TransportInfo',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    return updated;
  }

  @Cron('*/5 * * * *')
  async publishScheduled() {
    const now = new Date();
    await this.prisma.transportInfo.updateMany({
      where: { status: ContentStatus.SCHEDULED, scheduledAt: { lte: now } },
      data: { status: ContentStatus.PUBLISHED, publishedAt: now, scheduledAt: null },
    });
  }

  private async ensureExists(id: string) {
    const info = await this.prisma.transportInfo.findUnique({ where: { id } });
    if (!info) {
      throw new NotFoundException('Transport info not found');
    }
  }

  private normalizeStatus(
    input: TransportCreateInput | TransportUpdateInput,
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

    for (;;) {
      const existing = await this.prisma.transportInfo.findUnique({ where: { slug: candidate } });
      if (!existing || existing.id === excludeId) {
        return candidate;
      }
      candidate = `${slug}-${counter}`;
      counter += 1;
    }
  }
}
