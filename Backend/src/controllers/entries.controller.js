import fs from 'fs'
import path from 'path'
import Comment from '../models/Comment.js'
import CompanyEntry from '../models/CompanyEntry.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess } from '../utils/response.js'
import { ensureObjectId } from '../utils/validators.js'

const normalizeEntryType = (type) => {
  if (!type) return 'project'

  const value = String(type).trim()
  const map = {
    Project: 'project',
    Task: 'task',
    HR: 'hr_metric',
    Expense: 'financial_metric',
    Finance: 'financial_metric',
  }

  return map[value] || value.toLowerCase()
}

const parseInput = (value) => {
  if (!value) return null
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  }
  return value
}

const buildAttachment = (file) => ({
  fileName: file.originalname,
  fileUrl: `/uploads/${path.basename(file.path || file.filename || file.originalname)}`,
  fileType: file.mimetype,
  uploadedAt: new Date(),
})

const ensureAccess = (entry, user) => {
  if (user.role !== 'superadmin' && String(entry.companyId) !== String(user.companyId)) {
    throw new ApiError(403, 'You can only access entries for your own company')
  }
}

export const getEntries = asyncHandler(async (req, res) => {
  const query = {}

  if (req.user.role !== 'superadmin') {
    query.companyId = req.user.companyId
  }

  if (req.query.company) {
    ensureObjectId(req.query.company, 'company id')
    query.companyId = req.query.company
  }

  if (req.query.type && req.query.type !== 'all') {
    query.entryType = normalizeEntryType(req.query.type)
  }

  if (req.query.status && req.query.status !== 'all') {
    query.status = req.query.status
  }

  const page = Math.max(1, parseInt(req.query.page, 10) || 1)
  const limit = Math.max(1, parseInt(req.query.limit, 10) || 10)
  const skip = (page - 1) * limit

  const total = await CompanyEntry.countDocuments(query)
  const entries = await CompanyEntry.find(query)
    .populate('companyId', 'name code status')
    .populate('submittedBy', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  return sendSuccess(res, {
    data: {
      entries,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    },
  })
})

export const getEntryById = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'entry id')

  const entry = await CompanyEntry.findById(req.params.id)
    .populate('companyId', 'name code status')
    .populate('submittedBy', 'name email role')
    .populate('reviewedBy', 'name email role')

  if (!entry) {
    throw new ApiError(404, 'Entry not found')
  }

  ensureAccess(entry, req.user)

  return sendSuccess(res, {
    data: entry,
  })
})

export const createEntry = asyncHandler(async (req, res) => {
  const companyId = req.user.role === 'superadmin' ? req.body.companyId : req.user.companyId

  if (!companyId) {
    throw new ApiError(400, 'Company id is required to create entries')
  }

  ensureObjectId(companyId, 'company id')

  const attachments = (req.files || []).map(buildAttachment)
  const metadata = parseInput(req.body.metadata) || {}
  const entryType = normalizeEntryType(req.body.type)

  const entry = await CompanyEntry.create({
    companyId,
    entryType,
    title: req.body.title || 'Untitled entry',
    description: req.body.description || '',
    data: {
      project: req.body.project || null,
      metadata,
    },
    status: req.body.status || 'pending_review',
    submittedBy: req.user._id,
    attachments,
    priority: req.body.priority || 'medium',
    dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
    history: [
      {
        action: 'created',
        performedBy: req.user._id,
        performedAt: new Date(),
        changes: {
          title: req.body.title,
          entryType,
        },
      },
    ],
  })

  await entry.populate([
    { path: 'companyId', select: 'name code status' },
    { path: 'submittedBy', select: 'name email role' },
  ])

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Entry created successfully',
    data: entry,
  })
})

