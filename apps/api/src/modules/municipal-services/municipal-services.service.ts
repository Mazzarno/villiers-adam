import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { slugify } from '@villiers-adam/shared';

import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { VersionService } from '../audit/version.service';
import { AuditContext } from '../audit/audit.types';
import {
  MunicipalServiceCreateInput,
  MunicipalServiceScheduleInput,
  MunicipalServiceUpdateInput,
} from './dto/municipal-services.schemas';

@Injectable()
export class MunicipalServicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly versionService: VersionService,
  ) {}

  async listPublished(params: { category?: string } = {}) {
    const where: Prisma.MunicipalServiceWhereInput = {
      status: ContentStatus.PUBLISHED,
      publishedAt: { lte: new Date() },
    };
    if (params.category) {
      where.category = params.category;
    }
    return this.prisma.municipalService.findMany({
      where,
      orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }],
      include: { coverMedia: true },
    });
  }

  async listAll(params: { status?: ContentStatus; search?: string; category?: string }) {
    const where: Prisma.MunicipalServiceWhereInput = {};
    if (params.status) {
      where.status = params.status;
    }
    if (params.search) {
      where.name = { contains: params.search, mode: 'insensitive' };
    }
    if (params.category) {
      where.category = params.category;
    }
    return this.prisma.municipalService.findMany({
      where,
      orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }],
      include: { coverMedia: true },
    });
  }

  async getById(id: string) {
    const service = await this.prisma.municipalService.findUnique({
      where: { id },
      include: { coverMedia: true },
    });
    if (!service) {
      throw new NotFoundException('Municipal service not found');
    }
    return service;
  }

  async getBySlug(slug: string) {
    const service = await this.prisma.municipalService.findUnique({
      where: { slug },
      include: { coverMedia: true },
    });
    if (!service || service.status !== ContentStatus.PUBLISHED) {
      throw new NotFoundException('Municipal service not found');
    }
    return service;
  }

  async create(input: MunicipalServiceCreateInput, actor: AuditContext) {
    const baseSlug = input.slug?.trim() ? input.slug.trim() : input.name;
    const slug = await this.ensureUniqueSlug(slugify(baseSlug));
    const { status, publishedAt, scheduledAt } = this.normalizeStatus(input);

    const service = await this.prisma.municipalService.create({
      data: {
        name: input.name,
        slug,
        description: input.description ?? null,
        category: input.category ?? null,
        openingHours: input.openingHours ?? null,
        address: input.address ?? null,
        phone: input.phone ?? null,
        email: input.email ?? null,
        website: input.website ?? null,
        order: input.order ?? 0,
        status,
        publishedAt,
        scheduledAt,
        coverMediaId: input.coverMediaId ?? null,
        createdById: actor.userId,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('MunicipalService', service, actor.userId);
    await this.auditService.log({
      action: 'CREATE',
      entity: 'MunicipalService',
      entityId: service.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    return service;
  }

  async update(id: string, input: MunicipalServiceUpdateInput, actor: AuditContext) {
    const service = await this.prisma.municipalService.findUnique({ where: { id } });
    if (!service) {
      throw new NotFoundException('Municipal service not found');
    }

    const slugSource = input.slug?.trim()
      ? input.slug.trim()
      : input.name
        ? input.name
        : undefined;
    const slug = slugSource
      ? await this.ensureUniqueSlug(slugify(slugSource), id)
      : undefined;
    const { status, publishedAt, scheduledAt } = this.normalizeStatus(input, service);

    const updated = await this.prisma.municipalService.update({
      where: { id },
      data: {
        name: input.name ?? service.name,
        slug: slug ?? service.slug,
        description: input.description !== undefined ? input.description : service.description,
        category: input.category !== undefined ? input.category : service.category,
        openingHours: input.openingHours !== undefined ? input.openingHours : service.openingHours,
        address: input.address !== undefined ? input.address : service.address,
        phone: input.phone !== undefined ? input.phone : service.phone,
        email: input.email !== undefined ? input.email : service.email,
        website: input.website !== undefined ? input.website : service.website,
        order: input.order !== undefined ? input.order : service.order,
        status,
        publishedAt,
        scheduledAt,
        coverMediaId:
          input.coverMediaId !== undefined ? input.coverMediaId : service.coverMediaId,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('MunicipalService', updated, actor.userId);
    await this.auditService.log({
      action: 'UPDATE',
      entity: 'MunicipalService',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    return updated;
  }

  async remove(id: string, actor: AuditContext) {
    const service = await this.prisma.municipalService.findUnique({ where: { id } });
    if (!service) {
      throw new NotFoundException('Municipal service not found');
    }

    await this.auditService.log({
      action: 'DELETE',
      entity: 'MunicipalService',
      entityId: service.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    return this.prisma.municipalService.delete({ where: { id } });
  }

  async publish(id: string, actor: AuditContext) {
    await this.ensureExists(id);
    const updated = await this.prisma.municipalService.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        scheduledAt: null,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('MunicipalService', updated, actor.userId);
    await this.auditService.log({
      action: 'PUBLISH',
      entity: 'MunicipalService',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    return updated;
  }

  async schedule(id: string, input: MunicipalServiceScheduleInput, actor: AuditContext) {
    await this.ensureExists(id);
    const updated = await this.prisma.municipalService.update({
      where: { id },
      data: {
        status: ContentStatus.SCHEDULED,
        scheduledAt: new Date(input.scheduledAt),
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('MunicipalService', updated, actor.userId);
    await this.auditService.log({
      action: 'UPDATE',
      entity: 'MunicipalService',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    return updated;
  }

  async archive(id: string, actor: AuditContext) {
    await this.ensureExists(id);
    const updated = await this.prisma.municipalService.update({
      where: { id },
      data: {
        status: ContentStatus.ARCHIVED,
        updatedById: actor.userId,
      },
    });

    await this.versionService.record('MunicipalService', updated, actor.userId);
    await this.auditService.log({
      action: 'ARCHIVE',
      entity: 'MunicipalService',
      entityId: updated.id,
      userId: actor.userId,
      ip: actor.ip,
      userAgent: actor.userAgent,
    });

    return updated;
  }

  private async ensureExists(id: string) {
    const service = await this.prisma.municipalService.findUnique({ where: { id } });
    if (!service) {
      throw new NotFoundException('Municipal service not found');
    }
  }

  private normalizeStatus(
    input: MunicipalServiceCreateInput | MunicipalServiceUpdateInput,
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
      const existing = await this.prisma.municipalService.findUnique({ where: { slug: candidate } });
      if (!existing || existing.id === excludeId) {
        return candidate;
      }
      candidate = `${slug}-${counter}`;
      counter += 1;
    }
  }
}
