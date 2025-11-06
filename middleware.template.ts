import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting store (in production, use Redis or Upstash)
// WARNING: In-memory storage does NOT work correctly with multiple instances
// For production with auto-scaling, use:
// - Redis: https://redis.io
// - Upstash: https://upstash.com/docs/redis/overall/ratelimit
// - Vercel KV: https://vercel.com/docs/storage/vercel-kv
const rateLimit = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute

/**
 * Simple rate limiting implementation for SINGLE INSTANCE deployments
 * 
 * PRODUCTION NOTE: This in-memory implementation will NOT work correctly
 * with Railway's auto-scaling (2-10 replicas). Each instance maintains
 * its own rate limit counter, allowing users to bypass limits by hitting
 * different instances.
 * 
 * For multi-instance deployments, implement Redis-based rate limiting:
 * @see https://github.com/upstash/ratelimit
 * 
 * Example with Upstash:
 * ```typescript
 * import { Ratelimit } from '@upstash/ratelimit';
 * import { Redis } from '@upstash/redis';
 * 
 * const ratelimit = new Ratelimit({
 *   redis: Redis.fromEnv(),
 *   limiter: Ratelimit.slidingWindow(60, '1 m'),
 * });
 * 
 * const { success } = await ratelimit.limit(ip);
 * ```
 */
function checkRateLimit(identifier: string): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const record = rateLimit.get(identifier);

  // Clean up old entries periodically
  if (rateLimit.size > 10000) {
    for (const [key, value] of rateLimit.entries()) {
      if (value.resetTime < now) {
        rateLimit.delete(key);
      }
    }
  }

  if (!record || record.resetTime < now) {
    // Create new record
    rateLimit.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return {
      success: true,
      limit: RATE_LIMIT_MAX_REQUESTS,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      reset: now + RATE_LIMIT_WINDOW,
    };
  }

  // Check if limit exceeded
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      success: false,
      limit: RATE_LIMIT_MAX_REQUESTS,
      remaining: 0,
      reset: record.resetTime,
    };
  }

  // Increment count
  record.count++;
  return {
    success: true,
    limit: RATE_LIMIT_MAX_REQUESTS,
    remaining: RATE_LIMIT_MAX_REQUESTS - record.count,
    reset: record.resetTime,
  };
}

/**
 * Middleware for Edge runtime
 * - Rate limiting
 * - Security headers
 * - Request logging
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Get identifier for rate limiting (IP address or user ID)
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  
  // Only rate limit API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const rateLimitResult = checkRateLimit(ip);

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString());

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
            'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }
  }

  // Security headers (additional to next.config.js)
  response.headers.set('X-Request-ID', crypto.randomUUID());
  
  // CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      'https://dashboard.w3jdev.com',
      'https://punch-clock.w3jdev.com',
      'https://restaurant-ai.w3jdev.com',
      'https://flair-ai.w3jdev.com',
      'https://ai-artisan.w3jdev.com',
      'https://serene-ai.w3jdev.com',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
      'http://localhost:3005',
      'http://localhost:3006',
    ];

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    // Match all routes except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
  // Run on Edge runtime for best performance
  runtime: 'edge',
};
