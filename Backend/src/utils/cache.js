import NodeCache from 'node-cache';

// In-memory cache with TTL (seconds) - Redis-ready abstraction
class CacheManager {
  constructor() {
    this.cache = new NodeCache({ 
      stdTTL: 300, // 5 minutes default
      checkperiod: 120, // Check expired every 2 min
      useClones: false // Faster for plain objects
    });
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
  }

  // Get with TTL override
  get(key, ttl = null) {
    const data = this.cache.get(key);
    if (data) {
      this.stats.hits++;
      return data;
    }
    this.stats.misses++;
    return null;
  }

  // Set with TTL (seconds)
  set(key, value, ttl = 300) {
    this.cache.set(key, value, ttl);
    this.stats.sets++;
    return value;
  }

  // Multi-get/set for batch operations
  mget(keys) {
    return this.cache.mget(keys);
  }

  mset(items, ttl = 300) {
    return this.cache.mset(items, ttl);
  }

  // Delete single/multiple
  del(key) {
    const result = this.cache.del(key);
    if (result) this.stats.deletes++;
    return result;
  }

  // Clear all (careful in prod!)
  flush() {
    this.cache.flushAll();
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
  }

  // Get cache stats
  getStats() {
    return { ...this.stats, totalKeys: this.cache.keys().length };
  }

  // Redis compatibility layer (future)
  async connectRedis(url) {
    // Placeholder for ioredis integration
    console.log('Redis connection:', url);
  }
}

export const cache = new CacheManager();
export default cache;

