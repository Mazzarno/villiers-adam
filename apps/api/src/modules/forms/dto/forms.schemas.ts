import { z } from 'zod';

const formTypeEnum = z.enum(['CONTACT', 'SIGNALEMENT']);
const formStatusEnum = z.enum(['NEW', 'IN_PROGRESS', 'CLOSED']);

export const formCreateSchema = z.object({
  type: formTypeEnum,
  subject: z.string().optional().nullable(),
  message: z.string().min(1),
  name: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  data: z.any().optional().nullable(),
  website: z.string().optional().nullable(),
});

export const formStatusSchema = z.object({
  status: formStatusEnum,
});

export type FormCreateInput = z.infer<typeof formCreateSchema>;
export type FormStatusInput = z.infer<typeof formStatusSchema>;