export const updateEntry = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'entry id')

  const entry = await CompanyEntry.findById(req.params.id)

  if (!entry) {
    throw new ApiError(404, 'Entry not found')
  }

  ensureAccess(entry, req.user)

  const attachments = (req.files || []).map(buildAttachment)
  const metadata = parseInput(req.body.metadata)

  if (req.body.title) entry.title = req.body.title
  if (req.body.description) entry.description = req.body.description
  if (metadata) entry.data = {
    ...(entry.data || {}),
    metadata,
  }
  if (req.body.project) entry.data = {
    ...(entry.data || {}),
    project: req.body.project,
  }
  if (req.body.status) entry.status = req.body.status
  if (req.body.priority) entry.priority = req.body.priority
  if (req.body.dueDate) entry.dueDate = new Date(req.body.dueDate)
  if (attachments.length) entry.attachments.push(...attachments)

  entry.history.push({
    action: 'updated',
    performedBy: req.user._id,
    performedAt: new Date(),
    changes: {
      ...(req.body.title ? { title: req.body.title } : {}),
      ...(req.body.status ? { status: req.body.status } : {}),
    },
  })

  await entry.save()

  await entry.populate([
    { path: 'companyId', select: 'name code status' },
    { path: 'submittedBy', select: 'name email role' },
  ])

  return sendSuccess(res, {
    message: 'Entry updated successfully',
    data: entry,
  })
})

export const approveEntry = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'entry id')

  const entry = await CompanyEntry.findById(req.params.id)

  if (!entry) {
    throw new ApiError(404, 'Entry not found')
  }

  ensureAccess(entry, req.user)

  entry.status = 'approved'
  entry.reviewedBy = req.user._id
  entry.reviewedAt = new Date()
  entry.history.push({
    action: 'approved',
    performedBy: req.user._id,
    performedAt: new Date(),
  })

  await entry.save()

  return sendSuccess(res, {
    message: 'Entry approved successfully',
    data: entry,
  })
})

export const rejectEntry = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'entry id')

  const entry = await CompanyEntry.findById(req.params.id)

  if (!entry) {
    throw new ApiError(404, 'Entry not found')
  }

  ensureAccess(entry, req.user)

  entry.status = 'rejected'
  entry.reviewedBy = req.user._id
  entry.reviewedAt = new Date()
  entry.reviewNotes = req.body.reason || req.body.reviewNotes || 'Rejected by reviewer'
  entry.history.push({
    action: 'rejected',
    performedBy: req.user._id,
    performedAt: new Date(),
    notes: entry.reviewNotes,
  })

  await entry.save()

  return sendSuccess(res, {
    message: 'Entry rejected successfully',
    data: entry,
  })
})

export const bulkApproveEntries = asyncHandler(async (req, res) => {
  const { ids } = req.body

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new ApiError(400, 'Entry ids are required')
  }

  const query = { _id: { $in: ids } }
  if (req.user.role !== 'superadmin') {
    query.companyId = req.user.companyId
  }

  const result = await CompanyEntry.updateMany(query, {
    status: 'approved',
    reviewedBy: req.user._id,
    reviewedAt: new Date(),
  })

  return sendSuccess(res, {
    message: `${result.modifiedCount} entries approved successfully`,
    data: { count: result.modifiedCount },
  })
})

export const bulkDeleteEntries = asyncHandler(async (req, res) => {
  const { ids } = req.body

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new ApiError(400, 'Entry ids are required')
  }

  const query = { _id: { $in: ids } }
  if (req.user.role !== 'superadmin') {
    query.companyId = req.user.companyId
  }

  const result = await CompanyEntry.deleteMany(query)

  return sendSuccess(res, {
    message: `${result.deletedCount} entries deleted successfully`,
    data: { count: result.deletedCount },
  })
})

