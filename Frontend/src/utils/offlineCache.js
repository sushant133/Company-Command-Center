const CACHE_PREFIX = 'app_cache_'

const getCacheKey = (key) => `${CACHE_PREFIX}${key}`

export const cacheData = (key, data, ttl = 24 * 60 * 60 * 1000, userId = null) => {
  const cacheEntry = {
    data,
    timestamp: Date.now(),
    ttl,
    userId,
  }
  localStorage.setItem(getCacheKey(key), JSON.stringify(cacheEntry))
}

export const getCachedData = (key, userId = null) => {
  const cached = localStorage.getItem(getCacheKey(key))
  if (!cached) return null

  try {
    const cacheEntry = JSON.parse(cached)

    if (cacheEntry.userId && userId && cacheEntry.userId !== userId) {
      localStorage.removeItem(getCacheKey(key))
      return null
    }

    if (Date.now() - cacheEntry.timestamp > cacheEntry.ttl) {
      localStorage.removeItem(getCacheKey(key))
      return null
    }

    return cacheEntry.data
  } catch (error) {
    console.error('Failed to parse cached data:', error)
    localStorage.removeItem(getCacheKey(key))
    return null
  }
}

export const clearCache = (key = null, userId = null) => {
  if (key) {
    const cacheKey = getCacheKey(key)
    if (!userId) {
      localStorage.removeItem(cacheKey)
      return
    }

    const cached = localStorage.getItem(cacheKey)
    if (!cached) return

    try {
      const cacheEntry = JSON.parse(cached)
      if (!cacheEntry.userId || cacheEntry.userId === userId) {
        localStorage.removeItem(cacheKey)
      }
    } catch {
      localStorage.removeItem(cacheKey)
    }
    return
  }

  const keys = Object.keys(localStorage)
  keys.forEach((storageKey) => {
    if (!storageKey.startsWith(CACHE_PREFIX)) return

    try {
      const cached = JSON.parse(localStorage.getItem(storageKey))
      if (!userId || !cached?.userId || cached.userId === userId) {
        localStorage.removeItem(storageKey)
      }
    } catch {
      localStorage.removeItem(storageKey)
    }
  })
}
