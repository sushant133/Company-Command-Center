import mongoose from 'mongoose'
import Comment from '../models/Comment.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess as response } from '../utils/response.js'

// Get all comments for a company
export const getComments = asyncHandler(async (req, res) => {
  const { companyId } = req.params
  const { status, type, priority, page = 1, limit = 10 } = req.query

  const query = { companyId }

  if (status) query.status = status
  if (type) query.type = type
  if (priority) query.priority = priority

  const pageNumber = Math.max(1, parseInt(page, 10) || 1)
  const pageSize = Math.max(1, parseInt(limit, 10) || 10)
  const skip = (pageNumber - 1) * pageSize

  const total = await Comment.countDocuments(query)
  const comments = await Comment.find(query)
    .populate('fromUserId', 'name email')
    .populate('toUserIds', 'name email')
    .populate('companyId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize)

  response(res, {
    message: 'Comments retrieved successfully',
    data: {
      comments,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
        limit: pageSize,
      }
    }
  })
})

// Get single comment
export const getComment = asyncHandler(async (req, res) => {
  const { id } = req.params

  const comment = await Comment.findById(id)
    .populate('fromUserId', 'name email')
    .populate('toUserIds', 'name email')
    .populate('companyId', 'name')

  if (!comment) {
    throw new ApiError(404, 'Comment not found')
  }

  response(res, {
    message: 'Comment retrieved successfully',
    data: { comment }
  })
})

// Create new comment
export const createComment = asyncHandler(async (req, res) => {
  const commentData = {
    ...req.body,
    companyId: req.user.companyId || req.body.companyId,
    fromUserId: req.user._id
  }

  const comment = await Comment.create(commentData)

  await comment.populate([
    { path: 'fromUserId', select: 'name email' },
    { path: 'toUserIds', select: 'name email' },
    { path: 'companyId', select: 'name' }
  ])

  response(res, {
    statusCode: 201,
    message: 'Comment created successfully',
    data: { comment }
  })
})

// Update comment
export const updateComment = asyncHandler(async (req, res) => {
  const { id } = req.params
  const updateData = req.body

  const comment = await Comment.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  )
    .populate('fromUserId', 'name email')
    .populate('toUserIds', 'name email')
    .populate('companyId', 'name')

  if (!comment) {
    throw new ApiError(404, 'Comment not found')
  }

  response(res, {
    message: 'Comment updated successfully',
    data: { comment }
  })
})

// Delete comment
export const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params

  const comment = await Comment.findByIdAndDelete(id)

  if (!comment) {
    throw new ApiError(404, 'Comment not found')
  }

  response(res, {
    message: 'Comment deleted successfully'
  })
})

// Mark comment as read
export const markCommentAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params

  const comment = await Comment.findByIdAndUpdate(
    id,
    { status: 'read' },
    { new: true }
  )
    .populate('fromUserId', 'name email')
    .populate('toUserIds', 'name email')
    .populate('companyId', 'name')

  if (!comment) {
    throw new ApiError(404, 'Comment not found')
  }

  response(res, {
    message: 'Comment marked as read',
    data: { comment }
  })
})

// Get comments for current user
export const getMyComments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query

  const query = {
    $or: [
      { fromUserId: req.user._id },
      { toUserIds: req.user._id }
    ]
  }

  const pageNumber = Math.max(1, parseInt(page, 10) || 1)
  const pageSize = Math.max(1, parseInt(limit, 10) || 10)
  const skip = (pageNumber - 1) * pageSize

  const total = await Comment.countDocuments(query)
  const comments = await Comment.find(query)
    .populate('fromUserId', 'name email')
    .populate('toUserIds', 'name email')
    .populate('companyId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize)

  response(res, {
    message: 'User comments retrieved successfully',
    data: {
      comments,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
        limit: pageSize,
      }
    }
  })
})