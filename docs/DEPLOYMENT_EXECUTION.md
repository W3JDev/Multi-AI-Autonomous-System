# 🚀 Deployment Execution Guide

This guide provides step-by-step instructions to deploy all 6 applications to production.

## ⚡ Quick Start (For Experienced Users)

```bash
# 1. Verify readiness
./scripts/verify-deployment-ready.sh

# 2. Configure GitHub secrets (see below)
# 3. Push to main branch - CI/CD will deploy automatically

git push origin main
```

## 📋 Prerequisites

### Required Accounts
- ✅ GitHub account with repository access
- ✅ Vercel account (free tier is sufficient)
- ✅ Railway account (Hobby plan required - $5/month)
- ✅ Supabase account (free tier)
- ✅ Google Cloud account for Gemini API (free tier)
- ⭕ Sentry account (free tier) - Optional but recommended
- ⭕ Better Stack account (free tier) - Optional for uptime monitoring

### Required Tools
```bash
# Node.js 20+
node --version  # Should be >= 20.0.0

# pnpm 10+
pnpm --version  # Should be >= 10.0.0

# Vercel CLI (optional, for manual deployments)
npm install -g vercel

# Railway CLI (optional, for manual deployments)
npm install -g @railway/cli
```

## 🔧 Pre-Deployment Setup

### Step 1: Run Deployment Setup Script

This script will verify your local environment and build all applications:

```bash
./scripts/deploy-setup.sh
```

Expected output:
- ✓ All dependencies installed
- ✓ All packages built
- ✓ All 7 apps built successfully
- ✓ Type checks passed
- ✓ Linting passed

### Step 2: Configure Environment Variables

#### 2.1 Supabase Setup

1. Go to https://supabase.com
2. Create a new project
3. Navigate to Settings → Database
4. Copy the connection strings:
   - `DATABASE_URL` (Pooled connection string)
   - `DIRECT_DATABASE_URL` (Direct connection string)
5. Navigate to Settings → API
6. Copy:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

#### 2.2 Google Gemini API

1. Go to https://makersuite.google.com/app/apikey
2. Create an API key
3. Copy the `GEMINI_API_KEY`

#### 2.3 NextAuth Secret

Generate a secure secret:

```bash
openssl rand -base64 32
```

Use this as `NEXTAUTH_SECRET`

#### 2.4 Sentry (Optional but Recommended)

1. Go to https://sentry.io
2. Create a new organization
3. Create projects for each app (7 projects)
4. Copy the DSN for each project
5. For simplicity, you can use one DSN for all apps: `SENTRY_DSN`

### Step 3: Configure GitHub Secrets

Navigate to your repository on GitHub: Settings → Secrets and variables → Actions

Add the following secrets:

#### Vercel Secrets
```
VERCEL_TOKEN=<your_vercel_token>
VERCEL_ORG_ID=<your_org_id>
VERCEL_PROJECT_ID_unified-dashboard=<project_id>
VERCEL_PROJECT_ID_punch-clock=<project_id>
VERCEL_PROJECT_ID_flair-ai=<project_id>
VERCEL_PROJECT_ID_waiter-ai=<project_id>
VERCEL_PROJECT_ID_guest-ai=<project_id>
VERCEL_PROJECT_ID_serene-ai=<project_id>
VERCEL_PROJECT_ID_ai-artisan=<project_id>
```

**How to get these values:**

1. **VERCEL_TOKEN**: Go to https://vercel.com/account/tokens → Create Token
2. **VERCEL_ORG_ID**: 
   - Go to Vercel dashboard
   - Click on your profile/organization
   - Settings → General → Team ID (or Personal Account ID)
3. **VERCEL_PROJECT_ID_***: 
   - For each app, you need to create a project in Vercel first (see Step 4.1 below)
   - Then get the Project ID from Settings → General → Project ID

#### Railway Secrets
```
RAILWAY_TOKEN=<your_railway_token>
```

**How to get Railway token:**
```bash
railway login
railway whoami --token
```

Or generate from: https://railway.app/account/tokens

#### Database & App Secrets
```
DATABASE_URL=<supabase_connection_string>
```

Optional (for Slack notifications):
```
SLACK_WEBHOOK=<your_slack_webhook_url>
```

## 🌐 Step 4: Vercel Setup (Frontend Apps)

### 4.1 Create Projects in Vercel

You have two options:

