import { Controller, Get, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async list(@Req() req: { user: { sub: string } }) {
    return this.notificationsService.listForUser(req.user.sub);
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: { user: { sub: string } }) {
    const count = await this.notificationsService.getUnreadCount(req.user.sub);
    return { count };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: { user: { sub: string } }) {
    return this.notificationsService.markAsRead(id, req.user.sub);
  }

  @Patch('read-all')
  async markAllAsRead(@Req() req: { user: { sub: string } }) {
    await this.notificationsService.markAllAsRead(req.user.sub);
    return { success: true };
  }
}
