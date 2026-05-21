import { BadRequestException, Body, Controller, Get, Param, Post, Req, Res, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExportService } from './export.service';
import { archiveImportOptionsSchema, ArchiveImportOptionsInput } from './dto/export.schemas';

type ExportEntity = 'articles' | 'events' | 'annuaire' | 'demarches' | 'council' | 'services' | 'transports';
type UploadedArchive = { buffer: Buffer };

@Controller('export')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @RequirePermission('audit:read')
  @Get()
  async exportJson(@Res() res: Response) {
    const result = await this.exportService.exportFull('system');

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="mairie-export.zip"');

    result.stream.pipe(res);
  }

  @RequirePermission('audit:read')
  @Get('csv')
  async exportAllCsv(@Res() res: Response) {
    const stream = await this.exportService.exportAllCsv();

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="mairie-export-csv.zip"');

    stream.pipe(res);
  }

  @RequirePermission('audit:read')
  @Get('csv/:entity')
  async exportEntityCsv(@Param('entity') entity: ExportEntity, @Res() res: Response) {
    const csv = await this.exportService.exportToCsv(entity);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${entity}.csv"`);

    res.send(csv);
  }

  @RequirePermission('system:import')
  @Post('import')
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      files: 1,
      fileSize: 50 * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
      const filename = file.originalname?.toLowerCase() ?? '';
      const mimetype = file.mimetype?.toLowerCase() ?? '';
      const isZipMime =
        mimetype === 'application/zip' ||
        mimetype === 'application/x-zip-compressed' ||
        mimetype === 'application/octet-stream';
      const isZipName = filename.endsWith('.zip');

      if (!isZipMime && !isZipName) {
        cb(new BadRequestException('Only ZIP archives are allowed'), false);
        return;
      }

      cb(null, true);
    },
  }))
  async importJson(
    @UploadedFile() file: UploadedArchive,
    @Body(new ZodValidationPipe(archiveImportOptionsSchema)) body: ArchiveImportOptionsInput,
    @Req() req: { user: { sub: string } },
  ) {
    return this.exportService.importFromArchive(file, req.user.sub, body);
  }
}
