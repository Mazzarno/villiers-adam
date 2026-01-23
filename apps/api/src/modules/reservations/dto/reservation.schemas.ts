import { z } from 'zod';

const statusEnum = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']);

export const reservationCreateSchema = z.object({
  roomId: z.string().min(1),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  requesterName: z.string().min(1),
  requesterEmail: z.string().email(),
  requesterPhone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const reservationStatusSchema = z.object({
  status: statusEnum,
});

export const availabilityCheckSchema = z.object({
  roomId: z.string().min(1),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
});

export type ReservationCreateInput = z.infer<typeof reservationCreateSchema>;
export type ReservationStatusInput = z.infer<typeof reservationStatusSchema>;
export type AvailabilityCheckInput = z.infer<typeof availabilityCheckSchema>;
