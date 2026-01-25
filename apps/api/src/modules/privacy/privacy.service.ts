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
    const [forms, reservations, newsletter] = await Promise.all([
      this.prisma.formSubmission.findMany({ where: { email } }),
      this.prisma.reservation.findMany({ where: { requesterEmail: email } }),
      this.prisma.newsletterSubscription.findMany({ where: { email } }),
    ]);

    return {
      email,
      forms,
      reservations,
      newsletter,
    };
  }

  async eraseByEmail(email: string) {
    const [forms, reservations, newsletter] = await Promise.all([
      this.prisma.formSubmission.deleteMany({ where: { email } }),
      this.prisma.reservation.deleteMany({ where: { requesterEmail: email } }),
      this.prisma.newsletterSubscription.deleteMany({ where: { email } }),
    ]);

    return {
      email,
      deleted: {
        forms: forms.count,
        reservations: reservations.count,
        newsletter: newsletter.count,
      },
    };
  }

  @Cron('0 3 * * *')
  async applyRetentionPolicies() {
    const formsDays = this.configService.get<number>('RETENTION_FORMS_DAYS');
    const reservationsDays = this.configService.get<number>('RETENTION_RESERVATIONS_DAYS');
    const newsletterDays = this.configService.get<number>('RETENTION_NEWSLETTER_DAYS');

    if (formsDays && formsDays > 0) {
      const cutoff = this.getCutoffDate(formsDays);
      const result = await this.prisma.formSubmission.deleteMany({
        where: { createdAt: { lt: cutoff } },
      });
      if (result.count > 0) {
        this.logger.log(`Retention: deleted ${result.count} form submissions older than ${formsDays} days`);
      }
    }

    if (reservationsDays && reservationsDays > 0) {
      const cutoff = this.getCutoffDate(reservationsDays);
      const result = await this.prisma.reservation.deleteMany({
        where: { createdAt: { lt: cutoff } },
      });
      if (result.count > 0) {
        this.logger.log(`Retention: deleted ${result.count} reservations older than ${reservationsDays} days`);
      }
    }

    if (newsletterDays && newsletterDays > 0) {
      const cutoff = this.getCutoffDate(newsletterDays);
      const result = await this.prisma.newsletterSubscription.deleteMany({
        where: { unsubscribedAt: { not: null, lt: cutoff } },
      });
      if (result.count > 0) {
        this.logger.log(`Retention: deleted ${result.count} newsletter subscriptions older than ${newsletterDays} days`);
      }
    }
  }

  private getCutoffDate(days: number) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return cutoff;
  }
}
