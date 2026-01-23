import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AgendaType, ContentStatus } from '@prisma/client';
import { Request } from 'express';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/auth.types';
import {
  agendaCreateSchema,
  agendaScheduleSchema,
  agendaUpdateSchema,
  AgendaCreateInput,
  AgendaScheduleInput,
  AgendaUpdateInput,
} from './dto/agenda.schemas';
import { AgendaService } from './agenda.service';

@Controller('agenda')
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Get()
  listPublished(
    @Query('type') type?: AgendaType,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const parsedType =
      type && Object.values(AgendaType).includes(type) ? type : undefined;
    return this.agendaService.listPublished({ type: parsedType, from, to });
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:read')
  @Get('admin')
  listAll(
    @Query('status') status?: ContentStatus,
    @Query('type') type?: AgendaType,
    @Query('search') search?: string,
  ) {
    const parsedStatus =
      status && Object.values(ContentStatus).includes(status)
        ? status
        : undefined;
    const parsedType =
      type && Object.values(AgendaType).includes(type) ? type : undefined;
    return this.agendaService.listAll({ status: parsedStatus, type: parsedType, search });
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.agendaService.getById(id);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:create')
  @Post()
  create(
    @Req() req: Request,
    @Body(new ZodValidationPipe(agendaCreateSchema)) body: AgendaCreateInput,
  ) {
    const user = req.user as JwtPayload;
    return this.agendaService.create(body, {
      userId: user.sub,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:update')
  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(agendaUpdateSchema)) body: AgendaUpdateInput,
  ) {
    const user = req.user as JwtPayload;
    return this.agendaService.update(id, body, {
      userId: user.sub,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:delete')
  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.agendaService.remove(id, {
      userId: user.sub,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:publish')
  @Post(':id/publish')
  publish(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.agendaService.publish(id, {
      userId: user.sub,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:publish')
  @Post(':id/schedule')
  schedule(
    @Req() req: Request,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(agendaScheduleSchema)) body: AgendaScheduleInput,
  ) {
    const user = req.user as JwtPayload;
    return this.agendaService.schedule(id, body, {
      userId: user.sub,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:publish')
  @Post(':id/archive')
  archive(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.agendaService.archive(id, {
      userId: user.sub,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }
}
