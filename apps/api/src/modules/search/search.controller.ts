import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';

import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@Query('q') query = '', @Query('type') type?: string, @Query('limit') limit?: string) {
    const parsedLimit = limit ? Number(limit) : 20;
    return this.searchService.search(query, type as never, parsedLimit);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:publish')
  @Post('reindex')
  reindex() {
    return this.searchService.reindexAll();
  }
}
