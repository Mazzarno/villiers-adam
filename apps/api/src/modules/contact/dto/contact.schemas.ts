import { z } from 'zod';

export const contactCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1).optional(),
  message: z.string().min(1),
  website: z.string().optional(), // Honeypot anti-bot field
  captchaToken: z.string().optional().nullable(),
});

export type ContactCreateInput = z.infer<typeof contactCreateSchema>;
