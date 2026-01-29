import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import path from 'node:path';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';

import { validateEnv } from './config/env.schema';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ContentModule } from './modules/content/content.module';
import { AgendaModule } from './modules/agenda/agenda.module';
import { AnnuaireModule } from './modules/annuaire/annuaire.module';
import { DemarchesModule } from './modules/demarches/demarches.module';
import { MediaModule } from './modules/media/media.module';
import { SearchModule } from './modules/search/search.module';
import { EmailModule } from './modules/email/email.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AuditModule } from './modules/audit/audit.module';
import { HealthModule } from './modules/health/health.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { FormsModule } from './modules/forms/forms.module';
import { ExportModule } from './modules/export/export.module';
import { PrivacyModule } from './modules/privacy/privacy.module';
import { CouncilModule } from './modules/council/council.module';
import { MunicipalServicesModule } from './modules/municipal-services/municipal-services.module';
import { TransportsModule } from './modules/transports/transports.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: [
        path.resolve(process.cwd(), '.env'),
        path.resolve(process.cwd(), '../../.env'),
      ],
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    ContentModule,
    AgendaModule,
    AnnuaireModule,
    DemarchesModule,
    MediaModule,
    SearchModule,
    EmailModule,
    ReservationsModule,
    RoomsModule,
    FormsModule,
    ExportModule,
    PrivacyModule,
    SettingsModule,
    AuditModule,
    CouncilModule,
    MunicipalServicesModule,
    TransportsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
