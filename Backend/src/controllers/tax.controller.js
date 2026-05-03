import TaxFiling from '../models/TaxFiling.js'
import TDSRecord from '../models/TDSRecord.js'
import TaxDeduction from '../models/TaxDeduction.js'
import TaxDocument from '../models/TaxDocument.js'
import Employee from '../models/Employee.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess } from '../utils/response.js'
import { ensureObjectId } from '../utils/validators.js'

// Helper to resolve company scope based on user role
const resolveCompanyScope = (req) => {
  if (req.user.role === 'superadmin') {
    return req.query.companyId || null
  }
  return req.user.companyId ? String(req.user.companyId) : null
}

// Simple India New Regime FY 2024-25 slabs (monthly)
const calculateMonthlyTDS = (monthlySalary, regime = 'new') => {
  const annualSalary = monthlySalary * 12
  let tax = 0

  if (regime === 'new') {
    // New regime FY 24-25
    if (annualSalary <= 300000) tax = 0
    else if (annualSalary <= 600000) tax = (annualSalary - 300000) * 0.05
    else if (annualSalary <= 900000) tax = 300000 * 0.05 + (annualSalary - 600000) * 0.10
    else if (annualSalary <= 1200000) tax = 300000 * 0.05 + 300000 * 0.10 + (annualSalary - 900000) * 0.15
    else if (annualSalary <= 1500000) tax = 300000 * 0.05 + 300000 * 0.10 + 300000 * 0.15 + (annualSalary - 1200000) * 0.20
    else tax = 300000 * 0.05 + 300000 * 0.10 + 300000 * 0.15 + 300000 * 0.20 + (annualSalary - 1500000) * 0.30
    // Rebate under 87A if <= 7L
    if (annualSalary <= 700000) tax = 0
    // Health & Education Cess 4%
    tax = tax * 1.04
  } else {
    // Old regime simplified (no deductions for auto-calc)
    if (annualSalary <= 250000) tax = 0
    else if (annualSalary <= 500000) tax = (annualSalary - 250000) * 0.05
    else if (annualSalary <= 1000000) tax = 250000 * 0.05 + (annualSalary - 500000) * 0.20
    else tax = 250000 * 0.05 + 500000 * 0.20 + (annualSalary - 1000000) * 0.30
    tax = tax * 1.04
  }

  return Math.max(0, Math.round(tax / 12))
}

/**
 * GET /api/tax/filings
 */
export const getFilings = asyncHandler(async (req, res) => {
  const companyId = resolveCompanyScope(req)
  const { status, filingType, financialYear, search, page = '1', limit = '50' } = req.query

  const filter = {}
  if (companyId) {
    ensureObjectId(companyId, 'companyId')
    filter.companyId = companyId
  }
  if (status) filter.status = status
  if (filingType) filter.filingType = filingType
  if (financialYear) filter.period = { $regex: financialYear, $options: 'i' }
  if (search) {
    filter.$or = [
      { filingType: { $regex: search, $options: 'i' } },
      { period: { $regex: search, $options: 'i' } },
      { challanNumber: { $regex: search, $options: 'i' } },
    ]
  }

  const pageNum = Math.max(1, parseInt(page, 10))
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)))
  const skip = (pageNum - 1) * limitNum

  const [filings, total] = await Promise.all([
    TaxFiling.find(filter).populate('companyId', 'name code').sort({ dueDate: 1 }).skip(skip).limit(limitNum),
    TaxFiling.countDocuments(filter),
  ])

  return sendSuccess(res, {
    data: { filings, total, page: pageNum, pages: Math.ceil(total / limitNum) },
  })
})

/**
 * POST /api/tax/filings
 */
export const createFiling = asyncHandler(async (req, res) => {
  const { companyId, filingType, period, dueDate, amount, challanNumber, notes } = req.body
  if (!companyId || !filingType || !period || !dueDate) {
    throw new ApiError(400, 'Missing required fields')
  }
  ensureObjectId(companyId, 'companyId')

  const filing = await TaxFiling.create({
    companyId,
    filingType,
    period,
    dueDate: new Date(dueDate),
    amount: amount || 0,
    challanNumber,
    notes,
    createdBy: req.user._id,
  })

  const populated = await TaxFiling.findById(filing._id).populate('companyId', 'name code')
  return sendSuccess(res, { statusCode: 201, message: 'Filing created', data: populated })
})

/**
 * PATCH /api/tax/filings/:id/status
 */
export const updateFilingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status, filedDate } = req.body
  ensureObjectId(id, 'id')

  const update = { status }
  if (filedDate) update.filedDate = new Date(filedDate)

  const filing = await TaxFiling.findByIdAndUpdate(id, update, { new: true }).populate('companyId', 'name code')
  if (!filing) throw new ApiError(404, 'Filing not found')

  return sendSuccess(res, { message: 'Status updated', data: filing })
})

/**
 * GET /api/tax/tds
 */
