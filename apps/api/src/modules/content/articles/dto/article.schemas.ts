import { z } from 'zod';

const statusEnum = z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']);
const articleTypeEnum = z.enum(['ACTUALITE', 'PUBLICATION', 'BREVE']);
const publicationTypeEnum = z.enum(['ARRETE', 'COMPTE_RENDU', 'DELIBERATION']);

export const articleCreateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).optional().nullable(),
  summary: z.string().optional().nullable(),
  content: z.any(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  type: articleTypeEnum.optional(),
  publicationType: publicationTypeEnum.optional().nullable(),
  documentMediaId: z.string().optional().nullable(),
  documentNumber: z.string().optional().nullable(),
  meetingDate: z.string().datetime().optional().nullable(),
  publicationYear: z.number().int().optional().nullable(),
  isFlash: z.boolean().optional(),
  status: statusEnum.optional(),
  publishedAt: z.string().datetime().optional().nullable(),
  scheduledAt: z.string().datetime().optional().nullable(),
  coverMediaId: z.string().optional().nullable(),
});

export const articleUpdateSchema = articleCreateSchema.partial();

export const articleScheduleSchema = z.object({
  scheduledAt: z.string().datetime(),
});

export type ArticleCreateInput = z.infer<typeof articleCreateSchema>;
export type ArticleUpdateInput = z.infer<typeof articleUpdateSchema>;
export type ArticleScheduleInput = z.infer<typeof articleScheduleSchema>;
