import { z } from 'zod';

const statusEnum = z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']);

export const pageCreateSchema = z.object({
  title: z.string().min(1),
  summary: z.string().optional().nullable(),
  content: z.any(),
  status: statusEnum.optional(),
  publishedAt: z.string().datetime().optional().nullable(),
  scheduledAt: z.string().datetime().optional().nullable(),
  coverMediaId: z.string().optional().nullable(),
});

export const pageUpdateSchema = pageCreateSchema.partial();

export const pageScheduleSchema = z.object({
  scheduledAt: z.string().datetime(),
});

export type PageCreateInput = z.infer<typeof pageCreateSchema>;
export type PageUpdateInput = z.infer<typeof pageUpdateSchema>;
export type PageScheduleInput = z.infer<typeof pageScheduleSchema>;
