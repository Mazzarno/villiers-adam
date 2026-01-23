import { z } from 'zod';

const statusEnum = z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']);
const agendaTypeEnum = z.enum(['COMMUNAL', 'ASSOCIATIF', 'DECHETS']);

export const agendaCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  agendaType: agendaTypeEnum,
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional().nullable(),
  isAllDay: z.boolean().optional(),
  recurrenceRule: z.string().optional().nullable(),
  status: statusEnum.optional(),
  publishedAt: z.string().datetime().optional().nullable(),
  scheduledAt: z.string().datetime().optional().nullable(),
});

export const agendaUpdateSchema = agendaCreateSchema.partial();

export const agendaScheduleSchema = z.object({
  scheduledAt: z.string().datetime(),
});

export type AgendaCreateInput = z.infer<typeof agendaCreateSchema>;
export type AgendaUpdateInput = z.infer<typeof agendaUpdateSchema>;
export type AgendaScheduleInput = z.infer<typeof agendaScheduleSchema>;
