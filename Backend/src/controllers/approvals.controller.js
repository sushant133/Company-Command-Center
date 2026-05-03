import mongoose from 'mongoose'
import Approval from '../models/Approval.js'
import File from '../models/File.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess as response } from '../utils/response.js'
import { buildLocalFileRecord } from '../services/storage.service.js'

// Get all approvals for a company
export const getApprovals = asyncHandler(async (req, res) => {
  const { companyId } = req.params
  const { status, type, priority, page = 1, limit = 10 } = req.query

  // Validate and convert companyId to ObjectId
  if (!mongoose.Types.ObjectId.isValid(companyId)) {
    throw new ApiError(400, 'Invalid company ID')
  }

  const query = { companyId: new mongoose.Types.ObjectId(companyId) }

  if (status) query.status = status
  if (type) query.type = type
  if (priority) query.priority = priority

  const pageNumber = Math.max(1, parseInt(page, 10) || 1)
  const pageSize = Math.max(1, parseInt(limit, 10) || 10)
  const skip = (pageNumber - 1) * pageSize

  const total = await Approval.countDocuments(query)
  const approvals = await Approval.find(query)
    .populate('requestedBy', 'name email')
    .populate('approvedBy', 'name email')
    .populate('companyId', 'name')
    .populate('questions.questioner', 'name email')
    .populate('questions.answeredBy', 'name email')
    .populate('reviews.reviewer', 'name email')
    .populate('fileIds', 'originalName mimeType size storageUrl')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize)

  return response(res, {
    message: 'Approvals retrieved successfully',
    data: {
      approvals,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
        limit: pageSize,
      }
    }
  })
})

// Get single approval
export const getApproval = asyncHandler(async (req, res) => {
  const { id } = req.params

  const approval = await Approval.findById(id)
    .populate('requestedBy', 'name email')
    .populate('approvedBy', 'name email')
    .populate('companyId', 'name')
    .populate('questions.questioner', 'name email')
    .populate('questions.answeredBy', 'name email')
    .populate('reviews.reviewer', 'name email')

  if (!approval) {
    throw new ApiError(404, 'Approval not found')
  }

  return response(res, {
    message: 'Approval retrieved successfully',
    data: { approval }
  })
})

// Create new approval request
export const createApproval = asyncHandler(async (req, res) => {
  const approvalData = {
    ...req.body,
    companyId: req.params.companyId,
    requestedBy: req.user._id,
    questions: [],
    reviews: []
  }

  // Handle file uploads
  let fileIds = []
  if (req.files && req.files.length > 0) {
    const fileRecords = req.files.map(file => ({
      companyId: approvalData.companyId,
      uploadedBy: req.user._id,
      ...buildLocalFileRecord(file),
    }))

    const createdFiles = await File.insertMany(fileRecords)
    fileIds = createdFiles.map(file => file._id)
  }

  approvalData.fileIds = fileIds

  const approval = await Approval.create(approvalData)

  await approval.populate([
    { path: 'requestedBy', select: 'name email' },
    { path: 'companyId', select: 'name' },
    { path: 'fileIds', select: 'originalName mimeType size storageUrl' }
  ])

  return response(res, {
    statusCode: 201,
    message: 'Approval request created successfully',
    data: { approval }
  })
})

// Update approval (approve/reject with review)
export const updateApproval = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status, approvalComments } = req.body

  const approval = await Approval.findById(id)
  if (!approval) {
    throw new ApiError(404, 'Approval not found')
  }

  const updateData = {
    status,
    approvedBy: req.user._id,
  }

  if (approvalComments) {
    updateData.approvalComments = approvalComments
  }

  if (status === 'approved') {
    updateData.approvedAt = new Date()
  } else if (status === 'rejected') {
    updateData.rejectedAt = new Date()
  }

  const updatedApproval = await Approval.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  )
    .populate('requestedBy', 'name email')
    .populate('approvedBy', 'name email')
    .populate('companyId', 'name')
    .populate('questions.questioner', 'name email')
    .populate('questions.answeredBy', 'name email')
    .populate('reviews.reviewer', 'name email')

  return response(res, {
    message: 'Approval updated successfully',
    data: { approval: updatedApproval }
  })
})

