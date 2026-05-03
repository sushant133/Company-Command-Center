import { z } from 'zod';

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password at least 6 characters'),
});

/**
 * Register schema
 */
export const registerSchema = z.object({
  name: z.string().min(2, 'Name too short').max(50, 'Name too long'),
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$/,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
  passwordConfirm: z.string(),
  companyId: z.string().optional(),
  role: z.enum(['admin']).optional(), // Only admin for register (superadmin via bootstrap)
});

/**
 * Forgot password schema
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

/**
 * Reset password schema (with OTP)
 */
export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$/,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
});

export default {
  login: loginSchema,
  register: registerSchema,
  forgotPassword: forgotPasswordSchema,
  resetPassword: resetPasswordSchema,
};

