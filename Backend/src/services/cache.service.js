import cache from '../utils/cache.js';
import crypto from 'crypto';

// Cache service with intelligent key generation
export class CacheService {
  // Generate deterministic cache key
  static key(...parts) {
    const hash = crypto
      .createHash('md5')
      .update(parts.join(':'))
      .digest('hex');
    return `cc:${hash}`;
  }

  // Company-specific cache
  static async getCompanyData(companyId, queryType, params = {}) {
    const key = this.key('company', companyId, queryType, JSON.stringify(params));
    return cache.get(key, 600); // 10 min for company data
  }

  static setCompanyData(companyId, queryType, data, params = {}) {
    const key = this.key('company', companyId, queryType, JSON.stringify(params));
    return cache.set(key, data, 600);
  }

  // AI query result cache (per user, 15 min TTL)
  static async getAIQuery(userId, queryHash) {
    const key = this.key('ai', userId, queryHash);
    return cache.get(key, 900);
  }

  static setAIQuery(userId, queryHash, response) {
    const key = this.key('ai', userId, queryHash);
    return cache.set(key, response, 900);
  }

  // Dashboard metrics cache (global, 5 min)
  static getDashboardMetrics() {
    return cache.get('dashboard:metrics', 300);
  }

  static setDashboardMetrics(data) {
    return cache.set('dashboard:metrics', data, 300);
  }

  // Analytics cache (30 min)
  static getAnalytics(key) {
    return cache.get(`analytics:${key}`, 1800);
  }

  static setAnalytics(key, data) {
    return cache.set(`analytics:${key}`, data, 1800);
  }

  // Invalidate company data cache
  static invalidateCompany(companyId) {
    const pattern = `company:${companyId}:`;
    cache.keys().forEach(key => {
      if (key.startsWith(pattern)) {
        cache.del(key);
      }
    });
  }

  // Get cache stats
  static getStats() {
    return cache.getStats();
  }

  // Clear AI cache for user
  static clearUserAI(userId) {
    const pattern = `ai:${userId}:`;
    cache.keys().forEach(key => {
      if (key.startsWith(pattern)) {
        cache.del(key);
      }
    });
  }
}

export default CacheService;

