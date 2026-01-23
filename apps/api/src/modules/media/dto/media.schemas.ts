import { z } from 'zod';

export const mediaPresignSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().positive(),
});

export const mediaConfirmSchema = z.object({
  storageKey: z.string().min(1),
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().positive(),
  title: z.string().optional().nullable(),
  width: z.number().int().optional().nullable(),
  height: z.number().int().optional().nullable(),
  duration: z.number().int().optional().nullable(),
});

export type MediaPresignInput = z.infer<typeof mediaPresignSchema>;
export type MediaConfirmInput = z.infer<typeof mediaConfirmSchema>;
