import { z } from 'zod';

const statusEnum = z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']);

export const articleCreateSchema = z.object({
  title: z.string().min(1),
  summary: z.string().optional().nullable(),
  content: z.any(),
  isFlash: z.boolean().optional(),
  status: statusEnum.optional(),
  publishedAt: z.string().datetime().optional().nullable(),
  scheduledAt: z.string().datetime().optional().nullable(),
  coverMediaId: z.string().optional().nullable(),
});

export const articleUpdateSchema = articleCreateSchema.partial();

export const articleScheduleSchema = z.object({
  scheduledAt: z.string().datetime(),
});

export type ArticleCreateInput = z.infer<typeof articleCreateSchema>;
export type ArticleUpdateInput = z.infer<typeof articleUpdateSchema>;
export type ArticleScheduleInput = z.infer<typeof articleScheduleSchema>;
