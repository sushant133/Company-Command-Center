import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import User from '../models/User.js'
import { signAccessToken, signRefreshToken, verifyToken } from '../utils/jwt.js'
import { addToBlacklist, isBlacklisted } from './tokenBlacklist.js'
import { ApiError } from '../utils/ApiError.js'

export const hashPassword = async (password) => bcrypt.hash(password, 10)
export const comparePassword = async (password, hash) => bcrypt.compare(password, hash)

const normalizeCompanyId = (companyValue) => {
  if (!companyValue) return null
  if (typeof companyValue === 'object' && companyValue._id) return companyValue._id
  return companyValue
}

/**
 * SECURITY: Generate cryptographically secure refresh token
 * Rotation: Each new refresh invalidates the old one
 */
export const generateRefreshToken = async (userId) => {
  const refreshId = crypto.randomUUID()
  const refreshTokenHash = crypto.createHash('sha256').update(refreshId).digest('hex')
  const expiresInMs = 7 * 24 * 60 * 60 * 1000 // 7 days
  const expiresAt = new Date(Date.now() + expiresInMs)

  // Store hashed refresh token in DB (token rotation support)
  await User.findByIdAndUpdate(userId, {
    refreshTokenHash,
    refreshTokenExpiry: expiresAt,
  })

  const token = signRefreshToken({ userId, refreshId, type: 'refresh' })
  
  // Add to blacklist cleanup later
  addToBlacklist(token, expiresInMs)

  return { token, refreshId, expiresAt }
}

/**
 * SECURITY: Verify & rotate refresh token (invalidate old, issue new)
 * Implements token rotation best practice
 */
export const verifyAndRotateRefreshToken = async (refreshTokenStr) => {
  // Check blacklist first
  if (isBlacklisted(refreshTokenStr)) {
    throw new ApiError(401, 'Token has been revoked')
  }

  const decoded = verifyToken(refreshTokenStr)
  if (decoded.type !== 'refresh') {
    throw new ApiError(401, 'Invalid token type')
  }

  const user = await User.findById(decoded.userId)
  if (!user || !user.refreshTokenHash || !user.refreshTokenExpiry) {
    throw new ApiError(401, 'Refresh token not found')
  }

  if (user.refreshTokenExpiry < new Date()) {
    await revokeUserRefreshTokens(user._id)
    throw new ApiError(401, 'Refresh token expired')
  }

  // Verify hash matches (double-check security)
  const tokenHash = crypto.createHash('sha256').update(decoded.refreshId).digest('hex')
  if (tokenHash !== user.refreshTokenHash) {
    await revokeUserRefreshTokens(user._id)
    throw new ApiError(401, 'Invalid refresh token')
  }

  // TOKEN ROTATION: Revoke old, generate new
  await revokeUserRefreshTokens(user._id)
  const newRefresh = await generateRefreshToken(user._id)

  return {
    user,
    accessToken: signAccessToken({
      userId: user._id,
      role: user.role,
      companyId: normalizeCompanyId(user.companyId),
    }),
    refreshToken: newRefresh.token,
  }
}

/**
 * SECURITY: Revoke all refresh tokens for user (logout)
 */
export const revokeUserRefreshTokens = async (userId) => {
  await User.findByIdAndUpdate(userId, {
    refreshTokenHash: null,
    refreshTokenExpiry: null,
  })
}

/**
 * Create complete auth payload with both access + refresh tokens
 */
export const createAuthPayload = async (user) => {
  const normalizedCompanyId = normalizeCompanyId(user.companyId)
  const refreshTokens = await generateRefreshToken(user._id)

  return {
    accessToken: signAccessToken({
      userId: user._id,
      role: user.role,
      companyId: normalizedCompanyId,
    }),
    refreshToken: refreshTokens.token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: normalizedCompanyId,
      company: typeof user.companyId === 'object' && user.companyId?._id ? user.companyId : null,
      isActive: user.isActive,
    },
  }
}

