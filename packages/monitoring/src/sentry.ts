import * as Sentry from '@sentry/nextjs';

export interface SentryConfig {
  dsn?: string;
  environment?: string;
  appName: string;
  tracesSampleRate?: number;
}

/**
 * Initialize Sentry error tracking for Next.js applications
 * Note: This should be called in instrumentation.ts or sentry.client.config.ts
 */
export function initSentry(config: SentryConfig) {
  const {
    dsn = process.env.SENTRY_DSN,
    environment = process.env.NODE_ENV || 'development',
    appName,
    tracesSampleRate = 1.0,
  } = config;

  if (!dsn) {
    console.warn('Sentry DSN not provided, error tracking disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    tracesSampleRate,
    
    // Error filtering
    beforeSend(event) {
      // Don't send development errors
      if (environment === 'development') {
        console.error('Sentry Event (dev mode, not sent):', event);
        return null;
      }
      
      // Tag by app
      if (event.tags) {
        event.tags.app = appName;
      } else {
        event.tags = { app: appName };
      }
      
      // Filter out known non-critical errors
      if (event.exception?.values) {
        const message = event.exception.values[0]?.value || '';
        
        // Filter out network errors from browser extensions
        if (message.includes('ResizeObserver loop')) return null;
        if (message.includes('Non-Error promise rejection')) return null;
      }
      
      return event;
    },
  });
}

/**
 * Capture exception with Sentry
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (context) {
    Sentry.setContext('additional', context);
  }
  Sentry.captureException(error);
}

/**
 * Capture message with Sentry
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

/**
 * Set user context for Sentry
 */
export function setUser(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser(user);
}

/**
 * Clear user context
 */
export function clearUser() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for better error context
 */
export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
  Sentry.addBreadcrumb(breadcrumb);
}
