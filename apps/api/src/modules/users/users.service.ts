import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload } from '../auth/auth.types';
import { UserCreateInput, UserUpdateInput } from './dto/users.schemas';

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  role: true,
  mfaEnabled: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private isPrivilegedRole(role: UserRole) {
    return role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN_MAIRIE;
  }

  private assertRoleMutationAllowed(
    actor: JwtPayload,
    targetRole?: UserRole,
    existingRole?: UserRole,
  ) {
    if (actor.role === UserRole.SUPER_ADMIN) {
      return;
    }

    if (existingRole && this.isPrivilegedRole(existingRole)) {
      throw new ForbiddenException('Only SUPER_ADMIN can modify privileged accounts');
    }

    if (targetRole && this.isPrivilegedRole(targetRole)) {
      throw new ForbiddenException('Only SUPER_ADMIN can assign privileged roles');
    }
  }

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

  async create(input: UserCreateInput, actor: JwtPayload) {
    const existing = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const targetRole = (input.role ?? UserRole.READER) as UserRole;
    this.assertRoleMutationAllowed(actor, targetRole);

    const passwordHash = await this.hashPassword(input.password);
    return this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        avatarUrl: input.avatarUrl ?? null,
        role: targetRole,
        isActive: input.isActive ?? true,
      },
      select: userSelect,
    });
  }

  async update(id: string, input: UserUpdateInput, actor: JwtPayload) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    this.assertRoleMutationAllowed(actor, input.role as UserRole | undefined, existing.role);

    if (input.email && input.email !== existing.email) {
      const emailExists = await this.prisma.user.findUnique({ where: { email: input.email } });
      if (emailExists) {
        throw new BadRequestException('Email already exists');
      }
    }

    const shouldDeactivate = input.isActive === false && existing.isActive;
    const shouldRevokeSessions = shouldDeactivate || Boolean(input.password);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        email: input.email ?? existing.email,
        firstName: input.firstName ?? existing.firstName,
        lastName: input.lastName ?? existing.lastName,
        avatarUrl: input.avatarUrl !== undefined ? input.avatarUrl : existing.avatarUrl,
        role: input.role ?? existing.role,
        isActive: input.isActive ?? existing.isActive,
        passwordHash: input.password ? await this.hashPassword(input.password) : existing.passwordHash,
      },
      select: userSelect,
    });

    if (shouldRevokeSessions) {
      await this.prisma.session.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    return updatedUser;
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
