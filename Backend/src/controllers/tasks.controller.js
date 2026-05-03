import Task from '../models/Task.js'
import Company from '../models/Company.js'
import User from '../models/User.js'
import Section from '../models/Section.js'
import Notification from '../models/Notification.js'
import { ApiError } from '../utils/ApiError.js'
import { buildNotification } from '../services/notification.service.js'
import { emitToCompany, emitToSuperadmins } from '../utils/socket.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess } from '../utils/response.js'
import { ensureObjectId } from '../utils/validators.js'

export const createTask = asyncHandler(async (req, res) => {
  const { title, description, priority = 'medium', dueDate, sectionId, companyIds = [] } = req.body

  if (req.user.role !== 'superadmin') {
    throw new ApiError(403, 'Only superadmin can create tasks')
  }

  if (!companyIds || companyIds.length === 0) {
    throw new ApiError(400, 'At least one company required')
  }

  ensureObjectId(sectionId, 'section id')

  const section = await Section.findById(sectionId)
  if (!section) {
    throw new ApiError(404, 'Section not found')
  }

  // Validate companies exist
  const companies = await Company.find({ _id: { $in: companyIds } })
  if (companies.length !== companyIds.length) {
    throw new ApiError(400, 'Some companies not found')
  }

  const task = await Task.create({
    title,
    description,
    priority,
    dueDate,
    sectionId,
    companyIds,
    createdBy: req.user._id,
    status: 'pending',
  })

  // Notifications & sockets to assigned companies + superadmins
  const companyAdmins = await User.find({
    companyId: { $in: companyIds },
    role: 'admin',
    isActive: true,
  }).select('_id')

  if (companyAdmins.length > 0) {
    await Notification.insertMany(companyAdmins.map(admin =>
      buildNotification({
        type: 'task',
        title: `New task assigned: ${title}`,
        message: description.substring(0, 100) + '...',
        userId: admin._id,
        companyId: admin.companyId,
      })
    ))
  }

  const emitData = {
    id: task._id,
    title: task.title,
    priority: task.priority,
    dueDate: task.dueDate,
    status: task.status,
    companyIds: task.companyIds,
    createdAt: task.createdAt,
  }
  
  // Emit to all assigned companies
  companyIds.forEach(companyId => emitToCompany(companyId, 'task:assigned', emitData))
  emitToSuperadmins('task:assigned', emitData)

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Task created successfully',
    data: task,
  })
})

export const getTasks = asyncHandler(async (req, res) => {
  const query = req.user.role === 'superadmin' 
    ? {} 
    : { companyIds: req.user.companyId }

  const tasks = await Task.find(query)
    .populate('sectionId', 'name slug')
    .populate('companyIds', 'name code')
    .populate('createdBy', 'name email')
    .sort({ dueDate: 1, priority: -1, status: 1 })

  return sendSuccess(res, { data: tasks })
})

export const getTaskById = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'task id')
  
  const task = await Task.findById(req.params.id)
    .populate('sectionId', 'name slug')
    .populate('companyIds', 'name code')
    .populate('createdBy', 'name email')

  if (!task) throw new ApiError(404, 'Task not found')

  if (req.user.role !== 'superadmin' && !task.companyIds.some(c => String(c._id) === String(req.user.companyId))) {
    throw new ApiError(403, 'Access denied')
  }

  return sendSuccess(res, { data: task })
})

export const updateTask = asyncHandler(async (req, res) => {
  if (req.user.role !== 'superadmin') {
    throw new ApiError(403, 'Only superadmin can update tasks')
  }

  const { title, description, priority, dueDate, sectionId, companyIds } = req.body
  ensureObjectId(req.params.id, 'task id')

  // Build update object
  const updateData = {}
  if (title !== undefined) updateData.title = title
  if (description !== undefined) updateData.description = description
  if (priority !== undefined) updateData.priority = priority
  if (dueDate !== undefined) updateData.dueDate = dueDate
  if (sectionId !== undefined) {
    ensureObjectId(sectionId, 'section id')
    updateData.sectionId = sectionId
  }
  if (companyIds !== undefined && Array.isArray(companyIds)) {
    if (companyIds.length === 0) {
      throw new ApiError(400, 'At least one company required')
    }
    const companies = await Company.find({ _id: { $in: companyIds } })
    if (companies.length !== companyIds.length) {
      throw new ApiError(400, 'Some companies not found')
    }
    updateData.companyIds = companyIds
  }

  updateData.updatedAt = new Date()

  const task = await Task.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate('sectionId', 'name slug')
   .populate('companyIds', 'name code')

  if (!task) throw new ApiError(404, 'Task not found')

  const emitData = {
    id: task._id,
    title: task.title,
    status: task.status,
    companyIds: task.companyIds,
    updatedAt: task.updatedAt,
  }

  task.companyIds.forEach(companyId => emitToCompany(companyId, 'task:updated', emitData))
  emitToSuperadmins('task:updated', emitData)

  return sendSuccess(res, {
    message: 'Task updated',
    data: task,
  })
})

export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body
  ensureObjectId(req.params.id, 'task id')

  const validStatuses = ['pending', 'in-progress', 'completed', 'cancelled']
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`)
  }

  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { status, updatedAt: new Date() },
    { new: true, runValidators: true }
  )

  if (!task) throw new ApiError(404, 'Task not found')

  const emitData = {
    id: task._id,
    title: task.title,
    status: task.status,
    companyIds: task.companyIds,
    updatedAt: task.updatedAt,
  }

  task.companyIds.forEach(companyId => emitToCompany(companyId, 'task:updated', emitData))
  emitToSuperadmins('task:updated', emitData)

  return sendSuccess(res, {
    message: 'Task status updated',
    data: task,
  })
})

export const deleteTask = asyncHandler(async (req, res) => {
  if (req.user.role !== 'superadmin') {
    throw new ApiError(403, 'Only superadmin can delete tasks')
  }

  ensureObjectId(req.params.id, 'task id')
  await Task.findByIdAndDelete(req.params.id)

  return sendSuccess(res, { message: 'Task deleted' })
})

