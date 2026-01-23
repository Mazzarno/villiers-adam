import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { SearchModule } from '../search/search.module';

import { PermissionGuard } from '../../common/guards/permission.guard';
import { ArticlesController } from './articles/articles.controller';
import { ArticlesService } from './articles/articles.service';
import { ContentScheduler } from './content.scheduler';
import { EventsController } from './events/events.controller';
import { EventsService } from './events/events.service';
import { PagesController } from './pages/pages.controller';
import { PagesService } from './pages/pages.service';

@Module({
  imports: [AuditModule, SearchModule],
  controllers: [PagesController, ArticlesController, EventsController],
  providers: [PagesService, ArticlesService, EventsService, ContentScheduler, PermissionGuard],
})
export class ContentModule {}
