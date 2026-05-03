import { Router } from 'express'
import {
  createSubmission,
  deleteSubmission,
  getSubmissionById,
  getSubmissions,
  updateSubmission,
  updateSubmissionStatus,
} from '../controllers/submissions.controller.js'
import { auth } from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/role.middleware.js'

const router = Router()

router.use(auth)

router.post('/', requireRole('admin'), createSubmission)
router.get('/', getSubmissions)
router.get('/:id', getSubmissionById)
router.put('/:id', requireRole('admin'), updateSubmission)
router.patch('/:id/status', requireRole('superadmin'), updateSubmissionStatus)
router.delete('/:id', requireRole('superadmin'), deleteSubmission)

export default router
