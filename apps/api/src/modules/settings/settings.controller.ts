import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SettingsUpdateInput, settingsUpdateSchema } from './dto/settings.schemas';
import { SettingsService } from './settings.service';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function toPublicBranding(value: unknown) {
  const branding = isRecord(value) ? value : {};
  const colors = isRecord(branding.colors)
    ? branding.colors
    : isRecord(branding.couleurs)
      ? branding.couleurs
      : {};

  return {
    logo: normalizeString(branding.logo),
    primaryColor: normalizeString(colors.primary) ?? normalizeString(colors.primaire),
    secondaryColor: normalizeString(colors.secondary) ?? normalizeString(colors.secondaire),
  };
}

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('public')
  async getPublic() {
    const settings = await this.settingsService.get();
    return {
      siteName: settings.siteName,
      branding: toPublicBranding(settings.branding),
      accessibility: settings.accessibility,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      address: settings.address,
      municipalityProfile: settings.municipalityProfile,
    };
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('settings:read')
  @Get()
  getAdmin() {
    return this.settingsService.get();
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('settings:update')
  @Patch()
  update(@Body(new ZodValidationPipe(settingsUpdateSchema)) body: SettingsUpdateInput) {
    return this.settingsService.update(body);
  }
}
