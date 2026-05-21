import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { slugify } from '@villiers-adam/shared';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { VersionService } from '../../audit/version.service';
import { AuditContext } from '../../audit/audit.types';
import { SearchService } from '../../search/search.service';
import {
  EventCreateInput,
  EventScheduleInput,
  EventUpdateInput,
} from './dto/event.schemas';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly versionService: VersionService,
    private readonly searchService: SearchService,
  ) {}

  async listPublished() {
    const now = new Date();
    return this.prisma.event.findMany({
      where: {
        status: ContentStatus.PUBLISHED,
        OR: [{ publishedAt: { lte: now } }, { publishedAt: null }],
      },
      orderBy: { startsAt: 'asc' },
      include: { coverMedia: true },
    });
  }

  async listAll(params: { status?: ContentStatus; search?: string }) {
    const where: Prisma.EventWhereInput = {};
    if (params.status) {
      where.status = params.status;
    }
    if (params.search) {
      where.title = { contains: params.search, mode: 'insensitive' };
    }
    return this.prisma.event.findMany({ where, orderBy: { updatedAt: 'desc' } });
  }

  async getById(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { coverMedia: true },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async getBySlug(slug: string) {
    const event = await this.prisma.event.findUnique({
      where: { slug },
      include: { coverMedia: true },
    });
    if (!event || event.status !== ContentStatus.PUBLISHED) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async create(input: EventCreateInput, actor: AuditContext) {
    const baseSlug = input.slug?.trim() ? input.slug.trim() : input.title;
    const slug = await this.ensureUniqueSlug(slugify(baseSlug));
    const { status, publishedAt, scheduledAt } = this.normalizeStatus(input);

    const event = await this.prisma.event.create({
      data: {
        title: input.title,
        slug,
        summary: input.summary ?? null,
        content: input.content,
        metaTitle: input.metaTitle ?? null,
        metaDescription: input.metaDescription ?? null,
        locationName: input.locationName ?? null,
        address: input.address ?? null,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        startsAt: new Date(input.startsAt),
        endsAt: input.endsAt ? new Date(input.endsAt) : null,
        status,
        publishedAt,
        scheduledAt,
        coverMediaId: input.coverMediaId ?? null,
        createdById: actor.userId,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('Event', event, actor.userId);
    await this.auditService.log({
      action: 'CREATE',
      entity: 'Event',
      entityId: event.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    await this.searchService.upsertEvent(event);

    return event;
  }

  async update(id: string, input: EventUpdateInput, actor: AuditContext) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const slugSource = input.slug?.trim()
      ? input.slug.trim()
      : input.title
        ? input.title
        : undefined;
    const slug = slugSource
      ? await this.ensureUniqueSlug(slugify(slugSource), id)
      : undefined;
    const { status, publishedAt, scheduledAt } = this.normalizeStatus(input, event);

    const updated = await this.prisma.event.update({
      where: { id },
      data: {
        title: input.title ?? event.title,
        slug: slug ?? event.slug,
        summary: input.summary !== undefined ? input.summary : event.summary,
        content: input.content !== undefined ? input.content : event.content,
        metaTitle: input.metaTitle !== undefined ? input.metaTitle : event.metaTitle,
        metaDescription:
          input.metaDescription !== undefined ? input.metaDescription : event.metaDescription,
        locationName:
          input.locationName !== undefined ? input.locationName : event.locationName,
        address: input.address !== undefined ? input.address : event.address,
        latitude: input.latitude !== undefined ? input.latitude : event.latitude,
        longitude: input.longitude !== undefined ? input.longitude : event.longitude,
        startsAt: input.startsAt ? new Date(input.startsAt) : event.startsAt,
        endsAt: input.endsAt ? new Date(input.endsAt) : event.endsAt,
        status,
        publishedAt,
        scheduledAt,
        coverMediaId:
          input.coverMediaId !== undefined ? input.coverMediaId : event.coverMediaId,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('Event', updated, actor.userId);
    await this.auditService.log({
      action: 'UPDATE',
      entity: 'Event',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    await this.searchService.upsertEvent(updated);

    return updated;
  }

  async remove(id: string, actor: AuditContext) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    await this.auditService.log({
      action: 'DELETE',
      entity: 'Event',
      entityId: event.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    await this.searchService.remove('events', event.id);

    return this.prisma.event.delete({ where: { id } });
  }

  async publish(id: string, actor: AuditContext) {
    await this.ensureExists(id);
    const updated = await this.prisma.event.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        scheduledAt: null,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('Event', updated, actor.userId);
    await this.auditService.log({
      action: 'PUBLISH',
      entity: 'Event',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    await this.searchService.upsertEvent(updated);

    return updated;
  }

  async schedule(id: string, input: EventScheduleInput, actor: AuditContext) {
    await this.ensureExists(id);
    const updated = await this.prisma.event.update({
      where: { id },
      data: {
        status: ContentStatus.SCHEDULED,
        scheduledAt: new Date(input.scheduledAt),
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('Event', updated, actor.userId);
    await this.auditService.log({
      action: 'UPDATE',
      entity: 'Event',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    await this.searchService.upsertEvent(updated);

    return updated;
  }

  async archive(id: string, actor: AuditContext) {
    await this.ensureExists(id);
    const updated = await this.prisma.event.update({
      where: { id },
      data: {
        status: ContentStatus.ARCHIVED,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('Event', updated, actor.userId);
    await this.auditService.log({
      action: 'ARCHIVE',
      entity: 'Event',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    await this.searchService.remove('events', updated.id);

    return updated;
  }

  async publishScheduled() {
    const now = new Date();
    const ready = await this.prisma.event.findMany({
      where: { status: ContentStatus.SCHEDULED, scheduledAt: { lte: now } },
      select: { id: true },
    });

    if (ready.length === 0) {
      return;
    }

    await this.prisma.event.updateMany({
      where: { id: { in: ready.map((entry) => entry.id) } },
      data: { status: ContentStatus.PUBLISHED, publishedAt: now, scheduledAt: null },
    });

    await Promise.all(ready.map((entry) => this.searchService.upsertEvent(entry)));
  }

  private async ensureExists(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
  }

  private normalizeStatus(
    input: EventCreateInput | EventUpdateInput,
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
      const existing = await this.prisma.event.findUnique({ where: { slug: candidate } });
      if (!existing || existing.id === excludeId) {
        return candidate;
      }
      candidate = `${slug}-${counter}`;
      counter += 1;
    }
  }
}
