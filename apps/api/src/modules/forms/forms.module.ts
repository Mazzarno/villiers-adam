import { Module } from '@nestjs/common';

import { PermissionGuard } from '../../common/guards/permission.guard';
import { EmailModule } from '../email/email.module';
import { FormsController } from './forms.controller';
import { FormsService } from './forms.service';

@Module({
  imports: [EmailModule],
  controllers: [FormsController],
  providers: [FormsService, PermissionGuard],
})
export class FormsModule {}
