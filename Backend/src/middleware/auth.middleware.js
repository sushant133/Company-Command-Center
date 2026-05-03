import User from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { verifyToken } from '../utils/jwt.js'
import { isBlacklisted } from '../services/tokenBlacklist.js'

/**
 * SECURITY: Base authentication middleware (protect)
 * Checks Bearer token + blacklist + user active status
 */
export const protect = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null

  if (!token) {
    throw new ApiError(401, 'Access token required')
  }

  // SECURITY: Check token blacklist (immediate logout enforcement)
  if (isBlacklisted(token)) {
    throw new ApiError(401, 'Token has been revoked')
  }

  const decoded = verifyToken(token)
  const user = await User.findById(decoded.userId).select('-passwordHash')

  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid token or inactive user')
  }

  req.user = user
  next()
})

/**
 * SECURITY: Role-based authorization middleware
 * Usage: restrictTo('superadmin', 'admin')
 */
export const restrictTo = (...roles) => {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, `Requires one of these roles: ${roles.join(', ')}`))
    }
    next()
  }
}

/**
 * SECURITY: Company-scoped authorization
 * Automatically scopes queries to user.companyId unless superadmin
 * Usage: appScoped()
 * Options: { query: true } for auto-query scoping
 */
export const appScoped = (options = {}) => {
  return (req, _res, next) => {
    if (req.user.role === 'superadmin') {
      return next()
    }

    if (!req.user.companyId) {
      return next(new ApiError(403, 'Company access required'))
    }

    req.companyId = req.user.companyId

    // Auto-scope queries for company data
    if (options.query && req.queryable) {
      if (!req.queryable.companyId) {
        req.queryable.companyId = req.user.companyId
      }
    }

    next()
  }
}

/**
 * Backwards compatibility
 */
export const auth = protect