export const getTDSRecords = asyncHandler(async (req, res) => {
  const companyId = resolveCompanyScope(req)
  const { employeeId, financialYear, month, page = '1', limit = '50' } = req.query

  const filter = {}
  if (companyId) {
    ensureObjectId(companyId, 'companyId')
    filter.companyId = companyId
  }
  if (employeeId) filter.employeeId = employeeId
  if (financialYear) filter.financialYear = financialYear
  if (month) filter.month = month

  const pageNum = Math.max(1, parseInt(page, 10))
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)))
  const skip = (pageNum - 1) * limitNum

  const [records, total] = await Promise.all([
    TDSRecord.find(filter)
      .populate('employeeId', 'name employeeId department salary')
      .populate('companyId', 'name code')
      .sort({ month: -1 })
      .skip(skip)
      .limit(limitNum),
    TDSRecord.countDocuments(filter),
  ])

  return sendSuccess(res, {
    data: { records, total, page: pageNum, pages: Math.ceil(total / limitNum) },
  })
})

/**
 * POST /api/tax/tds/auto-calculate
 * Auto-calculates TDS for all active employees of a company for a given month
 */
export const autoCalculateTDS = asyncHandler(async (req, res) => {
  const { companyId, month, financialYear, regime = 'new' } = req.body
  if (!companyId || !month || !financialYear) {
    throw new ApiError(400, 'companyId, month and financialYear are required')
  }
  ensureObjectId(companyId, 'companyId')

  const employees = await Employee.find({ companyId, status: 'active', salary: { $gt: 0 } })
  if (!employees.length) {
    throw new ApiError(404, 'No active employees with salary found')
  }

  const created = []
  for (const emp of employees) {
    const monthlySalary = emp.salary
    const tdsAmount = calculateMonthlyTDS(monthlySalary, regime)
    const taxableIncome = monthlySalary * 12

    const existing = await TDSRecord.findOne({ companyId, employeeId: emp._id, month, financialYear })
    if (existing) {
      existing.tdsAmount = tdsAmount
      existing.salary = monthlySalary
      existing.taxableIncome = taxableIncome
      existing.regime = regime
      await existing.save()
      created.push(existing)
    } else {
      const record = await TDSRecord.create({
        companyId,
        employeeId: emp._id,
        financialYear,
        month,
        salary: monthlySalary,
        tdsAmount,
        regime,
        taxableIncome,
        createdBy: req.user._id,
      })
      created.push(record)
    }
  }

  return sendSuccess(res, {
    statusCode: 201,
    message: `TDS calculated for ${created.length} employees`,
    data: created,
  })
})

/**
 * GET /api/tax/deductions
 */
export const getDeductions = asyncHandler(async (req, res) => {
  const companyId = resolveCompanyScope(req)
  const { employeeId, financialYear, section, page = '1', limit = '50' } = req.query

  const filter = {}
  if (companyId) {
    ensureObjectId(companyId, 'companyId')
    filter.companyId = companyId
  }
  if (employeeId) filter.employeeId = employeeId
  if (financialYear) filter.financialYear = financialYear
  if (section) filter.section = section

  const pageNum = Math.max(1, parseInt(page, 10))
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)))
  const skip = (pageNum - 1) * limitNum

  const [deductions, total] = await Promise.all([
    TaxDeduction.find(filter)
      .populate('employeeId', 'name employeeId')
      .populate('companyId', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    TaxDeduction.countDocuments(filter),
  ])

  return sendSuccess(res, {
    data: { deductions, total, page: pageNum, pages: Math.ceil(total / limitNum) },
  })
})

/**
 * POST /api/tax/deductions
 */
export const createDeduction = asyncHandler(async (req, res) => {
  const { companyId, employeeId, financialYear, section, description, amount, proofUrl } = req.body
  if (!companyId || !financialYear || !section || amount == null) {
    throw new ApiError(400, 'Missing required fields')
  }
  ensureObjectId(companyId, 'companyId')

  const deduction = await TaxDeduction.create({
    companyId,
    employeeId: employeeId || null,
    financialYear,
    section,
    description,
    amount,
    proofUrl,
    createdBy: req.user._id,
  })

  const populated = await TaxDeduction.findById(deduction._id)
    .populate('employeeId', 'name employeeId')
    .populate('companyId', 'name code')

  return sendSuccess(res, { statusCode: 201, message: 'Deduction created', data: populated })
})

/**
 * GET /api/tax/documents
 */
export const getDocuments = asyncHandler(async (req, res) => {
  const companyId = resolveCompanyScope(req)
  const { financialYear, docType } = req.query

  const filter = {}
  if (companyId) {
    ensureObjectId(companyId, 'companyId')
    filter.companyId = companyId
  }
  if (financialYear) filter.financialYear = financialYear
  if (docType) filter.docType = docType

  const docs = await TaxDocument.find(filter)
    .populate('companyId', 'name code')
    .sort({ createdAt: -1 })

  return sendSuccess(res, { data: docs })
})

