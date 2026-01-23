import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { Request } from 'express';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/auth.types';
import {
  demarchesCreateSchema,
  demarchesScheduleSchema,
  demarchesUpdateSchema,
  DemarchesCreateInput,
  DemarchesScheduleInput,
  DemarchesUpdateInput,
} from './dto/demarches.schemas';
import { DemarchesService } from './demarches.service';

@Controller('demarches')
export class DemarchesController {
  constructor(private readonly demarchesService: DemarchesService) {}

  @Get()
  listPublished(@Query('search') search?: string) {
    return this.demarchesService.listPublished(search);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:read')
  @Get('admin')
  listAll(@Query('status') status?: ContentStatus, @Query('search') search?: string) {
    const parsedStatus =
      status && Object.values(ContentStatus).includes(status)
        ? status
        : undefined;
    return this.demarchesService.listAll({ status: parsedStatus, search });
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.demarchesService.getBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:create')
  @Post()
  create(
    @Req() req: Request,
    @Body(new ZodValidationPipe(demarchesCreateSchema)) body: DemarchesCreateInput,
  ) {
    const user = req.user as JwtPayload;
    return this.demarchesService.create(body, {
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
    @Body(new ZodValidationPipe(demarchesUpdateSchema)) body: DemarchesUpdateInput,
  ) {
    const user = req.user as JwtPayload;
    return this.demarchesService.update(id, body, {
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
    return this.demarchesService.remove(id, {
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
    return this.demarchesService.publish(id, {
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
    @Body(new ZodValidationPipe(demarchesScheduleSchema)) body: DemarchesScheduleInput,
  ) {
    const user = req.user as JwtPayload;
    return this.demarchesService.schedule(id, body, {
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
    return this.demarchesService.archive(id, {
      userId: user.sub,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }
}
