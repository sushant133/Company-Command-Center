import { z } from 'zod';

/**
 * Company creation schema
 * Used for POST /api/companies
 */
export const companyCreateSchema = z.object({
  name: z.string()
    .min(2, 'Company name too short')
    .max(100, 'Company name too long'),
  code: z.string()
    .min(2, 'Code too short')
    .max(10, 'Code too long')
    .regex(/^[A-Z0-9-]+$/, 'Code can only contain letters, numbers, and hyphens'),
  industry: z.string().max(50).optional(),
  location: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
});

/**
 * Company update schema (partial)
 */
export const companyUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  code: z.string().regex(/^[A-Z0-9-]+$/, 'Invalid code format').optional(),
  industry: z.string().max(50).optional(),
  location: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export default {
  create: companyCreateSchema,
  update: companyUpdateSchema,
};

