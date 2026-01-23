import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ReservationStatus } from '@prisma/client';
import { Request } from 'express';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/auth.types';
import {
  reservationCreateSchema,
  reservationStatusSchema,
  availabilityCheckSchema,
  ReservationCreateInput,
  ReservationStatusInput,
  AvailabilityCheckInput,
} from './dto/reservation.schemas';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post('check-availability')
  checkAvailability(
    @Body(new ZodValidationPipe(availabilityCheckSchema)) body: AvailabilityCheckInput,
  ) {
    return this.reservationsService.checkAvailability(
      body.roomId,
      new Date(body.startsAt),
      new Date(body.endsAt),
    );
  }

  @Get('slots/:roomId')
  getAvailableSlots(@Param('roomId') roomId: string, @Query('date') date: string) {
    const parsedDate = date ? new Date(date) : new Date();
    return this.reservationsService.getAvailableSlots(roomId, parsedDate);
  }

  @Post()
  create(@Body(new ZodValidationPipe(reservationCreateSchema)) body: ReservationCreateInput) {
    return this.reservationsService.create(body);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:read')
  @Get()
  list(@Query('status') status?: ReservationStatus) {
    const parsedStatus =
      status && Object.values(ReservationStatus).includes(status)
        ? status
        : undefined;
    return this.reservationsService.list({ status: parsedStatus });
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:read')
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.reservationsService.getById(id);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:update')
  @Patch(':id/status')
  updateStatus(
    @Req() req: Request,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(reservationStatusSchema)) body: ReservationStatusInput,
  ) {
    const user = req.user as JwtPayload;
    return this.reservationsService.updateStatus(id, body, user.sub);
  }
}
