# Deployment Guide - Phase 6

This guide covers deploying the W3JDev AI Ecosystem to production with self-healing infrastructure.

## 🏗️ Infrastructure Overview

### Deployment Targets

| Service | Platform | Cost | Purpose |
|---------|----------|------|---------|
| Frontend Apps (7) | Vercel Free | $0 | All Next.js applications |
| API Gateway | Railway | $5/mo | Unified backend API |
| Database | Supabase Free | $0 | PostgreSQL + Auth + Storage |
| AI Services | Google Cloud Free | $0 | Gemini API |
| CDN/Storage | Cloudflare R2 | $0 (10GB) | Static assets |
| Monitoring | Sentry Free | $0 | Error tracking |
| Uptime | Better Stack Free | $0 | Status monitoring |

**Total Monthly Cost: $5-15** (vs. previous ~$55/month = 73% reduction)

## 📋 Pre-Deployment Checklist

### 1. Environment Variables

Create the following secrets in your platforms:

#### Shared Secrets
```bash
DATABASE_URL="postgresql://user:pass@host:5432/db"
DIRECT_DATABASE_URL="postgresql://user:pass@host:5432/db"
GEMINI_API_KEY="your_gemini_api_key"
DEEPSEEK_API_KEY="your_deepseek_api_key"
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_ANON_KEY="your_supabase_key"
NEXTAUTH_SECRET="generate_with_openssl_rand"
SENTRY_DSN="https://xxx@sentry.io/xxx"
```

#### GitHub Secrets
```bash
# Vercel
VERCEL_TOKEN="your_vercel_token"
VERCEL_ORG_ID="your_org_id"
VERCEL_PROJECT_ID_unified-dashboard="project_id"
VERCEL_PROJECT_ID_punch-clock="project_id"
VERCEL_PROJECT_ID_flair-ai="project_id"
VERCEL_PROJECT_ID_waiter-ai="project_id"
VERCEL_PROJECT_ID_guest-ai="project_id"
VERCEL_PROJECT_ID_serene-ai="project_id"
VERCEL_PROJECT_ID_ai-artisan="project_id"

# Railway
RAILWAY_TOKEN="your_railway_token"

# Slack (optional)
SLACK_WEBHOOK="https://hooks.slack.com/services/xxx"
```

**Security Note:** The CI/CD workflow uses dynamic secret references (`secrets[format('VERCEL_PROJECT_ID_{0}', matrix.app)]`) to access project-specific secrets. This is a safe pattern that only accesses secrets matching the `VERCEL_PROJECT_ID_*` pattern, limiting exposure to only necessary secrets per deployment.

### 2. Database Setup

```bash
# Run migrations
cd packages/database
pnpm exec prisma migrate deploy

# Generate Prisma client
pnpm exec prisma generate
```

### 3. Build Verification

```bash
# Test builds locally
pnpm install
pnpm build

# Test specific app
pnpm build --filter=@ecosystem/ai-artisan
```

## 🚀 Deployment Steps

### Step 1: Deploy to Vercel (Frontend Apps)

#### Option A: Via Vercel Dashboard (Recommended for first deployment)

1. **Import Repository**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will detect it's a monorepo

2. **Create Project for Each App**
   - For each app in `apps/`:
     - Create a new project
     - Set root directory: `apps/[app-name]`
     - Framework: Next.js
     - Build command: `cd ../.. && pnpm build --filter=@ecosystem/[app-name]`
     - Output directory: `.next`
     - Install command: `cd ../.. && pnpm install --frozen-lockfile`

3. **Configure Environment Variables**
   - Add all shared environment variables
   - Set `NEXTAUTH_URL` to your app's domain
   - Set `API_GATEWAY_URL=https://api.w3jdev.com`

4. **Set Custom Domains**
   - unified-dashboard → `dashboard.w3jdev.com`
   - punch-clock → `punch-clock.w3jdev.com`
   - waiter-ai → `restaurant-ai.w3jdev.com`
   - flair-ai → `flair-ai.w3jdev.com`
   - ai-artisan → `ai-artisan.w3jdev.com`
   - serene-ai → `serene-ai.w3jdev.com`

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy each app
cd apps/unified-dashboard
vercel --prod

