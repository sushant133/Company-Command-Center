import { Router } from 'express'
import {
  getEntries,
  getEntryById,
  createEntry,
  updateEntry,
  approveEntry,
  rejectEntry,
  bulkApproveEntries,
  bulkDeleteEntries,
  exportEntries,
  getEntryComments,
  addEntryComment,
  getEntryActivityLog,
  downloadEntryAttachment,
  deleteEntryAttachment,
} from '../controllers/entries.controller.js'
import { auth } from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/role.middleware.js'
import { upload } from '../middleware/upload.middleware.js'

const router = Router()

router.use(auth)

router.get('/', getEntries)
router.post('/', upload.array('files', 10), createEntry)
router.get('/export', exportEntries)
router.post('/bulk-approve', requireRole('admin', 'superadmin'), bulkApproveEntries)
router.post('/bulk-delete', requireRole('admin', 'superadmin'), bulkDeleteEntries)

router.route('/:id')
  .get(getEntryById)
  .put(upload.array('files', 10), updateEntry)

router.post('/:id/approve', requireRole('admin', 'superadmin'), approveEntry)
router.post('/:id/reject', requireRole('admin', 'superadmin'), rejectEntry)
router.get('/:id/comments', getEntryComments)
router.post('/:id/comments', addEntryComment)
router.get('/:id/activity-log', getEntryActivityLog)
router.get('/:id/attachments/:attachmentId/download', downloadEntryAttachment)
router.delete('/:id/attachments/:attachmentId', deleteEntryAttachment)

export default router
