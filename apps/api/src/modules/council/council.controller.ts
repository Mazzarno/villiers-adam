import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ContentStatus, CouncilMemberRole } from '@prisma/client';
import { Request } from 'express';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/auth.types';
import {
  councilCreateSchema,
  councilScheduleSchema,
  councilUpdateSchema,
  CouncilCreateInput,
  CouncilScheduleInput,
  CouncilUpdateInput,
} from './dto/council.schemas';
import { CouncilService } from './council.service';

@Controller('council')
export class CouncilController {
  constructor(private readonly councilService: CouncilService) {}

  @Get()
  listPublished(@Query('role') role?: CouncilMemberRole) {
    const parsedRole =
      role && Object.values(CouncilMemberRole).includes(role) ? role : undefined;
    return this.councilService.listPublished({ role: parsedRole });
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:read')
  @Get('admin')
  listAll(
    @Query('status') status?: ContentStatus,
    @Query('search') search?: string,
    @Query('role') role?: CouncilMemberRole,
  ) {
    const parsedStatus =
      status && Object.values(ContentStatus).includes(status)
        ? status
        : undefined;
    const parsedRole =
      role && Object.values(CouncilMemberRole).includes(role) ? role : undefined;
    return this.councilService.listAll({ status: parsedStatus, search, role: parsedRole });
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:read')
  @Get('admin/:id')
  getById(@Param('id') id: string) {
    return this.councilService.getById(id);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:create')
  @Post()
  create(
    @Req() req: Request,
    @Body(new ZodValidationPipe(councilCreateSchema)) body: CouncilCreateInput,
  ) {
    const user = req.user as JwtPayload;
    return this.councilService.create(body, {
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
    @Body(new ZodValidationPipe(councilUpdateSchema)) body: CouncilUpdateInput,
  ) {
    const user = req.user as JwtPayload;
    return this.councilService.update(id, body, {
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
    return this.councilService.remove(id, {
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
    return this.councilService.publish(id, {
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
    @Body(new ZodValidationPipe(councilScheduleSchema)) body: CouncilScheduleInput,
  ) {
    const user = req.user as JwtPayload;
    return this.councilService.schedule(id, body, {
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
    return this.councilService.archive(id, {
      userId: user.sub,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }
}
