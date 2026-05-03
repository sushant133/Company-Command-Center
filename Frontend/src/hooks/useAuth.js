import { useEffect, useMemo, useState, useCallback } from 'react'
import { authAPI } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { cacheData, getCachedData, clearCache } from '../utils/offlineCache'

export const useAuth = () => {
  const {
    accessToken, 
    refreshToken, 
    user, 
    hydrated, 
    setSession, 
    clearSession, 
    setUser,
    refreshAccessToken,
    isRefreshing
  } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [bootstrapping, setBootstrapping] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

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

  // Auto-refresh access token ~10min before expiry (axios handles 401s)
  useEffect(() => {
    if (!accessToken || !refreshToken || isRefreshing) return

    const interval = setInterval(async () => {
      const success = await refreshAccessToken()
      if (!success) {
        clearSession()
      }
    }, 5 * 60 * 1000) // Every 5 minutes

    return () => clearInterval(interval)
  }, [accessToken, refreshToken, isRefreshing, refreshAccessToken, clearSession])

  useEffect(() => {
    if (!hydrated || !accessToken || user) return

    let active = true

    const hydrateUser = async () => {
      setBootstrapping(true)
      try {
        const cachedUser = getCachedData('user_profile')
        if (cachedUser && !isOnline) {
          setUser(cachedUser)
          setBootstrapping(false)
          return
        }

        const currentUser = await authAPI.me()
        if (active) {
          setUser(currentUser)
          cacheData('user_profile', currentUser, undefined, currentUser._id || currentUser.id)
        }
      } catch (error) {
        const cachedUser = getCachedData('user_profile')
        if (cachedUser && active) {
          setUser(cachedUser)
        } else if (active) {
          clearSession()
        }
      } finally {
        if (active) {
          setBootstrapping(false)
        }
      }
    }

    hydrateUser()

    return () => {
      active = false
    }
  }, [hydrated, accessToken, user, setUser, clearSession, isOnline])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const response = await authAPI.login({ email, password })
      setSession({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        user: response.user,
      })
      // Cache user data after successful login
      cacheData('user_profile', response.user, undefined, response.user._id || response.user.id)
      return response
    } finally {
      setLoading(false)
    }
  }

  const bootstrapSuperadmin = async (payload) => {
    setLoading(true)
    try {
      const response = await authAPI.bootstrapSuperadmin(payload)
      setSession({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        user: response.user,
      })
      return response
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      if (accessToken) {
        await authAPI.logout()
      }
    } catch (_error) {
      // Swallow logout API errors so local session always clears.
    } finally {
      clearSession()
    }
  }

  const refreshCurrentUser = async () => {
    if (!accessToken) return null
    const currentUser = await authAPI.me()
    setUser(currentUser)
    return currentUser
  }

  const derived = useMemo(
    () => ({
      isAuthenticated: Boolean(accessToken && user),
      isSuperadmin: user?.role === 'superadmin',
      isAdmin: user?.role === 'admin',
    }),
    [accessToken, user]
  )

  return {
    token: accessToken,
    user,
    hydrated,
    loading,
    bootstrapping,
    login,
    logout,
    refreshCurrentUser,
    bootstrapSuperadmin,
    ...derived,
  }
}
