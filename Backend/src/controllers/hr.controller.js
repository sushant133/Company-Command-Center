import Employee from '../models/Employee.js'
import Job from '../models/Job.js'
import Department from '../models/Department.js'
import Company from '../models/Company.js'
import xlsx from 'xlsx'
import fs from 'fs'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess } from '../utils/response.js'
import { ensureObjectId } from '../utils/validators.js'

// Helper to resolve company scope based on user role
const resolveCompanyScope = (req) => {
  if (req.user.role === 'superadmin') {
    return req.query.companyId || null
  }
  // Admin scoped to own company
  return req.user.companyId ? String(req.user.companyId) : null
}

/**
 * GET /api/hr/employees
 * Query params: companyId, department, role, status, search, joinDateFrom, joinDateTo, page, limit
 */
export const getEmployees = asyncHandler(async (req, res) => {
  const companyId = resolveCompanyScope(req)
  const {
    department,
    role,
    status,
    search,
    joinDateFrom,
    joinDateTo,
    page = '1',
    limit = '50',
  } = req.query

  const filter = {}

  if (companyId) {
    ensureObjectId(companyId, 'companyId')
    filter.companyId = companyId
  }

  if (department) {
    filter.department = { $regex: department, $options: 'i' }
  }

  if (role) {
    filter.role = { $regex: role, $options: 'i' }
  }

  if (status) {
    filter.status = status
  }

  if (joinDateFrom || joinDateTo) {
    filter.joinDate = {}
    if (joinDateFrom) filter.joinDate.$gte = new Date(joinDateFrom)
    if (joinDateTo) filter.joinDate.$lte = new Date(joinDateTo)
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } },
    ]
  }

  const pageNum = Math.max(1, parseInt(page, 10))
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)))
  const skip = (pageNum - 1) * limitNum

  const [employees, total] = await Promise.all([
    Employee.find(filter)
      .populate('companyId', 'name code')
      .populate('managerId', 'name employeeId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Employee.countDocuments(filter),
  ])

  return sendSuccess(res, {
    data: {
      employees,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    },
  })
})

/**
 * GET /api/hr/departments
 * Query params: companyId
 */
export const getDepartments = asyncHandler(async (req, res) => {
  const companyId = resolveCompanyScope(req)

  const filter = {}
  if (companyId) {
    ensureObjectId(companyId, 'companyId')
    filter.companyId = companyId
  }

  const departments = await Department.find(filter)
    .populate('companyId', 'name code')
    .populate('headId', 'name email')
    .sort({ name: 1 })

  // Optionally enrich with live employee counts
  const enriched = await Promise.all(
    departments.map(async (dept) => {
      const employeeCount = await Employee.countDocuments({
        companyId: dept.companyId?._id || dept.companyId,
        department: dept.name,
        isActive: true,
      })
      return {
        ...dept.toObject(),
        employeeCount,
      }
    })
  )

  return sendSuccess(res, { data: enriched })
})

/**
 * GET /api/hr/jobs
 * Query params: companyId, status, department
 */
export const getJobs = asyncHandler(async (req, res) => {
  const companyId = resolveCompanyScope(req)
  const { status, department } = req.query

  const filter = {}
  if (companyId) {
    ensureObjectId(companyId, 'companyId')
    filter.companyId = companyId
  }
  if (status) filter.status = status
  if (department) filter.department = { $regex: department, $options: 'i' }

  const jobs = await Job.find(filter)
    .populate('companyId', 'name code')
    .populate('createdBy', 'name email')
    .sort({ postedDate: -1 })

  return sendSuccess(res, { data: jobs })
})

/**
 * GET /api/hr/reports
 * Query params: companyId
 * Returns dynamic analytics computed from Employee collection
 */
