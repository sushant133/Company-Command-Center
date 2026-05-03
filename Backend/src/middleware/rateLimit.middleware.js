import rateLimit, { ipKeyGenerator } from 'express-rate-limit'
import slowDown from 'express-slow-down'
import { env } from '../config/env.js'

// SECURITY: AI Chat - 10 requests per minute per user/IP
export const aiChatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit per windowMs
  message: {
    success: false,
    message: 'Too many AI chat requests. Try again in 1 minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?._id || ipKeyGenerator(req) // Prefer user ID, fallback to IP with IPv6 support
  },
})

// SECURITY: Auth endpoints - more lenient in development
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: env.nodeEnv === 'development' ? 100 : 5, // 100 attempts in dev, 5 in production
  message: {
    success: false,
    message: 'Too many auth attempts. Try again in 1 minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
})

// SECURITY: General API - 100 requests per 15 minutes per IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// SECURITY: Brute force protection with slow-down
export const slowDownMiddleware = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests before slowing
  delayMs: () => 500, // Slow down by 500ms after 50 requests
})

export default {
  aiChat: aiChatLimiter,
  auth: authLimiter,
  api: apiLimiter,
  slowDown: slowDownMiddleware,
}

