import { Router } from 'express'
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
  updateTaskStatus,
} from '../controllers/tasks.controller.js'
import { auth } from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/role.middleware.js'
import { upload } from '../middleware/upload.middleware.js'

const router = Router()

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Create new task (Superadmin only)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Review Q1 Financial Report"
 *               description:
 *                 type: string
 *                 example: "Analyze revenue trends and prepare summary"
 *               assigneeId:
 *                 type: string
 *               companyId:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Task created successfully
 *   get:
 *     tags: [Tasks]
 *     summary: Get all tasks (filtered by auth user/company)
 *     parameters:
 *       - name: companyId
 *         in: query
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [pending, in-progress, completed]
 *     responses:
 *       200:
 *         description: Tasks list
 */
router.use(auth)

router.post('/', requireRole('superadmin'), upload.array('attachments'), createTask)
router.get('/', getTasks)

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get task by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *   put:
 *     tags: [Tasks]
 *     summary: Update task (Superadmin)
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task updated
 *   patch:
 *     tags: [Tasks]
 *     summary: Update task status
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed, cancelled]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete task (Superadmin)
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted
 */
router.get('/:id', getTaskById)
router.put('/:id', requireRole('superadmin'), upload.array('attachments'), updateTask)
router.patch('/:id/status', updateTaskStatus)
router.delete('/:id', requireRole('superadmin'), deleteTask)

export default router
