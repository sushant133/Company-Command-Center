import { Router } from 'express'
import {
  getEmployees,
  getDepartments,
  getJobs,
  getHRReports,
  createEmployee,
  createJob,
  createDepartment,
  importEmployees,
} from '../controllers/hr.controller.js'
import { auth } from '../middleware/auth.middleware.js'
import { upload } from '../middleware/upload.middleware.js'

const router = Router()

router.use(auth)

router.get('/employees', getEmployees)
router.post('/employees', createEmployee)

router.get('/departments', getDepartments)
router.post('/departments', createDepartment)

router.get('/jobs', getJobs)
router.post('/jobs', createJob)

router.get('/reports', getHRReports)

router.post('/import-employees', upload.single('file'), importEmployees)

export default router

