import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AgendaType, ContentStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { VersionService } from '../audit/version.service';
import { AuditContext } from '../audit/audit.types';
import {
  AgendaCreateInput,
  AgendaScheduleInput,
  AgendaUpdateInput,
} from './dto/agenda.schemas';

@Injectable()
export class AgendaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly versionService: VersionService,
  ) {}

  async listPublished(params: { type?: AgendaType; from?: string; to?: string }) {
    const where: Prisma.AgendaItemWhereInput = {
      status: ContentStatus.PUBLISHED,
      publishedAt: { lte: new Date() },
    };

    if (params.type) {
      where.agendaType = params.type;
    }

    if (params.from) {
      where.startsAt = { ...(where.startsAt as object), gte: new Date(params.from) };
    }

    if (params.to) {
      where.startsAt = { ...(where.startsAt as object), lte: new Date(params.to) };
    }

    return this.prisma.agendaItem.findMany({
      where,
      orderBy: { startsAt: 'asc' },
    });
  }

  async listAll(params: { status?: ContentStatus; search?: string; type?: AgendaType }) {
    const where: Prisma.AgendaItemWhereInput = {};
    if (params.status) {
      where.status = params.status;
    }
    if (params.type) {
      where.agendaType = params.type;
    }
    if (params.search) {
      where.title = { contains: params.search, mode: 'insensitive' };
    }

    return this.prisma.agendaItem.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getById(id: string) {
    const item = await this.prisma.agendaItem.findUnique({ where: { id } });
    if (!item || item.status !== ContentStatus.PUBLISHED) {
      throw new NotFoundException('Agenda item not found');
    }
    return item;
  }

  async create(input: AgendaCreateInput, actor: AuditContext) {
    const { status, publishedAt, scheduledAt } = this.normalizeStatus(input);

    const item = await this.prisma.agendaItem.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        agendaType: input.agendaType,
        startsAt: new Date(input.startsAt),
        endsAt: input.endsAt ? new Date(input.endsAt) : null,
        isAllDay: input.isAllDay ?? false,
        recurrenceRule: input.recurrenceRule ?? null,
        status,
        publishedAt,
        scheduledAt,
        createdById: actor.userId,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('AgendaItem', item, actor.userId);
    await this.auditService.log({
      action: 'CREATE',
      entity: 'AgendaItem',
      entityId: item.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    return item;
  }

  async update(id: string, input: AgendaUpdateInput, actor: AuditContext) {
    const item = await this.prisma.agendaItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Agenda item not found');
    }

    const { status, publishedAt, scheduledAt } = this.normalizeStatus(input, item);

    const updated = await this.prisma.agendaItem.update({
      where: { id },
      data: {
        title: input.title ?? item.title,
        description: input.description !== undefined ? input.description : item.description,
        agendaType: input.agendaType ?? item.agendaType,
        startsAt: input.startsAt ? new Date(input.startsAt) : item.startsAt,
        endsAt: input.endsAt ? new Date(input.endsAt) : item.endsAt,
        isAllDay: input.isAllDay ?? item.isAllDay,
        recurrenceRule:
          input.recurrenceRule !== undefined ? input.recurrenceRule : item.recurrenceRule,
        status,
        publishedAt,
        scheduledAt,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('AgendaItem', updated, actor.userId);
    await this.auditService.log({
      action: 'UPDATE',
      entity: 'AgendaItem',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    return updated;
  }

  async remove(id: string, actor: AuditContext) {
    const item = await this.prisma.agendaItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Agenda item not found');
    }

    await this.auditService.log({
      action: 'DELETE',
      entity: 'AgendaItem',
      entityId: item.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    return this.prisma.agendaItem.delete({ where: { id } });
  }

  async publish(id: string, actor: AuditContext) {
    await this.ensureExists(id);
    const updated = await this.prisma.agendaItem.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        scheduledAt: null,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('AgendaItem', updated, actor.userId);
    await this.auditService.log({
      action: 'PUBLISH',
      entity: 'AgendaItem',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    return updated;
  }

  async schedule(id: string, input: AgendaScheduleInput, actor: AuditContext) {
    await this.ensureExists(id);
    const updated = await this.prisma.agendaItem.update({
      where: { id },
      data: {
        status: ContentStatus.SCHEDULED,
        scheduledAt: new Date(input.scheduledAt),
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('AgendaItem', updated, actor.userId);
    await this.auditService.log({
      action: 'UPDATE',
      entity: 'AgendaItem',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    return updated;
  }

  async archive(id: string, actor: AuditContext) {
    await this.ensureExists(id);
    const updated = await this.prisma.agendaItem.update({
      where: { id },
      data: {
        status: ContentStatus.ARCHIVED,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('AgendaItem', updated, actor.userId);
    await this.auditService.log({
      action: 'ARCHIVE',
      entity: 'AgendaItem',
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
    await this.prisma.agendaItem.updateMany({
      where: { status: ContentStatus.SCHEDULED, scheduledAt: { lte: now } },
      data: { status: ContentStatus.PUBLISHED, publishedAt: now, scheduledAt: null },
    });
  }

  private async ensureExists(id: string) {
    const item = await this.prisma.agendaItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Agenda item not found');
    }
  }

  private normalizeStatus(
    input: AgendaCreateInput | AgendaUpdateInput,
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
}
