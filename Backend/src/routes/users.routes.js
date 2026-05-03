import { Router } from 'express'
import {
  createUser,
  getUserById,
  getUsers,
  updateUser,
  updateUserStatus,
} from '../controllers/users.controller.js'
import { auth } from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/role.middleware.js'

const router = Router()

router.use(auth)

router.post('/', requireRole('superadmin'), createUser)
router.get('/', requireRole('superadmin'), getUsers)
router.get('/:id', getUserById)
router.put('/:id', updateUser)
router.patch('/:id/status', requireRole('superadmin'), updateUserStatus)

export default router
