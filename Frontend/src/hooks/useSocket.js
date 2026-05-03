import { useEffect } from 'react'
import { useSocketStore } from '../store/socketStore.js'
import { useAuthStore } from '../store/authStore.js'

export const useSocket = () => {
  const { connected, onlineUsers, socket } = useSocketStore()
  const { user } = useAuthStore()

  useEffect(() => {
    if (user) {
      useSocketStore.getState().connect()
      return () => {
        // Don't disconnect on unmount, keep global
      }
    }
  }, [user])

  const onTaskUpdated = (callback) => {
    if (socket) {
      socket.on('task:updated', callback)
      return () => socket.off('task:updated', callback)
    }
  }

  const onSubmissionCreated = (callback) => {
    if (socket) {
      socket.on('submission:created', callback)
      return () => socket.off('submission:created', callback)
    }
  }

  return {
    connected,
    onlineUsers,
    onTaskUpdated,
    onSubmissionCreated,
    // Add more event handlers
  }
}

// Usage Example:
/*
const TaskList = () => {
  const { onTaskUpdated } = useSocket()
  
  useEffect(() => {
    const handleUpdate = (data) => {
      // Optimistic update task list
      updateTaskInList(data.id, data.status)
    }
    return onTaskUpdated(handleUpdate)
  }, [])

  return <TaskListComponent />
}
*/

