import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ContentStatus, DirectoryType } from '@prisma/client';
import { Request } from 'express';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/auth.types';
import {
  annuaireCreateSchema,
  annuaireScheduleSchema,
  annuaireUpdateSchema,
  AnnuaireCreateInput,
  AnnuaireScheduleInput,
  AnnuaireUpdateInput,
} from './dto/annuaire.schemas';
import { AnnuaireService } from './annuaire.service';

@Controller('annuaire')
export class AnnuaireController {
  constructor(private readonly annuaireService: AnnuaireService) {}

  @Get()
  listPublished(@Query('type') type?: DirectoryType, @Query('search') search?: string) {
    const parsedType =
      type && Object.values(DirectoryType).includes(type) ? type : undefined;
    return this.annuaireService.listPublished({ type: parsedType, search });
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:read')
  @Get('admin')
  listAll(
    @Query('status') status?: ContentStatus,
    @Query('type') type?: DirectoryType,
    @Query('search') search?: string,
  ) {
    const parsedStatus =
      status && Object.values(ContentStatus).includes(status)
        ? status
        : undefined;
    const parsedType =
      type && Object.values(DirectoryType).includes(type) ? type : undefined;
    return this.annuaireService.listAll({ status: parsedStatus, type: parsedType, search });
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.annuaireService.getBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:create')
  @Post()
  create(
    @Req() req: Request,
    @Body(new ZodValidationPipe(annuaireCreateSchema)) body: AnnuaireCreateInput,
  ) {
    const user = req.user as JwtPayload;
    return this.annuaireService.create(body, {
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
    @Body(new ZodValidationPipe(annuaireUpdateSchema)) body: AnnuaireUpdateInput,
  ) {
    const user = req.user as JwtPayload;
    return this.annuaireService.update(id, body, {
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
    return this.annuaireService.remove(id, {
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
    return this.annuaireService.publish(id, {
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
    @Body(new ZodValidationPipe(annuaireScheduleSchema)) body: AnnuaireScheduleInput,
  ) {
    const user = req.user as JwtPayload;
    return this.annuaireService.schedule(id, body, {
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
    return this.annuaireService.archive(id, {
      userId: user.sub,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }
}
