import { z } from 'zod';

import { httpUrlSchema } from '../../../common/validation/url.schemas';

const statusEnum = z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']);

export const municipalServiceCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional().nullable(),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  openingHours: z.any().optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  website: httpUrlSchema.optional().nullable(),
  order: z.number().int().optional(),
  status: statusEnum.optional(),
  publishedAt: z.string().datetime().optional().nullable(),
  scheduledAt: z.string().datetime().optional().nullable(),
  coverMediaId: z.string().optional().nullable(),
});

export const municipalServiceUpdateSchema = municipalServiceCreateSchema.partial();

export const municipalServiceScheduleSchema = z.object({
  scheduledAt: z.string().datetime(),
});

export type MunicipalServiceCreateInput = z.infer<typeof municipalServiceCreateSchema>;
export type MunicipalServiceUpdateInput = z.infer<typeof municipalServiceUpdateSchema>;
export type MunicipalServiceScheduleInput = z.infer<typeof municipalServiceScheduleSchema>;
