import { z } from 'zod';

export const requestOtpSchema = {
  body: z.object({
    email: z.string().email(),
    purpose: z.enum(['login', 'verify_email', 'reset_password']).optional().default('login'),
  }),
};

export const verifyOtpSchema = {
  body: z.object({
    email: z.string().email(),
    code: z.string().min(4).max(8),
    purpose: z.enum(['login', 'verify_email', 'reset_password']).optional().default('login'),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
};

export const refreshSchema = {
  body: z.object({
    refreshToken: z.string().min(1),
  }),
};

export const logoutSchema = {
  body: z.object({
    refreshToken: z.string().min(1).optional(),
  }),
};

export default { requestOtpSchema, verifyOtpSchema, loginSchema, refreshSchema, logoutSchema };
