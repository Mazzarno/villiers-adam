import { z } from 'zod';

export const importModeSchema = z.enum(['merge', 'replace']);

const booleanLikeSchema = z.preprocess((value) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === '' || normalized === 'false' || normalized === '0' || normalized === 'no') {
      return false;
    }
    if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
      return true;
    }
  }

  return value;
}, z.boolean());

export const archiveImportOptionsSchema = z.object({
  mode: z.preprocess(
    (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value),
    importModeSchema.default('merge'),
  ),
  dryRun: booleanLikeSchema.default(false),
  confirmReplace: z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() : value),
    z.string().min(1).optional(),
  ),
}).strict();

export type ImportMode = z.infer<typeof importModeSchema>;
export type ArchiveImportOptionsInput = z.infer<typeof archiveImportOptionsSchema>;
