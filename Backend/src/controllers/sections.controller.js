import Field from '../models/Field.js'
import Section from '../models/Section.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess } from '../utils/response.js'
import { ensureObjectId, ensureRequiredString } from '../utils/validators.js'

export const createSection = asyncHandler(async (req, res) => {
  const { name, slug, description } = req.body

  ensureRequiredString(name, 'Section name')
  ensureRequiredString(slug, 'Section slug')

  const section = await Section.create({
    name,
    slug,
    description,
    createdBy: req.user._id,
  })

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Section created successfully',
    data: section,
  })
})

export const getSections = asyncHandler(async (_req, res) => {
  const sections = await Section.find().sort({ createdAt: -1 })

  return sendSuccess(res, {
    data: sections,
  })
})

export const getSectionById = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'section id')
  const section = await Section.findById(req.params.id)

  if (!section) {
    throw new ApiError(404, 'Section not found')
  }

  const fields = await Field.find({ sectionId: section._id }).sort({ order: 1, createdAt: 1 })

  return sendSuccess(res, {
    data: {
      section,
      fields,
    },
  })
})

export const updateSection = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'section id')
  const section = await Section.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  if (!section) {
    throw new ApiError(404, 'Section not found')
  }

  return sendSuccess(res, {
    message: 'Section updated successfully',
    data: section,
  })
})

export const deleteSection = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'section id')
  const section = await Section.findByIdAndDelete(req.params.id)

  if (!section) {
    throw new ApiError(404, 'Section not found')
  }

  await Field.deleteMany({ sectionId: section._id })

  return sendSuccess(res, {
    message: 'Section deleted successfully',
  })
})

export const createField = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.sectionId, 'section id')
  const section = await Section.findById(req.params.sectionId)

  if (!section) {
    throw new ApiError(404, 'Section not found')
  }

  ensureRequiredString(req.body.label, 'Field label')
  ensureRequiredString(req.body.key, 'Field key')
  ensureRequiredString(req.body.type, 'Field type')

  const field = await Field.create({
    ...req.body,
    sectionId: req.params.sectionId,
  })

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Field created successfully',
    data: field,
  })
})

export const updateField = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'field id')
  const field = await Field.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  if (!field) {
    throw new ApiError(404, 'Field not found')
  }

  return sendSuccess(res, {
    message: 'Field updated successfully',
    data: field,
  })
})

export const deleteField = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'field id')
  const field = await Field.findByIdAndDelete(req.params.id)

  if (!field) {
    throw new ApiError(404, 'Field not found')
  }

  return sendSuccess(res, {
    message: 'Field deleted successfully',
  })
})
