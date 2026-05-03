import { useEffect, useState, useCallback } from 'react'
import client from '../api/client'
import { cacheData as cacheDataUtil, getCachedData as getCachedDataUtil, clearCache as clearCacheUtil } from '../utils/offlineCache'
import { useAuthStore } from '../store/authStore'

const SYNC_QUEUE_KEY = 'sync_queue'
const OFFLINE_ACTIONS_KEY = 'offline_actions'

export const useOffline = () => {
  const { user } = useAuthStore()
  const userId = user?._id || user?.id || null
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [syncQueue, setSyncQueue] = useState([])
  const [isSyncing, setIsSyncing] = useState(false)

  // Load sync queue from localStorage
  useEffect(() => {
    const savedQueue = localStorage.getItem(SYNC_QUEUE_KEY)
    if (savedQueue) {
      try {
        setSyncQueue(JSON.parse(savedQueue))
      } catch (error) {
        console.error('Failed to parse sync queue:', error)
        localStorage.removeItem(SYNC_QUEUE_KEY)
      }
    }
  }, [])

  // Save sync queue to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(syncQueue))
  }, [syncQueue])

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const cacheData = useCallback((key, data, ttl) => {
    cacheDataUtil(key, data, ttl, userId)
  }, [userId])

  const getCachedData = useCallback((key) => {
    return getCachedDataUtil(key, userId)
  }, [userId])

  const clearCache = useCallback((key) => {
    clearCacheUtil(key, userId)
  }, [userId])

  // Sync queue management
  const addToSyncQueue = useCallback((action) => {
    const syncItem = {
      id: Date.now() + Math.random(),
      action,
      timestamp: Date.now(),
      userId,
      retryCount: 0,
    }
    setSyncQueue(prev => [...prev, syncItem])
    return syncItem.id
  }, [user?.id])

  const removeFromSyncQueue = useCallback((id) => {
    setSyncQueue(prev => prev.filter(item => item.id !== id))
  }, [])

  const updateSyncItem = useCallback((id, updates) => {
    setSyncQueue(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ))
  }, [])

  // Sync process
  const syncOfflineActions = useCallback(async () => {
    if (!isOnline || isSyncing || syncQueue.length === 0) return

    setIsSyncing(true)
    const itemsToSync = [...syncQueue]

    for (const item of itemsToSync) {
      try {
        const action = item.action
        const endpoint = action.endpoint || getEndpointForAction(action.type, action.payload)
        const methodMap = {
          'create-company': 'post',
          'create-admin': 'post',
          'create-section': 'post',
          'add-field': 'post',
          'create-task': 'post',
          'create-submission': 'post',
          'generate-insight': 'post',
          'upload-file': 'post',
          'update': action.method || 'put',
          'patch': action.method || 'patch',
          'delete': action.method || 'delete',
        }
        const method = methodMap[action.type] || action.method || 'post'

        const requestData =
          action.type === 'add-field' ? action.payload.field : action.payload || {}
        await client.request({ url: endpoint, method, data: requestData })

        removeFromSyncQueue(item.id)

        if (item.action.cacheKey) {
          clearCache(item.action.cacheKey)
        }
      } catch (error) {
        console.error('Sync failed for item:', item.id, error)
        updateSyncItem(item.id, { retryCount: item.retryCount + 1 })
        if (item.retryCount >= 3) {
          removeFromSyncQueue(item.id)
          console.warn('Removed failed sync item after 3 attempts:', item.id)
        }
      }
    }

    setIsSyncing(false)
  }, [isOnline, isSyncing, syncQueue, removeFromSyncQueue, updateSyncItem, clearCache])

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && syncQueue.length > 0) {
      const timer = setTimeout(() => {
        syncOfflineActions()
      }, 2000) // Wait 2 seconds after coming online

      return () => clearTimeout(timer)
    }
  }, [isOnline, syncQueue.length, syncOfflineActions])

  // Offline action helpers
  const createOfflineAction = useCallback((type, payload, cacheKey) => {
    return addToSyncQueue({
      type,
      payload,
      cacheKey,
      endpoint: getEndpointForAction(type, payload),
    })
  }, [addToSyncQueue])

  const getEndpointForAction = (type, payload) => {
    const endpointMap = {
      'create-company': '/companies',
      'create-admin': '/users',
      'create-section': '/sections',
      'add-field': `/sections/${payload.sectionId}/fields`,
      'create-task': '/tasks',
      'create-submission': '/submissions',
      'upload-file': '/files/upload',
      'generate-insight': '/ai/generate-insight',
    }
    return endpointMap[type] || '/unknown'
  }

  return {
    isOnline,
    isOffline: !isOnline,
    syncQueue,
    isSyncing,
    cacheData,
    getCachedData,
    clearCache,
    addToSyncQueue,
    removeFromSyncQueue,
    syncOfflineActions,
    createOfflineAction,
    queueLength: syncQueue.length,
  }
}