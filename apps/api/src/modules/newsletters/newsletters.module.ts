import { Module } from '@nestjs/common';

import { HcaptchaService } from '../../common/security/hcaptcha.service';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { EmailModule } from '../email/email.module';
import { NewslettersController } from './newsletters.controller';
import { NewslettersService } from './newsletters.service';

@Module({
  imports: [EmailModule],
  controllers: [NewslettersController],
  providers: [NewslettersService, PermissionGuard, HcaptchaService],
  exports: [NewslettersService],
})
export class NewslettersModule {}
