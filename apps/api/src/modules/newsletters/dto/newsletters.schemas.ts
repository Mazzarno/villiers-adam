import { z } from 'zod';

export const topicCreateSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const topicUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const subscribeSchema = z.object({
  email: z.string().email(),
  topicIds: z.array(z.string()).optional(),
  captchaToken: z.string().optional().nullable(),
});

export const unsubscribeSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  captchaToken: z.string().optional().nullable(),
});

export type TopicCreateInput = z.infer<typeof topicCreateSchema>;
export type TopicUpdateInput = z.infer<typeof topicUpdateSchema>;
export type SubscribeInput = z.infer<typeof subscribeSchema>;
export type UnsubscribeInput = z.infer<typeof unsubscribeSchema>;
