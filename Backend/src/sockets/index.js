import { getIo } from '../utils/socket.js'
import User from '../models/User.js'
import { verifyToken } from '../utils/jwt.js'
import { isBlacklisted } from '../services/tokenBlacklist.js'
import { emitToSuperadmins } from '../utils/socket.js'

export const registerSocketServer = (io) => {
  // Socket auth middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token
      if (!token) return next(new Error('Access token required'))

      if (isBlacklisted(token)) return next(new Error('Token revoked'))

      const decoded = verifyToken(token)
      const user = await User.findById(decoded.userId).select('-passwordHash').lean()

      if (!user || !user.isActive) return next(new Error('Invalid user'))

      socket.user = user
      next()
    } catch (error) {
      next(new Error('Authentication failed'))
    }
  })

  io.on('connection', (socket) => {
    const user = socket.user

    // Auto-join rooms
    if (user.role === 'superadmin') {
      socket.join('superadmin')
    }
    socket.join(`company:${user.companyId}`)
    socket.join(`user:${user._id}`)

    // Emit online status
    emitToSuperadmins('user:online', { userId: user._id, name: user.name })

    // Handle ping
    socket.on('ping', () => socket.emit('pong', Date.now()))

    // Legacy join handlers (safe)
    socket.on('join:superadmin', () => socket.join('superadmin'))
    socket.on('join:company', (companyId) => {
      if (companyId && String(companyId) === String(user.companyId)) {
        socket.join(`company:${companyId}`)
      }
    })

    socket.on('disconnect', () => {
      emitToSuperadmins('user:offline', { userId: user._id })
      console.log(`User ${user._id} disconnected`)
    })
  })
}

