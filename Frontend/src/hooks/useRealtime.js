import { useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './useAuth'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export const useRealtime = () => {
  const { user, token } = useAuth()
  const [connected, setConnected] = useState(false)

  const socket = useMemo(() => {
    if (!token || !user) return null

    return io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    })
  }, [token, user])

  useEffect(() => {
    if (!socket || !user) return undefined

    const handleConnect = () => {
      setConnected(true)
      if (user.role === 'superadmin') {
        socket.emit('join:superadmin')
      }
      if (user.companyId) {
        socket.emit('join:company', user.companyId)
      }
    }

    const handleDisconnect = () => {
      setConnected(false)
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.disconnect()
    }
  }, [socket, user])

  return {
    socket,
    connected,
  }
}
