import { Router } from 'express'
import { deleteFile, getFileById, listFiles, uploadFile } from '../controllers/files.controller.js'
import { auth } from '../middleware/auth.middleware.js'
import { upload } from '../middleware/upload.middleware.js'

const router = Router()

router.use(auth)

router.get('/', listFiles)
router.post('/upload', upload.single('file'), uploadFile)
router.get('/:id', getFileById)
router.delete('/:id', deleteFile)

export default router