cd ../punch-clock
vercel --prod

# ... repeat for all apps
```

### Step 2: Deploy to Railway (Backend API)

1. **Create Railway Account**
   - Go to https://railway.app
   - Connect your GitHub account

2. **Create New Project**
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repository

3. **Configure Service**
   - Name: `api-gateway`
   - Root directory: `/`
   - Build command: `pnpm install --frozen-lockfile && pnpm build --filter=@repo/api-gateway`
   - Start command: `pnpm start --filter=@repo/api-gateway`

4. **Add Environment Variables**
   - Add all database and API keys
   - Set `PORT=3000`
   - Set `NODE_ENV=production`

5. **Configure Domain**
   - Add custom domain: `api.w3jdev.com`
   - Update DNS records as instructed

6. **Enable Health Checks**
   - Path: `/health`
   - Interval: 30s
   - Timeout: 10s

### Step 3: Setup Supabase

1. **Create Project**
   - Go to https://supabase.com
   - Create new project
   - Choose region closest to users

2. **Configure Database**
   - Get connection string from Settings → Database
   - Add to environment variables as `DATABASE_URL`

3. **Setup Authentication**
   - Enable Email/Password auth
   - Configure OAuth providers (Google, GitHub)
   - Get `SUPABASE_URL` and `SUPABASE_ANON_KEY`

4. **Setup Storage**
   - Create buckets:
     - `resumes` (for AI-Artisan)
     - `training-videos` (for FlairAi)
     - `avatars` (for user profiles)

### Step 4: Configure Monitoring

#### Sentry

1. **Create Organization**
   - Go to https://sentry.io
   - Create new organization

2. **Create Projects**
   - Create one project per app
   - Get DSN for each project

3. **Install Sentry**
   ```bash
   # Already installed in monitoring package
   # Just configure DSN in environment variables
   ```

#### Better Stack

1. **Create Account**
   - Go to https://betterstack.com/uptime

2. **Import Monitors**
   - Use `betterstack.yml` configuration
   - Or manually create monitors for each endpoint

3. **Setup Alerts**
   - Configure email alerts
   - Add Slack webhook (optional)

4. **Create Status Page**
   - Enable public status page
   - Configure custom domain: `status.w3jdev.com`

### Step 5: Configure CI/CD

The CI/CD pipeline is already configured in `.github/workflows/ci-cd.yml`.

**Required GitHub Secrets:**
- All Vercel secrets
- `RAILWAY_TOKEN`
- `DATABASE_URL`
- `SLACK_WEBHOOK` (optional)

**Pipeline Features:**
- ✅ Automatic linting and type checking
- ✅ Build verification for all apps
- ✅ Database migrations on deploy
- ✅ Auto-deploy to production on main branch
- ✅ Slack notifications

## 🔧 Post-Deployment Configuration

### DNS Configuration

Add these DNS records to your domain:

```dns
# Frontend Apps (CNAME to Vercel)
dashboard.w3jdev.com     CNAME  cname.vercel-dns.com
punch-clock.w3jdev.com   CNAME  cname.vercel-dns.com
restaurant-ai.w3jdev.com CNAME  cname.vercel-dns.com
flair-ai.w3jdev.com      CNAME  cname.vercel-dns.com
ai-artisan.w3jdev.com    CNAME  cname.vercel-dns.com
serene-ai.w3jdev.com     CNAME  cname.vercel-dns.com

# API Gateway (CNAME to Railway)
api.w3jdev.com           CNAME  [your-railway-domain]

