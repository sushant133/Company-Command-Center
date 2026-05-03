import { z } from 'zod'

// Reused from Backend/src/validations/task.validation.js
export const taskCreateSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title too long (max 200 chars)'),
  description: z.string().max(2000, 'Description too long').optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().optional(),
  companyIds: z.array(z.string()).min(1, 'At least one company required'),
  sectionId: z.string().optional(),
  status: z.enum(['pending', 'in-progress', 'completed']).default('pending'),
})

export const taskUpdateSchema = taskCreateSchema.partial()

// Reused from Backend/src/validations/company.validation.js  
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
})

export const companyUpdateSchema = companyCreateSchema.partial()

// Auth schemas (inferred standard)
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password required'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name too short'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['manager', 'company_admin']),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine((data) => data.role === 'manager' ? !!data.company : true, {
  message: 'Company required for managers',
  path: ['company'],
})

export const entrySchema = z.object({
  type: z.enum(['Project', 'Task', 'Expense', 'Finance', 'HR']),
  title: z.string().min(1, 'Title required'),
  description: z.string().optional(),
  project: z.string().optional(),
  metadata: z.object({}).passthrough(), // Dynamic
})

export const projectSchema = z.object({
  name: z.string().min(1, 'Name required'),
  description: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High']),
  status: z.enum(['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled']),
  budget: z.number().positive('Budget must be positive'),
  progress: z.number().min(0).max(100),
}).partial() // For updates
