import CacheService from '../services/cache.service.js'

// Response time & cache monitoring middleware
export const responseTime = async (req, res, next) => {
  const start = performance.now()
  const cacheKey = req.path + JSON.stringify(req.query)
  
  // Check cache stats before request
  const preStats = CacheService.getStats()
  
  res.on('finish', () => {
    const duration = performance.now() - start
    const cacheHit = req.cacheHit || false
    
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} - ${duration.toFixed(0)}ms ${cacheHit ? '[CACHE HIT]' : '[DB]'} | Cache: H${preStats.hits} M${preStats.misses}`)
    
    // Log slow requests (>500ms)
    if (duration > 500) {
      console.warn(`SLOW REQUEST: ${duration.toFixed(0)}ms ${req.method} ${req.path}`)
    }
  })
  
  next()
}

// Cache hit flag for controllers
export const setCacheHit = (hit) => (req, res, next) => {
  req.cacheHit = hit
  next()
}

export default responseTime