#### Option A: Via Vercel Dashboard (Recommended for first deployment)

For each of the 7 apps, repeat these steps:

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure the project:
   - **Project Name**: Choose a name (e.g., `w3jdev-punch-clock`)
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/<app-name>` (e.g., `apps/punch-clock`)
   - **Build Command**: `cd ../.. && pnpm build --filter=@ecosystem/<app-name>`
   - **Output Directory**: `.next`
   - **Install Command**: `cd ../.. && pnpm install --frozen-lockfile`

4. Add Environment Variables:
   - Click "Environment Variables"
   - Add all variables from `.env.template`
   - Set `NEXTAUTH_URL` to your app's domain (or use auto-generated Vercel URL for now)
   - Set `API_GATEWAY_URL` to your Railway URL (will be configured in Step 5)

5. Click "Deploy"
6. Once deployed, go to Settings → General → Project ID
7. Copy the Project ID and add it to GitHub Secrets as `VERCEL_PROJECT_ID_<app-name>`

Apps to create:
- [ ] unified-dashboard
- [ ] punch-clock
- [ ] flair-ai
- [ ] waiter-ai
- [ ] guest-ai
- [ ] serene-ai
- [ ] ai-artisan

#### Option B: Via Vercel CLI (Faster but requires initial setup)

```bash
cd apps/unified-dashboard
vercel link  # Link to your project
vercel env pull  # Pull environment variables
vercel deploy --prod
```

Repeat for all 7 apps.

### 4.2 Configure Custom Domains (Optional)

For each app in Vercel:

1. Go to Project Settings → Domains
2. Add custom domain:
   - unified-dashboard → `dashboard.yourdomain.com`
   - punch-clock → `punch-clock.yourdomain.com`
   - flair-ai → `flair-ai.yourdomain.com`
   - waiter-ai → `restaurant-ai.yourdomain.com`
   - guest-ai → `guest-ai.yourdomain.com`
   - serene-ai → `serene-ai.yourdomain.com`
   - ai-artisan → `ai-artisan.yourdomain.com`

3. Add DNS records to your domain provider:
   ```
   Type: CNAME
   Name: <subdomain>
   Value: cname.vercel-dns.com
   ```

## 🚂 Step 5: Railway Setup (API Gateway)

### 5.1 Create Railway Project

1. Go to https://railway.app/new
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Railway will detect the `railway.toml` configuration

### 5.2 Configure Service

1. **Service Name**: api-gateway
2. **Root Directory**: Leave as `/` (root)
3. **Environment Variables**: Click Variables → Raw Editor and paste:

```env
DATABASE_URL=<your_supabase_connection_string>
DIRECT_DATABASE_URL=<your_supabase_direct_connection_string>
GEMINI_API_KEY=<your_gemini_api_key>
DEEPSEEK_API_KEY=<your_deepseek_api_key>
SUPABASE_URL=<your_supabase_url>
SUPABASE_ANON_KEY=<your_supabase_anon_key>
SENTRY_DSN=<your_sentry_dsn>
NODE_ENV=production
PORT=3000
```

4. Click Deploy

### 5.3 Get Railway URL

1. Once deployed, Railway will provide a URL like `api-gateway-production-xxxx.up.railway.app`
2. Copy this URL
3. Update the `API_GATEWAY_URL` environment variable in all Vercel projects:
   - Go to each Vercel project
   - Settings → Environment Variables
   - Update `API_GATEWAY_URL` to `https://<railway-url>`
   - Redeploy the app

### 5.4 Configure Custom Domain (Optional)

1. In Railway project settings → Networking
2. Add custom domain: `api.yourdomain.com`
3. Add DNS record:
   ```
   Type: CNAME
   Name: api
   Value: <railway-provided-value>
   ```

## 📊 Step 6: Monitoring Setup

### 6.1 Sentry (Error Tracking)

Already configured via environment variables. Verify:

1. Go to https://sentry.io/
2. Check that errors are being reported (you can trigger a test error)
3. Set up email alerts in Sentry settings

### 6.2 Better Stack (Uptime Monitoring) - Optional

1. Go to https://betterstack.com/uptime
2. Import monitors from `betterstack.yml`:
   - Upload the file or manually create monitors for:
     - All 7 app URLs
     - API Gateway health check (`/health` endpoint)

3. Configure alerts:
   - Email: your email
   - Slack: your webhook URL (optional)

## ✅ Step 7: Verification

