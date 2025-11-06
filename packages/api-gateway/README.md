# @repo/api-gateway

Unified API Gateway for the W3JDev AI Ecosystem. Provides a single endpoint for all backend services with WebSocket support.

## Features

- **tRPC Integration**: Type-safe API with full TypeScript support
- **WebSocket Support**: Real-time subscriptions and updates
- **CORS Configuration**: Secure cross-origin requests
- **Health Checks**: Built-in health monitoring endpoint
- **Auto-Scaling**: Configured for Railway auto-scaling
- **Error Handling**: Comprehensive error handling and logging

## Architecture

```
Frontend Apps (Vercel) → API Gateway (Railway) → Database (Supabase)
                              ↓
                          tRPC Router
                              ↓
                      Shared Packages
```

## Endpoints

### Health Check
```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 12345,
  "environment": "production"
}
```

### API Info
```
GET /
```

Response:
```json
{
  "name": "W3JDev AI Ecosystem API Gateway",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "trpc": "/trpc"
  }
}
```

### tRPC
```
POST /trpc
```

All tRPC procedures are available at this endpoint.

### WebSocket
```
ws://api.w3jdev.com:3001
```

WebSocket server for tRPC subscriptions.

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev --filter=@repo/api-gateway

# Build
pnpm build --filter=@repo/api-gateway

# Start production server
pnpm start --filter=@repo/api-gateway
```

## Environment Variables

```env
# Server
PORT=3000
WS_PORT=3001
NODE_ENV=production

# Database
DATABASE_URL="postgresql://..."

# Redis (optional, for session management)
REDIS_URL="redis://..."

# Monitoring
SENTRY_DSN="https://xxx@sentry.io/xxx"
```

## Deployment

### Railway

1. **Create Service**
   - Platform: Railway
   - Service: api-gateway
   - Domain: api.w3jdev.com

2. **Configure Build**
   - Build command: `pnpm install --frozen-lockfile && pnpm build --filter=@repo/api-gateway`
   - Start command: `pnpm start --filter=@repo/api-gateway`

3. **Environment Variables**
   - Add all required environment variables
   - Set `PORT` to Railway's `$PORT` variable

4. **Health Checks**
   - Path: `/health`
   - Interval: 30s
   - Timeout: 10s

### Auto-Scaling

Configured in `railway.toml`:
- Min replicas: 2
- Max replicas: 10
- CPU target: 80%
- Memory target: 80%

## CORS Configuration

Allowed origins:
- `https://dashboard.w3jdev.com`
- `https://punch-clock.w3jdev.com`
- `https://restaurant-ai.w3jdev.com`
- `https://flair-ai.w3jdev.com`
- `https://ai-artisan.w3jdev.com`
- `https://serene-ai.w3jdev.com`
- Local development URLs

## Error Handling

All errors are:
1. Logged to console
2. Sent to Sentry (in production)
3. Returned with appropriate HTTP status codes

Example error response:
```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

## Graceful Shutdown

The gateway handles `SIGTERM` and `SIGINT` signals for graceful shutdown:
1. Stops accepting new requests
2. Waits for existing requests to complete
3. Closes database connections
4. Exits cleanly

## Monitoring

### Health Endpoint

Monitor via Better Stack:
```yaml
- name: "API Gateway"
  url: "https://api.w3jdev.com/health"
  interval: 30
```

### Metrics

Track in Railway dashboard:
- Request rate
- Response time
- Error rate
- CPU usage
- Memory usage

## Security

- **CORS**: Strict origin checking
- **Rate Limiting**: Implemented in frontend middleware
- **Environment Variables**: Secrets managed via Railway
- **HTTPS**: Enforced via Railway

## WebSocket Usage

```typescript
import { createWSClient, wsLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';

const wsClient = createWSClient({
  url: 'wss://api.w3jdev.com:3001',
});

const trpc = createTRPCNext({
  config() {
    return {
      links: [
        wsLink({
          client: wsClient,
        }),
      ],
    };
  },
});
```

## Production Checklist

- [ ] Environment variables configured
- [ ] Health checks passing
- [ ] CORS origins updated
- [ ] Database migrations run
- [ ] Monitoring configured
- [ ] Auto-scaling enabled
- [ ] Custom domain configured
- [ ] SSL certificate active

## License

MIT
