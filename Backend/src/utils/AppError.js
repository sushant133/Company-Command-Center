/**
 * Custom Application Error class - Production ready
 * Extends native Error with HTTP status and operational flag
 */
export class AppError extends Error {
  statusCode = 500;
  isOperational = true;
  errors = null;

  constructor(statusCode = 500, message, errors = null, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;

    // Ensure correct stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;

