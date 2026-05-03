import { z } from 'zod';
import aiValidation from '../validations/ai.validation.js';
import taskValidation from '../validations/task.validation.js';
import companyValidation from '../validations/company.validation.js';
import authValidation from '../validations/auth.validation.js';

/**
 * Reusable Zod validation middleware factory
 * Supports body parsing with field-specific errors
 */
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Parse req.body (files/params handled by other middlewares)
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        const errors = error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message,
        }));
        const isDev = process.env.NODE_ENV === 'development';
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors,
          ...(isDev && { stack: error.stack }),
        });
      }
      // Forward non-validation errors
      next(error);
    }
  };
};

/**
 * Pre-configured validators for common endpoints
 */
export default {
  aiChat: validate(aiValidation.aiChat),
  taskCreate: validate(taskValidation.create),
  taskUpdate: validate(taskValidation.update),
  companyCreate: validate(companyValidation.create),
  login: validate(authValidation.login),
  register: validate(authValidation.register),
  refresh: () => (req, res, next) => next(), // No body validation for refresh
};

