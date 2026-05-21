import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ContactService } from './contact.service';
import { ContactCreateInput, contactCreateSchema } from './dto/contact.schemas';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  submit(
    @Req() req: Request,
    @Body(new ZodValidationPipe(contactCreateSchema)) body: ContactCreateInput,
  ) {
    return this.contactService.submit(body, req.ip);
  }
}
