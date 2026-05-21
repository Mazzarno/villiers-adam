import { z } from 'zod';

const articleTypeEnum = z.enum(['ACTUALITE', 'PUBLICATION', 'BREVE']);
const publicationTypeEnum = z.enum(['ARRETE', 'COMPTE_RENDU', 'DELIBERATION']);
const statusEnum = z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']);

const articleDraftDataSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).optional().nullable(),
  summary: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  status: statusEnum.optional(),
  publishedAt: z.string().datetime().optional().nullable(),
  createdAt: z.string().datetime().optional().nullable(),
  updatedAt: z.string().datetime().optional().nullable(),
  coverMediaId: z.string().optional().nullable(),
  type: articleTypeEnum.optional(),
  publicationType: publicationTypeEnum.optional().nullable(),
  documentMediaId: z.string().optional().nullable(),
  documentNumber: z.string().optional().nullable(),
  meetingDate: z.string().datetime().optional().nullable(),
  publicationYear: z.number().int().optional().nullable(),
  isFlash: z.boolean().optional(),
});

const eventDraftDataSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).optional().nullable(),
  summary: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  status: statusEnum.optional(),
  publishedAt: z.string().datetime().optional().nullable(),
  createdAt: z.string().datetime().optional().nullable(),
  updatedAt: z.string().datetime().optional().nullable(),
  coverMediaId: z.string().optional().nullable(),
  locationName: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
});

const sourceIdSchema = z.string().min(1).optional().nullable();

export const previewDraftCreateSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('article'),
    sourceId: sourceIdSchema,
    data: articleDraftDataSchema,
  }),
  z.object({
    type: z.literal('event'),
    sourceId: sourceIdSchema,
    data: eventDraftDataSchema,
  }),
]);

export type PreviewDraftCreateInput = z.infer<typeof previewDraftCreateSchema>;
