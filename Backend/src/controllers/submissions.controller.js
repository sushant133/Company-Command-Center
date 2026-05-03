import Notification from '../models/Notification.js'
import Section from '../models/Section.js'
import Submission from '../models/Submission.js'
import Task from '../models/Task.js'
import User from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import { buildNotification } from '../services/notification.service.js'
import { emitToCompany, emitToSuperadmins } from '../utils/socket.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess } from '../utils/response.js'
import { ensureObjectId } from '../utils/validators.js'

export const createSubmission = asyncHandler(async (req, res) => {
  const { taskId, sectionId, values, note = '', fileIds = [] } = req.body

  if (!taskId || !sectionId) {
    throw new ApiError(400, 'Task and section are required')
  }

  ensureObjectId(taskId, 'task id')
  ensureObjectId(sectionId, 'section id')

  const task = await Task.findById(taskId)

  if (!task) {
    throw new ApiError(404, 'Task not found')
  }

  const section = await Section.findById(sectionId)

  if (!section) {
    throw new ApiError(404, 'Section not found')
  }

  if (!task.companyIds.some((companyId) => String(companyId) === String(req.user.companyId))) {
    throw new ApiError(403, 'You can only submit data for tasks assigned to your company')
  }

  const submission = await Submission.create({
    companyId: req.user.companyId,
    taskId,
    sectionId,
    submittedBy: req.user._id,
    values,
    note,
    fileIds,
  })

  // Socket emit
  const emitData = {
    id: submission._id,
    taskId: submission.taskId,
    companyId: submission.companyId,
    sectionId: submission.sectionId,
    status: submission.status || 'pending',
    submittedBy: req.user.name || req.user.email,
    createdAt: submission.createdAt,
  }
  emitToCompany(submission.companyId, 'submission:created', emitData)
  emitToSuperadmins('submission:created', emitData)

  const superadmins = await User.find({
    role: 'superadmin',
    isActive: true,
  }).select('_id')

  if (superadmins.length > 0) {
    await Notification.insertMany(
      superadmins.map((user) =>
        buildNotification({
          type: 'submission',
          title: 'New submission received',
          message: 'A company admin submitted a new task response.',
          userId: user._id,
          companyId: req.user.companyId,
        })
      )
    )
  }

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Submission created successfully',
    data: submission,
  })
})

export const getSubmissions = asyncHandler(async (req, res) => {
  const query =
    req.user.role === 'superadmin'
      ? {}
      : {
          companyId: req.user.companyId,
        }

  const submissions = await Submission.find(query)
    .populate('companyId', 'name code status')
    .populate('taskId', 'title status priority dueDate')
    .populate('sectionId', 'name slug')
    .populate('submittedBy', 'name email role')
    .sort({ createdAt: -1 })

  return sendSuccess(res, {
    data: submissions,
  })
})

export const getSubmissionById = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'submission id')
  const submission = await Submission.findById(req.params.id)
    .populate('companyId', 'name code status')
    .populate('taskId', 'title status priority dueDate')
    .populate('sectionId', 'name slug')
    .populate('submittedBy', 'name email role')

  if (!submission) {
    throw new ApiError(404, 'Submission not found')
  }

  if (req.user.role !== 'superadmin' && String(submission.companyId._id) !== String(req.user.companyId)) {
    throw new ApiError(403, 'You can only access your own company submissions')
  }

  return sendSuccess(res, {
    data: submission,
  })
})

export const updateSubmission = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'submission id')
  const submission = await Submission.findById(req.params.id)

  if (!submission) {
    throw new ApiError(404, 'Submission not found')
  }

  if (String(submission.companyId) !== String(req.user.companyId)) {
    throw new ApiError(403, 'You can only update your own company submissions')
  }

  Object.assign(submission, req.body)
  await submission.save()

  return sendSuccess(res, {
    message: 'Submission updated successfully',
    data: submission,
  })
})

export const updateSubmissionStatus = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'submission id')
  const submission = await Submission.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  )

  if (!submission) {
    throw new ApiError(404, 'Submission not found')
  }

  // Socket emit
  const emitData = {
    id: submission._id,
    status: submission.status,
    companyId: submission.companyId,
    updatedAt: new Date(),
  }
  emitToCompany(submission.companyId, 'submission:updated', emitData)
  emitToSuperadmins('submission:updated', emitData)

  return sendSuccess(res, {
    message: 'Submission status updated successfully',
    data: submission,
  })
})

export const deleteSubmission = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'submission id')
  const submission = await Submission.findById(req.params.id)

  if (!submission) {
    throw new ApiError(404, 'Submission not found')
  }

  // Only superadmin can delete submissions
  if (req.user.role !== 'superadmin') {
    throw new ApiError(403, 'Only superadmin can delete submissions')
  }

  await Submission.findByIdAndDelete(req.params.id)

  return sendSuccess(res, {
    message: 'Submission deleted successfully',
  })
})
