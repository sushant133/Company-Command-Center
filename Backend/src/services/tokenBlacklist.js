/**
 * SECURITY: In-memory token blacklist for logout/revocation
 * Note: For production scale, replace with Redis with TTL
 * Format: Map<token, expiryDate>
 */

const tokenBlacklist = new Map()

// Cleanup expired tokens every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [token, expiry] of tokenBlacklist.entries()) {
    if (expiry < now) {
      tokenBlacklist.delete(token)
    }
  }
}, 5 * 60 * 1000)

export const addToBlacklist = (token, expiryMs) => {
  const expiry = Date.now() + expiryMs
  tokenBlacklist.set(token, expiry)
}

export const isBlacklisted = (token) => {
  if (!token) return false
  const expiry = tokenBlacklist.get(token)
  if (!expiry) return false
  if (expiry < Date.now()) {
    tokenBlacklist.delete(token)
    return false
  }
  return true
}

export { tokenBlacklist }
export default { addToBlacklist, isBlacklisted }

