import { create } from 'zustand'

/**
 * Notification Store
 * Manages toast notifications and alerts
 */
export const useNotificationStore = create((set, get) => ({
  notifications: [],
  maxNotifications: 5,

  /**
   * Add a new notification
   */
  addNotification: (notification) => {
    const id = `${Date.now()}-${Math.random()}`
    const defaultNotification = {
      id,
      type: 'info',
      title: '',
      message: '',
      duration: 5000,
      autoClose: true,
      action: null,
      dismissible: true,
      ...notification,
    }

    set((state) => {
      const notifications = [...state.notifications, defaultNotification]

      // Keep only the latest notifications
      if (notifications.length > state.maxNotifications) {
        notifications.shift()
      }

      return { notifications }
    })

    // Auto-remove after duration
    if (defaultNotification.autoClose) {
      setTimeout(() => {
        get().removeNotification(id)
      }, defaultNotification.duration)
    }

    return id
  },

  /**
   * Remove notification by ID
   */
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },

  /**
   * Remove all notifications
   */
  clearAll: () => {
    set({ notifications: [] })
  },

  /**
   * Update notification
   */
  updateNotification: (id, updates) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, ...updates } : n
      ),
    }))
  },

  /**
   * Get notification by ID
   */
  getNotification: (id) => {
    return get().notifications.find((n) => n.id === id)
  },

  /**
   * Get all notifications of a specific type
   */
  getNotificationsByType: (type) => {
    return get().notifications.filter((n) => n.type === type)
  },

  /**
   * Check if any notifications exist
   */
  hasNotifications: () => {
    return get().notifications.length > 0
  },

  /**
   * Get notification count
   */
  getCount: () => {
    return get().notifications.length
  },

  /**
   * Set max notifications
   */
  setMaxNotifications: (max) => {
    set({ maxNotifications: max })
  },
}))

/**
 * Helper functions for different notification types
 */

export const showSuccess = (
  message,
  options = {}
) => {
  return useNotificationStore.getState().addNotification({
    type: 'success',
    title: options.title || 'Success',
    message,
    duration: options.duration || 5000,
    ...options,
  })
}

export const showError = (
  message,
  options = {}
) => {
  return useNotificationStore.getState().addNotification({
    type: 'error',
    title: options.title || 'Error',
    message,
    duration: options.duration || 7000,
    autoClose: options.autoClose !== false,
    ...options,
  })
}

export const showInfo = (
  message,
  options = {}
) => {
  return useNotificationStore.getState().addNotification({
    type: 'info',
    title: options.title || 'Information',
    message,
    duration: options.duration || 5000,
    ...options,
  })
}

export const showWarning = (
  message,
  options = {}
) => {
  return useNotificationStore.getState().addNotification({
    type: 'warning',
    title: options.title || 'Warning',
    message,
    duration: options.duration || 6000,
    ...options,
  })
}

export const showLoading = (
  message,
  options = {}
) => {
  return useNotificationStore.getState().addNotification({
    type: 'loading',
    title: options.title || 'Loading',
    message,
    autoClose: false,
    dismissible: false,
    duration: 0,
    ...options,
  })
}

/**
 * Batch notification helper
 */
export const showNotifications = (notifications) => {
  const ids = []
  notifications.forEach((notif) => {
    const id = useNotificationStore.getState().addNotification(notif)
    ids.push(id)
  })
  return ids
}

/**
 * Dismiss all notifications of a type
 */
export const dismissNotificationType = (type) => {
  const notifications = useNotificationStore
    .getState()
    .getNotificationsByType(type)
  notifications.forEach((n) => {
    useNotificationStore.getState().removeNotification(n.id)
  })
}

/**
 * Show confirmation dialog (can be enhanced with modal)
 */
export const showConfirmation = (
  message,
  options = {}
) => {
  return new Promise((resolve) => {
    const id = useNotificationStore.getState().addNotification({
      type: 'confirmation',
      title: options.title || 'Confirm',
      message,
      autoClose: false,
      dismissible: true,
      duration: 0,
      action: {
        label: options.confirmText || 'Confirm',
        onClick: () => {
          useNotificationStore.getState().removeNotification(id)
          resolve(true)
        },
      },
      secondaryAction: {
        label: options.cancelText || 'Cancel',
        onClick: () => {
          useNotificationStore.getState().removeNotification(id)
          resolve(false)
        },
      },
      ...options,
    })
  })
}

/**
 * Show toast with custom actions
 */
export const showToastWithAction = (
  message,
  action,
  options = {}
) => {
  return useNotificationStore.getState().addNotification({
    type: 'info',
    message,
    action: {
      label: action.label || 'Action',
      onClick: action.onClick,
    },
    ...options,
  })
}

/**
 * Promise-based notification helper
 */
export const showAsyncOperation = async (
  promise,
  messages = {}
) => {
  const loadingId = showLoading(
    messages.loading || 'Processing...'
  )

  try {
    const result = await promise
    useNotificationStore.getState().removeNotification(loadingId)
    showSuccess(messages.success || 'Operation completed successfully!')
    return result
  } catch (error) {
    useNotificationStore.getState().removeNotification(loadingId)
    showError(messages.error || error.message || 'Operation failed')
    throw error
  }
}

/**
 * Notification types constant
 */
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
  LOADING: 'loading',
  CONFIRMATION: 'confirmation',
}

/**
 * Create custom notification hook
 */
export const useNotification = () => {
  const addNotification = useNotificationStore((state) => state.addNotification)
  const removeNotification = useNotificationStore(
    (state) => state.removeNotification
  )
  const clearAll = useNotificationStore((state) => state.clearAll)

  return {
    success: showSuccess,
    error: showError,
    info: showInfo,
    warning: showWarning,
    loading: showLoading,
    add: addNotification,
    remove: removeNotification,
    clear: clearAll,
    confirm: showConfirmation,
    async: showAsyncOperation,
    withAction: showToastWithAction,
  }
}

/**
 * Export selectors for performance
 */
export const useNotifications = () =>
  useNotificationStore((state) => state.notifications)
export const useNotificationCount = () =>
  useNotificationStore((state) => state.notifications.length)
export const useHasNotifications = () =>
  useNotificationStore((state) => state.notifications.length > 0)