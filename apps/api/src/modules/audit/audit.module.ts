import { Module } from '@nestjs/common';

import { PermissionGuard } from '../../common/guards/permission.guard';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { VersionController } from './version.controller';
import { VersionService } from './version.service';

@Module({
  controllers: [AuditController, VersionController],
  providers: [AuditService, VersionService, PermissionGuard],
  exports: [AuditService, VersionService],
})
export class AuditModule {}
