import { io } from 'socket.io-client'
import { useAuthStore } from '../store/authStore.js'

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000'

export const initSocket = () => {
  const { accessToken, user } = useAuthStore.getState()
  
  if (!accessToken || !user) {
    console.warn('No auth token, socket not connecting')
    return null
  }

  const socket = io(SOCKET_URL, {
    auth: {
      token: `Bearer ${accessToken}`
    },
    autoConnect: false, // Manual connect
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
  })

  // Auto reconnect on token refresh
  useAuthStore.subscribe((state) => {
    if (state.accessToken && socket.auth.token !== `Bearer ${state.accessToken}`) {
      socket.auth.token = `Bearer ${state.accessToken}`
      socket.disconnect().connect()
    }
  })

  return socket
}

export const connectSocket = (socket) => {
  if (socket && !socket.connected) {
    socket.connect()
  }
}

export const disconnectSocket = (socket) => {
  if (socket) {
    socket.disconnect()
  }
}

