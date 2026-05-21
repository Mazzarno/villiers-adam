import { BadRequestException, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

import { PrismaService } from '../../common/prisma/prisma.service';
import { HcaptchaService } from '../../common/security/hcaptcha.service';
import { EmailService } from '../email/email.service';
import { TopicCreateInput, TopicUpdateInput, SubscribeInput } from './dto/newsletters.schemas';

@Injectable()
export class NewslettersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly hcaptchaService: HcaptchaService,
  ) {}

  async listSubscriptions(params?: { status?: 'confirmed' | 'unconfirmed' | 'unsubscribed' }) {
    const where: Record<string, unknown> = {};

    if (params?.status === 'confirmed') {
      where.confirmedAt = { not: null };
      where.unsubscribedAt = null;
    } else if (params?.status === 'unconfirmed') {
      where.confirmedAt = null;
      where.unsubscribedAt = null;
    } else if (params?.status === 'unsubscribed') {
      where.unsubscribedAt = { not: null };
    }

    return this.prisma.newsletterSubscription.findMany({
      where,
      select: {
        id: true,
        email: true,
        confirmedAt: true,
        unsubscribedAt: true,
        createdAt: true,
        updatedAt: true,
        topics: { include: { topic: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats() {
    const [total, confirmed, unsubscribed] = await Promise.all([
      this.prisma.newsletterSubscription.count(),
      this.prisma.newsletterSubscription.count({ where: { confirmedAt: { not: null }, unsubscribedAt: null } }),
      this.prisma.newsletterSubscription.count({ where: { unsubscribedAt: { not: null } } }),
    ]);

    const topics = await this.prisma.newsletterTopic.findMany({
      include: { _count: { select: { subscriptions: true } } },
    });

    return {
      total,
      confirmed,
      unconfirmed: total - confirmed - unsubscribed,
      unsubscribed,
      byTopic: topics.map((t) => ({
        topicId: t.id,
        topicName: t.name,
        count: t._count.subscriptions,
      })),
    };
  }

  async listTopics(activeOnly = false) {
    return this.prisma.newsletterTopic.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async createTopic(data: TopicCreateInput) {
    return this.prisma.newsletterTopic.create({ data });
  }

  async updateTopic(id: string, data: TopicUpdateInput) {
    const topic = await this.prisma.newsletterTopic.findUnique({ where: { id } });
    if (!topic) throw new BadRequestException('Topic not found');

    return this.prisma.newsletterTopic.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  async deleteTopic(id: string) {
    const topic = await this.prisma.newsletterTopic.findUnique({ where: { id } });
    if (!topic) throw new BadRequestException('Topic not found');

    await this.prisma.newsletterSubscriptionTopic.deleteMany({ where: { topicId: id } });
    return this.prisma.newsletterTopic.delete({ where: { id } });
  }

  async subscribe(data: SubscribeInput, remoteIp?: string) {
    const captchaValid = await this.hcaptchaService.verifyToken(data.captchaToken ?? undefined, remoteIp);
    if (!captchaValid) {
      throw new BadRequestException('Captcha invalide');
    }

    const existing = await this.prisma.newsletterSubscription.findUnique({
      where: { email: data.email },
    });

    let confirmationTokenToSend: string | null = null;

    if (existing) {
      if (existing.unsubscribedAt || !existing.confirmedAt || !existing.confirmationToken) {
        const newToken = randomBytes(32).toString('hex');
        await this.prisma.newsletterSubscription.update({
          where: { id: existing.id },
          data: {
            unsubscribedAt: null,
            confirmedAt: null,
            confirmationToken: newToken,
          },
        });
        confirmationTokenToSend = newToken;
      } else {
        confirmationTokenToSend = existing.confirmationToken;
      }

      if (data.topicIds?.length) {
        await this.prisma.newsletterSubscriptionTopic.deleteMany({
          where: { subscriptionId: existing.id },
        });
        await this.prisma.newsletterSubscriptionTopic.createMany({
          data: data.topicIds.map((topicId) => ({
            subscriptionId: existing.id,
            topicId,
          })),
        });
      }

      if (confirmationTokenToSend) {
        await this.emailService.sendNewsletterConfirmation(data.email, confirmationTokenToSend);
      }

      return { success: true };
    }

    const token = randomBytes(32).toString('hex');

    const subscription = await this.prisma.newsletterSubscription.create({
      data: {
        email: data.email,
        confirmationToken: token,
      },
    });

    if (data.topicIds?.length) {
      await this.prisma.newsletterSubscriptionTopic.createMany({
        data: data.topicIds.map((topicId) => ({
          subscriptionId: subscription.id,
          topicId,
        })),
      });
    }

    await this.emailService.sendNewsletterConfirmation(data.email, token);

    return { success: true };
  }

  async confirmSubscription(token: string) {
    const subscription = await this.prisma.newsletterSubscription.findFirst({
      where: { confirmationToken: token },
    });

    if (!subscription) {
      return { success: true };
    }

    if (!subscription.confirmedAt) {
      await this.prisma.newsletterSubscription.update({
        where: { id: subscription.id },
        data: { confirmedAt: new Date() },
      });
    }

    return { success: true };
  }

  async unsubscribe(email: string, token: string, captchaToken?: string | null, remoteIp?: string) {
    const captchaValid = await this.hcaptchaService.verifyToken(captchaToken ?? undefined, remoteIp);
    if (!captchaValid) {
      throw new BadRequestException('Captcha invalide');
    }

    const subscription = await this.prisma.newsletterSubscription.findFirst({
      where: { email, confirmationToken: token },
    });

    if (!subscription) {
      return { success: true };
    }

    if (!subscription.unsubscribedAt) {
      await this.prisma.newsletterSubscription.update({
        where: { id: subscription.id },
        data: { unsubscribedAt: new Date() },
      });
    }

    return { success: true };
  }

  async exportCsv() {
    const subscriptions = await this.prisma.newsletterSubscription.findMany({
      include: { topics: { include: { topic: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const header = 'Email,Statut,Date inscription,Topics\n';
    const rows = subscriptions.map((sub) => {
      const status = sub.unsubscribedAt
        ? 'Désabonné'
        : sub.confirmedAt
          ? 'Confirmé'
          : 'Non confirmé';
      const topics = sub.topics.map((t) => t.topic.name).join('; ');
      return `"${sub.email}","${status}","${sub.createdAt.toISOString().split('T')[0]}","${topics}"`;
    });

    return header + rows.join('\n');
  }
}
