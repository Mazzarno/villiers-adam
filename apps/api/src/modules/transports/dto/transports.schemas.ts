import { z } from 'zod';

const statusEnum = z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']);

export const transportsCreateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).optional().nullable(),
  summary: z.string().optional().nullable(),
  content: z.any(),
  operator: z.string().optional().nullable(),
  website: z.string().url().optional().nullable(),
  phone: z.string().optional().nullable(),
  status: statusEnum.optional(),
  publishedAt: z.string().datetime().optional().nullable(),
  scheduledAt: z.string().datetime().optional().nullable(),
  coverMediaId: z.string().optional().nullable(),
});

export const transportsUpdateSchema = transportsCreateSchema.partial();

export const transportsScheduleSchema = z.object({
  scheduledAt: z.string().datetime(),
});

export type TransportCreateInput = z.infer<typeof transportsCreateSchema>;
export type TransportUpdateInput = z.infer<typeof transportsUpdateSchema>;
export type TransportScheduleInput = z.infer<typeof transportsScheduleSchema>;
