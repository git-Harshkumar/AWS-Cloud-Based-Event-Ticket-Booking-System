import app from './app.js'
import { config } from './config/index.js'
import logger from './utils/logger.js'
import prisma from './config/prisma.js'

const startServer = async () => {
  try {
    await prisma.$connect()
    logger.info('Database connected successfully')

    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`, {
        instanceId: config.instanceId,
        environment: config.nodeEnv,
        pid: process.pid
      })
    })

    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received, shutting down gracefully`)
      server.close(async () => {
        await prisma.$disconnect()
        logger.info('Database disconnected')
        process.exit(0)
      })

      setTimeout(() => {
        logger.error('Forced shutdown after timeout')
        process.exit(1)
      }, 10000)
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection', { reason })
    })

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', { error })
      gracefulShutdown('UNCAUGHT_EXCEPTION')
    })

  } catch (error) {
    logger.error('Failed to start server', { error })
    process.exit(1)
  }
}

startServer()