import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { SearchModule } from '../search/search.module';

import { PermissionGuard } from '../../common/guards/permission.guard';
import { AnnuaireController } from './annuaire.controller';
import { AnnuaireService } from './annuaire.service';

@Module({
  imports: [AuditModule, SearchModule],
  controllers: [AnnuaireController],
  providers: [AnnuaireService, PermissionGuard],
})
export class AnnuaireModule {}
