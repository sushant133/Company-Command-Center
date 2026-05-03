import User from '../models/User.js'
import OTP from '../models/OTP.js'
import { comparePassword, createAuthPayload, hashPassword, revokeUserRefreshTokens, verifyAndRotateRefreshToken } from '../services/auth.service.js'
import { sendOTPEmail } from '../services/email.service.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess } from '../utils/response.js'
import { ensureRequiredString, isValidEmail } from '../utils/validators.js'

/**
 * Generate a random 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// ==================== FIXED BOOTSTRAP SUPERADMIN ====================
export const bootstrapSuperadmin = asyncHandler(async (req, res) => {
  const existingSuperadmin = await User.findOne({ role: 'superadmin' })

  if (existingSuperadmin) {
    return sendSuccess(res, {
      message: 'Superadmin already exists',
    })
  }

  // First time setup - Create default superadmin
  const passwordHash = await hashPassword('Admin@12345')

  const user = await User.create({
    name: 'Super Admin',
    email: 'admin@company.com',
    passwordHash,
    role: 'superadmin',
  })

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Superadmin created successfully',
    data: {
      email: 'admin@company.com',
      password: 'Admin@12345'   // Show only once
    }
  })
})
// =================================================================

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  ensureRequiredString(email, 'Email')
  ensureRequiredString(password, 'Password')

  if (!isValidEmail(email)) {
    throw new ApiError(400, 'A valid email is required')
  }

  const user = await User.findOne({ email }).populate('companyId', 'name code status')

  if (!user) {
    throw new ApiError(401, 'Invalid email or password')
  }

  const isMatch = await comparePassword(password, user.passwordHash)

  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password')
  }

  if (!user.isActive) {
    throw new ApiError(403, 'User account is inactive')
  }

  user.lastLoginAt = new Date()
  await user.save()

  return sendSuccess(res, {
    message: 'Login successful',
    data: await createAuthPayload(user),
  })
})

export const me = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id)
    .select('-passwordHash')
    .populate('companyId', 'name code status')

  return sendSuccess(res, {
    data: currentUser,
  })
})

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  ensureRequiredString(currentPassword, 'Current password')
  ensureRequiredString(newPassword, 'New password')

  const user = await User.findById(req.user._id)
  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  const isMatch = await comparePassword(currentPassword, user.passwordHash)
  if (!isMatch) {
    throw new ApiError(401, 'Current password is incorrect')
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters')
  }

  user.passwordHash = await hashPassword(newPassword)
  await user.save()

  return sendSuccess(res, {
    message: 'Password changed successfully',
  })
})

export const logout = asyncHandler(async (req, res) => {
  await revokeUserRefreshTokens(req.user._id)
  return sendSuccess(res, {
    message: 'Logged out successfully. Tokens revoked.',
  })
})

export const refreshTokens = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.headers['x-refresh-token']
  
  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token required')
  }

  const { accessToken, refreshToken: newRefreshToken, user } = await verifyAndRotateRefreshToken(refreshToken)

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })

  return sendSuccess(res, {
    message: 'Tokens refreshed successfully',
    data: {
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        isActive: user.isActive,
      },
    },
  })
})

export const register = asyncHandler(async (req, res) => {
  if (req.user.role !== 'superadmin') {
    throw new ApiError(403, 'Only superadmin can create new users')
  }

  const { name, email, password, passwordConfirm, companyId } = req.body

  if (password !== passwordConfirm) {
    throw new ApiError(400, 'Passwords do not match')
  }

  const existingUser = await User.findOne({ email: String(email).toLowerCase().trim() })
  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists')
  }

  if (!companyId) {
    throw new ApiError(400, 'Company ID required for admin registration')
  }

  const passwordHash = await hashPassword(password)
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: 'admin',
    companyId,
  })

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Admin user created successfully',
    data: await createAuthPayload(user),
  })
})

// Forgot Password Flow (unchanged)
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body

  ensureRequiredString(email, 'Email')

  if (!isValidEmail(email)) {
    throw new ApiError(400, 'A valid email is required')
  }

  const normalizedEmail = String(email).toLowerCase().trim()

  const user = await User.findOne({ email: normalizedEmail })
  if (!user) {
    return sendSuccess(res, {
      message: 'If an account exists with this email, an OTP has been sent.',
    })
  }

  await OTP.deleteMany({ email: normalizedEmail })

  const otpCode = generateOTP()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  await OTP.create({
    email: normalizedEmail,
    otp: otpCode,
    expiresAt,
  })

  try {
    await sendOTPEmail(normalizedEmail, otpCode, user.name)
  } catch (emailError) {
    await OTP.deleteMany({ email: normalizedEmail })
    throw new ApiError(500, 'Failed to send OTP email. Please try again later.')
  }

  return sendSuccess(res, {
    message: 'If an account exists with this email, an OTP has been sent.',
  })
})

export const verifyOTP = asyncHandler(async (req, res) => { ... }) // Keep your existing code for this and below

// (Keep the rest of your functions: verifyOTP, resetPassword as they were)