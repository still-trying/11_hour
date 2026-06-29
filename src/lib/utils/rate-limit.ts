type RateLimitRecord = { count: number; resetAt: number }

const requestCounts = new Map<string, RateLimitRecord>()

// Lazy cleanup: remove expired entries on each call
export function checkRateLimit(
  key: string,
  maxRequests: number = 30,
  windowMs: number = 60_000,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()

  // Lazy cleanup: remove expired entries every 100 calls
  if (requestCounts.size > 100) {
    requestCounts.forEach((record, k) => {
      if (now > record.resetAt) requestCounts.delete(k)
    })
  }

  const record = requestCounts.get(key)

  if (!record || now > record.resetAt) {
    requestCounts.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs }
  }

  record.count++

  if (record.count > maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt }
  }

  return { allowed: true, remaining: maxRequests - record.count, resetAt: record.resetAt }
}
