import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { FormStatus, FormType } from '@prisma/client';
import { Request } from 'express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { formCreateSchema, formStatusSchema, FormCreateInput, FormStatusInput } from './dto/forms.schemas';
import { FormsService } from './forms.service';

@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle({ short: { limit: 3, ttl: 60000 } })
  submit(@Req() req: Request, @Body(new ZodValidationPipe(formCreateSchema)) body: FormCreateInput) {
    return this.formsService.submit(body, req.ip, req.headers['user-agent']);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:read')
  @Get()
  list(
    @Query('status') status?: FormStatus,
    @Query('type') type?: FormType,
    @Query('includeBot') includeBot?: string,
  ) {
    const parsedStatus =
      status && Object.values(FormStatus).includes(status) ? status : undefined;
    const parsedType = type && Object.values(FormType).includes(type) ? type : undefined;
    return this.formsService.list({
      status: parsedStatus,
      type: parsedType,
      includeBot: includeBot === 'true',
    });
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content:update')
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(formStatusSchema)) body: FormStatusInput,
  ) {
    return this.formsService.updateStatus(id, body);
  }
}
