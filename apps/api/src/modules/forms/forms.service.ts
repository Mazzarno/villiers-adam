import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { FormStatus, FormType } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';
import { HcaptchaService } from '../../common/security/hcaptcha.service';
import { EmailService } from '../email/email.service';
import { FormCreateInput, FormStatusInput } from './dto/forms.schemas';

@Injectable()
export class FormsService {
  private readonly logger = new Logger(FormsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly hcaptchaService: HcaptchaService,
  ) {}

  async submit(input: FormCreateInput, ip?: string, userAgent?: string) {
    const isBot = Boolean(input.website && input.website.trim().length > 0);

    if (!isBot) {
      const captchaValid = await this.hcaptchaService.verifyToken(input.captchaToken ?? undefined, ip);
      if (!captchaValid) {
        this.logger.warn(`Form submission blocked (captcha invalid) from ${ip ?? 'unknown IP'}`);
        throw new BadRequestException('Captcha verification failed');
      }
    }

    const submission = await this.prisma.formSubmission.create({
      data: {
        type: input.type as FormType,
        subject: input.subject ?? null,
        message: input.message,
        name: input.name ?? null,
        email: input.email ?? null,
        phone: input.phone ?? null,
        data: input.data ?? null,
        honeypot: input.website ?? null,
        isBot,
        ip,
        userAgent,
      },
    });

    if (!isBot && submission.email) {
      await this.emailService.sendFormReceipt(
        submission.email,
        submission.subject ?? 'Nouveau message',
      );
    }

    return { id: submission.id, success: true };
  }

  async list(params: { status?: FormStatus; type?: FormType; includeBot?: boolean }) {
    return this.prisma.formSubmission.findMany({
      where: {
        status: params.status,
        type: params.type,
        isBot: params.includeBot ? undefined : false,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, input: FormStatusInput) {
    return this.prisma.formSubmission.update({
      where: { id },
      data: { status: input.status },
    });
  }
}
