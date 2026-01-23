import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExportService } from './export.service';

type ExportEntity = 'pages' | 'articles' | 'events' | 'agenda' | 'annuaire' | 'demarches' | 'reservations' | 'forms';

@Controller('export')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @RequirePermission('content:read')
  @Get()
  async exportJson(@Res() res: Response) {
    const stream = await this.exportService.exportAll();

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="mairie-export.zip"');

    stream.pipe(res);
  }

  @RequirePermission('content:read')
  @Get('csv')
  async exportAllCsv(@Res() res: Response) {
    const stream = await this.exportService.exportAllCsv();

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="mairie-export-csv.zip"');

    stream.pipe(res);
  }

  @RequirePermission('content:read')
  @Get('csv/:entity')
  async exportEntityCsv(@Param('entity') entity: ExportEntity, @Res() res: Response) {
    const csv = await this.exportService.exportToCsv(entity);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${entity}.csv"`);

    res.send(csv);
  }
}
