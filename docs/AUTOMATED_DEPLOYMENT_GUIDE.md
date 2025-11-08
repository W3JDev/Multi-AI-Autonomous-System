# Automated Deployment Guide

Complete guide for deploying the Multi-AI Autonomous System using the automated deployment solution.

## Overview

This automated deployment solution addresses Railway auto-detection issues and provides complete automation for deploying:
- **API Gateway** to Railway (Hobby plan - $5/month)
- **7 Frontend Apps** to Vercel (Free tier)
- **Environment Variable** synchronization across all platforms
- **End-to-end verification** of all services

## Prerequisites

### Required Tools
- **Node.js** >= 20.0.0
- **pnpm** >= 9.0.0
- **Railway CLI**: `npm install -g @railway/cli`
- **Vercel CLI**: `npm install -g vercel`
- **Git**
- **curl** (for health checks)

### Required Accounts
- [Railway Account](https://railway.app/) (Hobby plan - $5/month)
- [Vercel Account](https://vercel.com/) (Free tier)
- [Neon Database](https://neon.tech/) or [Supabase](https://supabase.com/) (Free tier)
- [Google Gemini API Key](https://makersuite.google.com/app/apikey) (Free tier)
- [DeepSeek API Key](https://platform.deepseek.com/) (Optional)

## Quick Start

### One-Command Deployment

```bash
# Execute the complete deployment
./scripts/deploy-all.sh
```

This master script will guide you through all 4 tasks:
1. Railway configuration validation
2. API Gateway deployment to Railway
3. Vercel environment variable updates
4. End-to-end verification

### Step-by-Step Deployment

If you prefer to execute tasks individually:

#### Task 1: Validate Railway Configuration

```bash
./scripts/validate-railway-config.sh
```

**What it checks:**
- ✓ `.railwayignore` exists and excludes all frontend apps
- ✓ `railway.toml` is properly configured
- ✓ API Gateway builds successfully
- ✓ Frontend apps are properly separated
- ✓ No frontend code in API Gateway build

#### Task 2: Deploy API Gateway

```bash
# First, login to Railway
railway login

# Set required environment variables in Railway
railway variables set DATABASE_URL=<your_database_url>
railway variables set GEMINI_API_KEY=<your_gemini_key>
railway variables set NODE_ENV=production

# Validate environment
./scripts/validate-environment.sh railway

# Deploy to Railway
./scripts/railway-deploy.sh
```

**What it does:**
- ✓ Validates Railway CLI authentication
- ✓ Checks environment variables
- ✓ Builds API Gateway locally first
- ✓ Deploys to Railway
- ✓ Waits for deployment to complete
- ✓ Runs health checks with retry logic
- ✓ Displays deployment URL

#### Task 3: Update Vercel Apps

```bash
# Get the Railway URL
RAILWAY_URL=$(railway domain)

# Update all 7 Vercel apps
./scripts/update-vercel-envs.sh https://$RAILWAY_URL
```

**What it does:**
- ✓ Updates `API_GATEWAY_URL` for all 7 apps
- ✓ Sets variables for production and preview environments
- ✓ Optionally triggers redeployment
- ✓ Verifies updates were successful

#### Task 4: Verify Deployment

```bash
# Run comprehensive verification
./scripts/verify-deployment.sh https://your-railway-url.railway.app

# Test connections
./scripts/verify-connections.sh https://your-railway-url.railway.app
```

**What it verifies:**
1. ✓ All 7 frontend apps can reach API Gateway
2. ✓ Database connectivity through API Gateway
3. ✓ Authentication configuration
4. ✓ AI API keys configured
5. ✓ Health monitoring active
6. ✓ Performance targets met (API < 100ms)
7. ✓ Error handling in place
8. ✓ Auto-scaling configured (2-10 replicas)
9. ✓ CI/CD pipeline ready
10. ✓ Documentation complete

## Scripts Reference

### Core Deployment Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `deploy-all.sh` | Master orchestration script | `./scripts/deploy-all.sh` |
| `railway-deploy.sh` | Deploy API Gateway to Railway | `./scripts/railway-deploy.sh` |
| `update-vercel-envs.sh` | Update Vercel environment variables | `./scripts/update-vercel-envs.sh <API_URL>` |
| `verify-deployment.sh` | Comprehensive verification | `./scripts/verify-deployment.sh <API_URL>` |

### Validation Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `validate-railway-config.sh` | Validate Railway configuration | `./scripts/validate-railway-config.sh` |
| `validate-environment.sh` | Validate environment variables | `./scripts/validate-environment.sh [railway\|local]` |
| `health-check.sh` | Health check with retry logic | `./scripts/health-check.sh <URL> [retries] [interval]` |
| `verify-connections.sh` | Test app-to-API connections | `./scripts/verify-connections.sh <API_URL>` |

### Maintenance Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `railway-rollback.sh` | Rollback to previous deployment | `./scripts/railway-rollback.sh` |

## Configuration Files

### `.railwayignore`

Prevents Railway from auto-detecting frontend applications:

```
# Ignore all frontend applications
apps/unified-dashboard/
apps/punch-clock/
apps/flair-ai/
apps/waiter-ai/
apps/guest-ai/
apps/serene-ai/
apps/ai-artisan/

# Ignore shared packages except api-gateway
packages/ui/
packages/ai/
packages/auth/
packages/database/
packages/api/
packages/monitoring/
packages/utils/
```

### `railway.toml`

Explicit configuration for API Gateway only:

```toml
[build]
builder = "NIXPACKS"
buildCommand = "pnpm install --frozen-lockfile && pnpm build --filter=@repo/api-gateway"

[deploy]
serviceName = "api-gateway"
startCommand = "cd packages/api-gateway && node dist/index.js"
healthcheckPath = "/health"

[deploy.autoscaling]
enabled = true
minReplicas = 2
maxReplicas = 10
targetCPU = 80
targetMemory = 80
```

## Environment Variables

### Railway (API Gateway)

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `GEMINI_API_KEY` - Google Gemini API key
- `NODE_ENV` - Set to "production"

Optional:
- `DEEPSEEK_API_KEY` - DeepSeek API fallback
- `SENTRY_DSN` - Error tracking
- `PORT` - Default: 3000
- `WS_PORT` - WebSocket port

### Vercel (All 7 Apps)

Each app needs:
- `DATABASE_URL` - Same as Railway
- `GEMINI_API_KEY` - Same as Railway
- `API_GATEWAY_URL` - Railway URL (auto-updated by scripts)
- `NEXTAUTH_SECRET` - Generated with `openssl rand -base64 32`
- `NEXTAUTH_URL` - App's Vercel URL
- `NODE_ENV` - Set to "production"

Optional:
- `SENTRY_DSN` - Error tracking
- `DEEPSEEK_API_KEY` - DeepSeek fallback

## Troubleshooting

### Railway Detection Issues

**Problem**: Railway detects frontend apps

**Solution**:
```bash
# Verify .railwayignore exists
cat .railwayignore

# Validate configuration
./scripts/validate-railway-config.sh

# Redeploy
railway up --detach
```

### Health Check Failures

**Problem**: Health endpoint not responding

**Solution**:
```bash
# Check Railway status
railway status

# View logs
railway logs --tail 50

# Test health endpoint
curl https://your-api.railway.app/health

# Run health check with retries
./scripts/health-check.sh https://your-api.railway.app 30 2
```

### Environment Variable Issues

**Problem**: Apps can't connect to API Gateway

**Solution**:
```bash
# Verify Railway variables
railway variables

# Validate environment
./scripts/validate-environment.sh railway

# Update Vercel apps
./scripts/update-vercel-envs.sh https://your-api.railway.app
```

### Build Failures

**Problem**: API Gateway build fails

**Solution**:
```bash
# Test build locally
pnpm install --frozen-lockfile
pnpm build --filter=@repo/api-gateway

# Check for errors
railway logs --tail 100

# Validate configuration
./scripts/validate-railway-config.sh
```

## CI/CD Integration

The deployment scripts integrate with the existing CI/CD pipeline in `.github/workflows/ci-cd.yml`.

### Automatic Deployment

On push to `main` branch:
1. Builds all packages and apps
2. Runs tests
3. Deploys API Gateway to Railway
4. Deploys all 7 apps to Vercel
5. Sends notification (if configured)

### Manual Deployment

```bash
# Trigger CI/CD
git commit --allow-empty -m "deploy: trigger deployment"
git push origin main
```

## Performance Targets

| Metric | Target | How to Test |
|--------|--------|-------------|
| API Response Time | < 100ms | `./scripts/verify-deployment.sh` |
| App Load Time | < 2s | Manual browser testing |
| Health Check | 100% uptime | Railway dashboard |
| Auto-scaling | 2-10 replicas | Load testing with `ab` |

## Security Checklist

- [ ] All secrets stored in platform environment variables
- [ ] No secrets committed to Git
- [ ] HTTPS enabled on all services (automatic)
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Regular security updates

## Cost Monitoring

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| Railway | Hobby | $5.00 |
| Vercel | Free | $0.00 |
| Neon/Supabase | Free | $0.00 |
| Gemini API | Free Tier | $0.00 |
| **Total** | | **$5.00** |

## Support

### Documentation
- [Railway Docs](https://docs.railway.app/)
- [Vercel Docs](https://vercel.com/docs)
- [Project README](../README.md)
- [Deployment Status](../DEPLOYMENT_STATUS.md)

### Useful Commands

```bash
# Railway
railway status          # Check service status
railway logs            # View logs
railway open            # Open dashboard
railway variables       # List environment variables

# Vercel
vercel ls              # List deployments
vercel logs            # View logs
vercel env ls          # List environment variables

# Health Checks
./scripts/health-check.sh <URL>           # Test health endpoint
./scripts/verify-deployment.sh <URL>      # Full verification
./scripts/verify-connections.sh <URL>     # Test connections
```

## Next Steps

After successful deployment:

1. **Test All Apps**: Visit each Vercel URL and test functionality
2. **Monitor Health**: Set up Better Stack or similar for uptime monitoring
3. **Error Tracking**: Configure Sentry for error monitoring
4. **Custom Domains**: Add custom domains in Railway and Vercel dashboards
5. **Performance**: Run load tests and optimize as needed
6. **Documentation**: Update README with live URLs

## Success Criteria

Your deployment is complete when:

- ✅ Railway only detects and deploys API Gateway
- ✅ All 7 frontend apps deployed to Vercel
- ✅ API Gateway health check returns 200
- ✅ All apps can connect to API Gateway
- ✅ Auto-scaling configured (2-10 replicas)
- ✅ CI/CD pipeline working
- ✅ All environment variables set correctly
- ✅ No console errors in apps
- ✅ API response times < 100ms
- ✅ Documentation updated with URLs

---

**Deployment Status**: Ready for Production ✅

**Last Updated**: November 2024

**Repository**: W3JDev/Multi-AI-Autonomous-System
