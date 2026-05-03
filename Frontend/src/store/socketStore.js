import { create } from 'zustand'
import { initSocket, connectSocket, disconnectSocket } from '../api/socket.js'
import { useAuthStore } from './authStore.js'

export const useSocketStore = create((set, get) => ({
  socket: null,
  connected: false,
  onlineUsers: new Set(),

  init: () => {
    const socket = initSocket()
    set({ socket })

    if (socket) {
      socket.on('connect', () => {
        console.log('Socket connected')
        set({ connected: true })
      })

      socket.on('disconnect', () => {
        console.log('Socket disconnected')
        set({ connected: false })
      })

      socket.on('user:online', (data) => {
        set((state) => {
          const onlineUsers = new Set(state.onlineUsers)
          onlineUsers.add(data.userId)
          return { onlineUsers }
        })
      })

      socket.on('user:offline', (data) => {
        set((state) => {
          const onlineUsers = new Set(state.onlineUsers)
          onlineUsers.delete(data.userId)
          return { onlineUsers }
        })
      })

      // Task events
      socket.on('task:assigned', (data) => {
        console.log('New task assigned:', data)
        // Trigger refetch or optimistic update in tasks list
        get().emitTaskEvent('assigned', data)
      })

      socket.on('task:updated', (data) => {
        console.log('Task updated:', data)
        get().emitTaskEvent('updated', data)
      })

      // Submission events
      socket.on('submission:created', (data) => {
        console.log('New submission:', data)
        get().emitSubmissionEvent('created', data)
      })

      socket.on('submission:updated', (data) => {
        console.log('Submission updated:', data)
        get().emitSubmissionEvent('updated', data)
      })
    }
  },

  connect: () => {
    const { socket } = get()
    connectSocket(socket)
  },

  disconnect: () => {
    const { socket } = get()
    disconnectSocket(socket)
  },

  // Event callbacks (external components subscribe)
  onTaskEvent: (eventType, callback) => {}, // Example
  emitTaskEvent: (type, data) => console.log(`Task ${type}:`, data),
  emitSubmissionEvent: (type, data) => console.log(`Submission ${type}:`, data),

  destroy: () => {
    const { socket } = get()
    disconnectSocket(socket)
    if (socket) {
      socket.off()
      socket.removeAllListeners()
    }
  },
}))

// Auto-init on auth change
useAuthStore.subscribe((state) => {
  if (state.user && state.accessToken) {
    const socketStore = useSocketStore.getState()
    if (!socketStore.socket) {
      socketStore.init()
    }
    socketStore.connect()
  } else {
    useSocketStore.getState().disconnect()
  }
})

