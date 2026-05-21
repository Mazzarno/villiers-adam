import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';

import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class PrivacyService {
  private readonly logger = new Logger(PrivacyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async exportByEmail(email: string) {
    const [newsletter] = await Promise.all([
      this.prisma.newsletterSubscription.findMany({
        where: { email },
        select: {
          id: true,
          email: true,
          confirmedAt: true,
          unsubscribedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return {
      email,
      newsletter,
    };
  }

  async eraseByEmail(email: string) {
    const [newsletter] = await Promise.all([
      this.prisma.newsletterSubscription.deleteMany({ where: { email } }),
    ]);

    return {
      email,
      deleted: {
        newsletter: newsletter.count,
      },
    };
  }

  @Cron('0 3 * * *')
  async applyRetentionPolicies() {
    const newsletterDays = this.configService.get<number>('RETENTION_NEWSLETTER_DAYS');

    if (newsletterDays && newsletterDays > 0) {
      const cutoff = this.getCutoffDate(newsletterDays);
      const result = await this.prisma.newsletterSubscription.deleteMany({
        where: {
          confirmedAt: null,
          createdAt: { lt: cutoff },
        },
      });
      if (result.count > 0) {
        this.logger.log(`Retention: deleted ${result.count} unconfirmed newsletter subscriptions older than ${newsletterDays} days`);
      }
    }

    if (newsletterDays && newsletterDays > 0) {
      const cutoff = this.getCutoffDate(newsletterDays);
      const result = await this.prisma.newsletterSubscription.deleteMany({
        where: { unsubscribedAt: { not: null, lt: cutoff } },
      });
      if (result.count > 0) {
        this.logger.log(`Retention: deleted ${result.count} unsubscribed newsletter subscriptions older than ${newsletterDays} days`);
      }
    }
  }

  private getCutoffDate(days: number) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return cutoff;
  }
}
