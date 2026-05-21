import { z } from 'zod';

const roleEnum = z.enum(['SUPER_ADMIN', 'ADMIN_MAIRIE', 'AGENT', 'CONTRIBUTOR', 'READER']);

export const userCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  avatarUrl: z.string().min(1).optional().nullable(),
  role: roleEnum.optional(),
  isActive: z.boolean().optional(),
});

export const userUpdateSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  avatarUrl: z.string().min(1).optional().nullable(),
  role: roleEnum.optional(),
  isActive: z.boolean().optional(),
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
