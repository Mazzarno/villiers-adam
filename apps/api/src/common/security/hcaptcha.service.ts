import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type HcaptchaVerifyResponse = {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  score?: number;
  'error-codes'?: string[];
};

@Injectable()
export class HcaptchaService {
  private readonly logger = new Logger(HcaptchaService.name);
  private readonly enabled: boolean;
  private readonly secretKey?: string;

  constructor(private readonly configService: ConfigService) {
    this.enabled = this.configService.get<boolean>('HCAPTCHA_ENABLED') ?? false;
    this.secretKey = this.configService.get('HCAPTCHA_SECRET_KEY');
  }

  async verifyToken(token?: string, remoteIp?: string) {
    if (!this.enabled) return true;
    if (!this.secretKey) {
      this.logger.warn('HCAPTCHA_ENABLED is true but HCAPTCHA_SECRET_KEY is missing.');
      return false;
    }
    if (!token) return false;

    const body = new URLSearchParams({
      secret: this.secretKey,
      response: token,
    });

    if (remoteIp) {
      body.append('remoteip', remoteIp);
    }

    try {
      const response = await fetch('https://hcaptcha.com/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      });

      const data = (await response.json()) as HcaptchaVerifyResponse;
      if (!data.success) {
        this.logger.warn(`hCaptcha verification failed: ${data['error-codes']?.join(', ') ?? 'unknown'}`);
      }
      return data.success;
    } catch (error) {
      this.logger.error('hCaptcha verification error', error instanceof Error ? error.stack : undefined);
      return false;
    }
  }
}
