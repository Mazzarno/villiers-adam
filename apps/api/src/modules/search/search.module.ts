import { Module } from '@nestjs/common';

import { PermissionGuard } from '../../common/guards/permission.guard';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  controllers: [SearchController],
  providers: [SearchService, PermissionGuard],
  exports: [SearchService],
})
export class SearchModule {}
