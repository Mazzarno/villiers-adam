import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res, UseGuards, UsePipes } from '@nestjs/common';
import { Response } from 'express';
import { Request } from 'express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  topicCreateSchema,
  topicUpdateSchema,
  subscribeSchema,
  unsubscribeSchema,
  TopicCreateInput,
  TopicUpdateInput,
  SubscribeInput,
  UnsubscribeInput,
} from './dto/newsletters.schemas';
import { NewslettersService } from './newsletters.service';

@Controller('newsletters')
export class NewslettersController {
  constructor(private readonly newslettersService: NewslettersService) {}

  // --- Admin endpoints ---

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('settings:read')
  @Get('subscriptions')
  listSubscriptions(@Query('status') status?: 'confirmed' | 'unconfirmed' | 'unsubscribed') {
    return this.newslettersService.listSubscriptions({ status });
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('settings:read')
  @Get('stats')
  getStats() {
    return this.newslettersService.getStats();
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:read')
  @Get('topics/admin')
  listAllTopics() {
    return this.newslettersService.listTopics(false);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:create')
  @Post('topics')
  @UsePipes(new ZodValidationPipe(topicCreateSchema))
  createTopic(@Body() body: TopicCreateInput) {
    return this.newslettersService.createTopic(body);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:update')
  @Patch('topics/:id')
  updateTopic(@Param('id') id: string, @Body(new ZodValidationPipe(topicUpdateSchema)) body: TopicUpdateInput) {
    return this.newslettersService.updateTopic(id, body);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:delete')
  @Delete('topics/:id')
  deleteTopic(@Param('id') id: string) {
    return this.newslettersService.deleteTopic(id);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('settings:read')
  @Get('export/csv')
  async exportCsv(@Res() res: Response) {
    const csv = await this.newslettersService.exportCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  }

  // --- Public endpoints ---

  @Get('topics')
  listActiveTopics() {
    return this.newslettersService.listTopics(true);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  @Post('subscribe')
  subscribe(@Req() req: Request, @Body(new ZodValidationPipe(subscribeSchema)) body: SubscribeInput) {
    return this.newslettersService.subscribe(body, req.ip);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  @Post('unsubscribe')
  unsubscribe(@Req() req: Request, @Body(new ZodValidationPipe(unsubscribeSchema)) body: UnsubscribeInput) {
    return this.newslettersService.unsubscribe(body.email, body.token, body.captchaToken, req.ip);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ medium: { limit: 20, ttl: 60000 } })
  @Get('confirm/:token')
  confirmSubscription(@Param('token') token: string) {
    return this.newslettersService.confirmSubscription(token);
  }
}
