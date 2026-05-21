import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { createHash, randomBytes } from 'node:crypto';

import { PrismaService } from '../../common/prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { AuditService } from '../audit/audit.service';
import { AuditContext } from '../audit/audit.types';
import {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  LogoutInput,
  MfaConfirmInput,
  MfaDisableInput,
  MfaVerifyInput,
  RefreshInput,
  RegisterInput,
  ResetPasswordInput,
} from './dto/auth.schemas';
import { JwtPayload } from './auth.types';

const ACCESS_TOKEN_TTL = '15m';
const MFA_TOKEN_TTL = '5m';
const REFRESH_TOKEN_DAYS = 7;
const RESET_TOKEN_MINUTES = 60;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly auditService: AuditService,
  ) {}

  async register(input: RegisterInput, actor?: AuditContext) {
    const publicRegistrationEnabled =
      this.configService.get<boolean>('PUBLIC_REGISTRATION_ENABLED') ?? false;
    if (!publicRegistrationEnabled) {
      throw new ForbiddenException('Public registration is disabled');
    }

    const expectedRegistrationToken = this.configService.get<string>('PUBLIC_REGISTRATION_TOKEN');
    if (expectedRegistrationToken) {
      if (!input.registrationToken || input.registrationToken !== expectedRegistrationToken) {
        throw new ForbiddenException('Invalid registration token');
      }
    }

    const existing = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash: await this.hashPassword(input.password),
        firstName: input.firstName,
        lastName: input.lastName,
        role: UserRole.READER,
      },
    });

    if (actor) {
      await this.auditService.log({
        action: 'CREATE',
        entity: 'User',
        entityId: user.id,
        userId: actor.userId,
        ip: actor.ip,
        userAgent: actor.userAgent,
      });
    }

    return { id: user.id, email: user.email, role: user.role };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        role: true,
        mfaEnabled: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async changePassword(userId: string, input: ChangePasswordInput, actor?: AuditContext) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isActive: true, passwordHash: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isCurrentPasswordValid = await this.verifyPassword(
      input.currentPassword,
      user.passwordHash,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (input.currentPassword === input.newPassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    const nextPasswordHash = await this.hashPassword(input.newPassword);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: nextPasswordHash },
      }),
      this.prisma.session.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    if (actor) {
      await this.auditService.log({
        action: 'UPDATE',
        entity: 'User',
        entityId: user.id,
        userId: actor.userId,
        ip: actor.ip,
        userAgent: actor.userAgent,
      });
    }

    return { success: true };
  }

  async login(input: LoginInput, actor?: AuditContext) {
    const user = await this.validateUser(input.email, input.password);
    if (user.mfaEnabled) {
      return {
        requireMfa: true,
        mfaToken: this.createMfaToken(user),
      };
    }

    const tokens = await this.issueTokens(user, true);
    if (actor) {
      await this.auditService.log({
        action: 'LOGIN',
        entity: 'User',
        entityId: user.id,
        userId: user.id,
        ip: actor.ip,
        userAgent: actor.userAgent,
      });
    }

    return tokens;
  }

  async verifyMfa(input: MfaVerifyInput, actor?: AuditContext) {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(input.mfaToken);
    } catch (error) {
      throw new UnauthorizedException('Invalid MFA token');
    }

    if (payload.type !== 'mfa') {
      throw new UnauthorizedException('Invalid MFA token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive || !user.mfaSecret || !user.mfaEnabled) {
      throw new UnauthorizedException('MFA not enabled');
    }

    const isValid = authenticator.verify({ token: input.code, secret: user.mfaSecret });
    if (!isValid) {
      throw new UnauthorizedException('Invalid MFA code');
    }

    const tokens = await this.issueTokens(user, true);
    if (actor) {
      await this.auditService.log({
        action: 'LOGIN',
        entity: 'User',
        entityId: user.id,
        userId: user.id,
        ip: actor.ip,
        userAgent: actor.userAgent,
      });
    }

    return tokens;
  }

  async enableMfa(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }

    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, 'Villiers-Adam', secret);
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: secret, mfaEnabled: false },
    });

    return { secret, otpauthUrl, qrCodeDataUrl };
  }

  async confirmMfa(userId: string, input: MfaConfirmInput) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive || !user.mfaSecret) {
      throw new BadRequestException('MFA not initialized');
    }

    const isValid = authenticator.verify({ token: input.code, secret: user.mfaSecret });
    if (!isValid) {
      throw new UnauthorizedException('Invalid MFA code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: true },
    });

    return { enabled: true };
  }

  async disableMfa(userId: string, input: MfaDisableInput) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive || !user.mfaSecret || !user.mfaEnabled) {
      throw new BadRequestException('MFA not enabled');
    }

    const isValid = authenticator.verify({ token: input.code, secret: user.mfaSecret });
    if (!isValid) {
      throw new UnauthorizedException('Invalid MFA code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: false, mfaSecret: null },
    });

    return { disabled: true };
  }

  async refresh(input: RefreshInput) {
    if (!input.refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const session = await this.findSession(input.refreshToken);
    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = await this.prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || !user.isActive) {
      await this.prisma.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('User not found');
    }

    await this.prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(user, true);
  }

  async logout(input: LogoutInput, actor?: AuditContext) {
    if (input.refreshToken) {
      const session = await this.findSession(input.refreshToken);
      if (session && !session.revokedAt) {
        await this.prisma.session.update({
          where: { id: session.id },
          data: { revokedAt: new Date() },
        });
      }
    }

    if (actor && actor.userId !== 'unknown') {
      await this.auditService.log({
        action: 'LOGOUT',
        entity: 'User',
        entityId: actor.userId,
        userId: actor.userId,
        ip: actor.ip,
        userAgent: actor.userAgent,
      });
    }
    return { success: true };
  }

  async forgotPassword(input: ForgotPasswordInput) {
    const user = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
      return { success: true };
    }

    const token = this.generateToken();
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_MINUTES * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    await this.emailService.sendPasswordReset(user.email, token);

    return { success: true };
  }

  async resetPassword(input: ResetPasswordInput) {
    const tokenHash = this.hashToken(input.token);
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid reset token');
    }

    await this.prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash: await this.hashPassword(input.password) },
    });

    await this.prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    });

    await this.prisma.session.updateMany({
      where: { userId: resetToken.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { success: true };
  }

  private async issueTokens(user: { id: string; email: string; role: UserRole; mfaEnabled: boolean },
    mfaVerified: boolean,
  ) {
    const accessToken = this.createAccessToken(user, mfaVerified);
    const { refreshToken, expiresAt } = await this.createSession(user.id);

    return {
      accessToken,
      refreshToken,
      refreshExpiresAt: expiresAt.toISOString(),
    };
  }

  private createAccessToken(
    user: { id: string; email: string; role: UserRole; mfaEnabled: boolean },
    mfaVerified: boolean,
  ) {
    return this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        mfaEnabled: user.mfaEnabled,
        mfa: user.mfaEnabled ? mfaVerified : true,
      },
      { expiresIn: ACCESS_TOKEN_TTL },
    );
  }

  private createMfaToken(user: { id: string; email: string; role: UserRole }) {
    return this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role, type: 'mfa' },
      { expiresIn: MFA_TOKEN_TTL },
    );
  }

  private async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await this.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  private async createSession(userId: string) {
    const refreshToken = this.generateToken();
    const refreshTokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

    await this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash,
        expiresAt,
      },
    });

    return { refreshToken, expiresAt };
  }

  private async findSession(refreshToken: string) {
    const refreshTokenHash = this.hashToken(refreshToken);
    return this.prisma.session.findUnique({ where: { refreshTokenHash } });
  }

  private generateToken() {
    return randomBytes(48).toString('hex');
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private async hashPassword(password: string) {
    const { hash } = await import('argon2');
    return hash(password);
  }

  private async verifyPassword(password: string, hash: string) {
    const { verify } = await import('argon2');
    return verify(hash, password);
  }
}