export const getHRReports = asyncHandler(async (req, res) => {
  const companyId = resolveCompanyScope(req)

  const filter = {}
  if (companyId) {
    ensureObjectId(companyId, 'companyId')
    filter.companyId = companyId
  }

  // Headcount trend by month (last 12 months)
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11)
  twelveMonthsAgo.setDate(1)

  const headcountTrend = await Employee.aggregate([
    { $match: { ...filter, joinDate: { $gte: twelveMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$joinDate' },
          month: { $month: '$joinDate' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ])

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const headcountByMonth = headcountTrend.map((item) => ({
    month: `${months[item._id.month - 1]} ${item._id.year}`,
    hires: item.count,
  }))

  // Gender distribution
  const genderDistribution = await Employee.aggregate([
    { $match: filter },
    { $group: { _id: '$gender', count: { $sum: 1 } } },
  ])

  // Department distribution
  const departmentDistribution = await Employee.aggregate([
    { $match: filter },
    { $group: { _id: '$department', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ])

  // Status breakdown
  const statusBreakdown = await Employee.aggregate([
    { $match: filter },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ])

  // Summary metrics
  const totalEmployees = await Employee.countDocuments(filter)
  const activeEmployees = await Employee.countDocuments({ ...filter, status: 'active' })
  const newHiresThisMonth = await Employee.countDocuments({
    ...filter,
    joinDate: {
      $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    },
  })
  const avgTenureDays = await Employee.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        avg: {
          $avg: {
            $divide: [{ $subtract: [new Date(), '$joinDate'] }, 1000 * 60 * 60 * 24],
          },
        },
      },
    },
  ])

  const openJobs = await Job.countDocuments({
    ...(companyId ? { companyId } : {}),
    status: 'open',
  })

  return sendSuccess(res, {
    data: {
      summary: {
        totalEmployees,
        activeEmployees,
        newHiresThisMonth,
        avgTenureDays: avgTenureDays[0]?.avg ? Math.round(avgTenureDays[0].avg) : 0,
        openJobs,
      },
      headcountByMonth,
      genderDistribution: genderDistribution.map((g) => ({
        name: g._id || 'unknown',
        value: g.count,
      })),
      departmentDistribution: departmentDistribution.map((d) => ({
        name: d._id || 'Unassigned',
        value: d.count,
      })),
      statusBreakdown: statusBreakdown.map((s) => ({
        name: s._id,
        value: s.count,
      })),
    },
  })
})

/**
 * POST /api/hr/employees
 * Create a new employee
 */
export const createEmployee = asyncHandler(async (req, res) => {
  const {
    employeeId,
    name,
    email,
    phone,
    companyId,
    department,
    role,
    status,
    gender,
    joinDate,
    salary,
    managerId,
    address,
  } = req.body

  if (!employeeId || !name || !email || !companyId || !department || !role || !joinDate) {
    throw new ApiError(400, 'Missing required fields')
  }

  ensureObjectId(companyId, 'companyId')

  // Check for duplicate employeeId or email
  const existing = await Employee.findOne({
    $or: [{ employeeId }, { email }],
    companyId,
  })

  if (existing) {
    throw new ApiError(409, 'Employee ID or email already exists for this company')
  }

  const employee = await Employee.create({
    employeeId,
    name,
    email,
    phone,
    companyId,
    department,
    role,
    status: status || 'active',
    gender: gender || 'prefer_not_to_say',
    joinDate: new Date(joinDate),
    salary: salary || 0,
    managerId: managerId || null,
    address,
  })

  const populated = await Employee.findById(employee._id)
    .populate('companyId', 'name code')
    .populate('managerId', 'name employeeId')

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Employee created successfully',
    data: populated,
  })
})

/**
 * POST /api/hr/jobs
 * Create a new job posting
 */
export const createJob = asyncHandler(async (req, res) => {
  const {
    title,
    companyId,
    department,
    location,
    type,
    status,
    description,
    requirements,
    salaryMin,
    salaryMax,
    currency,
    closingDate,
  } = req.body

  if (!title || !companyId || !department) {
    throw new ApiError(400, 'Title, companyId and department are required')
  }

  ensureObjectId(companyId, 'companyId')

  const job = await Job.create({
    title,
    companyId,
    department,
    location,
    type,
    status: status || 'open',
    description,
    requirements: Array.isArray(requirements) ? requirements : [],
    salaryMin,
    salaryMax,
    currency,
    closingDate: closingDate ? new Date(closingDate) : undefined,
    createdBy: req.user._id,
  })

  const populated = await Job.findById(job._id)
    .populate('companyId', 'name code')
    .populate('createdBy', 'name email')

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Job created successfully',
    data: populated,
  })
})

/**
 * POST /api/hr/departments
 * Create a new department
 */
export const createDepartment = asyncHandler(async (req, res) => {
  const { name, companyId, code, description, headId, budget, location } = req.body

  if (!name || !companyId) {
    throw new ApiError(400, 'Name and companyId are required')
  }

  ensureObjectId(companyId, 'companyId')

  const existing = await Department.findOne({ name, companyId })
  if (existing) {
    throw new ApiError(409, 'Department already exists for this company')
  }

  const department = await Department.create({
    name,
    companyId,
    code,
    description,
    headId: headId || null,
    budget: budget || 0,
    location,
  })

  const populated = await Department.findById(department._id)
    .populate('companyId', 'name code')
    .populate('headId', 'name email')

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Department created successfully',
    data: populated,
  })
})

/**
 * POST /api/hr/import-employees
 * Bulk import employees from Excel file
 * Expected columns: name, email, phone, role, department, joinDate, status
 */
