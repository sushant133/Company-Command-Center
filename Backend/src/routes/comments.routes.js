import express from 'express'
import {
  getComments,
  getComment,
  createComment,
  updateComment,
  deleteComment,
  markCommentAsRead,
  getMyComments
} from '../controllers/comments.controller.js'
import { auth } from '../middleware/auth.middleware.js'
import { requireCompanyAccess } from '../middleware/companyAccess.middleware.js'

const router = express.Router({ mergeParams: true })

// All routes require authentication
router.use(auth)

// Company access middleware for nested routes
router.use((req, res, next) => requireCompanyAccess(req.params.companyId)(req, res, next))

// Routes for /api/companies/:companyId/comments
router.route('/')
  .get(getComments)
  .post(createComment)

router.route('/my')
  .get(getMyComments)

router.route('/:id')
  .get(getComment)
  .put(updateComment)
  .delete(deleteComment)

router.route('/:id/read')
  .put(markCommentAsRead)

export default router