import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ContentStatus, DirectoryType, Prisma } from '@prisma/client';
import { slugify } from '@villiers-adam/shared';

import { sanitizeHttpUrl } from '../../common/security/url-sanitizer';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { VersionService } from '../audit/version.service';
import { AuditContext } from '../audit/audit.types';
import { SearchService } from '../search/search.service';
import {
  AnnuaireCreateInput,
  AnnuaireScheduleInput,
  AnnuaireUpdateInput,
} from './dto/annuaire.schemas';

@Injectable()
export class AnnuaireService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly versionService: VersionService,
    private readonly searchService: SearchService,
  ) {}

  private sanitizeWebsite<T extends { website: string | null }>(entry: T): T {
    return {
      ...entry,
      website: sanitizeHttpUrl(entry.website),
    };
  }

  async listPublished(params: { type?: DirectoryType; search?: string }) {
    const now = new Date();
    const where: Prisma.DirectoryEntryWhereInput = {
      status: ContentStatus.PUBLISHED,
      OR: [{ publishedAt: { lte: now } }, { publishedAt: null }],
    };

    if (params.type) {
      where.type = params.type;
    }

    if (params.search) {
      where.name = { contains: params.search, mode: 'insensitive' };
    }

    const entries = await this.prisma.directoryEntry.findMany({
      where,
      orderBy: { name: 'asc' },
      include: { coverMedia: true },
    });
    return entries.map((entry) => this.sanitizeWebsite(entry));
  }

  async listAll(params: { status?: ContentStatus; search?: string; type?: DirectoryType }) {
    const where: Prisma.DirectoryEntryWhereInput = {};
    if (params.status) {
      where.status = params.status;
    }
    if (params.type) {
      where.type = params.type;
    }
    if (params.search) {
      where.name = { contains: params.search, mode: 'insensitive' };
    }

    const entries = await this.prisma.directoryEntry.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
    return entries.map((entry) => this.sanitizeWebsite(entry));
  }

  async getBySlug(slug: string) {
    const entry = await this.prisma.directoryEntry.findUnique({
      where: { slug },
      include: { coverMedia: true },
    });
    if (!entry || entry.status !== ContentStatus.PUBLISHED) {
      throw new NotFoundException('Entry not found');
    }
    return this.sanitizeWebsite(entry);
  }

  async create(input: AnnuaireCreateInput, actor: AuditContext) {
    const slug = await this.ensureUniqueSlug(slugify(input.name));
    const { status, publishedAt, scheduledAt } = this.normalizeStatus(input);

    const entry = await this.prisma.directoryEntry.create({
      data: {
        name: input.name,
        slug,
        type: input.type,
        description: input.description ?? null,
        phone: input.phone ?? null,
        email: input.email ?? null,
        website: sanitizeHttpUrl(input.website),
        addressLine1: input.addressLine1 ?? null,
        addressLine2: input.addressLine2 ?? null,
        postalCode: input.postalCode ?? null,
        city: input.city ?? null,
        country: input.country ?? null,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        openingHours: input.openingHours ?? null,
        status,
        publishedAt,
        scheduledAt,
        coverMediaId: input.coverMediaId ?? null,
        createdById: actor.userId,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('DirectoryEntry', entry, actor.userId);
    await this.auditService.log({
      action: 'CREATE',
      entity: 'DirectoryEntry',
      entityId: entry.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    await this.searchService.upsertDirectory(entry);

    return this.sanitizeWebsite(entry);
  }

  async update(id: string, input: AnnuaireUpdateInput, actor: AuditContext) {
    const entry = await this.prisma.directoryEntry.findUnique({ where: { id } });
    if (!entry) {
      throw new NotFoundException('Entry not found');
    }

    const slug = input.name ? await this.ensureUniqueSlug(slugify(input.name), id) : undefined;
    const { status, publishedAt, scheduledAt } = this.normalizeStatus(input, entry);

    const updated = await this.prisma.directoryEntry.update({
      where: { id },
      data: {
        name: input.name ?? entry.name,
        slug: slug ?? entry.slug,
        type: input.type ?? entry.type,
        description: input.description !== undefined ? input.description : entry.description,
        phone: input.phone !== undefined ? input.phone : entry.phone,
        email: input.email !== undefined ? input.email : entry.email,
        website:
          input.website !== undefined
            ? sanitizeHttpUrl(input.website)
            : sanitizeHttpUrl(entry.website),
        addressLine1: input.addressLine1 !== undefined ? input.addressLine1 : entry.addressLine1,
        addressLine2: input.addressLine2 !== undefined ? input.addressLine2 : entry.addressLine2,
        postalCode: input.postalCode !== undefined ? input.postalCode : entry.postalCode,
        city: input.city !== undefined ? input.city : entry.city,
        country: input.country !== undefined ? input.country : entry.country,
        latitude: input.latitude !== undefined ? input.latitude : entry.latitude,
        longitude: input.longitude !== undefined ? input.longitude : entry.longitude,
        openingHours: input.openingHours !== undefined ? input.openingHours : entry.openingHours,
        status,
        publishedAt,
        scheduledAt,
        coverMediaId:
          input.coverMediaId !== undefined ? input.coverMediaId : entry.coverMediaId,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('DirectoryEntry', updated, actor.userId);
    await this.auditService.log({
      action: 'UPDATE',
      entity: 'DirectoryEntry',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    await this.searchService.upsertDirectory(updated);

    return this.sanitizeWebsite(updated);
  }

  async remove(id: string, actor: AuditContext) {
    const entry = await this.prisma.directoryEntry.findUnique({ where: { id } });
    if (!entry) {
      throw new NotFoundException('Entry not found');
    }

    await this.auditService.log({
      action: 'DELETE',
      entity: 'DirectoryEntry',
      entityId: entry.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    await this.searchService.remove('directory', entry.id);

    return this.prisma.directoryEntry.delete({ where: { id } });
  }

  async publish(id: string, actor: AuditContext) {
    await this.ensureExists(id);
    const updated = await this.prisma.directoryEntry.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        scheduledAt: null,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('DirectoryEntry', updated, actor.userId);
    await this.auditService.log({
      action: 'PUBLISH',
      entity: 'DirectoryEntry',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    await this.searchService.upsertDirectory(updated);

    return updated;
  }

  async schedule(id: string, input: AnnuaireScheduleInput, actor: AuditContext) {
    await this.ensureExists(id);
    const updated = await this.prisma.directoryEntry.update({
      where: { id },
      data: {
        status: ContentStatus.SCHEDULED,
        scheduledAt: new Date(input.scheduledAt),
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('DirectoryEntry', updated, actor.userId);
    await this.auditService.log({
      action: 'UPDATE',
      entity: 'DirectoryEntry',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    await this.searchService.upsertDirectory(updated);

    return updated;
  }

  async archive(id: string, actor: AuditContext) {
    await this.ensureExists(id);
    const updated = await this.prisma.directoryEntry.update({
      where: { id },
      data: {
        status: ContentStatus.ARCHIVED,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('DirectoryEntry', updated, actor.userId);
    await this.auditService.log({
      action: 'ARCHIVE',
      entity: 'DirectoryEntry',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    await this.searchService.remove('directory', updated.id);

    return updated;
  }

  @Cron('*/5 * * * *')
  async publishScheduled() {
    const now = new Date();
    const ready = await this.prisma.directoryEntry.findMany({
      where: { status: ContentStatus.SCHEDULED, scheduledAt: { lte: now } },
      select: { id: true },
    });

    if (ready.length === 0) {
      return;
    }

    await this.prisma.directoryEntry.updateMany({
      where: { id: { in: ready.map((entry) => entry.id) } },
      data: { status: ContentStatus.PUBLISHED, publishedAt: now, scheduledAt: null },
    });

    await Promise.all(ready.map((entry) => this.searchService.upsertDirectory(entry)));
  }

  private async ensureExists(id: string) {
    const entry = await this.prisma.directoryEntry.findUnique({ where: { id } });
    if (!entry) {
      throw new NotFoundException('Entry not found');
    }
  }

  private normalizeStatus(
    input: AnnuaireCreateInput | AnnuaireUpdateInput,
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
      const existing = await this.prisma.directoryEntry.findUnique({ where: { slug: candidate } });
      if (!existing || existing.id === excludeId) {
        return candidate;
      }
      candidate = `${slug}-${counter}`;
      counter += 1;
    }
  }
}