export const importEmployees = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Excel file is required')
  }

  const companyId = resolveCompanyScope(req)
  if (!companyId) {
    throw new ApiError(400, 'Company scope not found')
  }

  ensureObjectId(companyId, 'companyId')

  // Parse Excel
  const workbook = xlsx.readFile(req.file.path)
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const rows = xlsx.utils.sheet_to_json(worksheet, { defval: '' })

  if (!rows || rows.length === 0) {
    fs.unlinkSync(req.file.path)
    throw new ApiError(400, 'Excel file is empty or could not be parsed')
  }

  // Normalize expected columns with flexible matching
  const normalizeKey = (key) =>
    String(key)
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '')

  const headerMap = {
    name: ['name', 'fullname', 'full_name', 'employeename'],
    email: ['email', 'emailaddress', 'email_address', 'mail'],
    phone: ['phone', 'phonenumber', 'phone_number', 'mobile', 'contact'],
    role: ['role', 'jobtitle', 'job_title', 'designation', 'position'],
    department: ['department', 'dept', 'division', 'team'],
    joindate: ['joindate', 'join_date', 'dateofjoining', 'startdate', 'start_date', 'joined'],
    status: ['status', 'employeestatus'],
    gender: ['gender', 'sex'],
    salary: ['salary', 'ctc', 'pay'],
  }

  const findColumn = (rowKeys, possibleKeys) => {
    for (const pk of possibleKeys) {
      const matched = rowKeys.find((k) => normalizeKey(k) === pk)
      if (matched !== undefined) return matched
    }
    return null
  }

  // Get column names from first row
  const sampleRow = rows[0]
  const rowKeys = Object.keys(sampleRow)
  const colName = findColumn(rowKeys, headerMap.name)
  const colEmail = findColumn(rowKeys, headerMap.email)
  const colPhone = findColumn(rowKeys, headerMap.phone)
  const colRole = findColumn(rowKeys, headerMap.role)
  const colDepartment = findColumn(rowKeys, headerMap.department)
  const colJoinDate = findColumn(rowKeys, headerMap.joindate)
  const colStatus = findColumn(rowKeys, headerMap.status)
  const colGender = findColumn(rowKeys, headerMap.gender)
  const colSalary = findColumn(rowKeys, headerMap.salary)

  if (!colName || !colEmail || !colRole || !colDepartment || !colJoinDate) {
    fs.unlinkSync(req.file.path)
    throw new ApiError(
      400,
      `Missing required columns. Found: ${Object.keys(sampleRow).join(', ')}. Required: name, email, role, department, joinDate`
    )
  }

  // Check existing emails for this company
  const allEmails = rows
    .map((r) => String(r[colEmail] || '').trim().toLowerCase())
    .filter(Boolean)

  const existingEmployees = await Employee.find({
    companyId,
    email: { $in: allEmails },
  }).select('email')

  const existingEmails = new Set(existingEmployees.map((e) => e.email.toLowerCase()))

  const employeesToInsert = []
  const skippedRows = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const name = String(row[colName] || '').trim()
    const email = String(row[colEmail] || '').trim().toLowerCase()
    const phone = colPhone ? String(row[colPhone] || '').trim() : ''
    const role = String(row[colRole] || '').trim()
    const department = String(row[colDepartment] || '').trim()
    const joinDateRaw = row[colJoinDate]
    const status = colStatus ? String(row[colStatus] || '').trim().toLowerCase() : 'active'
    const gender = colGender ? String(row[colGender] || '').trim().toLowerCase() : 'prefer_not_to_say'
    const salaryRaw = colSalary ? row[colSalary] : 0

    if (!name || !email || !role || !department || !joinDateRaw) {
      skippedRows.push({ row: i + 2, reason: 'Missing required fields', email })
      continue
    }

    if (existingEmails.has(email)) {
      skippedRows.push({ row: i + 2, reason: 'Duplicate email', email })
      continue
    }

    // Parse join date
    let joinDate
    if (joinDateRaw instanceof Date) {
      joinDate = joinDateRaw
    } else {
      const parsed = new Date(joinDateRaw)
      joinDate = isNaN(parsed.getTime()) ? new Date(Math.round((joinDateRaw - 25569) * 86400 * 1000)) : parsed
      if (isNaN(joinDate.getTime())) {
        skippedRows.push({ row: i + 2, reason: 'Invalid join date', email })
        continue
      }
    }

    const validStatuses = ['active', 'inactive', 'onleave']
    const validGenders = ['male', 'female', 'other', 'prefer_not_to_say']

    employeesToInsert.push({
      employeeId: `EMP-${Date.now()}-${i}`,
      name,
      email,
      phone,
      companyId,
      department,
      role,
      status: validStatuses.includes(status) ? status : 'active',
      gender: validGenders.includes(gender) ? gender : 'prefer_not_to_say',
      joinDate,
      salary: Number(salaryRaw) || 0,
      isActive: status === 'active',
    })
  }

  // Clean up uploaded file
  try {
    fs.unlinkSync(req.file.path)
  } catch {
    // ignore cleanup error
  }

  let insertedCount = 0
  if (employeesToInsert.length > 0) {
    const result = await Employee.insertMany(employeesToInsert, { ordered: false })
    insertedCount = result.length
  }

  return sendSuccess(res, {
    statusCode: 201,
    message: `Imported ${insertedCount} employee${insertedCount !== 1 ? 's' : ''} successfully`,
    data: {
      imported: insertedCount,
      skipped: skippedRows.length,
      skippedRows: skippedRows.slice(0, 20),
    },
  })
})

