import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ArticleType, ContentStatus, PublicationType } from '@prisma/client';
import { Request } from 'express';

import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { RequirePermission } from '../../../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../../auth/auth.types';
import {
  articleCreateSchema,
  articleScheduleSchema,
  articleUpdateSchema,
  ArticleCreateInput,
  ArticleScheduleInput,
  ArticleUpdateInput,
} from './dto/article.schemas';
import { ArticlesService } from './articles.service';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  listPublished(
    @Query('type') type?: ArticleType,
    @Query('publicationType') publicationType?: PublicationType,
    @Query('isFlash') isFlash?: string,
  ) {
    const parsedType =
      type && Object.values(ArticleType).includes(type) ? type : undefined;
    const parsedPublicationType =
      publicationType && Object.values(PublicationType).includes(publicationType)
        ? publicationType
        : undefined;
    const parsedIsFlash = isFlash === 'true' ? true : isFlash === 'false' ? false : undefined;
    return this.articlesService.listPublished({
      type: parsedType,
      publicationType: parsedPublicationType,
      isFlash: parsedIsFlash,
    });
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:read')
  @Get('admin')
  listAll(
    @Query('status') status?: ContentStatus,
    @Query('search') search?: string,
    @Query('type') type?: ArticleType,
    @Query('publicationType') publicationType?: PublicationType,
    @Query('isFlash') isFlash?: string,
  ) {
    const parsedStatus =
      status && Object.values(ContentStatus).includes(status)
        ? status
        : undefined;
    const parsedType =
      type && Object.values(ArticleType).includes(type) ? type : undefined;
    const parsedPublicationType =
      publicationType && Object.values(PublicationType).includes(publicationType)
        ? publicationType
        : undefined;
    const parsedIsFlash = isFlash === 'true' ? true : isFlash === 'false' ? false : undefined;
    return this.articlesService.listAll({
      status: parsedStatus,
      search,
      type: parsedType,
      publicationType: parsedPublicationType,
      isFlash: parsedIsFlash,
    });
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:read')
  @Get('admin/:id')
  getById(@Param('id') id: string) {
    return this.articlesService.getById(id);
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.articlesService.getBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:create')
  @Post()
  create(
    @Req() req: Request,
    @Body(new ZodValidationPipe(articleCreateSchema)) body: ArticleCreateInput,
  ) {
    const user = req.user as JwtPayload;
    return this.articlesService.create(body, {
      userId: user.sub,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:update')
  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(articleUpdateSchema)) body: ArticleUpdateInput,
  ) {
    const user = req.user as JwtPayload;
    return this.articlesService.update(id, body, {
      userId: user.sub,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:delete')
  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.articlesService.remove(id, {
      userId: user.sub,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:publish')
  @Post(':id/publish')
  publish(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.articlesService.publish(id, {
      userId: user.sub,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:publish')
  @Post(':id/schedule')
  schedule(
    @Req() req: Request,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(articleScheduleSchema)) body: ArticleScheduleInput,
  ) {
    const user = req.user as JwtPayload;
    return this.articlesService.schedule(id, body, {
      userId: user.sub,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:publish')
  @Post(':id/archive')
  archive(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.articlesService.archive(id, {
      userId: user.sub,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }
}
