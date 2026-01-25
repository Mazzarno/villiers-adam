import { Module } from '@nestjs/common';

import { PermissionGuard } from '../../common/guards/permission.guard';
import { HcaptchaService } from '../../common/security/hcaptcha.service';
import { EmailModule } from '../email/email.module';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';

@Module({
  imports: [EmailModule],
  controllers: [ReservationsController],
  providers: [ReservationsService, PermissionGuard, HcaptchaService],
})
export class ReservationsModule {}
