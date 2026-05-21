import { Injectable } from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(entry: {
    action: AuditAction;
    userId: string;
    entity?: string;
    entityId?: string;
    metadata?: Prisma.JsonValue;
    ip?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        action: entry.action,
        userId: entry.userId,
        entity: entry.entity,
        entityId: entry.entityId,
        metadata: entry.metadata ?? undefined,
        ip: entry.ip,
        userAgent: entry.userAgent,
      },
    });
  }

  async list(params: {
    action?: AuditAction;
    entity?: string;
    userId?: string;
    take?: number;
    skip?: number;
  }) {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        action: params.action,
        entity: params.entity,
        userId: params.userId,
      },
      orderBy: { createdAt: 'desc' },
      take: params.take ?? 50,
      skip: params.skip ?? 0,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    const idsByEntity = logs.reduce<Record<string, Set<string>>>((acc, log) => {
      if (log.entity && log.entityId) {
        if (!acc[log.entity]) acc[log.entity] = new Set<string>();
        acc[log.entity].add(log.entityId);
      }
      return acc;
    }, {});

    const buildMap = (rows: { id: string; title: string }[]) =>
      rows.reduce<Record<string, string>>((acc, row) => {
        acc[row.id] = row.title;
        return acc;
      }, {});

    const titleMaps: Record<string, Record<string, string>> = {};

    if (idsByEntity.Article?.size) {
      const rows = await this.prisma.article.findMany({
        where: { id: { in: Array.from(idsByEntity.Article) } },
        select: { id: true, title: true },
      });
      titleMaps.Article = buildMap(rows);
    }
    if (idsByEntity.Event?.size) {
      const rows = await this.prisma.event.findMany({
        where: { id: { in: Array.from(idsByEntity.Event) } },
        select: { id: true, title: true },
      });
      titleMaps.Event = buildMap(rows);
    }
    if (idsByEntity.Media?.size) {
      const rows = await this.prisma.media.findMany({
        where: { id: { in: Array.from(idsByEntity.Media) } },
        select: { id: true, filename: true },
      });
      titleMaps.Media = rows.reduce<Record<string, string>>((acc, row) => {
        acc[row.id] = row.filename;
        return acc;
      }, {});
    }
    if (idsByEntity.DirectoryEntry?.size) {
      const rows = await this.prisma.directoryEntry.findMany({
        where: { id: { in: Array.from(idsByEntity.DirectoryEntry) } },
        select: { id: true, name: true },
      });
      titleMaps.DirectoryEntry = rows.reduce<Record<string, string>>((acc, row) => {
        acc[row.id] = row.name;
        return acc;
      }, {});
    }
    if (idsByEntity.Procedure?.size) {
      const rows = await this.prisma.procedure.findMany({
        where: { id: { in: Array.from(idsByEntity.Procedure) } },
        select: { id: true, title: true },
      });
      titleMaps.Procedure = buildMap(rows);
    }
    if (idsByEntity.CouncilMember?.size) {
      const rows = await this.prisma.councilMember.findMany({
        where: { id: { in: Array.from(idsByEntity.CouncilMember) } },
        select: { id: true, name: true },
      });
      titleMaps.CouncilMember = rows.reduce<Record<string, string>>((acc, row) => {
        acc[row.id] = row.name;
        return acc;
      }, {});
    }
    if (idsByEntity.MunicipalService?.size) {
      const rows = await this.prisma.municipalService.findMany({
        where: { id: { in: Array.from(idsByEntity.MunicipalService) } },
        select: { id: true, name: true },
      });
      titleMaps.MunicipalService = rows.reduce<Record<string, string>>((acc, row) => {
        acc[row.id] = row.name;
        return acc;
      }, {});
    }
    if (idsByEntity.TransportInfo?.size) {
      const rows = await this.prisma.transportInfo.findMany({
        where: { id: { in: Array.from(idsByEntity.TransportInfo) } },
        select: { id: true, title: true },
      });
      titleMaps.TransportInfo = buildMap(rows);
    }
    if (idsByEntity.User?.size) {
      const rows = await this.prisma.user.findMany({
        where: { id: { in: Array.from(idsByEntity.User) } },
        select: { id: true, firstName: true, lastName: true },
      });
      titleMaps.User = rows.reduce<Record<string, string>>((acc, row) => {
        acc[row.id] = `${row.firstName} ${row.lastName}`;
        return acc;
      }, {});
    }

    return logs.map((log) => ({
      ...log,
      entityType: log.entity,
      entityTitle: log.entity && log.entityId ? titleMaps[log.entity]?.[log.entityId] : undefined,
    }));
  }
}
