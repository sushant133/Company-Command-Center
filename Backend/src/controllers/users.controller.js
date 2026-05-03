import Company from '../models/Company.js'
import User from '../models/User.js'
import { hashPassword } from '../services/auth.service.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess } from '../utils/response.js'
import { ensureObjectId, ensureRequiredString, isValidEmail } from '../utils/validators.js'

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, companyId } = req.body

  ensureRequiredString(name, 'Name')
  ensureRequiredString(email, 'Email')
  ensureRequiredString(password, 'Password')
  ensureRequiredString(role, 'Role')

  if (!['superadmin', 'admin'].includes(role)) {
    throw new ApiError(400, 'Role must be either superadmin or admin')
  }

  if (!isValidEmail(email)) {
    throw new ApiError(400, 'A valid email is required')
  }

  if (role === 'admin') {
    if (!companyId) {
      throw new ApiError(400, 'Admin must be assigned to a company')
    }

    ensureObjectId(companyId, 'companyId')

    const company = await Company.findById(companyId)

    if (!company) {
      throw new ApiError(404, 'Company not found')
    }
  }

  const existingUser = await User.findOne({ email })

  if (existingUser) {
    throw new ApiError(409, 'A user with this email already exists')
  }

  const user = await User.create({
    name,
    email,
    passwordHash: await hashPassword(password),
    role,
    companyId: role === 'admin' ? companyId : null,
  })

  if (role === 'admin' && companyId) {
    await Company.findByIdAndUpdate(companyId, {
      $addToSet: { adminIds: user._id },
    })
  }

  const createdUser = await User.findById(user._id)
    .select('-passwordHash')
    .populate('companyId', 'name code status')

  return sendSuccess(res, {
    statusCode: 201,
    message: 'User created successfully',
    data: createdUser,
  })
})

export const getUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().select('-passwordHash').populate('companyId', 'name code status')

  return sendSuccess(res, {
    data: users,
  })
})

export const getUserById = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'user id')

  const user = await User.findById(req.params.id)
    .select('-passwordHash')
    .populate('companyId', 'name code status')

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  if (req.user.role !== 'superadmin' && String(req.user._id) !== String(user._id)) {
    throw new ApiError(403, 'You can only access your own profile')
  }

  return sendSuccess(res, {
    data: user,
  })
})

export const updateUser = asyncHandler(async (req, res) => {
  const { name, email, role, companyId, isActive, password } = req.body
  ensureObjectId(req.params.id, 'user id')
  const user = await User.findById(req.params.id)

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  if (req.user.role !== 'superadmin' && String(req.user._id) !== String(user._id)) {
    throw new ApiError(403, 'You can only update your own profile')
  }

  const previousCompanyId = user.companyId ? String(user.companyId) : null

  if (name !== undefined) user.name = name
  if (email !== undefined) {
    if (!isValidEmail(email)) {
      throw new ApiError(400, 'A valid email is required')
    }
    const existingUser = await User.findOne({ email, _id: { $ne: user._id } })
    if (existingUser) {
      throw new ApiError(409, 'A user with this email already exists')
    }
    user.email = email
  }
  if (password !== undefined) {
    if (typeof password !== 'string' || password.length < 6) {
      throw new ApiError(400, 'Password must be at least 6 characters')
    }
    user.passwordHash = await hashPassword(password)
  }
  if (role !== undefined && req.user.role === 'superadmin') user.role = role
  if (isActive !== undefined && req.user.role === 'superadmin') user.isActive = isActive

  if (user.role === 'admin') {
    if (!companyId && !user.companyId) {
      throw new ApiError(400, 'Admin must be assigned to a company')
    }

    const resolvedCompanyId = companyId || user.companyId
    ensureObjectId(resolvedCompanyId, 'companyId')
    user.companyId = resolvedCompanyId
  } else {
    user.companyId = null
  }

  await user.save()

  const nextCompanyId = user.companyId ? String(user.companyId) : null

  if (previousCompanyId && previousCompanyId !== nextCompanyId) {
    await Company.findByIdAndUpdate(previousCompanyId, {
      $pull: { adminIds: user._id },
    })
  }

  if (nextCompanyId) {
    await Company.findByIdAndUpdate(nextCompanyId, {
      $addToSet: { adminIds: user._id },
    })
  }

  const updatedUser = await User.findById(user._id)
    .select('-passwordHash')
    .populate('companyId', 'name code status')

  return sendSuccess(res, {
    message: 'User updated successfully',
    data: updatedUser,
  })
})

export const updateUserStatus = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'user id')
  const { isActive } = req.body
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true }
  ).select('-passwordHash')

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  return sendSuccess(res, {
    message: 'User status updated successfully',
    data: user,
  })
})
