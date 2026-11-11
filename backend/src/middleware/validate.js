import { validationResult } from 'express-validator'
import { ValidationError } from './errorHandler.js'

export const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
      value: err.value
    }))
    throw new ValidationError('Validation failed', formattedErrors)
  }
  next()
}

export const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj.trim()
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize)
    }
    if (obj && typeof obj === 'object') {
      const sanitized = {}
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitize(value)
      }
      return sanitized
    }
    return obj
  }

  req.body = sanitize(req.body)
  req.query = sanitize(req.query)
  req.params = sanitize(req.params)
  next()
}