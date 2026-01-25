import { Body, Controller, Delete, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { Request } from 'express';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/auth.types';
import { mediaConfirmSchema, mediaPresignSchema, MediaConfirmInput, MediaPresignInput } from './dto/media.schemas';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('media:create')
  @Post('presign')
  presign(@Body(new ZodValidationPipe(mediaPresignSchema)) body: MediaPresignInput) {
    return this.mediaService.presignUpload(body);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('media:create')
  @Post('confirm')
  confirm(
    @Req() req: Request,
    @Body(new ZodValidationPipe(mediaConfirmSchema)) body: MediaConfirmInput,
  ) {
    const user = req.user as JwtPayload;
    return this.mediaService.confirmUpload(body, user.sub);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('media:read')
  @Get()
  list() {
    return this.mediaService.list();
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('media:read')
  @Get(':id')
  get(@Param('id') id: string) {
    return this.mediaService.getById(id);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('media:read')
  @Get(':id/download')
  download(@Param('id') id: string) {
    return this.mediaService.download(id);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('media:delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }

  /**
   * Public route to serve media files.
   * Redirects to a presigned URL from MinIO.
   * The storageKey includes the path (e.g., "2024/01/uuid-filename.jpg")
   */
  @Get('public/*')
  async servePublic(@Param('0') storageKey: string, @Res() res: Response) {
    const { url } = await this.mediaService.getPublicUrl(storageKey);
    return res.redirect(url);
  }
}
