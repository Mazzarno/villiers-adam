import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';

import { PermissionGuard } from '../../common/guards/permission.guard';
import { AgendaController } from './agenda.controller';
import { AgendaService } from './agenda.service';

@Module({
  imports: [AuditModule],
  controllers: [AgendaController],
  providers: [AgendaService, PermissionGuard],
})
export class AgendaModule {}
