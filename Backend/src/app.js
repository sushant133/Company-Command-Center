import cookieParser from 'cookie-parser'
import cors from 'cors'
import helmet from 'helmet'
import express from 'express'
import rateLimitMiddleware from './middleware/rateLimit.middleware.js'
import morgan from 'morgan'
import compression from 'compression'
import path from 'path'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import { swaggerDefinition } from './swagger.js'
import { env } from './config/env.js'
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js'
import { responseTime } from './middleware/responseTime.js'
import apiRoutes from './routes/index.js'

const app = express()

// Swagger setup
const specs = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: ['./src/routes/*.js', './src/swagger.js']
})

const corsOptions = {
  origin: (origin, callback) => {
    // Allow all in development for dynamic ports/network IPs
    if (env.nodeEnv === 'development') {
      callback(null, true)
      return
    }
    
    // Production: only configured clientUrl
    const allowedOrigins = [env.clientUrl]
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}

app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
}))

app.use(rateLimitMiddleware.api)
app.use(rateLimitMiddleware.slowDown)

app.use(cors(corsOptions))

// SECURITY: Body size limits
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))
app.use(cookieParser())
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false
    return compression.filter(req, res)
  }
}))
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'))
app.use(responseTime)

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Multi-Company API Docs'
}))

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Multi-company command center backend is running',
    docs: '/api-docs',
    health: '/api/health'
  })
})

app.use('/api', apiRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
