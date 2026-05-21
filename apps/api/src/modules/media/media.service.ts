import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MediaType } from '@prisma/client';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import { PrismaService } from '../../common/prisma/prisma.service';
import { MinioService } from './minio.service';
import {
  ALLOWED_MEDIA_MIME_TYPES,
  MAX_MEDIA_SIZE_BYTES,
  MediaConfirmInput,
  MediaPresignInput,
} from './dto/media.schemas';

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
  ) {}

  async presignUpload(input: MediaPresignInput) {
    this.assertAllowedMimeType(input.mimeType);
    if (input.size > MAX_MEDIA_SIZE_BYTES) {
      throw new BadRequestException('File exceeds maximum allowed size');
    }

    const storageKey = this.buildStorageKey(input.filename);
    const uploadUrl = await this.minio.presignedPutObject(storageKey);

    return {
      storageKey,
      uploadUrl,
      bucket: this.minio.getBucket(),
    };
  }

  async confirmUpload(input: MediaConfirmInput, userId: string) {
    this.assertAllowedMimeType(input.mimeType);
    if (input.size > MAX_MEDIA_SIZE_BYTES) {
      throw new BadRequestException('File exceeds maximum allowed size');
    }

    const fileExtension = path.extname(input.filename).toLowerCase();
    const keyExtension = path.extname(input.storageKey).toLowerCase();
    if (!fileExtension || fileExtension !== keyExtension) {
      throw new BadRequestException('File extension mismatch');
    }

    const type = this.mapMediaType(input.mimeType);
    const stat = await this.minio.statObject(input.storageKey).catch(() => null);
    if (!stat) {
      throw new BadRequestException('Uploaded file not found');
    }

    if (stat.size !== input.size) {
      throw new BadRequestException('Uploaded file size mismatch');
    }

    if (stat.size > MAX_MEDIA_SIZE_BYTES) {
      throw new BadRequestException('Uploaded file is too large');
    }

    const uploadedContentType = (
      stat as {
        metaData?: Record<string, string | undefined>;
      }
    ).metaData?.['content-type'];
    if (uploadedContentType && uploadedContentType !== input.mimeType) {
      throw new BadRequestException('Uploaded file type mismatch');
    }

    const url = this.buildPublicUrl(input.storageKey);

    return this.prisma.media.create({
      data: {
        title: input.title ?? null,
        filename: input.filename,
        mimeType: input.mimeType,
        size: input.size,
        url,
        storageKey: input.storageKey,
        bucket: this.minio.getBucket(),
        type,
        width: input.width ?? null,
        height: input.height ?? null,
        duration: input.duration ?? null,
        createdById: userId,
      },
    });
  }

  async list() {
    return this.prisma.media.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getById(id: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) {
      throw new NotFoundException('Media not found');
    }
    return media;
  }

  async download(id: string) {
    const media = await this.getById(id);
    const url = await this.minio.presignedGetObject(media.storageKey);
    return { url };
  }

  async getPublicUrl(storageKey: string) {
    const media = await this.prisma.media.findFirst({
      where: { storageKey },
    });
    if (!media) {
      throw new NotFoundException('Media not found');
    }
    const url = await this.minio.presignedGetObject(storageKey);
    return { url, media };
  }

  async remove(id: string) {
    const media = await this.getById(id);
    await this.minio.removeObject(media.storageKey);
    return this.prisma.media.delete({ where: { id } });
  }

  private mapMediaType(mimeType: string) {
    if (mimeType.startsWith('image/')) {
      return MediaType.IMAGE;
    }
    if (mimeType.startsWith('video/')) {
      return MediaType.VIDEO;
    }
    return MediaType.DOCUMENT;
  }

  private assertAllowedMimeType(mimeType: string) {
    if (!ALLOWED_MEDIA_MIME_TYPES.includes(mimeType as (typeof ALLOWED_MEDIA_MIME_TYPES)[number])) {
      throw new BadRequestException('Unsupported media type');
    }
  }

  private buildStorageKey(filename: string) {
    const parsed = path.parse(filename);
    const ext = parsed.ext.toLowerCase().replace(/[^a-z0-9.]/g, '');
    if (!ext) {
      throw new BadRequestException('Missing or invalid file extension');
    }

    const base = parsed.name.trim().replace(/\s+/g, '-').toLowerCase();
    const safeBase = base.replace(/[^a-z0-9-]/g, '').slice(0, 120) || 'file';
    const now = new Date();
    const prefix = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
    return `${prefix}/${randomUUID()}-${safeBase}${ext}`;
  }

  private buildPublicUrl(storageKey: string) {
    return `/media/public/${storageKey}`;
  }
}
