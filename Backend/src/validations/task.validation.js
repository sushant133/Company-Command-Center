import { z } from 'zod';

/**
 * Task creation schema
 * Used for POST /api/tasks
 */
export const taskCreateSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title too long (max 200 chars)'),
  description: z.string().max(2000, 'Description too long').optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  companyIds: z.array(z.string()).min(1, 'At least one company required'),
  sectionId: z.string().optional(),
  status: z.enum(['pending', 'in-progress', 'completed']).default('pending'),
});

/**
 * Task update schema (partial)
 * Used for PUT/PATCH /api/tasks/:id
 */
export const taskUpdateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  companyIds: z.array(z.string()).optional(),
  sectionId: z.string().optional(),
  status: z.enum(['pending', 'in-progress', 'completed']).optional(),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(['pending', 'in-progress', 'completed']),
});

export default {
  create: taskCreateSchema,
  update: taskUpdateSchema,
  status: updateTaskStatusSchema,
};

