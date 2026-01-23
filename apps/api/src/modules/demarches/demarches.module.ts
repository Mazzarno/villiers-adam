import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { SearchModule } from '../search/search.module';

import { PermissionGuard } from '../../common/guards/permission.guard';
import { DemarchesController } from './demarches.controller';
import { DemarchesService } from './demarches.service';

@Module({
  imports: [AuditModule, SearchModule],
  controllers: [DemarchesController],
  providers: [DemarchesService, PermissionGuard],
})
export class DemarchesModule {}
