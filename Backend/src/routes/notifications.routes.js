import { Router } from 'express'
import { getNotifications, markAsRead } from '../controllers/notifications.controller.js'
import { auth } from '../middleware/auth.middleware.js'

const router = Router()

router.use(auth)

router.get('/', getNotifications)
router.patch('/:id/read', markAsRead)

export default router
