import os from 'os'
import { config } from '../config/index.js'
import { successResponse } from '../utils/response.js'
import { asyncHandler } from '../middleware/errorHandler.js'

export const getHealth = asyncHandler(async (req, res) => {
  const memUsage = process.memoryUsage()
  const uptime = process.uptime()

  return successResponse(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptime),
    memory: {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024)
    },
    cpu: process.cpuUsage(),
    version: process.version,
    platform: process.platform,
    pid: process.pid
  })
})

export const getInstanceInfo = asyncHandler(async (req, res) => {
  return successResponse(res, {
    message: 'Request handled successfully',
    instanceId: config.instanceId,
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    totalMemory: Math.round(os.totalmem() / 1024 / 1024 / 1024) + ' GB',
    freeMemory: Math.round(os.freemem() / 1024 / 1024 / 1024) + ' GB',
    uptime: Math.floor(os.uptime() / 3600) + ' hours',
    timestamp: new Date().toISOString()
  })
})