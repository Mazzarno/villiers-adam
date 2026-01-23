import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['SUPER_ADMIN', 'ADMIN_MAIRIE', 'AGENT', 'CONTRIBUTOR', 'READER']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export const mfaVerifySchema = z.object({
  mfaToken: z.string().min(1),
  code: z.string().length(6),
});

export const mfaConfirmSchema = z.object({
  code: z.string().length(6),
});

export const mfaDisableSchema = z.object({
  code: z.string().length(6),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type MfaVerifyInput = z.infer<typeof mfaVerifySchema>;
export type MfaConfirmInput = z.infer<typeof mfaConfirmSchema>;
export type MfaDisableInput = z.infer<typeof mfaDisableSchema>;
