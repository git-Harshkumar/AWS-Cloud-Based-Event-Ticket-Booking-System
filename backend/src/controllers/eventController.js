import prisma from '../config/prisma.js'
import { successResponse, paginatedResponse } from '../utils/response.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { NotFoundError, ConflictError } from '../middleware/errorHandler.js'

const buildEventFilter = (query) => {
  const filter = {}
  if (query.search) {
    filter.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
      { location: { contains: query.search, mode: 'insensitive' } }
    ]
  }
  if (query.category) {
    filter.category = { equals: query.category, mode: 'insensitive' }
  }
  if (query.dateFrom) {
    filter.eventDate = { ...filter.eventDate, gte: new Date(query.dateFrom) }
  }
  if (query.dateTo) {
    filter.eventDate = { ...filter.eventDate, lte: new Date(query.dateTo) }
  }
  return filter
}

export const getEvents = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12))
  const skip = (page - 1) * limit

  const filter = buildEventFilter(req.query)
  filter.availableSeats = { gt: 0 }
  filter.eventDate = { ...filter.eventDate, gt: new Date() }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where: filter,
      orderBy: { eventDate: 'asc' },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        location: true,
        eventDate: true,
        ticketPrice: true,
        totalSeats: true,
        availableSeats: true,
        imageUrl: true,
        createdAt: true
      }
    }),
    prisma.event.count({ where: filter })
  ])

  return paginatedResponse(res, events, { page, limit, total, totalPages: Math.ceil(total / limit) })
})

export const getEventById = asyncHandler(async (req, res) => {
  const event = await prisma.event.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      location: true,
      eventDate: true,
      ticketPrice: true,
      totalSeats: true,
      availableSeats: true,
      imageUrl: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { bookings: { where: { status: 'CONFIRMED' } } } }
    }
  })

  if (!event) {
    throw new NotFoundError('Event not found')
  }

  return successResponse(res, event)
})

export const createEvent = asyncHandler(async (req, res) => {
  const { title, description, category, location, eventDate, ticketPrice, totalSeats, imageUrl } = req.body

  const event = await prisma.event.create({
    data: {
      title: title.trim(),
      description: description.trim(),
      category,
      location: location.trim(),
      eventDate: new Date(eventDate),
      ticketPrice: parseFloat(ticketPrice),
      totalSeats: parseInt(totalSeats),
      availableSeats: parseInt(totalSeats),
      imageUrl: imageUrl || null
    }
  })

  return successResponse(res, event, 'Event created successfully', 201)
})

export const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { title, description, category, location, eventDate, ticketPrice, totalSeats, imageUrl } = req.body

  const existingEvent = await prisma.event.findUnique({ where: { id } })
  if (!existingEvent) {
    throw new NotFoundError('Event not found')
  }

  const updateData = {}
  if (title) updateData.title = title.trim()
  if (description) updateData.description = description.trim()
  if (category) updateData.category = category
  if (location) updateData.location = location.trim()
  if (eventDate) updateData.eventDate = new Date(eventDate)
  if (ticketPrice !== undefined) updateData.ticketPrice = parseFloat(ticketPrice)
  if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null

  if (totalSeats !== undefined) {
    const newTotalSeats = parseInt(totalSeats)
    const bookedSeats = existingEvent.totalSeats - existingEvent.availableSeats
    if (newTotalSeats < bookedSeats) {
      throw new ConflictError('Cannot reduce total seats below booked seats')
    }
    updateData.totalSeats = newTotalSeats
    updateData.availableSeats = newTotalSeats - bookedSeats
  }

  const event = await prisma.event.update({
    where: { id },
    data: updateData
  })

  return successResponse(res, event, 'Event updated successfully')
})

export const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params

  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) {
    throw new NotFoundError('Event not found')
  }

  const activeBookings = await prisma.booking.count({
    where: { eventId: id, status: 'CONFIRMED' }
  })
  if (activeBookings > 0) {
    throw new ConflictError('Cannot delete event with active bookings')
  }

  await prisma.event.delete({ where: { id } })

  return successResponse(res, null, 'Event deleted successfully')
})

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.event.groupBy({
    by: ['category'],
    _count: { category: true },
    where: { eventDate: { gt: new Date() }, availableSeats: { gt: 0 } },
    orderBy: { _count: { category: 'desc' } }
  })

  return successResponse(res, categories.map(c => ({ category: c.category, count: c._count.category })))
})