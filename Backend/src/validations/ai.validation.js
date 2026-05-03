import { z } from 'zod';

/**
 * AI Chat validation schema
 * Used for /api/ai/chat endpoint
 */
export const aiChatSchema = z.object({
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message too long (max 1000 chars)')
    .trim(),
});

/**
 * Generate insight validation (for superadmins)
 */
export const generateInsightSchema = z.object({
  companyIds: z.array(z.string()).min(1, 'At least one company required'),
  type: z.enum(['financial', 'hr', 'tax', 'overall']).optional(),
});

export default {
  aiChat: aiChatSchema,
  generateInsight: generateInsightSchema,
};

