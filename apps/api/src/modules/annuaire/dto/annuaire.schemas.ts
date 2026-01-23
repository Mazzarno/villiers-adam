import { z } from 'zod';

const statusEnum = z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']);
const directoryTypeEnum = z.enum(['ASSOCIATION', 'ENTERPRISE', 'COMMERCE']);

export const annuaireCreateSchema = z.object({
  name: z.string().min(1),
  type: directoryTypeEnum,
  description: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  website: z.string().url().optional().nullable(),
  addressLine1: z.string().optional().nullable(),
  addressLine2: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  openingHours: z.any().optional().nullable(),
  status: statusEnum.optional(),
  publishedAt: z.string().datetime().optional().nullable(),
  scheduledAt: z.string().datetime().optional().nullable(),
  coverMediaId: z.string().optional().nullable(),
});

export const annuaireUpdateSchema = annuaireCreateSchema.partial();

export const annuaireScheduleSchema = z.object({
  scheduledAt: z.string().datetime(),
});

export type AnnuaireCreateInput = z.infer<typeof annuaireCreateSchema>;
export type AnnuaireUpdateInput = z.infer<typeof annuaireUpdateSchema>;
export type AnnuaireScheduleInput = z.infer<typeof annuaireScheduleSchema>;
