import { Injectable, NotFoundException } from '@nestjs/common';
import { slugify } from '@villiers-adam/shared';

import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateRoomInput, UpdateRoomInput } from './dto';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  // Public - pour le site web
  async findAllActive() {
    return this.prisma.room.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOneBySlug(slug: string) {
    const room = await this.prisma.room.findUnique({
      where: { slug },
    });
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return room;
  }

  // Admin - gestion complète
  async findAll() {
    return this.prisma.room.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { reservations: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        _count: {
          select: { reservations: true },
        },
      },
    });
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return room;
  }

  async create(data: CreateRoomInput) {
    const slug = data.slug || this.generateSlug(data.name);

    return this.prisma.room.create({
      data: {
        ...data,
        slug,
      },
    });
  }

  async update(id: string, data: UpdateRoomInput) {
    await this.ensureExists(id);

    return this.prisma.room.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.ensureExists(id);

    return this.prisma.room.delete({
      where: { id },
    });
  }

  private async ensureExists(id: string) {
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) {
      throw new NotFoundException('Room not found');
    }
  }

  private generateSlug(name: string): string {
    return slugify(name);
  }
}
