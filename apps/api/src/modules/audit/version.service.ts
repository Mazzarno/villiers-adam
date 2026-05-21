import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';

type Snapshot = Record<string, unknown>;

@Injectable()
export class VersionService {
  constructor(private readonly prisma: PrismaService) {}

  async record(entityType: string, entity: { id: string }, userId: string) {
    const latest = await this.prisma.version.findFirst({
      where: { entityType, entityId: entity.id },
      orderBy: { versionNumber: 'desc' },
    });
    const versionNumber = latest ? latest.versionNumber + 1 : 1;
    const snapshot = JSON.parse(JSON.stringify(entity)) as Prisma.InputJsonValue;

    return this.prisma.version.create({
      data: {
        entityType,
        entityId: entity.id,
        versionNumber,
        snapshot,
        createdById: userId,
      },
    });
  }

  async list(entityType: string, entityId: string) {
    return this.prisma.version.findMany({
      where: { entityType, entityId },
      orderBy: { versionNumber: 'desc' },
    });
  }

  async restore(versionId: string) {
    const version = await this.prisma.version.findUnique({ where: { id: versionId } });
    if (!version) {
      throw new NotFoundException('Version not found');
    }

    const snapshot = this.sanitizeSnapshot(version.snapshot as Snapshot);

    switch (version.entityType) {
      case 'Article':
        return this.prisma.article.update({
          where: { id: version.entityId },
          data: snapshot as Prisma.ArticleUpdateInput,
        });
      case 'Event':
        return this.prisma.event.update({
          where: { id: version.entityId },
          data: snapshot as Prisma.EventUpdateInput,
        });
      case 'DirectoryEntry':
        return this.prisma.directoryEntry.update({
          where: { id: version.entityId },
          data: snapshot as Prisma.DirectoryEntryUpdateInput,
        });
      case 'Procedure':
        return this.prisma.procedure.update({
          where: { id: version.entityId },
          data: snapshot as Prisma.ProcedureUpdateInput,
        });
      case 'CouncilMember':
        return this.prisma.councilMember.update({
          where: { id: version.entityId },
          data: snapshot as Prisma.CouncilMemberUpdateInput,
        });
      case 'MunicipalService':
        return this.prisma.municipalService.update({
          where: { id: version.entityId },
          data: snapshot as Prisma.MunicipalServiceUpdateInput,
        });
      case 'TransportInfo':
        return this.prisma.transportInfo.update({
          where: { id: version.entityId },
          data: snapshot as Prisma.TransportInfoUpdateInput,
        });
      default:
        throw new BadRequestException('Unsupported entity type');
    }
  }

  private sanitizeSnapshot(snapshot: Snapshot) {
    const { id, createdAt, updatedAt, ...rest } = snapshot;
    void id;
    void createdAt;
    void updatedAt;
    return rest;
  }
}
