import { z } from 'zod';

import { httpUrlSchema } from '../../../common/validation/url.schemas';

const statusEnum = z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']);

export const demarchesCreateSchema = z.object({
  title: z.string().min(1),
  summary: z.string().optional().nullable(),
  content: z.any(),
  steps: z.any().optional().nullable(),
  externalUrl: httpUrlSchema.optional().nullable(),
  status: statusEnum.optional(),
  publishedAt: z.string().datetime().optional().nullable(),
  scheduledAt: z.string().datetime().optional().nullable(),
  coverMediaId: z.string().optional().nullable(),
});

export const demarchesUpdateSchema = demarchesCreateSchema.partial();

export const demarchesScheduleSchema = z.object({
  scheduledAt: z.string().datetime(),
});

export type DemarchesCreateInput = z.infer<typeof demarchesCreateSchema>;
export type DemarchesUpdateInput = z.infer<typeof demarchesUpdateSchema>;
export type DemarchesScheduleInput = z.infer<typeof demarchesScheduleSchema>;
