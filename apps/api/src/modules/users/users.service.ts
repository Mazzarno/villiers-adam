import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';
import { UserCreateInput, UserUpdateInput } from './dto/users.schemas';

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  mfaEnabled: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.user.findMany({ select: userSelect, orderBy: { createdAt: 'desc' } });
  }

  async getById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: userSelect });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(input: UserCreateInput) {
    const existing = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const passwordHash = await this.hashPassword(input.password);
    return this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role ?? 'READER',
        isActive: input.isActive ?? true,
      },
      select: userSelect,
    });
  }

  async update(id: string, input: UserUpdateInput) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    if (input.email && input.email !== existing.email) {
      const emailExists = await this.prisma.user.findUnique({ where: { email: input.email } });
      if (emailExists) {
        throw new BadRequestException('Email already exists');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        email: input.email ?? existing.email,
        firstName: input.firstName ?? existing.firstName,
        lastName: input.lastName ?? existing.lastName,
        role: input.role ?? existing.role,
        isActive: input.isActive ?? existing.isActive,
        passwordHash: input.password ? await this.hashPassword(input.password) : existing.passwordHash,
      },
      select: userSelect,
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('User not found');
    }
    return this.prisma.user.delete({ where: { id }, select: userSelect });
  }

  private async hashPassword(password: string) {
    const { hash } = await import('argon2');
    return hash(password);
  }
}
