import { Router } from 'express'
import {
  generateInsight,
  getCompanyInsights,
  getInsights,
  chatbotMessage,
} from '../controllers/ai.controller.js'
import { auth } from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/role.middleware.js'

const router = Router()

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     tags: [AI]
 *     summary: AI Chatbot - Send message to portfolio assistant
 *     description: Natural language interface for company insights, financial analysis, HR metrics, risk assessment, task management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Tell me about TechNova financial performance and risks"
 *             required:
 *               - message
 *     responses:
 *       200:
 *         description: AI response generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     aiMessage:
 *                       type: string
 *                       example: "**TechNova Analysis**\\nRevenue: $2.5M..."
 *                     isError:
 *                       type: boolean
 *       400:
 *         description: Invalid input
 *       429:
 *         description: Rate limited
 */
router.post('/chat', auth, chatbotMessage)

/**
 * @swagger
 * /api/ai/insights:
 *   get:
 *     tags: [AI]
 *     summary: Get all AI insights
 *     responses:
 *       200:
 *         description: Insights list
 */
router.get('/insights', getInsights)

/**
 * @swagger
 * /api/ai/insights/company/{companyId}:
 *   get:
 *     tags: [AI]
 *     summary: Company-specific insights
 *     parameters:
 *       - name: companyId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Company insights
 */
router.get('/insights/company/:companyId', getCompanyInsights)

router.post('/generate-insight', requireRole('superadmin'), generateInsight)

export default router
