import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditAction } from '@prisma/client';

import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditService } from './audit.service';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('audit:read')
  @Get()
  list(
    @Query('action') action?: AuditAction,
    @Query('entity') entity?: string,
    @Query('userId') userId?: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    const parsedAction =
      action && Object.values(AuditAction).includes(action) ? action : undefined;
    return this.auditService.list({
      action: parsedAction,
      entity,
      userId,
      take: take ? Number(take) : undefined,
      skip: skip ? Number(skip) : undefined,
    });
  }
}
