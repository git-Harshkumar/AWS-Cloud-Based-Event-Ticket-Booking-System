import request from 'supertest'
import app from '../src/app.js'
import prisma from '../src/config/prisma.js'
import bcrypt from 'bcryptjs'

describe('Authentication API', () => {
  const testEmail = 'test@example.com'
  const testPassword = 'password123'
  let authToken

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } })
  })

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } })
    await prisma.$disconnect()
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: testEmail,
          password: testPassword
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.user).toHaveProperty('id')
      expect(res.body.data.user.email).toBe(testEmail)
      expect(res.body.data).toHaveProperty('token')
      authToken = res.body.data.token
    })

    it('should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User 2',
          email: testEmail,
          password: testPassword
        })

      expect(res.status).toBe(409)
      expect(res.body.success).toBe(false)
    })

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({})

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveProperty('token')
    })

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'wrongpassword'
        })

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })

    it('should reject non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testPassword
        })

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })
  })

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.user.email).toBe(testEmail)
    })

    it('should reject without token', async () => {
      const res = await request(app)
        .get('/api/auth/me')

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })

    it('should reject invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })
  })
})