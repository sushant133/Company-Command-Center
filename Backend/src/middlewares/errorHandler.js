import AppError from '../utils/AppError.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

/**
 * Centralized Error Handler Middleware
 * Handles all error types with consistent JSON response format
 * Production-ready with stack trace suppression
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors = [];

  // Log the error for debugging
  console.error('❌ ERROR:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
  })

  // AppError (handled first)
  if (err instanceof AppError) {
    statusCode = err.statusCode || 500;
    message = err.message;
    errors = err.errors || [];
  }
  // Zod Validation Error
  else if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.errors.map(e => ({
      path: e.path.join('.'),
      message: e.message,
    }));
  }
  // Mongoose Duplicate Key (E11000)
  else if (err.name === 'MongoServerError' && err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate Field Value';
    const field = Object.keys(err.keyPattern)[0];
    errors = [`${field} already exists`];
  }
  // Mongoose Cast Error (invalid ObjectId)
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid Resource ID';
    errors = [`Invalid ${err.path} ID format`];
  }
  // JWT Errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid Token';
    errors = [];
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token Expired';
    errors = [];
  }
  // Generic Mongoose Validation
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map(e => e.message);
  }

  // Default error message for operational errors
  if (err.isOperational) {
    message = err.message;
  }

  const response = {
    status: 'error',
    message,
    ...(errors.length && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route not found: ${req.originalUrl}`,
  });
};

export default {
  errorHandler,
  notFoundHandler,
};

