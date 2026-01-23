import { Module } from '@nestjs/common';

import { PermissionGuard } from '../../common/guards/permission.guard';
import { MediaModule } from '../media/media.module';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';

@Module({
  imports: [MediaModule],
  controllers: [ExportController],
  providers: [ExportService, PermissionGuard],
})
export class ExportModule {}
