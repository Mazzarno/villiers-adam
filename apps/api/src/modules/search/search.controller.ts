import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @UseGuards(ThrottlerGuard)
  @Throttle({ medium: { limit: 60, ttl: 60000 } })
  @Get()
  search(@Query('q') query = '', @Query('type') type?: string, @Query('limit') limit?: string) {
    const parsedLimit = limit ? Number(limit) : 20;
    const safeLimit = Number.isFinite(parsedLimit)
      ? Math.min(Math.max(parsedLimit, 1), 50)
      : 20;
    return this.searchService.search(query, type as never, safeLimit);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:publish')
  @Post('reindex')
  reindex() {
    return this.searchService.reindexAll();
  }
}