export const exportEntries = asyncHandler(async (req, res) => {
  const query = {}

  if (req.user.role !== 'superadmin') {
    query.companyId = req.user.companyId
  }

  if (req.query.type && req.query.type !== 'all') {
    query.entryType = normalizeEntryType(req.query.type)
  }

  const entries = await CompanyEntry.find(query)
    .populate('companyId', 'name')
    .populate('submittedBy', 'name')
    .sort({ createdAt: -1 })

  const csvLines = [
    'Title,Company,Type,Status,Submitted By,Created At',
    ...entries.map((entry) => [
      JSON.stringify(entry.title || ''),
      JSON.stringify(entry.companyId?.name || ''),
      JSON.stringify(entry.entryType || ''),
      JSON.stringify(entry.status || ''),
      JSON.stringify(entry.submittedBy?.name || ''),
      JSON.stringify(entry.createdAt?.toISOString() || ''),
    ].join(',')),
  ]

  res.header('Content-Type', 'text/csv')
  res.attachment('entries.csv')
  res.send(csvLines.join('\n'))
})

export const getEntryComments = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'entry id')

  const entry = await CompanyEntry.findById(req.params.id)
  if (!entry) {
    throw new ApiError(404, 'Entry not found')
  }

  ensureAccess(entry, req.user)

  const comments = await Comment.find({
    targetId: entry._id,
    targetModel: 'CompanyEntry',
  })
    .populate('fromUserId', 'name email')
    .populate('toUserIds', 'name email')
    .sort({ createdAt: -1 })

  return sendSuccess(res, {
    data: comments,
  })
})

export const addEntryComment = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'entry id')

  const entry = await CompanyEntry.findById(req.params.id)
  if (!entry) {
    throw new ApiError(404, 'Entry not found')
  }

  ensureAccess(entry, req.user)

  if (!req.body.message || !req.body.message.trim()) {
    throw new ApiError(400, 'Comment message is required')
  }

  const comment = await Comment.create({
    message: req.body.message,
    companyId: entry.companyId,
    targetId: entry._id,
    targetModel: 'CompanyEntry',
    targetName: entry.title,
    fromUserId: req.user._id,
    toUserIds: [],
    status: 'sent',
    type: 'general',
  })

  await comment.populate('fromUserId', 'name email')

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Comment added successfully',
    data: comment,
  })
})

export const getEntryActivityLog = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'entry id')

  const entry = await CompanyEntry.findById(req.params.id)
  if (!entry) {
    throw new ApiError(404, 'Entry not found')
  }

  ensureAccess(entry, req.user)

  return sendSuccess(res, {
    data: entry.history || [],
  })
})

export const downloadEntryAttachment = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'entry id')
  const { attachmentId } = req.params

  const entry = await CompanyEntry.findById(req.params.id)
  if (!entry) {
    throw new ApiError(404, 'Entry not found')
  }

  ensureAccess(entry, req.user)

  const attachment = entry.attachments.id(attachmentId)
  if (!attachment) {
    throw new ApiError(404, 'Attachment not found')
  }

  if (attachment.fileUrl.startsWith('/uploads/')) {
    const filePath = path.resolve(process.cwd(), `.${attachment.fileUrl}`)
    if (!fs.existsSync(filePath)) {
      throw new ApiError(404, 'Attachment file not found')
    }
    return res.download(filePath, attachment.fileName)
  }

  return res.redirect(attachment.fileUrl)
})

export const deleteEntryAttachment = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'entry id')
  const { attachmentId } = req.params

  const entry = await CompanyEntry.findById(req.params.id)
  if (!entry) {
    throw new ApiError(404, 'Entry not found')
  }

  ensureAccess(entry, req.user)

  const attachment = entry.attachments.id(attachmentId)
  if (!attachment) {
    throw new ApiError(404, 'Attachment not found')
  }

  if (attachment.fileUrl.startsWith('/uploads/')) {
    const filePath = path.resolve(process.cwd(), `.${attachment.fileUrl}`)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  }

  entry.attachments.id(attachmentId).remove()
  await entry.save()

  return sendSuccess(res, {
    message: 'Attachment removed successfully',
  })
})
