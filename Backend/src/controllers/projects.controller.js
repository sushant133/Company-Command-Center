import mongoose from 'mongoose'
import Project from '../models/Project.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess as response } from '../utils/response.js'

// Get all projects for a company
export const getProjects = asyncHandler(async (req, res) => {
  const { companyId } = req.params
  const { status, health, priority, page = 1, limit = 10 } = req.query

  const query = { companyId }

  if (status) query.status = status
  if (health) query.health = health
  if (priority) query.priority = priority

  const pageNumber = Math.max(1, parseInt(page, 10) || 1)
  const pageSize = Math.max(1, parseInt(limit, 10) || 10)
  const skip = (pageNumber - 1) * pageSize

  const total = await Project.countDocuments(query)
  const projects = await Project.find(query)
    .populate('manager', 'name email')
    .populate('team', 'name email')
    .populate('companyId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize)

  response(res, {
    message: 'Projects retrieved successfully',
    data: {
      projects,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
        limit: pageSize,
      }
    }
  })
})

// Get single project
export const getProject = asyncHandler(async (req, res) => {
  const { id } = req.params

  const project = await Project.findById(id)
    .populate('manager', 'name email')
    .populate('team', 'name email')
    .populate('companyId', 'name')

  if (!project) {
    throw new ApiError(404, 'Project not found')
  }

  response(res, {
    message: 'Project retrieved successfully',
    data: { project }
  })
})

// Create new project
export const createProject = asyncHandler(async (req, res) => {
  const projectData = {
    ...req.body,
    companyId: req.user.companyId || req.body.companyId
  }

  const project = await Project.create(projectData)

  await project.populate([
    { path: 'manager', select: 'name email' },
    { path: 'team', select: 'name email' },
    { path: 'companyId', select: 'name' }
  ])

  response(res, {
    statusCode: 201,
    message: 'Project created successfully',
    data: { project }
  })
})

// Update project
export const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params
  const updateData = req.body

  const project = await Project.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  )
    .populate('manager', 'name email')
    .populate('team', 'name email')
    .populate('companyId', 'name')

  if (!project) {
    throw new ApiError(404, 'Project not found')
  }

  response(res, {
    message: 'Project updated successfully',
    data: { project }
  })
})

// Delete project
export const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params

  const project = await Project.findByIdAndDelete(id)

  if (!project) {
    throw new ApiError(404, 'Project not found')
  }

  response(res, {
    message: 'Project deleted successfully'
  })
})

// Get project statistics
export const getProjectStats = asyncHandler(async (req, res) => {
  const { companyId } = req.params

  const stats = await Project.aggregate([
    { $match: { companyId: mongoose.Types.ObjectId(companyId) } },
    {
      $group: {
        _id: null,
        totalProjects: { $sum: 1 },
        activeProjects: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        completedProjects: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        onTrackProjects: {
          $sum: { $cond: [{ $eq: ['$health', 'green'] }, 1, 0] }
        },
        atRiskProjects: {
          $sum: { $cond: [{ $eq: ['$health', 'yellow'] }, 1, 0] }
        },
        criticalProjects: {
          $sum: { $cond: [{ $eq: ['$health', 'red'] }, 1, 0] }
        },
        totalBudget: { $sum: '$budget' },
        totalSpent: { $sum: '$spent' }
      }
    }
  ])

  const result = stats[0] || {
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    onTrackProjects: 0,
    atRiskProjects: 0,
    criticalProjects: 0,
    totalBudget: 0,
    totalSpent: 0
  }

  response(res, {
    message: 'Project statistics retrieved successfully',
    data: { stats: result }
  })
})