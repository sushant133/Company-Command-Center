import express from 'express'
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats
} from '../controllers/projects.controller.js'
import { auth } from '../middleware/auth.middleware.js'
import { requireCompanyAccess } from '../middleware/companyAccess.middleware.js'
import { requireRole } from '../middleware/role.middleware.js'

const router = express.Router({ mergeParams: true })

// All routes require authentication
router.use(auth)

// Company access middleware for nested routes
router.use((req, res, next) => requireCompanyAccess(req.params.companyId)(req, res, next))

// Routes for /api/companies/:companyId/projects
router.route('/')
  .get(getProjects)
  .post(requireRole('admin', 'manager'), createProject)

router.route('/stats')
  .get(getProjectStats)

router.route('/:id')
  .get(getProject)
  .put(requireRole('admin', 'manager'), updateProject)
  .delete(requireRole('admin'), deleteProject)

export default router