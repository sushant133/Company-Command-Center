import { Router } from 'express'
import {
  createCompany,
  deleteCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
} from '../controllers/companies.controller.js'
import { auth } from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/role.middleware.js'

const router = Router()

router.use(auth)

router.post('/', requireRole('superadmin'), createCompany)
router.get('/', getCompanies)
router.get('/:id', getCompanyById)
router.put('/:id', requireRole('superadmin'), updateCompany)
router.delete('/:id', requireRole('superadmin'), deleteCompany)

export default router
