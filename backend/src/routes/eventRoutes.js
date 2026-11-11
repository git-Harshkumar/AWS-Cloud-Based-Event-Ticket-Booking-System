import { Router } from 'express'
import { body, query, param } from 'express-validator'
import * as eventController from '../controllers/eventController.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()

router.get('/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
    query('search').optional().trim(),
    query('category').optional().trim(),
    query('dateFrom').optional().isISO8601().toDate(),
    query('dateTo').optional().isISO8601().toDate()
  ],
  validate,
  eventController.getEvents
)

router.get('/categories', eventController.getCategories)

router.get('/:id',
  [param('id').isUUID().withMessage('Invalid event ID')],
  validate,
  eventController.getEventById
)

router.post('/',
  authenticate,
  authorize('ADMIN'),
  [
    body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
    body('description').trim().isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
    body('category').notEmpty().withMessage('Category is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('eventDate').isISO8601().toDate().withMessage('Valid event date is required'),
    body('ticketPrice').isFloat({ min: 0 }).withMessage('Ticket price must be a positive number'),
    body('totalSeats').isInt({ min: 1, max: 100000 }).withMessage('Total seats must be between 1 and 100,000'),
    body('imageUrl').optional().isURL().withMessage('Image URL must be valid')
  ],
  validate,
  eventController.createEvent
)

router.put('/:id',
  authenticate,
  authorize('ADMIN'),
  [
    param('id').isUUID().withMessage('Invalid event ID'),
    body('title').optional().trim().isLength({ min: 3 }),
    body('description').optional().trim().isLength({ min: 20 }),
    body('category').optional().notEmpty(),
    body('location').optional().trim().notEmpty(),
    body('eventDate').optional().isISO8601().toDate(),
    body('ticketPrice').optional().isFloat({ min: 0 }),
    body('totalSeats').optional().isInt({ min: 1, max: 100000 }),
    body('imageUrl').optional().isURL()
  ],
  validate,
  eventController.updateEvent
)

router.delete('/:id',
  authenticate,
  authorize('ADMIN'),
  [param('id').isUUID().withMessage('Invalid event ID')],
  validate,
  eventController.deleteEvent
)

export default router