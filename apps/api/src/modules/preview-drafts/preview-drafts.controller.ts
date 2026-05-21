import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { previewDraftCreateSchema, PreviewDraftCreateInput } from './dto/preview-draft.schemas';
import { PreviewDraftsService } from './preview-drafts.service';

@Controller('preview-drafts')
export class PreviewDraftsController {
  constructor(private readonly previewDraftsService: PreviewDraftsService) {}

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:read')
  @Post()
  createDraft(
    @Body(new ZodValidationPipe(previewDraftCreateSchema)) body: PreviewDraftCreateInput,
  ) {
    return this.previewDraftsService.createDraft(body);
  }

  @Get(':token')
  getDraft(@Param('token') token: string) {
    return this.previewDraftsService.getDraftByToken(token);
  }
}
