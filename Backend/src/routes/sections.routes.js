import { Router } from 'express'
import {
  createField,
  createSection,
  deleteField,
  deleteSection,
  getSectionById,
  getSections,
  updateField,
  updateSection,
} from '../controllers/sections.controller.js'
import { auth } from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/role.middleware.js'

const router = Router()

router.use(auth)

router.post('/', requireRole('superadmin'), createSection)
router.get('/', getSections)
router.get('/:id', getSectionById)
router.put('/:id', requireRole('superadmin'), updateSection)
router.delete('/:id', requireRole('superadmin'), deleteSection)

router.post('/:sectionId/fields', requireRole('superadmin'), createField)
router.put('/fields/:id', requireRole('superadmin'), updateField)
router.delete('/fields/:id', requireRole('superadmin'), deleteField)

export default router
