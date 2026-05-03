import { Router } from 'express'
import {
  getApprovals,
  getApproval,
  createApproval,
  updateApproval,
  addQuestion,
  answerQuestion,
  addReview,
  deleteApproval,
  getApprovalStats
} from '../controllers/approvals.controller.js'
import { auth } from '../middleware/auth.middleware.js'
import { requireCompanyAccess } from '../middleware/companyAccess.middleware.js'
import { requireRole } from '../middleware/role.middleware.js'
import { upload } from '../middleware/upload.middleware.js'

const router = Router({ mergeParams: true })

// All routes require authentication
router.use(auth)

// Company access middleware for nested routes
router.use((req, res, next) => requireCompanyAccess(req.params.companyId)(req, res, next))

// Routes for /api/companies/:companyId/approvals
router.route('/')
  .get(getApprovals)
  .post(upload.array('files', 10), createApproval)

router.route('/stats')
  .get(getApprovalStats)

router.route('/:id')
  .get(getApproval)
  .put(requireRole('superadmin', 'admin', 'manager'), updateApproval)
  .delete(requireRole('admin', 'superadmin'), deleteApproval)

// Question endpoints
router.route('/:id/questions')
  .post(addQuestion)

router.route('/:id/questions/:questionId/answer')
  .post(answerQuestion)

// Review endpoints
router.route('/:id/reviews')
  .post(requireRole('superadmin', 'admin'), addReview)

export default router