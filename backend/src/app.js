import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { config } from './config/index.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { sanitizeInput } from './middleware/validate.js'
import logger, { logRequest } from './utils/logger.js'

import os from 'os'
import authRoutes from './routes/authRoutes.js'
import eventRoutes from './routes/eventRoutes.js'
import bookingRoutes from './routes/bookingRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import instanceRoutes from './routes/instanceRoutes.js'

const app = express()

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}))

app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use(sanitizeInput)
app.use(logRequest)

const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.nodeEnv === 'development' ? 10000 : config.rateLimitMaxRequests,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
})
app.use('/api/', limiter)

app.use('/api/auth', authRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api', instanceRoutes)

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'EventFlow API Server',
    version: '1.0.0',
    instanceId: config.instanceId,
    hostname: os.hostname(),
    timestamp: new Date().toISOString()
  })
})

app.use(notFoundHandler)
app.use(errorHandler)

export default app