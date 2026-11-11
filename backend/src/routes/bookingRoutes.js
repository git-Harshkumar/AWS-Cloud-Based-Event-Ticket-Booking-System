import { Router } from 'express'
import { body, param } from 'express-validator'
import * as bookingController from '../controllers/bookingController.js'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()

router.post('/',
  authenticate,
  [
    body('eventId').isUUID().withMessage('Valid event ID is required'),
    body('quantity').isInt({ min: 1, max: 10 }).withMessage('Quantity must be between 1 and 10')
  ],
  validate,
  bookingController.createBooking
)

router.get('/my', authenticate, bookingController.getMyBookings)

router.get('/my/stats', authenticate, bookingController.getBookingStats)

router.get('/:id',
  authenticate,
  [param('id').isUUID().withMessage('Invalid booking ID')],
  validate,
  bookingController.getBookingById
)

router.patch('/:id/cancel',
  authenticate,
  [param('id').isUUID().withMessage('Invalid booking ID')],
  validate,
  bookingController.cancelBooking
)

export default router