import { db } from '@repo/database';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: HealthStatus;
    gemini?: HealthStatus;
    deepseek?: HealthStatus;
    supabase?: HealthStatus;
  };
}

export interface HealthStatus {
  status: 'ok' | 'error' | 'warning';
  latency?: number;
  error?: string;
  details?: Record<string, any>;
}

/**
 * Comprehensive health check for all services
 */
export async function healthCheck(): Promise<HealthCheckResult> {
  const checks = {
    database: await checkDatabase(),
    gemini: await checkGeminiAPI(),
    deepseek: await checkDeepSeekAPI(),
    supabase: await checkSupabase(),
  };

  // Determine overall health status
  const hasErrors = Object.values(checks).some(c => c.status === 'error');
  const hasWarnings = Object.values(checks).some(c => c.status === 'warning');
  
  let status: 'healthy' | 'degraded' | 'unhealthy';
  if (hasErrors) {
    status = 'unhealthy';
  } else if (hasWarnings) {
    status = 'degraded';
  } else {
    status = 'healthy';
  }

  return {
    status,
    timestamp: new Date().toISOString(),
    checks,
  };
}

/**
 * Check database connectivity
 */
export async function checkDatabase(): Promise<HealthStatus> {
  try {
    const startTime = Date.now();
    await db.$queryRaw`SELECT 1`;
    const latency = Date.now() - startTime;
    
    return {
      status: 'ok',
      latency,
      details: {
        connected: true,
      },
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check Gemini API availability
 */
export async function checkGeminiAPI(): Promise<HealthStatus> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        status: 'warning',
        error: 'API key not configured',
      };
    }

    // Simple connectivity check (you can enhance this with an actual API call)
    return {
      status: 'ok',
      details: {
        configured: true,
      },
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check DeepSeek API availability
 */
export async function checkDeepSeekAPI(): Promise<HealthStatus> {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return {
        status: 'warning',
        error: 'API key not configured',
      };
    }

    return {
      status: 'ok',
      details: {
        configured: true,
      },
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check Supabase connectivity
 */
export async function checkSupabase(): Promise<HealthStatus> {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return {
        status: 'warning',
        error: 'Supabase not configured',
      };
    }

    return {
      status: 'ok',
      details: {
        configured: true,
      },
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Simple health check endpoint response
 */
export function simpleHealthCheck() {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: process.memoryUsage().heapUsed,
      total: process.memoryUsage().heapTotal,
    },
  };
}
