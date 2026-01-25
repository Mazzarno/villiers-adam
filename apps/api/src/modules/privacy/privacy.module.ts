import { Module } from '@nestjs/common';

import { PermissionGuard } from '../../common/guards/permission.guard';
import { PrivacyController } from './privacy.controller';
import { PrivacyService } from './privacy.service';

@Module({
  controllers: [PrivacyController],
  providers: [PrivacyService, PermissionGuard],
})
export class PrivacyModule {}