# Status Page (CNAME to Better Stack)
status.w3jdev.com        CNAME  [betterstack-domain]
```

### Rate Limiting (Production)

**Important:** The middleware template uses in-memory rate limiting which **does not work** with Railway's auto-scaling (multiple instances).

For production with auto-scaling, implement Redis-based rate limiting:

1. **Add Upstash Redis** (Free tier available)
   ```bash
   # Install dependencies
   pnpm add @upstash/ratelimit @upstash/redis
   ```

2. **Update middleware.ts**
   ```typescript
   import { Ratelimit } from '@upstash/ratelimit';
   import { Redis } from '@upstash/redis';
   
   const ratelimit = new Ratelimit({
     redis: Redis.fromEnv(),
     limiter: Ratelimit.slidingWindow(60, '1 m'),
   });
   
   // In middleware
   const { success } = await ratelimit.limit(ip);
   ```

3. **Add environment variables**
   ```env
   UPSTASH_REDIS_REST_URL="your_url"
   UPSTASH_REDIS_REST_TOKEN="your_token"
   ```

Alternative solutions:
- **Vercel KV**: Built-in Redis for Vercel apps
- **Redis Cloud**: Managed Redis service
- **Cloudflare Workers KV**: Edge storage

### SSL Certificates

- Vercel: Auto-managed (Let's Encrypt)
- Railway: Auto-managed (Let's Encrypt)
- Better Stack: Auto-managed

### Auto-Scaling Configuration

**Railway:**
- Min replicas: 2
- Max replicas: 10
- CPU target: 80%
- Memory target: 80%

**Vercel:**
- Automatically scales per request
- Edge functions for optimal performance

## 🔍 Monitoring & Alerts

### Health Check Endpoints

```bash
# API Gateway
curl https://api.w3jdev.com/health

# Frontend apps (any page)
curl https://dashboard.w3jdev.com
```

### Monitoring Dashboards

- **Sentry:** https://sentry.io → View errors and performance
- **Better Stack:** https://betterstack.com → View uptime
- **Vercel Analytics:** https://vercel.com/analytics
- **Railway Metrics:** https://railway.app/project/[id]/metrics

## 🛠️ Maintenance

### Rolling Back Deployments

**Vercel:**
```bash
# Via dashboard: Deployments → Select previous → Promote to Production
# Via CLI:
vercel rollback
```

**Railway:**
```bash
# Via dashboard: Deployments → Select previous → Redeploy
```

### Database Migrations

```bash
# Create migration
cd packages/database
pnpm exec prisma migrate dev --name migration_name

# Deploy migration
pnpm exec prisma migrate deploy
```

### Updating Dependencies

```bash
# Update all dependencies
pnpm update --recursive --latest

# Rebuild and test
pnpm build
pnpm test

# Deploy via git push (CI/CD will handle it)
git add .
git commit -m "chore: update dependencies"
git push origin main
```

## 🚨 Troubleshooting

### Build Failures

1. Check build logs in Vercel/Railway dashboard
2. Verify all environment variables are set
3. Test build locally: `pnpm build`
4. Check for TypeScript errors: `pnpm type-check`

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check Supabase project is running
3. Verify IP allowlist (Supabase allows all by default)
4. Test connection: `psql $DATABASE_URL`

### API Gateway Issues

1. Check Railway logs
2. Verify health endpoint: `curl https://api.w3jdev.com/health`
3. Check environment variables
4. Restart service in Railway dashboard

### Monitoring Alerts

1. Check Better Stack dashboard for status
2. Review Sentry for error details
3. Check Railway/Vercel metrics for resource usage

## 📊 Success Metrics

After deployment, verify:

- [ ] All 7 apps are accessible via custom domains
- [ ] API Gateway health check returns 200
- [ ] Database migrations completed
- [ ] SSL certificates are active
- [ ] Monitoring dashboards show data
- [ ] CI/CD pipeline runs successfully
- [ ] Cost is within $5-15/month budget
- [ ] Performance metrics meet targets:
  - Lighthouse score > 90
  - API response time < 100ms
  - Bundle size < 200KB
  - Uptime > 99.9%

## 📞 Support

For deployment issues:
1. Check monitoring dashboards first
2. Review deployment logs
3. Consult documentation
4. Reach out to platform support

---

**Deployment Checklist:** Phase 6 Complete ✅
