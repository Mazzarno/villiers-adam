import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SettingsUpdateInput, settingsUpdateSchema } from './dto/settings.schemas';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('public')
  async getPublic() {
    const settings = await this.settingsService.get();
    return {
      siteName: settings.siteName,
      branding: settings.branding,
      accessibility: settings.accessibility,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      address: settings.address,
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
