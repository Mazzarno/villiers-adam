import { Module } from '@nestjs/common';

import { PermissionGuard } from '../../common/guards/permission.guard';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { MinioService } from './minio.service';

@Module({
  controllers: [MediaController],
  providers: [MediaService, MinioService, PermissionGuard],
  exports: [MediaService, MinioService],
})
export class MediaModule {}
