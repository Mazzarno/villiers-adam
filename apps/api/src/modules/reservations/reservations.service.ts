import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ReservationStatus } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';
import { HcaptchaService } from '../../common/security/hcaptcha.service';
import { EmailService } from '../email/email.service';
import { ReservationCreateInput, ReservationStatusInput } from './dto/reservation.schemas';

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly hcaptchaService: HcaptchaService,
  ) {}

  async checkAvailability(roomId: string, startsAt: Date, endsAt: Date, excludeId?: string) {
    const conflicting = await this.prisma.reservation.findFirst({
      where: {
        roomId,
        id: excludeId ? { not: excludeId } : undefined,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [
          {
            startsAt: { lt: endsAt },
            endsAt: { gt: startsAt },
          },
        ],
      },
    });

    return {
      available: !conflicting,
      conflictingReservation: conflicting
        ? { id: conflicting.id, startsAt: conflicting.startsAt, endsAt: conflicting.endsAt }
        : null,
    };
  }

  async getAvailableSlots(roomId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const reservations = await this.prisma.reservation.findMany({
      where: {
        roomId,
        status: { in: ['PENDING', 'APPROVED'] },
        startsAt: { gte: startOfDay },
        endsAt: { lte: endOfDay },
      },
      orderBy: { startsAt: 'asc' },
      select: { startsAt: true, endsAt: true },
    });

    return { date, reservations };
  }

  async create(input: ReservationCreateInput, ip?: string) {
    const captchaValid = await this.hcaptchaService.verifyToken(input.captchaToken ?? undefined, ip);
    if (!captchaValid) {
      this.logger.warn(`Reservation blocked (captcha invalid) from ${ip ?? 'unknown IP'}`);
      throw new BadRequestException('Captcha verification failed');
    }

    const room = await this.prisma.room.findUnique({ where: { id: input.roomId } });
    if (!room || !room.isActive) {
      throw new BadRequestException('Invalid room');
    }

    const startsAt = new Date(input.startsAt);
    const endsAt = new Date(input.endsAt);

    if (startsAt >= endsAt) {
      throw new BadRequestException('Start time must be before end time');
    }

    const availability = await this.checkAvailability(input.roomId, startsAt, endsAt);
    if (!availability.available) {
      throw new ConflictException({
        message: 'Time slot is not available',
        conflict: availability.conflictingReservation,
      });
    }

    const reservation = await this.prisma.reservation.create({
      data: {
        roomId: input.roomId,
        startsAt,
        endsAt,
        requesterName: input.requesterName,
        requesterEmail: input.requesterEmail,
        requesterPhone: input.requesterPhone ?? null,
        notes: input.notes ?? null,
      },
    });

    await this.emailService.sendReservationConfirmation(
      reservation.requesterEmail,
      reservation.id,
    );

    return reservation;
  }

  async list(params: { status?: ReservationStatus }) {
    return this.prisma.reservation.findMany({
      where: { status: params.status },
      orderBy: { createdAt: 'desc' },
      include: { room: true },
    });
  }

  async getById(id: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: { room: true },
    });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    return reservation;
  }

  async updateStatus(id: string, input: ReservationStatusInput, userId: string) {
    await this.ensureExists(id);
    return this.prisma.reservation.update({
      where: { id },
      data: {
        status: input.status,
        handledById: userId,
      },
    });
  }

  private async ensureExists(id: string) {
    const reservation = await this.prisma.reservation.findUnique({ where: { id } });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
  }
}
