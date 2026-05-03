import Company from '../models/Company.js'
import Employee from '../models/Employee.js'
import Submission from '../models/Submission.js'
import Task from '../models/Task.js'
import Department from '../models/Department.js'
import Comment from '../models/Comment.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess } from '../utils/response.js'
import CacheService from '../services/cache.service.js'
import { ensureObjectId } from '../utils/validators.js'

// Get start date based on days parameter
const getDateRange = (days) => {
  const end = new Date()
  const start = new Date()
  if (days === 'all' || !days) {
    start.setFullYear(start.getFullYear() - 10)
  } else {
    start.setDate(start.getDate() - parseInt(days))
  }
  return { start, end }
}

export const getOverviewAnalytics = asyncHandler(async (req, res) => {
  const { days = '30' } = req.query
  const cacheKey = `analytics:overview:${days}:${req.user._id}`
  
  let data = CacheService.getAnalytics(cacheKey)
  if (data) {
    return sendSuccess(res, { 
      data,
      fromCache: true,
      cacheHit: true 
    })
  }
  
  const { start, end } = getDateRange(days)

  const [
    totalCompanies,
    activeCompanies,
    activeTasks,
    overdueTasks,
    totalSubmissions,
    approvedSubmissions,
    submissionsInRange,
    totalEmployees,
    departmentCount,
  ] = await Promise.all([
    Company.countDocuments().lean(),
    Company.countDocuments({ status: 'active' }).lean(),
    Task.countDocuments({ status: { $in: ['active', 'overdue'] } }).lean(),
    Task.countDocuments({ status: 'overdue' }).lean(),
    Submission.countDocuments().lean(),
    Submission.countDocuments({ status: 'approved' }).lean(),
    Submission.countDocuments({ createdAt: { $gte: start, $lte: end } }).lean(),
    Employee.countDocuments().lean(),
    Department.countDocuments().lean(),
  ])

  // Get submission trend data
  const submissionTrends = await Submission.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
    {
      $limit: 30,
    },
  ])

  // Get company performance
  const companyPerformance = await Company.aggregate([
    {
      $lookup: {
        from: 'submissions',
        localField: '_id',
        foreignField: 'companyId',
        as: 'submissions',
      },
    },
    {
      $lookup: {
        from: 'tasks',
        let: { companyId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $in: ['$$companyId', '$companyIds'] },
            },
          },
        ],
        as: 'tasks',
      },
    },
    {
      $project: {
        name: 1,
        code: 1,
        submissionCount: { $size: '$submissions' },
        taskCount: { $size: '$tasks' },
        activeTaskCount: {
          $size: {
            $filter: {
              input: '$tasks',
              as: 'task',
              cond: { $in: ['$$task.status', ['active', 'overdue']] },
            },
          },
        },
      },
    },
    { $limit: 10 },
    { $sort: { submissionCount: -1 } },
  ])

  const result = {
    summary: {
      totalCompanies,
      activeCompanies,
      activeTasks,
      overdueTasks,
      totalSubmissions,
      approvedSubmissions,
      submissionsInRange,
      totalEmployees,
      departmentCount,
    },
    submissionTrends,
    companyPerformance,
  }
  
  CacheService.setAnalytics(cacheKey, result, 900) // 15 min
  
  return sendSuccess(res, { data: result })
})

