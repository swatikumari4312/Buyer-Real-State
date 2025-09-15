import type { NextRequest } from "next/server"

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export function rateLimit(
  request: NextRequest,
  options: {
    windowMs: number // Time window in milliseconds
    maxRequests: number // Max requests per window
    keyGenerator?: (req: NextRequest) => string
  },
): { success: boolean; limit: number; remaining: number; resetTime: number } {
  const key = options.keyGenerator ? options.keyGenerator(request) : getClientIP(request)
  const now = Date.now()
  const windowStart = now - options.windowMs

  // Clean up old entries
  Object.keys(store).forEach((k) => {
    if (store[k].resetTime < now) {
      delete store[k]
    }
  })

  // Get or create entry for this key
  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 0,
      resetTime: now + options.windowMs,
    }
  }

  // Check if limit exceeded
  if (store[key].count >= options.maxRequests) {
    return {
      success: false,
      limit: options.maxRequests,
      remaining: 0,
      resetTime: store[key].resetTime,
    }
  }

  // Increment counter
  store[key].count++

  return {
    success: true,
    limit: options.maxRequests,
    remaining: options.maxRequests - store[key].count,
    resetTime: store[key].resetTime,
  }
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return "unknown"
}
