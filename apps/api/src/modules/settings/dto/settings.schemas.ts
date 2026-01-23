import { z } from 'zod';

const colorSchema = z.object({
  primaire: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  secondaire: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

const brandingSchema = z.object({
  couleurs: colorSchema.partial(),
  slogan: z.string().optional().nullable(),
});

const accessibilitySchema = z.object({
  seniorMode: z.boolean().optional(),
  dyslexicMode: z.boolean().optional(),
  nightMode: z.boolean().optional(),
  keyboardMode: z.boolean().optional(),
});

export const settingsUpdateSchema = z.object({
  siteName: z.string().optional(),
  branding: brandingSchema.optional(),
  accessibility: accessibilitySchema.optional(),
  contactEmail: z.string().email().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  address: z.any().optional().nullable(),
});

export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;
