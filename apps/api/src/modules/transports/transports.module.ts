import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { TransportsController } from './transports.controller';
import { TransportsService } from './transports.service';

@Module({
  imports: [AuditModule],
  controllers: [TransportsController],
  providers: [TransportsService, PermissionGuard],
})
export class TransportsModule {}
