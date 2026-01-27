import { z } from 'zod';

export const createRoomSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  slug: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  capacity: z.number().int().positive('La capacité doit être positive').optional(),
  isActive: z.boolean().optional().default(true),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