/**
 * POST /api/tax/documents
 */
export const createDocument = asyncHandler(async (req, res) => {
  const { companyId, financialYear, docType, title, originalName, storageUrl, size, mimeType } = req.body
  if (!companyId || !financialYear || !title) {
    throw new ApiError(400, 'Missing required fields')
  }
  ensureObjectId(companyId, 'companyId')

  const doc = await TaxDocument.create({
    companyId,
    financialYear,
    docType: docType || 'Other',
    title,
    originalName,
    storageUrl,
    size,
    mimeType,
    uploadedBy: req.user._id,
  })

  const populated = await TaxDocument.findById(doc._id).populate('companyId', 'name code')
  return sendSuccess(res, { statusCode: 201, message: 'Document recorded', data: populated })
})

/**
 * GET /api/tax/reports
 */
export const getTaxReports = asyncHandler(async (req, res) => {
  const companyId = resolveCompanyScope(req)
  const { financialYear } = req.query

  const filter = {}
  if (companyId) {
    ensureObjectId(companyId, 'companyId')
    filter.companyId = companyId
  }

  const fyFilter = financialYear ? { financialYear } : {}

  // Summary numbers
  const totalLiability = await TaxFiling.aggregate([
    { $match: { ...filter, status: { $in: ['Pending', 'Filed', 'Overdue'] } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ])
  const paidAmount = await TaxFiling.aggregate([
    { $match: { ...filter, status: 'Filed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ])
  const pendingAmount = await TaxFiling.aggregate([
    { $match: { ...filter, status: 'Pending' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ])
  const overdueCount = await TaxFiling.countDocuments({ ...filter, status: 'Overdue' })

  // Monthly TDS trend
  const tdsTrend = await TDSRecord.aggregate([
    { $match: { ...filter, ...fyFilter } },
    { $group: { _id: '$month', totalTDS: { $sum: '$tdsAmount' }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ])

  // Deductions by section
  const deductionsBySection = await TaxDeduction.aggregate([
    { $match: { ...filter, ...fyFilter } },
    { $group: { _id: '$section', total: { $sum: '$amount' } } },
    { $sort: { total: -1 } },
  ])

  // Filings by type
  const filingsByType = await TaxFiling.aggregate([
    { $match: filter },
    { $group: { _id: '$filingType', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } },
  ])

  // Status breakdown
  const statusBreakdown = await TaxFiling.aggregate([
    { $match: filter },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ])

  return sendSuccess(res, {
    data: {
      summary: {
        totalLiability: totalLiability[0]?.total || 0,
        paidAmount: paidAmount[0]?.total || 0,
        pendingAmount: pendingAmount[0]?.total || 0,
        overdueCount,
      },
      tdsTrend: tdsTrend.map((t) => ({ month: t._id, totalTDS: t.totalTDS, count: t.count })),
      deductionsBySection: deductionsBySection.map((d) => ({ name: d._id, value: d.total })),
      filingsByType: filingsByType.map((f) => ({ name: f._id, count: f.count, amount: f.totalAmount })),
      statusBreakdown: statusBreakdown.map((s) => ({ name: s._id, value: s.count })),
    },
  })
})

/**
 * GET /api/tax/dashboard
 */
export const getTaxDashboard = asyncHandler(async (req, res) => {
  const companyId = resolveCompanyScope(req)

  const filter = {}
  if (companyId) {
    ensureObjectId(companyId, 'companyId')
    filter.companyId = companyId
  }

  const now = new Date()
  const upcomingDeadline = new Date(now)
  upcomingDeadline.setDate(now.getDate() + 7)

  const totalFilings = await TaxFiling.countDocuments(filter)
  const pendingFilings = await TaxFiling.countDocuments({ ...filter, status: 'Pending' })
  const overdueFilings = await TaxFiling.countDocuments({ ...filter, status: 'Overdue' })
  const filedThisMonth = await TaxFiling.countDocuments({
    ...filter,
    status: 'Filed',
    filedDate: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) },
  })

  const upcomingDue = await TaxFiling.find({
    ...filter,
    status: 'Pending',
    dueDate: { $gte: now, $lte: upcomingDeadline },
  })
    .populate('companyId', 'name code')
    .sort({ dueDate: 1 })
    .limit(5)

  const totalTDS = await TDSRecord.aggregate([
    { $match: filter },
    { $group: { _id: null, total: { $sum: '$tdsAmount' } } },
  ])

  const totalDeductions = await TaxDeduction.aggregate([
    { $match: filter },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ])

  return sendSuccess(res, {
    data: {
      summary: {
        totalFilings,
        pendingFilings,
        overdueFilings,
        filedThisMonth,
        totalTDS: totalTDS[0]?.total || 0,
        totalDeductions: totalDeductions[0]?.total || 0,
      },
      upcomingDue,
    },
  })
})

