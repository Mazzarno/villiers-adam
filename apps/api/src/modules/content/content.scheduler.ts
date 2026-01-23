import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { ArticlesService } from './articles/articles.service';
import { EventsService } from './events/events.service';
import { PagesService } from './pages/pages.service';

@Injectable()
export class ContentScheduler {
  constructor(
    private readonly pagesService: PagesService,
    private readonly articlesService: ArticlesService,
    private readonly eventsService: EventsService,
  ) {}

  @Cron('*/5 * * * *')
  async publishScheduled() {
    await this.pagesService.publishScheduled();
    await this.articlesService.publishScheduled();
    await this.eventsService.publishScheduled();
  }
}
