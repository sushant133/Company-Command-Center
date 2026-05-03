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

export const bootstrapSuperadmin = asyncHandler(async (req, res) => {
  const existingSuperadmin = await User.findOne({ role: 'superadmin' })

  if (existingSuperadmin) {
    throw new ApiError(400, 'Superadmin already exists')
  }

  const { name, email, password } = req.body

  ensureRequiredString(name, 'Name')
  ensureRequiredString(email, 'Email')
  ensureRequiredString(password, 'Password')

  if (!isValidEmail(email)) {
    throw new ApiError(400, 'A valid email is required')
  }

  const existingUser = await User.findOne({ email: String(email).toLowerCase().trim() })

  if (existingUser) {
    throw new ApiError(409, 'A user with this email already exists')
  }

  const passwordHash = await hashPassword(password)
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: 'superadmin',
  })

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Superadmin created successfully',
    data: await createAuthPayload(user),
  })
})

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

/**
 * SECURITY: Proper logout - revoke refresh token (immediate invalidation)
 */
export const logout = asyncHandler(async (req, res) => {
  await revokeUserRefreshTokens(req.user._id)
  return sendSuccess(res, {
    message: 'Logged out successfully. Tokens revoked.',
  })
})

/**
 * SECURITY: Refresh token endpoint with rotation
 * POST /api/auth/refresh
 * Returns new access + refresh tokens, old refresh is revoked
 */
export const refreshTokens = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.headers['x-refresh-token']
  
  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token required')
  }

  const { accessToken, refreshToken: newRefreshToken, user } = await verifyAndRotateRefreshToken(refreshToken)

  // Set new refresh token as httpOnly cookie (secure, can't be accessed by JS)
  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true, // SECURITY: Prevents XSS access
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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

/**
 * SUPERADMIN ONLY: Register new admin user for a company
 * Includes password confirmation & strong policy enforcement
 */
export const register = asyncHandler(async (req, res) => {
  // SECURITY: Only superadmin can register new users
  if (req.user.role !== 'superadmin') {
    throw new ApiError(403, 'Only superadmin can create new users')
  }

  const { name, email, password, passwordConfirm, companyId } = req.body

  // Validate password confirmation
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

// ─────────────────────────────────────────────────────────────
// Forgot Password Flow with Email OTP
// ─────────────────────────────────────────────────────────────

/**
 * Step 1: Generate OTP and send via email
 * POST /api/auth/forgot-password
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body

  ensureRequiredString(email, 'Email')

  if (!isValidEmail(email)) {
    throw new ApiError(400, 'A valid email is required')
  }

  const normalizedEmail = String(email).toLowerCase().trim()

  // Check if user exists
  const user = await User.findOne({ email: normalizedEmail })
  if (!user) {
    // For security, don't reveal whether email exists or not
    return sendSuccess(res, {
      message: 'If an account exists with this email, an OTP has been sent.',
    })
  }

  // Delete any existing OTP for this email
  await OTP.deleteMany({ email: normalizedEmail })

  // Generate new OTP
  const otpCode = generateOTP()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

  // Save OTP to database
  await OTP.create({
    email: normalizedEmail,
    otp: otpCode,
    expiresAt,
  })

  // Send OTP via email
  try {
    await sendOTPEmail(normalizedEmail, otpCode, user.name)
  } catch (emailError) {
    // If email fails, delete the OTP and throw error
    await OTP.deleteMany({ email: normalizedEmail })
    console.error('Failed to send OTP email:', emailError)
    throw new ApiError(500, 'Failed to send OTP email. Please try again later.')
  }

  return sendSuccess(res, {
    message: 'If an account exists with this email, an OTP has been sent.',
  })
})

/**
 * Step 2: Verify OTP
 * POST /api/auth/verify-otp
 */
export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body

  ensureRequiredString(email, 'Email')
  ensureRequiredString(otp, 'OTP')

  if (!isValidEmail(email)) {
    throw new ApiError(400, 'A valid email is required')
  }

  const normalizedEmail = String(email).toLowerCase().trim()

  // Find the OTP record
  const otpRecord = await OTP.findOne({
    email: normalizedEmail,
    otp: String(otp).trim(),
  })

  if (!otpRecord) {
    throw new ApiError(400, 'Invalid OTP. Please try again.')
  }

  // Check if OTP has expired
  if (otpRecord.expiresAt < new Date()) {
    await OTP.deleteOne({ _id: otpRecord._id })
    throw new ApiError(400, 'OTP has expired. Please request a new one.')
  }

  return sendSuccess(res, {
    message: 'OTP verified successfully',
    data: { email: normalizedEmail },
  })
})

/**
 * Step 3: Reset password after OTP verification
 * POST /api/auth/reset-password
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body

  ensureRequiredString(email, 'Email')
  ensureRequiredString(otp, 'OTP')
  ensureRequiredString(newPassword, 'New password')

  if (!isValidEmail(email)) {
    throw new ApiError(400, 'A valid email is required')
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters')
  }

  const normalizedEmail = String(email).toLowerCase().trim()

  // Verify OTP again before resetting password
  const otpRecord = await OTP.findOne({
    email: normalizedEmail,
    otp: String(otp).trim(),
  })

  if (!otpRecord) {
    throw new ApiError(400, 'Invalid or expired OTP. Please request a new one.')
  }

  if (otpRecord.expiresAt < new Date()) {
    await OTP.deleteOne({ _id: otpRecord._id })
    throw new ApiError(400, 'OTP has expired. Please request a new one.')
  }

  // Find user and update password
  const user = await User.findOne({ email: normalizedEmail })
  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  user.passwordHash = await hashPassword(newPassword)
  await user.save()

  // Delete the used OTP
  await OTP.deleteOne({ _id: otpRecord._id })

  return sendSuccess(res, {
    message: 'Password reset successfully. You can now log in with your new password.',
  })
})
