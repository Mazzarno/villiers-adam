import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { z } from 'zod';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrivacyService } from './privacy.service';

const emailQuerySchema = z.object({
  email: z.string().email(),
});

type EmailQuery = z.infer<typeof emailQuerySchema>;

@Controller('privacy')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class PrivacyController {
  constructor(private readonly privacyService: PrivacyService) {}

  @RequirePermission('content:read')
  @Get('export')
  exportByEmail(@Query(new ZodValidationPipe(emailQuerySchema)) query: EmailQuery) {
    return this.privacyService.exportByEmail(query.email);
  }

  @RequirePermission('content:delete')
  @Post('erase')
  eraseByEmail(@Body(new ZodValidationPipe(emailQuerySchema)) body: EmailQuery) {
    return this.privacyService.eraseByEmail(body.email);
  }
}
