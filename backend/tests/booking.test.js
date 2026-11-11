import request from 'supertest'
import app from '../src/app.js'
import prisma from '../src/config/prisma.js'
import bcrypt from 'bcryptjs'

describe('Booking API', () => {
  const testEmail = 'booking-test@example.com'
  const testPassword = 'password123'
  let authToken
  let eventId

  beforeAll(async () => {
    // Clean up
    await prisma.booking.deleteMany({ where: { user: { email: testEmail } } })
    await prisma.user.deleteMany({ where: { email: testEmail } })
    await prisma.event.deleteMany({ where: { title: 'Concurrent Test Event' } })

    // Create user
    const hashedPassword = await bcrypt.hash(testPassword, 12)
    const user = await prisma.user.create({
      data: { name: 'Booking Test User', email: testEmail, password: hashedPassword }
    })

    // Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword })
    authToken = loginRes.body.data.token

    // Create event with limited seats
    const event = await prisma.event.create({
      data: {
        title: 'Concurrent Test Event',
        description: 'Test event for concurrent booking scenarios',
        category: 'Test',
        location: 'Test Location',
        eventDate: new Date(Date.now() + 86400000), // Tomorrow
        ticketPrice: 50.00,
        totalSeats: 5,
        availableSeats: 5
      }
    })
    eventId = event.id
  })

  afterAll(async () => {
    await prisma.booking.deleteMany({ where: { eventId } })
    await prisma.event.deleteMany({ where: { id: eventId } })
    await prisma.user.deleteMany({ where: { email: testEmail } })
    await prisma.$disconnect()
  })

  describe('POST /api/bookings', () => {
    it('should create a booking successfully', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ eventId, quantity: 2 })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.quantity).toBe(2)
      expect(res.body.data.eventId).toBe(eventId)
    })

    it('should decrement available seats', async () => {
      const event = await prisma.event.findUnique({ where: { id: eventId } })
      expect(event.availableSeats).toBe(3)
    })

    it('should reject booking more seats than available', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ eventId, quantity: 10 })

      expect(res.status).toBe(409)
      expect(res.body.success).toBe(false)
    })

    it('should reject booking past event', async () => {
      const pastEvent = await prisma.event.create({
        data: {
          title: 'Past Event',
          description: 'Past event',
          category: 'Test',
          location: 'Test',
          eventDate: new Date(Date.now() - 86400000),
          ticketPrice: 50,
          totalSeats: 10,
          availableSeats: 10
        }
      })

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ eventId: pastEvent.id, quantity: 1 })

      expect(res.status).toBe(409)
      expect(res.body.success).toBe(false)

      await prisma.event.delete({ where: { id: pastEvent.id } })
    })

    it('should validate quantity', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ eventId, quantity: 0 })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })
  })

  describe('Concurrent Booking Prevention', () => {
    let concurrentEventId

    beforeEach(async () => {
      const event = await prisma.event.create({
        data: {
          title: 'Concurrent Test Event',
          description: 'Test concurrent booking',
          category: 'Test',
          location: 'Test',
          eventDate: new Date(Date.now() + 86400000),
          ticketPrice: 100,
          totalSeats: 3,
          availableSeats: 3
        }
      })
      concurrentEventId = event.id
    })

    afterEach(async () => {
      await prisma.booking.deleteMany({ where: { eventId: concurrentEventId } })
      await prisma.event.delete({ where: { id: concurrentEventId } })
    })

    it('should prevent overbooking under concurrent requests', async () => {
      const promises = Array(5).fill().map(() =>
        request(app)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ eventId: concurrentEventId, quantity: 1 })
      )

      const results = await Promise.allSettled(promises)
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.status === 201)
      const failed = results.filter(r => r.status === 'fulfilled' && r.value.status === 409)

      // Only 3 should succeed (total seats = 3)
      expect(successful.length).toBe(3)
      expect(failed.length).toBe(2)

      // Verify final seat count
      const event = await prisma.event.findUnique({ where: { id: concurrentEventId } })
      expect(event.availableSeats).toBe(0)
    })

    it('should handle rapid sequential bookings', async () => {
      for (let i = 0; i < 3; i++) {
        const res = await request(app)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ eventId: concurrentEventId, quantity: 1 })
        expect(res.status).toBe(201)
      }

      // 4th should fail
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ eventId: concurrentEventId, quantity: 1 })

      expect(res.status).toBe(409)
    })
  })

  describe('GET /api/bookings/my', () => {
    it('should return user bookings', async () => {
      const res = await request(app)
        .get('/api/bookings/my')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data.length).toBeGreaterThan(0)
    })
  })

  describe('PATCH /api/bookings/:id/cancel', () => {
    it('should cancel a booking and restore seats', async () => {
      // Create a new booking to cancel
      const bookRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ eventId, quantity: 1 })

      const bookingId = bookRes.body.data.id
      const eventBefore = await prisma.event.findUnique({ where: { id: eventId } })
      const seatsBefore = eventBefore.availableSeats

      const res = await request(app)
        .patch(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.status).toBe('CANCELLED')

      const eventAfter = await prisma.event.findUnique({ where: { id: eventId } })
      expect(eventAfter.availableSeats).toBe(seatsBefore + 1)
    })

    it('should not allow cancelling past event bookings', async () => {
      const pastEvent = await prisma.event.create({
        data: {
          title: 'Past Event for Cancel',
          description: 'Past',
          category: 'Test',
          location: 'Test',
          eventDate: new Date(Date.now() - 86400000),
          ticketPrice: 50,
          totalSeats: 10,
          availableSeats: 10
        }
      })

      const bookRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ eventId: pastEvent.id, quantity: 1 })

      const res = await request(app)
        .patch(`/api/bookings/${bookRes.body.data.id}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(409)
      expect(res.body.success).toBe(false)

      await prisma.booking.deleteMany({ where: { eventId: pastEvent.id } })
      await prisma.event.delete({ where: { id: pastEvent.id } })
    })
  })
})