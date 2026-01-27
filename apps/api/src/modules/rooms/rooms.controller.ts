import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoomsService } from './rooms.service';
import { createRoomSchema, updateRoomSchema, CreateRoomInput, UpdateRoomInput } from './dto';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  // Public endpoints
  @Get()
  findAllActive() {
    return this.roomsService.findAllActive();
  }

  @Get(':slug')
  findOneBySlug(@Param('slug') slug: string) {
    return this.roomsService.findOneBySlug(slug);
  }

  // Admin endpoints
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:read')
  @Get('admin/all')
  findAll() {
    return this.roomsService.findAll();
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:read')
  @Get('admin/:id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:create')
  @Post('admin')
  create(@Body(new ZodValidationPipe(createRoomSchema)) body: CreateRoomInput) {
    return this.roomsService.create(body);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:update')
  @Put('admin/:id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateRoomSchema)) body: UpdateRoomInput,
  ) {
    return this.roomsService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:delete')
  @Delete('admin/:id')
  delete(@Param('id') id: string) {
    return this.roomsService.delete(id);
  }
}
