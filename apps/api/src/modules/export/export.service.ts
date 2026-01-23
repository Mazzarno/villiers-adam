import { BadRequestException, Injectable } from '@nestjs/common';
import archiver from 'archiver';
import { PassThrough } from 'node:stream';

import { PrismaService } from '../../common/prisma/prisma.service';
import { MinioService } from '../media/minio.service';

type ExportEntity = 'pages' | 'articles' | 'events' | 'agenda' | 'annuaire' | 'demarches' | 'reservations' | 'forms';

@Injectable()
export class ExportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
  ) {}

  private toCsv<T extends Record<string, unknown>>(data: T[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const rows = data.map((item) =>
      headers
        .map((header) => {
          const value = item[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          const str = String(value);
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(','),
    );

    return [headers.join(','), ...rows].join('\n');
  }

  async exportToCsv(entity: ExportEntity): Promise<string> {
    let data: Record<string, unknown>[];

    switch (entity) {
      case 'pages':
        data = await this.prisma.page.findMany();
        break;
      case 'articles':
        data = await this.prisma.article.findMany();
        break;
      case 'events':
        data = await this.prisma.event.findMany();
        break;
      case 'agenda':
        data = await this.prisma.agendaItem.findMany();
        break;
      case 'annuaire':
        data = await this.prisma.directoryEntry.findMany();
        break;
      case 'demarches':
        data = await this.prisma.procedure.findMany();
        break;
      case 'reservations':
        data = await this.prisma.reservation.findMany({ include: { room: true } });
        break;
      case 'forms':
        data = await this.prisma.formSubmission.findMany({ where: { isBot: false } });
        break;
      default:
        throw new BadRequestException(`Unknown entity: ${entity}`);
    }

    return this.toCsv(data as Record<string, unknown>[]);
  }

  async exportAllCsv() {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = new PassThrough();

    archive.pipe(stream);

    const entities: ExportEntity[] = [
      'pages',
      'articles',
      'events',
      'agenda',
      'annuaire',
      'demarches',
      'reservations',
      'forms',
    ];

    for (const entity of entities) {
      const csv = await this.exportToCsv(entity);
      archive.append(csv, { name: `${entity}.csv` });
    }

    await archive.finalize();

    return stream;
  }

  async exportAll() {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = new PassThrough();

    archive.pipe(stream);

    const [pages, articles, events, agenda, directory, procedures, media] = await Promise.all([
      this.prisma.page.findMany(),
      this.prisma.article.findMany(),
      this.prisma.event.findMany(),
      this.prisma.agendaItem.findMany(),
      this.prisma.directoryEntry.findMany(),
      this.prisma.procedure.findMany(),
      this.prisma.media.findMany(),
    ]);

    archive.append(JSON.stringify(pages, null, 2), { name: 'pages.json' });
    archive.append(JSON.stringify(articles, null, 2), { name: 'articles.json' });
    archive.append(JSON.stringify(events, null, 2), { name: 'events.json' });
    archive.append(JSON.stringify(agenda, null, 2), { name: 'agenda.json' });
    archive.append(JSON.stringify(directory, null, 2), { name: 'annuaire.json' });
    archive.append(JSON.stringify(procedures, null, 2), { name: 'demarches.json' });
    archive.append(JSON.stringify(media, null, 2), { name: 'media.json' });

    for (const item of media) {
      const objectStream = await this.minio.getObjectStream(item.storageKey);
      archive.append(objectStream, { name: `media/${item.storageKey}` });
    }

    await archive.finalize();

    return stream;
  }
}
