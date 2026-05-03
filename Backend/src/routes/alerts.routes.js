import { Router } from 'express'
import { getSmartAlerts } from '../controllers/alerts.controller.js'
import { auth } from '../middleware/auth.middleware.js'

const router = Router()

router.use(auth)
router.get('/', getSmartAlerts)

export default router
