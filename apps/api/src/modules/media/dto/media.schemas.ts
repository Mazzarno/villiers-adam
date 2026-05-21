import { z } from 'zod';

export const ALLOWED_MEDIA_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
  'video/mp4',
  'video/webm',
] as const;

export const MAX_MEDIA_SIZE_BYTES = 25 * 1024 * 1024;

const storageKeyPattern = /^\d{4}\/\d{2}\/[0-9a-f-]{36}-[a-z0-9-]{1,120}\.[a-z0-9]{1,10}$/i;
const filenamePattern = /^[a-zA-Z0-9._()\- ]+$/;

export const mediaPresignSchema = z.object({
  filename: z.string().trim().min(1).max(180).regex(filenamePattern),
  mimeType: z.enum(ALLOWED_MEDIA_MIME_TYPES),
  size: z.number().int().positive().max(MAX_MEDIA_SIZE_BYTES),
});

export const mediaConfirmSchema = z.object({
  storageKey: z.string().trim().regex(storageKeyPattern),
  filename: z.string().trim().min(1).max(180).regex(filenamePattern),
  mimeType: z.enum(ALLOWED_MEDIA_MIME_TYPES),
  size: z.number().int().positive().max(MAX_MEDIA_SIZE_BYTES),
  title: z.string().trim().max(180).optional().nullable(),
  width: z.number().int().positive().max(12000).optional().nullable(),
  height: z.number().int().positive().max(12000).optional().nullable(),
  duration: z.number().int().positive().max(24 * 60 * 60).optional().nullable(),
});

export type MediaPresignInput = z.infer<typeof mediaPresignSchema>;
export type MediaConfirmInput = z.infer<typeof mediaConfirmSchema>;
