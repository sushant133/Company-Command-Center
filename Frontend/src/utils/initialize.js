import { useAuthStore } from '../store/authStore'
import { authAPI } from '../api/auth'

/**
 * Initialize Application
 * Performs all necessary setup before rendering the app
 */
export const initializeApp = async () => {
  try {
    console.log('Starting application initialization...')

    // 1. Check if token exists in localStorage
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      console.log('No authentication token found - user is logged out')
      return
    }

    console.log('Found existing token, validating...')

    // 2. Verify token is still valid by fetching current user
    try {
      const currentUserResponse = await authAPI.getCurrentUser()
      const currentUser = currentUserResponse.user

      const authStore = useAuthStore.getState()

      // Update store with current user data
      authStore.setUser(currentUser)
      authStore.setToken(token)

      console.log(`✓ User authenticated: ${currentUser.name}`)
    } catch (error) {
      // Token is invalid or expired, clear storage
      console.warn('Token validation failed:', error.message)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      useAuthStore.getState().logout()
      return
    }

    // 3. Initialize theme
    initializeTheme()

    // 4. Check browser compatibility
    checkBrowserCompatibility()

    // 5. Setup global error handling
    setupErrorBoundary()

    // 6. Initialize analytics if available
    initializeAnalytics()

    // 7. Setup performance monitoring
    setupPerformanceMonitoring()

    console.log('✓ Application initialization complete')
  } catch (error) {
    console.error('Initialization error:', error)
    throw error
  }
}

/**
 * Initialize Theme
 * Sets up color scheme based on user preference or system setting
 */
const initializeTheme = () => {
  try {
    const theme = 'light'
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', theme)
    console.log(`✓ Theme initialized: ${theme}`)
  } catch (error) {
    console.warn('Theme initialization failed:', error)
  }
}

/**
 * Check Browser Compatibility
 * Verifies that the browser supports required features
 */
const checkBrowserCompatibility = () => {
  try {
    const requiredFeatures = {
      localStorage: () => typeof Storage !== 'undefined',
      fetch: () => typeof fetch !== 'undefined',
      promise: () => typeof Promise !== 'undefined',
      arrayIncludes: () => Array.prototype.includes !== undefined,
    }

    const unsupported = Object.entries(requiredFeatures).filter(
      ([_, check]) => !check()
    )

    if (unsupported.length > 0) {
      console.warn(
        'Browser missing features:',
        unsupported.map(([name]) => name)
      )
    }

    // Detect browser
    const userAgent = navigator.userAgent
    const browsers = {
      Chrome: /Chrome/.test(userAgent),
      Firefox: /Firefox/.test(userAgent),
      Safari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
      Edge: /Edg/.test(userAgent),
    }

    const detectedBrowser = Object.entries(browsers).find(
      ([_, isMatch]) => isMatch
    )?.[0] || 'Unknown'

    console.log(`✓ Browser detected: ${detectedBrowser}`)
  } catch (error) {
    console.warn('Browser compatibility check failed:', error)
  }
}

/**
 * Setup Error Boundary
 * Global error handling for unhandled errors and promise rejections
 */
const setupErrorBoundary = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    // Could send to error tracking service like Sentry here
  })

  // Handle global errors
  window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error)
    // Could send to error tracking service like Sentry here
  })

  console.log('✓ Error boundary setup complete')
}

/**
 * Initialize Analytics
 * Setup analytics tracking if available
 */
const initializeAnalytics = () => {
  try {
    // Google Analytics
    if (window.gtag) {
      window.gtag('event', 'app_start', {
        timestamp: new Date().toISOString(),
      })
      console.log('✓ Analytics initialized (Google Analytics)')
    }

    // Mixpanel or other analytics can be added here
  } catch (error) {
    console.warn('Analytics initialization failed:', error)
  }
}

/**
 * Setup Performance Monitoring
 * Monitor and log core performance metrics
 */
const setupPerformanceMonitoring = () => {
  try {
    if (!window.performance || !window.performance.timing) {
      console.warn('Performance API not supported in this browser')
      return
    }

    // Wait for page load to complete
    window.addEventListener('load', () => {
      // Use setTimeout to ensure all resources are loaded
      setTimeout(() => {
        const perfData = window.performance.timing
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
        const domContentLoadedTime =
          perfData.domContentLoadedEventEnd - perfData.navigationStart
        const firstPaintTime = perfData.responseEnd - perfData.navigationStart

        console.log('Performance Metrics:')
        console.log(`  Page Load Time: ${pageLoadTime}ms`)
        console.log(`  DOM Content Loaded: ${domContentLoadedTime}ms`)
        console.log(`  First Paint: ${firstPaintTime}ms`)

        // Send to analytics if available
        if (window.gtag) {
          window.gtag('event', 'page_load_time', {
            value: pageLoadTime,
            event_category: 'performance',
          })
        }
      }, 0)
    })

    console.log('✓ Performance monitoring setup complete')
  } catch (error) {
    console.warn('Performance monitoring setup failed:', error)
  }
}

/**
 * Get App Version
 * Returns the app version
 */
export const getAppVersion = () => {
  return import.meta.env.VITE_APP_VERSION || '1.0.0'
}

/**
 * Get App Environment
 * Returns the current environment (development, production, etc.)
 */
export const getAppEnvironment = () => {
  return import.meta.env.MODE || 'production'
}

/**
 * Get API URL
 * Returns the configured API URL
 */
export const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
}

/**
 * Get Socket URL
 * Returns the configured Socket.io URL
 */
export const getSocketUrl = () => {
  return import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
}

/**
 * Get Debug Info
 * Returns debugging information about the application
 */
export const getDebugInfo = () => {
  return {
    version: getAppVersion(),
    environment: getAppEnvironment(),
    apiUrl: getApiUrl(),
    socketUrl: getSocketUrl(),
    userAgent: navigator.userAgent,
    screen: {
      width: window.innerWidth,
      height: window.innerHeight,
      colorDepth: window.screen.colorDepth,
      devicePixelRatio: window.devicePixelRatio,
    },
    storage: {
      localStorage: typeof localStorage !== 'undefined',
      sessionStorage: typeof sessionStorage !== 'undefined',
    },
    connection: {
      effectiveType: navigator.connection?.effectiveType || 'unknown',
      downlink: navigator.connection?.downlink || 'unknown',
      rtt: navigator.connection?.rtt || 'unknown',
      saveData: navigator.connection?.saveData || false,
    },
    features: {
      serviceWorker: 'serviceWorker' in navigator,
      webWorker: typeof Worker !== 'undefined',
      webSocket: 'WebSocket' in window,
      indexedDB: 'indexedDB' in window,
    },
  }
}

/**
 * Log Debug Info
 * Logs all debug information to console
 */
export const logDebugInfo = () => {
  const debugInfo = getDebugInfo()
  console.group('Debug Information')
  console.table(debugInfo)
  console.groupEnd()
}

/**
 * Check if App is in Development Mode
 */
export const isDevelopment = () => {
  return import.meta.env.DEV
}

/**
 * Check if App is in Production Mode
 */
export const isProduction = () => {
  return import.meta.env.PROD
}

/**
 * Check if App is in Preview Mode
 */
export const isPreview = () => {
  return import.meta.env.PREVIEW
}