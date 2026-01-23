import { z } from 'zod';

const statusEnum = z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']);

export const eventCreateSchema = z.object({
  title: z.string().min(1),
  summary: z.string().optional().nullable(),
  content: z.any(),
  locationName: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional().nullable(),
  status: statusEnum.optional(),
  publishedAt: z.string().datetime().optional().nullable(),
  scheduledAt: z.string().datetime().optional().nullable(),
  coverMediaId: z.string().optional().nullable(),
});

export const eventUpdateSchema = eventCreateSchema.partial();

export const eventScheduleSchema = z.object({
  scheduledAt: z.string().datetime(),
});

export type EventCreateInput = z.infer<typeof eventCreateSchema>;
export type EventUpdateInput = z.infer<typeof eventUpdateSchema>;
export type EventScheduleInput = z.infer<typeof eventScheduleSchema>;
