import prisma from '../config/prisma.js'
import { successResponse, paginatedResponse } from '../utils/response.js'
import { asyncHandler } from '../middleware/errorHandler.js'

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalEvents,
    totalBookings,
    totalTicketsSold,
    totalRevenue,
    recentBookings
  ] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.booking.count({ where: { status: 'CONFIRMED' } }),
    prisma.booking.aggregate({
      where: { status: 'CONFIRMED' },
      _sum: { quantity: true }
    }),
    prisma.booking.aggregate({
      where: { status: 'CONFIRMED' },
      _sum: { totalAmount: true }
    }),
    prisma.booking.findMany({
      where: { status: 'CONFIRMED' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, title: true, eventDate: true, ticketPrice: true } }
      }
    })
  ])

  return successResponse(res, {
    totalUsers,
    totalEvents,
    totalBookings,
    totalTicketsSold: totalTicketsSold._sum.quantity || 0,
    totalRevenue: totalRevenue._sum.totalAmount || 0,
    recentBookings
  })
})

export const getDashboardCharts = asyncHandler(async (req, res) => {
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const [revenueByMonth, bookingsByStatus] = await Promise.all([
    prisma.$queryRaw`
      SELECT to_char("createdAt", 'Mon YYYY') as month, SUM("totalAmount") as revenue
      FROM "Booking"
      WHERE "status" = 'CONFIRMED' AND "createdAt" >= ${sixMonthsAgo}
      GROUP BY to_char("createdAt", 'Mon YYYY'), date_trunc('month', "createdAt")
      ORDER BY date_trunc('month', "createdAt")
    `,
    prisma.booking.groupBy({
      by: ['status'],
      _count: { status: true },
      where: { status: { in: ['CONFIRMED', 'CANCELLED', 'PENDING'] } }
    })
  ])

  return successResponse(res, {
    revenueByMonth: revenueByMonth.map(r => ({
      month: r.month,
      revenue: parseFloat(r.revenue)
    })),
    bookingsByStatus: bookingsByStatus.map(b => ({
      status: b.status,
      count: b._count.status
    }))
  })
})

export const getAllBookings = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))
  const skip = (page - 1) * limit

  const filter = {}
  if (req.query.status) filter.status = req.query.status
  if (req.query.userId) filter.userId = req.query.userId
  if (req.query.eventId) filter.eventId = req.query.eventId

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, title: true, eventDate: true, ticketPrice: true } }
      }
    }),
    prisma.booking.count({ where: filter })
  ])

  return paginatedResponse(res, bookings, { page, limit, total, totalPages: Math.ceil(total / limit) })
})

export const getAllUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))
  const skip = (page - 1) * limit

  const filter = {}
  if (req.query.role) filter.role = req.query.role
  if (req.query.search) {
    filter.OR = [
      { name: { contains: req.query.search, mode: 'insensitive' } },
      { email: { contains: req.query.search, mode: 'insensitive' } }
    ]
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { bookings: true } } }
    }),
    prisma.user.count({ where: filter })
  ])

  return paginatedResponse(res, users, { page, limit, total, totalPages: Math.ceil(total / limit) })
})

export const getAdminEvents = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10))
  const skip = (page - 1) * limit

  const filter = {}
  if (req.query.search) {
    filter.OR = [
      { title: { contains: req.query.search, mode: 'insensitive' } },
      { location: { contains: req.query.search, mode: 'insensitive' } }
    ]
  }
  if (req.query.category) filter.category = { equals: req.query.category, mode: 'insensitive' }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true, title: true, category: true, location: true,
        eventDate: true, ticketPrice: true, totalSeats: true,
        availableSeats: true, imageUrl: true, createdAt: true,
        _count: { select: { bookings: { where: { status: 'CONFIRMED' } } } }
      }
    }),
    prisma.event.count({ where: filter })
  ])

  return paginatedResponse(res, events, { page, limit, total, totalPages: Math.ceil(total / limit) })
})