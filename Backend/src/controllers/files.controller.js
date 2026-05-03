import File from '../models/File.js'
import { buildLocalFileRecord } from '../services/storage.service.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess } from '../utils/response.js'
import { ensureObjectId } from '../utils/validators.js'

export const listFiles = asyncHandler(async (req, res) => {
  const query =
    req.user.role === 'superadmin'
      ? req.query.companyId
        ? { companyId: req.query.companyId }
        : {}
      : { companyId: req.user.companyId }

  const files = await File.find(query)
    .populate('companyId', 'name code status')
    .populate('uploadedBy', 'name email role')
    .sort({ createdAt: -1 })

  return sendSuccess(res, {
    data: files,
  })
})

export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'A file is required')
  }

  const targetCompanyId =
    req.user.role === 'superadmin'
      ? req.body.companyId || null
      : req.user.companyId

  if (!targetCompanyId) {
    throw new ApiError(400, 'companyId is required for uploads')
  }

  ensureObjectId(targetCompanyId, 'company id')

  const fileRecord = await File.create({
    companyId: targetCompanyId,
    uploadedBy: req.user._id,
    ...buildLocalFileRecord(req.file),
  })

  return sendSuccess(res, {
    statusCode: 201,
    message: 'File uploaded successfully',
    data: fileRecord,
  })
})

export const getFileById = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'file id')
  const file = await File.findById(req.params.id)

  if (!file) {
    throw new ApiError(404, 'File not found')
  }

  if (req.user.role !== 'superadmin' && String(file.companyId) !== String(req.user.companyId)) {
    throw new ApiError(403, 'You can only access files from your own company')
  }

  return sendSuccess(res, {
    data: file,
  })
})

export const deleteFile = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'file id')
  const file = await File.findById(req.params.id)

  if (!file) {
    throw new ApiError(404, 'File not found')
  }

  if (req.user.role !== 'superadmin' && String(file.companyId) !== String(req.user.companyId)) {
    throw new ApiError(403, 'You can only delete files from your own company')
  }

  await file.deleteOne()

  return sendSuccess(res, {
    message: 'File deleted successfully',
  })
})
