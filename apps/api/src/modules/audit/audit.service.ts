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
    return this.prisma.auditLog.findMany({
      where: {
        action: params.action,
        entity: params.entity,
        userId: params.userId,
      },
      orderBy: { createdAt: 'desc' },
      take: params.take ?? 50,
      skip: params.skip ?? 0,
    });
  }
}
