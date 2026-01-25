import { Module } from '@nestjs/common';

import { PermissionGuard } from '../../common/guards/permission.guard';
import { HcaptchaService } from '../../common/security/hcaptcha.service';
import { EmailModule } from '../email/email.module';
import { FormsController } from './forms.controller';
import { FormsService } from './forms.service';

@Module({
  imports: [EmailModule],
  controllers: [FormsController],
  providers: [FormsService, PermissionGuard, HcaptchaService],
})
export class FormsModule {}
