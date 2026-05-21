import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ContentStatus, Prisma } from '@prisma/client';
import { slugify } from '@villiers-adam/shared';

import { sanitizeHttpUrl } from '../../common/security/url-sanitizer';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { VersionService } from '../audit/version.service';
import { AuditContext } from '../audit/audit.types';
import { SearchService } from '../search/search.service';
import {
  DemarchesCreateInput,
  DemarchesScheduleInput,
  DemarchesUpdateInput,
} from './dto/demarches.schemas';

@Injectable()
export class DemarchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly versionService: VersionService,
    private readonly searchService: SearchService,
  ) {}

  private sanitizeExternalUrl<T extends { externalUrl: string | null }>(procedure: T): T {
    return {
      ...procedure,
      externalUrl: sanitizeHttpUrl(procedure.externalUrl),
    };
  }

  async listPublished(search?: string) {
    const now = new Date();
    const where: Prisma.ProcedureWhereInput = {
      status: ContentStatus.PUBLISHED,
      OR: [{ publishedAt: { lte: now } }, { publishedAt: null }],
    };

    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const procedures = await this.prisma.procedure.findMany({
      where,
      orderBy: { title: 'asc' },
      include: { coverMedia: true },
    });
    return procedures.map((procedure) => this.sanitizeExternalUrl(procedure));
  }

  async listAll(params: { status?: ContentStatus; search?: string }) {
    const where: Prisma.ProcedureWhereInput = {};
    if (params.status) {
      where.status = params.status;
    }
    if (params.search) {
      where.title = { contains: params.search, mode: 'insensitive' };
    }

    const procedures = await this.prisma.procedure.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: { coverMedia: true },
    });
    return procedures.map((procedure) => this.sanitizeExternalUrl(procedure));
  }

  async getById(id: string) {
    const procedure = await this.prisma.procedure.findUnique({
      where: { id },
      include: { coverMedia: true },
    });
    if (!procedure) {
      throw new NotFoundException('Procedure not found');
    }
    return this.sanitizeExternalUrl(procedure);
  }

  async getBySlug(slug: string) {
    const procedure = await this.prisma.procedure.findUnique({
      where: { slug },
      include: { coverMedia: true },
    });
    if (!procedure || procedure.status !== ContentStatus.PUBLISHED) {
      throw new NotFoundException('Procedure not found');
    }
    return this.sanitizeExternalUrl(procedure);
  }

  async create(input: DemarchesCreateInput, actor: AuditContext) {
    const slug = await this.ensureUniqueSlug(slugify(input.title));
    const { status, publishedAt, scheduledAt } = this.normalizeStatus(input);

    const procedure = await this.prisma.procedure.create({
      data: {
        title: input.title,
        slug,
        summary: input.summary ?? null,
        content: input.content,
        steps: input.steps ?? null,
        externalUrl: sanitizeHttpUrl(input.externalUrl),
        status,
        publishedAt,
        scheduledAt,
        coverMediaId: input.coverMediaId ?? null,
        createdById: actor.userId,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('Procedure', procedure, actor.userId);
    await this.auditService.log({
      action: 'CREATE',
      entity: 'Procedure',
      entityId: procedure.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    await this.searchService.upsertProcedure(procedure);

    return this.sanitizeExternalUrl(procedure);
  }

  async update(id: string, input: DemarchesUpdateInput, actor: AuditContext) {
    const procedure = await this.prisma.procedure.findUnique({ where: { id } });
    if (!procedure) {
      throw new NotFoundException('Procedure not found');
    }

    const slug = input.title ? await this.ensureUniqueSlug(slugify(input.title), id) : undefined;
    const { status, publishedAt, scheduledAt } = this.normalizeStatus(input, procedure);

    const updated = await this.prisma.procedure.update({
      where: { id },
      data: {
        title: input.title ?? procedure.title,
        slug: slug ?? procedure.slug,
        summary: input.summary !== undefined ? input.summary : procedure.summary,
        content: input.content !== undefined ? input.content : procedure.content,
        steps: input.steps !== undefined ? input.steps : procedure.steps,
        externalUrl:
          input.externalUrl !== undefined
            ? sanitizeHttpUrl(input.externalUrl)
            : sanitizeHttpUrl(procedure.externalUrl),
        status,
        publishedAt,
        scheduledAt,
        coverMediaId:
          input.coverMediaId !== undefined ? input.coverMediaId : procedure.coverMediaId,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('Procedure', updated, actor.userId);
    await this.auditService.log({
      action: 'UPDATE',
      entity: 'Procedure',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    await this.searchService.upsertProcedure(updated);

    return this.sanitizeExternalUrl(updated);
  }

  async remove(id: string, actor: AuditContext) {
    const procedure = await this.prisma.procedure.findUnique({ where: { id } });
    if (!procedure) {
      throw new NotFoundException('Procedure not found');
    }

    await this.auditService.log({
      action: 'DELETE',
      entity: 'Procedure',
      entityId: procedure.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    await this.searchService.remove('procedures', procedure.id);

    return this.prisma.procedure.delete({ where: { id } });
  }

  async publish(id: string, actor: AuditContext) {
    await this.ensureExists(id);
    const updated = await this.prisma.procedure.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        scheduledAt: null,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('Procedure', updated, actor.userId);
    await this.auditService.log({
      action: 'PUBLISH',
      entity: 'Procedure',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    await this.searchService.upsertProcedure(updated);

    return updated;
  }

  async schedule(id: string, input: DemarchesScheduleInput, actor: AuditContext) {
    await this.ensureExists(id);
    const updated = await this.prisma.procedure.update({
      where: { id },
      data: {
        status: ContentStatus.SCHEDULED,
        scheduledAt: new Date(input.scheduledAt),
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('Procedure', updated, actor.userId);
    await this.auditService.log({
      action: 'UPDATE',
      entity: 'Procedure',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    await this.searchService.upsertProcedure(updated);

    return updated;
  }

  async archive(id: string, actor: AuditContext) {
    await this.ensureExists(id);
    const updated = await this.prisma.procedure.update({
      where: { id },
      data: {
        status: ContentStatus.ARCHIVED,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('Procedure', updated, actor.userId);
    await this.auditService.log({
      action: 'ARCHIVE',
      entity: 'Procedure',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    await this.searchService.remove('procedures', updated.id);

    return updated;
  }

  @Cron('*/5 * * * *')
  async publishScheduled() {
    const now = new Date();
    const ready = await this.prisma.procedure.findMany({
      where: { status: ContentStatus.SCHEDULED, scheduledAt: { lte: now } },
      select: { id: true },
    });

    if (ready.length === 0) {
      return;
    }

    await this.prisma.procedure.updateMany({
      where: { id: { in: ready.map((entry) => entry.id) } },
      data: { status: ContentStatus.PUBLISHED, publishedAt: now, scheduledAt: null },
    });

    await Promise.all(ready.map((entry) => this.searchService.upsertProcedure(entry)));
  }

  private async ensureExists(id: string) {
    const procedure = await this.prisma.procedure.findUnique({ where: { id } });
    if (!procedure) {
      throw new NotFoundException('Procedure not found');
    }
  }

  private normalizeStatus(
    input: DemarchesCreateInput | DemarchesUpdateInput,
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
      const existing = await this.prisma.procedure.findUnique({ where: { slug: candidate } });
      if (!existing || existing.id === excludeId) {
        return candidate;
      }
      candidate = `${slug}-${counter}`;
      counter += 1;
    }
  }
}
