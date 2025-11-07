# @repo/monitoring

Monitoring, error tracking, and health check utilities for the W3JDev AI Ecosystem.

## Features

- **Sentry Integration**: Error tracking and performance monitoring
- **Health Checks**: Comprehensive system health monitoring
- **Auto-Recovery**: Self-healing mechanisms for common failures
- **Slack Notifications**: Alert integration

## Installation

This package is internal to the monorepo and automatically included in apps.

## Usage

### Initialize Sentry

```typescript
import { initSentry } from '@repo/monitoring';

// In your Next.js app's instrumentation.ts or _app.tsx
initSentry({
  appName: 'punch-clock',
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});
```

### Health Checks

```typescript
import { healthCheck, simpleHealthCheck } from '@repo/monitoring';

// Comprehensive health check
const health = await healthCheck();
console.log(health);
// {
//   status: 'healthy',
//   timestamp: '2025-01-01T00:00:00.000Z',
//   checks: {
//     database: { status: 'ok', latency: 10 },
//     gemini: { status: 'ok' },
//     deepseek: { status: 'ok' },
//     supabase: { status: 'ok' }
//   }
// }

// Simple health check (for endpoints)
const simple = simpleHealthCheck();
```

### Auto-Recovery

```typescript
import { AutoRecovery, sendSlackNotification } from '@repo/monitoring';

// Initialize auto-recovery
const autoRecovery = new AutoRecovery({
  checkInterval: 30000, // 30 seconds
  enabled: true,
  notifySlack: async (message) => {
    await sendSlackNotification(process.env.SLACK_WEBHOOK!, message);
  },
});

// Start monitoring
autoRecovery.start();

// Stop when shutting down
process.on('SIGTERM', () => {
  autoRecovery.stop();
});
```

### Error Tracking

```typescript
import { captureException, captureMessage, setUser, addBreadcrumb } from '@repo/monitoring';

// Capture errors
try {
  // Your code
} catch (error) {
  captureException(error, {
    context: 'additional data',
  });
}

// Log messages
captureMessage('Something important happened', 'info');

// Set user context
setUser({
  id: 'user-123',
  email: 'user@example.com',
  username: 'john_doe',
});

// Add breadcrumbs for context
addBreadcrumb({
  category: 'auth',
  message: 'User logged in',
  level: 'info',
});
```

## API Gateway Integration

The monitoring package is integrated into the API Gateway:

```typescript
import { AutoRecovery, healthCheck } from '@repo/monitoring';

// Health endpoint
app.get('/health', async (req, res) => {
  const health = await healthCheck();
  res.json(health);
});

// Start auto-recovery
const autoRecovery = new AutoRecovery({
  checkInterval: 30000,
  enabled: process.env.NODE_ENV === 'production',
});
autoRecovery.start();
```

## Environment Variables

```env
# Sentry
SENTRY_DSN="https://xxx@sentry.io/xxx"

# Database (for health checks)
DATABASE_URL="postgresql://..."

# AI Services (for health checks)
GEMINI_API_KEY="your_key"
DEEPSEEK_API_KEY="your_key"

# Supabase (for health checks)
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_ANON_KEY="your_key"

# Slack (optional)
SLACK_WEBHOOK="https://hooks.slack.com/services/xxx"
```

## Recovery Actions

The auto-recovery system automatically:

1. **Database Reconnection**: Attempts to reconnect if database fails
2. **AI Failover**: Switches to DeepSeek if Gemini fails
3. **Slack Alerts**: Notifies team of issues and recoveries
4. **Health Monitoring**: Checks every 30 seconds

## Production Setup

1. **Configure Sentry**: Create projects for each app at https://sentry.io
2. **Setup Slack**: Create webhook at https://api.slack.com/messaging/webhooks
3. **Enable Auto-Recovery**: Set `NODE_ENV=production`
4. **Monitor Dashboards**: 
   - Sentry: https://sentry.io
   - Better Stack: https://betterstack.com

## License

MIT
