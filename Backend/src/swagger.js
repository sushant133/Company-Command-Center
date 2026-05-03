/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints
 *   - name: AI
 *     description: AI Chatbot and Insights
 *   - name: Tasks
 *     description: Task management (CRUD)
 *   - name: Companies
 *     description: Company management
 *   - name: Health
 *     description: System health checks
 *
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *         message:
 *           type: string
 *     Success:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *
 * security:
 *  - BearerAuth: []
 *
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     responses:
 *       200:
 *         description: Healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: {type: string, example: user@example.com}
 *               password: {type: string, format: password}
 *               name: {type: string}
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         $ref: '#/components/schemas/Error'
 *
 * /api/ai/chat:
 *   post:
 *     tags: [AI]
 *     summary: AI Portfolio Chatbot - Send message
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Tell me about TechNova"
 *             required: [message]
 *     responses:
 *       200:
 *         description: AI response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Invalid message
 *         $ref: '#/components/schemas/Error'
 *     description: Main AI chatbot endpoint. Handles natural language queries about portfolio companies, financials, HR metrics, risks, etc.
 *
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
 *               title: {type: string, example: "Review Q1 financials"}
 *               description: {type: string}
 *               assigneeId: {type: string}
 *               companyId: {type: string}
 *               attachments: {type: array, items: {type: string, format: binary}}
 *     responses:
 *       201:
 *         description: Task created
 *   get:
 *     tags: [Tasks]
 *     summary: Get tasks
 *     parameters:
 *       - name: companyId
 *         in: query
 *         schema: {type: string}
 *     responses:
 *       200:
 *         description: Tasks list
 *
 * /api/tasks/{id}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get task by ID
 *   put:
 *     tags: [Tasks]
 *     summary: Update task (Superadmin)
 *   patch:
 *     tags: [Tasks]
 *     summary: Update task status
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: {type: string}
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               status: {type: string, enum: [pending, in-progress, completed]}
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete task (Superadmin)
 *
 * /api/companies:
 *   get:
 *     tags: [Companies]
 *     summary: List companies in portfolio
 *     responses:
 *       200:
 *         description: Company list
 */

export const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Multi-Company Command Center API',
    version: '1.0.0',
    description: 'AI-powered multi-company management platform API'
  }
};
