import { Router } from 'express'
import {
  getFilings,
  createFiling,
  updateFilingStatus,
  getTDSRecords,
  autoCalculateTDS,
  getDeductions,
  createDeduction,
  getDocuments,
  createDocument,
  getTaxReports,
  getTaxDashboard,
} from '../controllers/tax.controller.js'
import { auth } from '../middleware/auth.middleware.js'

const router = Router()

router.use(auth)

// Filings
router.get('/filings', getFilings)
router.post('/filings', createFiling)
router.patch('/filings/:id/status', updateFilingStatus)

// TDS
router.get('/tds', getTDSRecords)
router.post('/tds/auto-calculate', autoCalculateTDS)

// Deductions
router.get('/deductions', getDeductions)
router.post('/deductions', createDeduction)

// Documents
router.get('/documents', getDocuments)
router.post('/documents', createDocument)

// Reports & Dashboard
router.get('/reports', getTaxReports)
router.get('/dashboard', getTaxDashboard)

export default router

