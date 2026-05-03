import Company from '../models/Company.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess } from '../utils/response.js'
import { ensureObjectId, ensureRequiredString } from '../utils/validators.js'

export const createCompany = asyncHandler(async (req, res) => {
  const { name, code, industry, description, logo } = req.body

  ensureRequiredString(name, 'Company name')
  ensureRequiredString(code, 'Company code')

  const company = await Company.create({
    name,
    code,
    industry,
    description,
    logo,
    createdBy: req.user._id,
  })

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Company created successfully',
    data: company,
  })
})

export const getCompanies = asyncHandler(async (req, res) => {
  const query =
    req.user.role === 'superadmin'
      ? {}
      : {
          _id: req.user.companyId,
        }

  const companies = await Company.find(query).populate('adminIds', 'name email role isActive')

  return sendSuccess(res, {
    data: companies,
  })
})

export const getCompanyById = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'company id')

  if (req.user.role !== 'superadmin' && String(req.user.companyId) !== req.params.id) {
    throw new ApiError(403, 'You can only access your own company')
  }

  const company = await Company.findById(req.params.id).populate('adminIds', 'name email role isActive')

  if (!company) {
    throw new ApiError(404, 'Company not found')
  }

  return sendSuccess(res, {
    data: company,
  })
})

export const updateCompany = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'company id')
  const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  if (!company) {
    throw new ApiError(404, 'Company not found')
  }

  return sendSuccess(res, {
    message: 'Company updated successfully',
    data: company,
  })
})

export const deleteCompany = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'company id')
  const company = await Company.findByIdAndDelete(req.params.id)

  if (!company) {
    throw new ApiError(404, 'Company not found')
  }

  return sendSuccess(res, {
    message: 'Company deleted successfully',
  })
})
