import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { CouncilController } from './council.controller';
import { CouncilService } from './council.service';

@Module({
  imports: [AuditModule],
  controllers: [CouncilController],
  providers: [CouncilService, PermissionGuard],
})
export class CouncilModule {}
