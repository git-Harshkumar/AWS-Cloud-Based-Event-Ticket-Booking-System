import { Router } from 'express'
import { query, param } from 'express-validator'
import * as adminController from '../controllers/adminController.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()

router.use(authenticate, authorize('ADMIN'))

router.get('/dashboard', adminController.getDashboardStats)
router.get('/dashboard/charts', adminController.getDashboardCharts)

router.get('/bookings',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isIn(['CONFIRMED', 'CANCELLED', 'PENDING']),
    query('userId').optional().isUUID(),
    query('eventId').optional().isUUID()
  ],
  validate,
  adminController.getAllBookings
)

router.get('/users',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('role').optional().isIn(['USER', 'ADMIN']),
    query('search').optional().trim()
  ],
  validate,
  adminController.getAllUsers
)

router.get('/events',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
    query('search').optional().trim(),
    query('category').optional().trim()
  ],
  validate,
  adminController.getAdminEvents
)

export default router