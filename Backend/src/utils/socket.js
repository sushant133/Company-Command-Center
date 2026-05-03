let io = null

// Initialize socket io instance
export const initSocketIo = (serverIo) => {
  io = serverIo
}

// Get socket io instance
export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initSocketIo first.')
  }
  return io
}

// Emit helpers
export const emitToCompany = (companyId, event, data) => {
  const ios = getIo()
  ios.to(`company:${companyId}`).emit(event, data)
}

export const emitToSuperadmins = (event, data) => {
  const ios = getIo()
  ios.to('superadmin').emit(event, data)
}

export const emitToUser = (userId, event, data) => {
  const ios = getIo()
  ios.to(`user:${userId}`).emit(event, data)
}

// Broadcast with online status
export const broadcastUserStatus = (userId, isOnline) => {
  emitToSuperadmins('user:status', { userId, isOnline })
}

