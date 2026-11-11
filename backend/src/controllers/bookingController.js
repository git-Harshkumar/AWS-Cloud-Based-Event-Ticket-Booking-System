import prisma from '../config/prisma.js'
import { successResponse } from '../utils/response.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { NotFoundError, ConflictError, ValidationError } from '../middleware/errorHandler.js'

export const createBooking = asyncHandler(async (req, res) => {
  const { eventId, quantity } = req.body
  const userId = req.user.id

  const qty = parseInt(quantity)
  if (isNaN(qty) || qty < 1) {
    throw new ValidationError('Invalid quantity')
  }
  if (qty > 10) {
    throw new ValidationError('Maximum 10 tickets per booking')
  }

  const booking = await prisma.$transaction(async (tx) => {
    const event = await tx.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true, eventDate: true, ticketPrice: true, availableSeats: true, totalSeats: true }
    })

    if (!event) {
      throw new NotFoundError('Event not found')
    }

    if (new Date(event.eventDate) <= new Date()) {
      throw new ConflictError('Cannot book past events')
    }

    if (event.availableSeats < qty) {
      throw new ConflictError(`Only ${event.availableSeats} seats available`)
    }

    const updatedEvent = await tx.event.update({
      where: { id: eventId },
      data: { availableSeats: { decrement: qty } }
    })

    const totalAmount = event.ticketPrice * qty

    const booking = await tx.booking.create({
      data: {
        userId,
        eventId,
        quantity: qty,
        totalAmount,
        status: 'CONFIRMED'
      },
      include: {
        event: {
          select: { id: true, title: true, eventDate: true, location: true, ticketPrice: true, imageUrl: true }
        },
        user: { select: { id: true, name: true, email: true } }
      }
    })

    return booking
  }, {
    maxWait: 5000,
    timeout: 10000,
    isolationLevel: 'Serializable'
  })

  return successResponse(res, booking, 'Booking confirmed successfully', 201)
})

export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await prisma.booking.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      event: {
        select: {
          id: true, title: true, description: true, category: true,
          location: true, eventDate: true, ticketPrice: true, imageUrl: true
        }
      }
    }
  })

  return successResponse(res, bookings)
})

export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await prisma.booking.findUnique({
    where: { id: req.params.id },
    include: {
      event: {
        select: {
          id: true, title: true, description: true, category: true,
          location: true, eventDate: true, ticketPrice: true, imageUrl: true
        }
      },
      user: { select: { id: true, name: true, email: true } }
    }
  })

  if (!booking) {
    throw new NotFoundError('Booking not found')
  }

  if (booking.userId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    })
  }

  return successResponse(res, booking)
})

export const cancelBooking = asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user.id

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { event: { select: { id: true, eventDate: true, availableSeats: true } } }
  })

  if (!booking) {
    throw new NotFoundError('Booking not found')
  }

  if (booking.userId !== userId && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    })
  }

  if (booking.status === 'CANCELLED') {
    throw new ConflictError('Booking is already cancelled')
  }

  if (new Date(booking.event.eventDate) <= new Date()) {
    throw new ConflictError('Cannot cancel booking for past events')
  }

  const cancelledBooking = await prisma.$transaction(async (tx) => {
    await tx.event.update({
      where: { id: booking.eventId },
      data: { availableSeats: { increment: booking.quantity } }
    })

    const updatedBooking = await tx.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        event: {
          select: { id: true, title: true, eventDate: true, location: true, ticketPrice: true, imageUrl: true }
        }
      }
    })

    return updatedBooking
  })

  return successResponse(res, cancelledBooking, 'Booking cancelled successfully')
})

export const getBookingStats = asyncHandler(async (req, res) => {
  const userId = req.user.id

  const [totalBookings, upcomingBookings, totalSpent, totalTickets] = await Promise.all([
    prisma.booking.count({ where: { userId, status: 'CONFIRMED' } }),
    prisma.booking.count({
      where: {
        userId,
        status: 'CONFIRMED',
        event: { eventDate: { gt: new Date() } }
      }
    }),
    prisma.booking.aggregate({
      where: { userId, status: 'CONFIRMED' },
      _sum: { totalAmount: true }
    }),
    prisma.booking.aggregate({
      where: { userId, status: 'CONFIRMED' },
      _sum: { quantity: true }
    })
  ])

  return successResponse(res, {
    totalBookings,
    upcomingBookings,
    totalSpent: totalSpent._sum.totalAmount || 0,
    totalTickets: totalTickets._sum.quantity || 0
  })
})