export const getCompanyAnalytics = asyncHandler(async (req, res) => {
  const companyId =
    req.user.role === 'superadmin' ? req.params.companyId : req.user.companyId
  const { days = '30' } = req.query

  if (!companyId) {
    throw new ApiError(400, 'Company id is required')
  }

  ensureObjectId(companyId, 'company id')
  const { start, end } = getDateRange(days)

  const [
    company,
    taskCount,
    activeTaskCount,
    completedTaskCount,
    submissionCount,
    approvedSubmissionCount,
    employees,
    departments,
    submissionTrends,
  ] = await Promise.all([
    Company.findById(companyId).select('name code status'),
    Task.countDocuments({ companyIds: companyId }),
    Task.countDocuments({ companyIds: companyId, status: 'active' }),
    Task.countDocuments({ companyIds: companyId, status: 'completed' }),
    Submission.countDocuments({ companyId }),
    Submission.countDocuments({ companyId, status: 'approved' }),
    Employee.countDocuments({ companyId }),
    Department.countDocuments({ companyId }),
    Submission.aggregate([
      {
        $match: {
          companyId,
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]),
  ])

  if (!company) {
    throw new ApiError(404, 'Company not found')
  }

  return sendSuccess(res, {
    data: {
      company,
      metrics: {
        taskCount,
        activeTaskCount,
        completedTaskCount,
        submissionCount,
        approvedSubmissionCount,
        employees,
        departments,
      },
      submissionTrends,
    },
  })
})

export const getCompanyRankings = asyncHandler(async (req, res) => {
  const { days = '30' } = req.query
  const { start, end } = getDateRange(days)

  const rankings = await Company.aggregate([
    {
      $lookup: {
        from: 'submissions',
        let: { companyId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$companyId', '$$companyId'] },
              createdAt: { $gte: start, $lte: end },
            },
          },
        ],
        as: 'submissions',
      },
    },
    {
      $lookup: {
        from: 'tasks',
        let: { companyId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $in: ['$$companyId', '$companyIds'] },
            },
          },
        ],
        as: 'tasks',
      },
    },
    {
      $project: {
        name: 1,
        code: 1,
        status: 1,
        submissionCount: { $size: '$submissions' },
        approvedSubmissionCount: {
          $size: {
            $filter: {
              input: '$submissions',
              as: 'sub',
              cond: { $eq: ['$$sub.status', 'approved'] },
            },
          },
        },
        taskCount: { $size: '$tasks' },
        completionRate: {
          $cond: {
            if: { $eq: [{ $size: '$submissions' }, 0] },
            then: 0,
            else: {
              $multiply: [
                {
                  $divide: [
                    {
                      $size: {
                        $filter: {
                          input: '$submissions',
                          as: 'sub',
                          cond: { $eq: ['$$sub.status', 'approved'] },
                        },
                      },
                    },
                    { $size: '$submissions' },
                  ],
                },
                100,
              ],
            },
          },
        },
      },
    },
    {
      $sort: { submissionCount: -1, completionRate: -1 },
    },
  ])

  return sendSuccess(res, {
    data: rankings,
  })
})

// Get HR Analytics
export const getHRAnalytics = asyncHandler(async (req, res) => {
  const { companyId } = req.query
  const query = companyId ? { companyId } : {}

  const [departments, employees, employeeByDept, departmentStats] = await Promise.all([
    Department.countDocuments(query),
    Employee.countDocuments(query),
    Employee.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$departmentId',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'department',
        },
      },
      {
        $project: {
          _id: 0,
          name: { $arrayElemAt: ['$department.name', 0] },
          count: 1,
        },
      },
    ]),
    Department.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: 'departmentId',
          as: 'employees',
        },
      },
      {
        $project: {
          name: 1,
          employeeCount: { $size: '$employees' },
        },
      },
    ]),
  ])

  return sendSuccess(res, {
    data: {
      summary: {
        totalDepartments: departments,
        totalEmployees: employees,
      },
      employeeByDepartment: employeeByDept,
      departmentStats,
    },
  })
})

// Get Activity Log
export const getActivityLog = asyncHandler(async (req, res) => {
  const { days = '30', limit = '20' } = req.query
  const { start, end } = getDateRange(days)

const [submissions, tasks, comments] = await Promise.all([
    Submission.countDocuments({ createdAt: { $gte: start, $lte: end } }),
    Task.countDocuments({ createdAt: { $gte: start, $lte: end } }),
    Comment.countDocuments({ createdAt: { $gte: start, $lte: end } }).catch(() => 0),
  ])

  // Get activity breakdown by day
  const activityByDay = await Submission.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        submissions: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
    {
      $limit: parseInt(limit),
    },
  ])

  return sendSuccess(res, {
    data: {
      summary: {
        submissions,
        tasks,
        comments: comments || 0,
      },
      activityByDay,
    },
  })
})
