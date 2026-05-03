import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export const signAccessToken = (payload) => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  })
}

export const signRefreshToken = (payload) => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  })
}

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, env.jwtSecret)
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

