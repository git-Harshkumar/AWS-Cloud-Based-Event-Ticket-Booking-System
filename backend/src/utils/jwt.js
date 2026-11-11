import jwt from 'jsonwebtoken'
import { config } from '../config/index.js'

export const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  )
}

export const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret)
}

export const decodeToken = (token) => {
  return jwt.decode(token)
}