Run the deployment verification script:

```bash
./scripts/verify-deployment-ready.sh
```

### Manual Verification Checklist

- [ ] All 7 apps are accessible via their Vercel URLs or custom domains
- [ ] API Gateway health check responds: `curl https://<railway-url>/health`
- [ ] Sentry dashboard shows apps are connected
- [ ] Better Stack monitors show "Up" status
- [ ] GitHub Actions CI/CD pipeline runs successfully
- [ ] Database migrations completed (if applicable)
- [ ] All environment variables are set correctly

## 🔄 Step 8: Enable Automatic Deployments

Once everything is verified, push to main branch to test automatic deployments:

```bash
git add .
git commit -m "feat: ready for automatic deployment"
git push origin main
```

The CI/CD pipeline will:
1. ✅ Lint and type check all code
2. ✅ Build all packages
3. ✅ Build all apps
4. ✅ Run database migrations
5. ✅ Deploy all apps to Vercel
6. ✅ Deploy API Gateway to Railway
7. ✅ Send Slack notification (if configured)

Monitor the deployment:
- GitHub Actions: Repository → Actions tab
- Vercel: Dashboard → Deployments
- Railway: Dashboard → Deployments

## 🎉 Deployment Complete!

Your applications are now live:

### Production URLs
- Dashboard: https://dashboard.yourdomain.com (or Vercel URL)
- PUNCH-CLOCK: https://punch-clock.yourdomain.com
- FlairAi: https://flair-ai.yourdomain.com
- WaiterAi: https://restaurant-ai.yourdomain.com
- GuestAi: https://guest-ai.yourdomain.com
- Serene-AI: https://serene-ai.yourdomain.com
- Ai-Artisan: https://ai-artisan.yourdomain.com
- API Gateway: https://api.yourdomain.com

### Monitoring Dashboards
- Sentry: https://sentry.io/
- Better Stack: https://betterstack.com/
- Vercel Analytics: https://vercel.com/analytics
- Railway Metrics: https://railway.app/

## 📈 Post-Deployment

### Monitor Performance
- Check Vercel Analytics for page load times
- Review Sentry for any errors
- Monitor Better Stack for uptime
- Check Railway metrics for API performance

### Optimize Costs
- Verify Railway usage stays within $5/month budget
- Monitor Vercel bandwidth and function invocations
- Check Supabase database usage

### Next Steps
1. Set up custom domains (if not done)
2. Configure email alerts for monitoring
3. Set up staging environment (optional)
4. Review and optimize performance
5. Plan for scaling if needed

## 🔧 Troubleshooting

### Build Failures

**Issue**: App fails to build in Vercel
**Solution**: 
1. Check build logs in Vercel dashboard
2. Verify environment variables are set
3. Test build locally: `pnpm build --filter=@ecosystem/<app-name>`
4. Check for TypeScript errors

**Issue**: Packages not found during build
**Solution**:
1. Verify `pnpm install --frozen-lockfile` is set as install command
2. Check that root directory is set correctly
3. Ensure build command includes `cd ../..`

### API Gateway Issues

**Issue**: Railway deployment fails
**Solution**:
1. Check Railway logs
2. Verify health check endpoint responds
3. Check environment variables
4. Test locally: `cd packages/api-gateway && pnpm dev`

**Issue**: Health check fails
**Solution**:
1. Verify database connection
2. Check Prisma client is generated
3. Review Railway logs for errors

### Database Issues

**Issue**: Cannot connect to database
**Solution**:
1. Verify DATABASE_URL is correct
2. Check Supabase project is running
3. Verify IP allowlist (Supabase allows all by default)
4. Test connection: `psql $DATABASE_URL`

### Monitoring Issues

**Issue**: Sentry not receiving errors
**Solution**:
1. Verify SENTRY_DSN is set in all apps
2. Check Sentry project settings
3. Trigger a test error
4. Review Sentry debug logs

## 📞 Support

- Documentation: `docs/DEPLOYMENT.md`
- GitHub Issues: Create an issue in the repository
- Vercel Support: https://vercel.com/support
- Railway Support: https://railway.app/help
- Sentry Support: https://sentry.io/support/

---

**Deployment Status**: ✅ Infrastructure Ready for Production Deployment

**Target Performance**:
- Uptime: 99.9%
- Page Load: < 2s
- API Response: < 100ms
- Monthly Cost: $5-15

**Last Updated**: November 2025
