import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VersionService } from './version.service';

@Controller('versions')
export class VersionController {
  constructor(private readonly versionService: VersionService) {}

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('audit:read')
  @Get(':entityType/:entityId')
  list(@Param('entityType') entityType: string, @Param('entityId') entityId: string) {
    return this.versionService.list(entityType, entityId);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:update')
  @Post(':id/restore')
  restore(@Param('id') id: string, @Body() _body: Record<string, unknown>) {
    return this.versionService.restore(id);
  }
}
