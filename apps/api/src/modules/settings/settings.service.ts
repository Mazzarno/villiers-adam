import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';
import { SettingsUpdateInput } from './dto/settings.schemas';

const DEFAULT_ACCESSIBILITY = {
  seniorMode: true,
  dyslexicMode: false,
  nightMode: true,
};

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
        siteName: 'Mairie',
        branding: {} as Prisma.InputJsonValue,
        accessibility: DEFAULT_ACCESSIBILITY as Prisma.InputJsonValue,
        contactEmail: null,
        contactPhone: null,
        address: Prisma.JsonNull,
        municipalityProfile: Prisma.JsonNull,
      },
    });
  }

  async update(input: SettingsUpdateInput) {
    await this.get();

    const data: Prisma.SettingsUpdateInput = {};

    if (input.siteName !== undefined) {
      data.siteName = input.siteName;
    }

    if (input.branding !== undefined) {
      data.branding = input.branding as Prisma.InputJsonValue;
    }

    if (input.accessibility !== undefined) {
      data.accessibility = input.accessibility as Prisma.InputJsonValue;
    }

    if (input.contactEmail !== undefined) {
      data.contactEmail = input.contactEmail;
    }

    if (input.contactPhone !== undefined) {
      data.contactPhone = input.contactPhone;
    }

    if (input.address !== undefined) {
      data.address =
        input.address === null
          ? Prisma.JsonNull
          : (input.address as Prisma.InputJsonValue);
    }

    if (input.municipalityProfile !== undefined) {
      data.municipalityProfile =
        input.municipalityProfile === null
          ? Prisma.JsonNull
          : (input.municipalityProfile as Prisma.InputJsonValue);
    }

    return this.prisma.settings.update({
      where: { id: 'default' },
      data,
    });
  }
}
