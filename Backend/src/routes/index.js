import { Router } from 'express'
import aiRoutes from './ai.routes.js'
import analyticsRoutes from './analytics.routes.js'
import alertsRoutes from './alerts.routes.js'
import approvalsRoutes from './approvals.routes.js'
import authRoutes from './auth.routes.js'
import commentsRoutes from './comments.routes.js'
import companiesRoutes from './companies.routes.js'
import entriesRoutes from './entries.routes.js'
import filesRoutes from './files.routes.js'
import notificationsRoutes from './notifications.routes.js'
import projectsRoutes from './projects.routes.js'
import sectionsRoutes from './sections.routes.js'
import submissionsRoutes from './submissions.routes.js'
import tasksRoutes from './tasks.routes.js'
import usersRoutes from './users.routes.js'
import hrRoutes from './hr.routes.js'
import taxRoutes from './tax.routes.js'

const router = Router()

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Backend is healthy',
  })
})

router.use('/auth', authRoutes)
router.use('/users', usersRoutes)
router.use('/companies', companiesRoutes)
router.use('/sections', sectionsRoutes)
router.use('/tasks', tasksRoutes)
router.use('/submissions', submissionsRoutes)
router.use('/files', filesRoutes)
router.use('/analytics', analyticsRoutes)
router.use('/ai', aiRoutes)
router.use('/alerts', alertsRoutes)
router.use('/notifications', notificationsRoutes)
router.use('/companies/:companyId/projects', projectsRoutes)
router.use('/companies/:companyId/approvals', approvalsRoutes)
router.use('/companies/:companyId/comments', commentsRoutes)
router.use('/entries', entriesRoutes)
router.use('/hr', hrRoutes)
router.use('/tax', taxRoutes)

export default router
