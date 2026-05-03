import { Router } from 'express'
import {
  getCompanyAnalytics,
  getCompanyRankings,
  getOverviewAnalytics,
  getHRAnalytics,
  getActivityLog,
} from '../controllers/analytics.controller.js'
import { auth } from '../middleware/auth.middleware.js'
import { requireCompanyAccess } from '../middleware/companyAccess.middleware.js'
import { requireRole } from '../middleware/role.middleware.js'

const router = Router()

router.use(auth)

router.get('/overview', requireRole('superadmin'), getOverviewAnalytics)
router.get('/company/:companyId', requireCompanyAccess, getCompanyAnalytics)
router.get('/rankings', requireRole('superadmin'), getCompanyRankings)
router.get('/hr', requireRole('superadmin'), getHRAnalytics)
router.get('/activity', requireRole('superadmin'), getActivityLog)

export default router
