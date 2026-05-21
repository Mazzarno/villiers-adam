import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ContentStatus, CouncilMemberRole, Prisma } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { VersionService } from '../audit/version.service';
import { AuditContext } from '../audit/audit.types';
import {
  CouncilCreateInput,
  CouncilScheduleInput,
  CouncilUpdateInput,
} from './dto/council.schemas';

@Injectable()
export class CouncilService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly versionService: VersionService,
  ) {}

  async listPublished(params: { role?: CouncilMemberRole } = {}) {
    const now = new Date();
    const where: Prisma.CouncilMemberWhereInput = {
      status: ContentStatus.PUBLISHED,
      OR: [{ publishedAt: { lte: now } }, { publishedAt: null }],
    };
    if (params.role) {
      where.role = params.role;
    }
    return this.prisma.councilMember.findMany({
      where,
      orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }],
      include: { photoMedia: true },
    });
  }

  async listAll(params: { status?: ContentStatus; search?: string; role?: CouncilMemberRole }) {
    const where: Prisma.CouncilMemberWhereInput = {};
    if (params.status) {
      where.status = params.status;
    }
    if (params.search) {
      where.name = { contains: params.search, mode: 'insensitive' };
    }
    if (params.role) {
      where.role = params.role;
    }
    return this.prisma.councilMember.findMany({
      where,
      orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }],
      include: { photoMedia: true },
    });
  }

  async getById(id: string) {
    const member = await this.prisma.councilMember.findUnique({
      where: { id },
      include: { photoMedia: true },
    });
    if (!member) {
      throw new NotFoundException('Council member not found');
    }
    return member;
  }

  async create(input: CouncilCreateInput, actor: AuditContext) {
    const { status, publishedAt, scheduledAt } = this.normalizeStatus(input);
    const member = await this.prisma.councilMember.create({
      data: {
        name: input.name,
        role: input.role,
        roleTitle: input.roleTitle ?? null,
        delegations: input.delegations ?? null,
        bio: input.bio ?? null,
        email: input.email ?? null,
        phone: input.phone ?? null,
        order: input.order ?? 0,
        status,
        publishedAt,
        scheduledAt,
        photoMediaId: input.photoMediaId ?? null,
        createdById: actor.userId,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('CouncilMember', member, actor.userId);
    await this.auditService.log({
      action: 'CREATE',
      entity: 'CouncilMember',
      entityId: member.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    return member;
  }

  async update(id: string, input: CouncilUpdateInput, actor: AuditContext) {
    const member = await this.prisma.councilMember.findUnique({ where: { id } });
    if (!member) {
      throw new NotFoundException('Council member not found');
    }

    const { status, publishedAt, scheduledAt } = this.normalizeStatus(input, member);
    const updated = await this.prisma.councilMember.update({
      where: { id },
      data: {
        name: input.name ?? member.name,
        role: input.role ?? member.role,
        roleTitle: input.roleTitle !== undefined ? input.roleTitle : member.roleTitle,
        delegations: input.delegations !== undefined ? input.delegations : member.delegations,
        bio: input.bio !== undefined ? input.bio : member.bio,
        email: input.email !== undefined ? input.email : member.email,
        phone: input.phone !== undefined ? input.phone : member.phone,
        order: input.order !== undefined ? input.order : member.order,
        status,
        publishedAt,
        scheduledAt,
        photoMediaId:
          input.photoMediaId !== undefined ? input.photoMediaId : member.photoMediaId,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('CouncilMember', updated, actor.userId);
    await this.auditService.log({
      action: 'UPDATE',
      entity: 'CouncilMember',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    return updated;
  }

  async remove(id: string, actor: AuditContext) {
    const member = await this.prisma.councilMember.findUnique({ where: { id } });
    if (!member) {
      throw new NotFoundException('Council member not found');
    }

    await this.auditService.log({
      action: 'DELETE',
      entity: 'CouncilMember',
      entityId: member.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    return this.prisma.councilMember.delete({ where: { id } });
  }

  @Cron('*/5 * * * *')
  async publishScheduled() {
    const now = new Date();
    await this.prisma.councilMember.updateMany({
      where: { status: ContentStatus.SCHEDULED, scheduledAt: { lte: now } },
      data: { status: ContentStatus.PUBLISHED, publishedAt: now, scheduledAt: null },
    });
  }

  async publish(id: string, actor: AuditContext) {
    await this.ensureExists(id);
    const updated = await this.prisma.councilMember.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        scheduledAt: null,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('CouncilMember', updated, actor.userId);
    await this.auditService.log({
      action: 'PUBLISH',
      entity: 'CouncilMember',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    return updated;
  }

  async schedule(id: string, input: CouncilScheduleInput, actor: AuditContext) {
    await this.ensureExists(id);
    const updated = await this.prisma.councilMember.update({
      where: { id },
      data: {
        status: ContentStatus.SCHEDULED,
        scheduledAt: new Date(input.scheduledAt),
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('CouncilMember', updated, actor.userId);
    await this.auditService.log({
      action: 'UPDATE',
      entity: 'CouncilMember',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    return updated;
  }

  async archive(id: string, actor: AuditContext) {
    await this.ensureExists(id);
    const updated = await this.prisma.councilMember.update({
      where: { id },
      data: {
        status: ContentStatus.ARCHIVED,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('CouncilMember', updated, actor.userId);
    await this.auditService.log({
      action: 'ARCHIVE',
      entity: 'CouncilMember',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    return updated;
  }

  private async ensureExists(id: string) {
    const member = await this.prisma.councilMember.findUnique({ where: { id } });
    if (!member) {
      throw new NotFoundException('Council member not found');
    }
  }

  private normalizeStatus(
    input: CouncilCreateInput | CouncilUpdateInput,
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