// Add question to approval
export const addQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { question } = req.body

  if (!question || question.trim().length === 0) {
    throw new ApiError(400, 'Question is required')
  }

  const approval = await Approval.findById(id)
  if (!approval) {
    throw new ApiError(404, 'Approval not found')
  }

  approval.questions.push({
    questioner: req.user._id,
    question: question.trim(),
  })

  await approval.save()

  await approval.populate([
    { path: 'requestedBy', select: 'name email' },
    { path: 'questions.questioner', select: 'name email' },
    { path: 'questions.answeredBy', select: 'name email' },
  ])

  return response(res, {
    message: 'Question added successfully',
    data: { approval }
  })
})

// Answer question in approval
export const answerQuestion = asyncHandler(async (req, res) => {
  const { id, questionId } = req.params
  const { answer } = req.body

  if (!answer || answer.trim().length === 0) {
    throw new ApiError(400, 'Answer is required')
  }

  const approval = await Approval.findById(id)
  if (!approval) {
    throw new ApiError(404, 'Approval not found')
  }

  const question = approval.questions.id(questionId)
  if (!question) {
    throw new ApiError(404, 'Question not found')
  }

  question.answer = answer.trim()
  question.answeredBy = req.user._id
  question.answeredAt = new Date()

  await approval.save()

  await approval.populate([
    { path: 'requestedBy', select: 'name email' },
    { path: 'questions.questioner', select: 'name email' },
    { path: 'questions.answeredBy', select: 'name email' },
  ])

  return response(res, {
    message: 'Answer added successfully',
    data: { approval }
  })
})

// Add review to approval
export const addReview = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { review, status } = req.body

  if (!review || review.trim().length === 0) {
    throw new ApiError(400, 'Review is required')
  }

  if (!['approved', 'rejected', 'request-changes'].includes(status)) {
    throw new ApiError(400, 'Invalid review status. Must be approved, rejected, or request-changes')
  }

  const approval = await Approval.findById(id)
  if (!approval) {
    throw new ApiError(404, 'Approval not found')
  }

  approval.reviews.push({
    reviewer: req.user._id,
    review: review.trim(),
    status,
  })

  // Update main approval status based on review
  if (status === 'approved') {
    approval.status = 'approved'
    approval.approvedBy = req.user._id
    approval.approvedAt = new Date()
  } else if (status === 'rejected') {
    approval.status = 'rejected'
    approval.rejectedAt = new Date()
  } else if (status === 'request-changes') {
    approval.status = 'under-review'
  }

  approval.approvalComments = review.trim()

  await approval.save()

  await approval.populate([
    { path: 'requestedBy', select: 'name email' },
    { path: 'approvedBy', select: 'name email' },
    { path: 'reviews.reviewer', select: 'name email' },
  ])

  return response(res, {
    message: 'Review added successfully',
    data: { approval }
  })
})

// Delete approval
export const deleteApproval = asyncHandler(async (req, res) => {
  const { id } = req.params

  const approval = await Approval.findByIdAndDelete(id)

  if (!approval) {
    throw new ApiError(404, 'Approval not found')
  }

  return response(res, {
    message: 'Approval deleted successfully'
  })
})

// Get approval statistics
export const getApprovalStats = asyncHandler(async (req, res) => {
  const { companyId } = req.params

  const stats = await Approval.aggregate([
    { $match: { companyId: mongoose.Types.ObjectId(companyId) } },
    {
      $group: {
        _id: null,
        totalApprovals: { $sum: 1 },
        pendingApprovals: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        approvedApprovals: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
        },
        rejectedApprovals: {
          $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
        },
        underReviewApprovals: {
          $sum: { $cond: [{ $eq: ['$status', 'under-review'] }, 1, 0] }
        },
        urgentApprovals: {
          $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
        },
        highApprovals: {
          $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
        },
        totalAmount: { $sum: '$amount' },
        approvedAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, '$amount', 0] }
        }
      }
    }
  ])

  const result = stats[0] || {
    totalApprovals: 0,
    pendingApprovals: 0,
    approvedApprovals: 0,
    rejectedApprovals: 0,
    underReviewApprovals: 0,
    urgentApprovals: 0,
    highApprovals: 0,
    totalAmount: 0,
    approvedAmount: 0
  }

  return response(res, {
    message: 'Approval statistics retrieved successfully',
    data: { stats: result }
  })
})