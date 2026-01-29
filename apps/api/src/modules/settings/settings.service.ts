import { Injectable } from '@nestjs/common';
import { mairieConfig } from '@villiers-adam/shared';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';
import { SettingsUpdateInput } from './dto/settings.schemas';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    const settings = await this.prisma.settings.findUnique({ where: { id: 'default' } });
    if (settings) {
      return settings;
    }

    return this.prisma.settings.create({
      data: {
        id: 'default',
        siteName: mairieConfig.commune.nomComplet,
        branding: mairieConfig.branding,
        accessibility: {
          seniorMode: true,
          dyslexicMode: false,
          nightMode: true,
        },
        contactEmail: mairieConfig.mairie.contact.email,
        contactPhone: mairieConfig.mairie.contact.telephone,
        address: mairieConfig.mairie.adresse as Prisma.InputJsonValue,
      },
    });
  }

  async update(input: SettingsUpdateInput) {
    const existing = await this.get();

    return this.prisma.settings.update({
      where: { id: 'default' },
      data: {
        siteName: input.siteName ?? existing.siteName,
        branding: (input.branding ?? existing.branding) as Prisma.InputJsonValue,
        accessibility: (input.accessibility ?? existing.accessibility) as Prisma.InputJsonValue,
        contactEmail: input.contactEmail ?? existing.contactEmail,
        contactPhone: input.contactPhone ?? existing.contactPhone,
        address: (input.address ?? existing.address) as Prisma.InputJsonValue,
      },
    });
  }
}
