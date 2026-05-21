import { Module } from '@nestjs/common';

import { PermissionGuard } from '../../common/guards/permission.guard';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { PreviewDraftsController } from './preview-drafts.controller';
import { PreviewDraftsService } from './preview-drafts.service';

@Module({
  imports: [PrismaModule],
  controllers: [PreviewDraftsController],
  providers: [PreviewDraftsService, PermissionGuard],
})
export class PreviewDraftsModule {}
