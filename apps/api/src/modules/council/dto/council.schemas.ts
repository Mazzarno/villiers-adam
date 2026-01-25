import { z } from 'zod';

const statusEnum = z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']);
const roleEnum = z.enum(['MAIRE', 'ADJOINT', 'CONSEILLER', 'CONSEILLER_DELEGUE']);

export const councilCreateSchema = z.object({
  name: z.string().min(1),
  role: roleEnum,
  roleTitle: z.string().optional().nullable(),
  delegations: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  order: z.number().int().optional(),
  status: statusEnum.optional(),
  publishedAt: z.string().datetime().optional().nullable(),
  scheduledAt: z.string().datetime().optional().nullable(),
  photoMediaId: z.string().optional().nullable(),
});

export const councilUpdateSchema = councilCreateSchema.partial();

export const councilScheduleSchema = z.object({
  scheduledAt: z.string().datetime(),
});

export type CouncilCreateInput = z.infer<typeof councilCreateSchema>;
export type CouncilUpdateInput = z.infer<typeof councilUpdateSchema>;
export type CouncilScheduleInput = z.infer<typeof councilScheduleSchema>;
