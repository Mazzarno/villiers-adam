import { z } from 'zod';

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

export const httpUrlSchema = z.string().url().refine((value) => {
  try {
    const parsed = new URL(value);
    return ALLOWED_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}, 'Only http/https URLs are allowed');
