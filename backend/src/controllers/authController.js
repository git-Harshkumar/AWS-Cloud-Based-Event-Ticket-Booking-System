import bcrypt from 'bcryptjs'
import prisma from '../config/prisma.js'
import { generateToken } from '../utils/jwt.js'
import { successResponse } from '../utils/response.js'
import { asyncHandler } from '../middleware/errorHandler.js'

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'Email already registered'
    })
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  })

  const token = generateToken(user.id, user.role)

  return successResponse(res, { user, token }, 'Registration successful', 201)
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    })
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    })
  }

  const token = generateToken(user.id, user.role)

  const userResponse = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  }

  return successResponse(res, { user: userResponse, token }, 'Login successful')
})

export const getMe = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  })

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    })
  }

  return successResponse(res, { user })
})

export const logout = asyncHandler(async (req, res) => {
  return successResponse(res, null, 'Logged out successfully')
})