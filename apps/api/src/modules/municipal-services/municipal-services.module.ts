import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { MunicipalServicesController } from './municipal-services.controller';
import { MunicipalServicesService } from './municipal-services.service';

@Module({
  imports: [AuditModule],
  controllers: [MunicipalServicesController],
  providers: [MunicipalServicesService, PermissionGuard],
})
export class MunicipalServicesModule {}
