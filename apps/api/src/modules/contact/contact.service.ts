import { BadRequestException, Injectable } from '@nestjs/common';

import { HcaptchaService } from '../../common/security/hcaptcha.service';
import { EmailService } from '../email/email.service';
import { ContactCreateInput } from './dto/contact.schemas';

@Injectable()
export class ContactService {
  constructor(
    private readonly emailService: EmailService,
    private readonly hcaptchaService: HcaptchaService,
  ) {}

  async submit(input: ContactCreateInput, remoteIp?: string) {
    const subject = input.subject?.trim() || 'Message de contact';

    // Honeypot trap for bots: pretend success but do nothing.
    if (input.website?.trim()) {
      return { success: true };
    }

    const captchaValid = await this.hcaptchaService.verifyToken(input.captchaToken ?? undefined, remoteIp);
    if (!captchaValid) {
      throw new BadRequestException('Captcha invalide');
    }

    await this.emailService.sendContactMessage({
      name: input.name,
      email: input.email,
      subject,
      message: input.message,
    });

    await this.emailService.sendFormReceipt(input.email, subject);

    return { success: true };
  }
}
