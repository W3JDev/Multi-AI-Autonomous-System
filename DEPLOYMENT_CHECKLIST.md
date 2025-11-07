# ✅ Quick Deployment Checklist

Use this checklist to deploy your applications to production.

## Pre-Deployment ✅

- [x] All packages build successfully (7/7)
- [x] All apps build successfully (7/7)
- [x] All configuration files present
- [x] CI/CD pipeline configured
- [x] Monitoring systems ready
- [x] Documentation complete
- [x] Security verified (0 vulnerabilities)

**Status**: Infrastructure ready ✅

---

## Step 1: Create Accounts (30-60 min)

- [ ] **Vercel**: https://vercel.com/signup (Free)
- [ ] **Railway**: https://railway.app/new (Hobby $5/mo)
- [ ] **Supabase**: https://supabase.com/dashboard (Free)
- [ ] **Gemini API**: https://makersuite.google.com/app/apikey (Free)
- [ ] **Sentry**: https://sentry.io/signup (Free - Optional)
- [ ] **Better Stack**: https://betterstack.com/signup (Free - Optional)

---

## Step 2: Setup Supabase (15 min)

1. Create new project in Supabase
2. Copy connection strings:
   - [ ] `DATABASE_URL` (pooled)
   - [ ] `DIRECT_DATABASE_URL` (direct)
3. Copy API credentials:
   - [ ] `SUPABASE_URL`
   - [ ] `SUPABASE_ANON_KEY`

---

## Step 3: Generate Secrets (5 min)

Run this command to generate NextAuth secret:
```bash
openssl rand -base64 32
```
- [ ] Copy output as `NEXTAUTH_SECRET`

Get Gemini API key:
- [ ] Go to https://makersuite.google.com/app/apikey
- [ ] Create key and copy as `GEMINI_API_KEY`

---

## Step 4: Configure GitHub Secrets (30-45 min)

Go to: Repository → Settings → Secrets and variables → Actions

### Required Secrets

**Vercel** (Get from https://vercel.com/account/tokens):
- [ ] `VERCEL_TOKEN` - Create at account/tokens
- [ ] `VERCEL_ORG_ID` - Find in account settings

**Note**: `VERCEL_PROJECT_ID_*` will be added after creating projects (Step 5)

**Railway** (Get from CLI or https://railway.app/account/tokens):
- [ ] `RAILWAY_TOKEN`

**Database**:
- [ ] `DATABASE_URL` - From Supabase (Step 2)

**Optional**:
- [ ] `SLACK_WEBHOOK` - For deployment notifications

---

## Step 5: Create Vercel Projects (60-90 min)

For each of the 7 apps, create a Vercel project:

### Apps to Deploy
- [ ] **unified-dashboard**
- [ ] **punch-clock**
- [ ] **flair-ai**
- [ ] **waiter-ai**
- [ ] **guest-ai**
- [ ] **serene-ai**
- [ ] **ai-artisan**

### For Each App:

1. Go to https://vercel.com/new
2. Import GitHub repository
3. Configure:
   - **Root Directory**: `apps/<app-name>`
   - **Build Command**: `cd ../.. && pnpm build --filter=@ecosystem/<app-name>`
   - **Output Directory**: `.next`
   - **Install Command**: `cd ../.. && pnpm install --frozen-lockfile`

4. Add Environment Variables (copy from template below)
5. Deploy
6. Get Project ID from Settings → General
7. Add to GitHub Secrets: `VERCEL_PROJECT_ID_<app-name>`

### Environment Variables for Each App:
```env
DATABASE_URL=<from_supabase>
DIRECT_DATABASE_URL=<from_supabase>
GEMINI_API_KEY=<from_google>
DEEPSEEK_API_KEY=<optional>
SUPABASE_URL=<from_supabase>
SUPABASE_ANON_KEY=<from_supabase>
NEXTAUTH_SECRET=<generated>
NEXTAUTH_URL=<will_be_vercel_url>
SENTRY_DSN=<optional>
API_GATEWAY_URL=<will_add_after_railway>
```

---

## Step 6: Deploy API Gateway to Railway (15-30 min)

1. Go to https://railway.app/new
2. Deploy from GitHub repo
3. Select your repository
4. Railway auto-detects `railway.toml`
5. Add environment variables (same as Vercel apps + `PORT=3000`)
6. Deploy
7. Copy Railway URL (e.g., `api-gateway-production-xxxx.up.railway.app`)

**Update Vercel Apps**:
- [ ] Go back to each Vercel project
- [ ] Update `API_GATEWAY_URL=https://<railway-url>`
- [ ] Redeploy each app

---

## Step 7: Verify Deployment (30 min)

### Test All Apps
- [ ] unified-dashboard → `https://unified-dashboard-xxx.vercel.app`
- [ ] punch-clock → `https://punch-clock-xxx.vercel.app`
- [ ] flair-ai → `https://flair-ai-xxx.vercel.app`
- [ ] waiter-ai → `https://waiter-ai-xxx.vercel.app`
- [ ] guest-ai → `https://guest-ai-xxx.vercel.app`
- [ ] serene-ai → `https://serene-ai-xxx.vercel.app`
- [ ] ai-artisan → `https://ai-artisan-xxx.vercel.app`

### Test API Gateway
```bash
curl https://<railway-url>/health
```
- [ ] Should return: `{"status":"healthy",...}`

### Check Monitoring
- [ ] Vercel Analytics showing traffic
- [ ] Railway Metrics showing activity
- [ ] Sentry receiving events (if configured)

---

## Step 8: Configure Custom Domains (Optional)

### For Each App in Vercel:
1. Settings → Domains → Add Domain
2. Add DNS CNAME:
   ```
   Name: <subdomain>
   Value: cname.vercel-dns.com
   ```

### Suggested Domains:
- [ ] `dashboard.yourdomain.com` → unified-dashboard
- [ ] `punch-clock.yourdomain.com` → punch-clock
- [ ] `flair-ai.yourdomain.com` → flair-ai
- [ ] `restaurant-ai.yourdomain.com` → waiter-ai
- [ ] `guest-ai.yourdomain.com` → guest-ai
- [ ] `serene-ai.yourdomain.com` → serene-ai
- [ ] `ai-artisan.yourdomain.com` → ai-artisan

### For API Gateway:
- [ ] Railway → Settings → Networking → Add Domain
- [ ] `api.yourdomain.com` → Add CNAME to Railway value

---

## Step 9: Setup Monitoring (Optional, 15-30 min)

### Sentry (Error Tracking)
1. Create organization at https://sentry.io
2. Create project for each app (or one shared project)
3. Copy DSN
4. Add `SENTRY_DSN` to Vercel environment variables
5. Redeploy apps

### Better Stack (Uptime Monitoring)
1. Create account at https://betterstack.com/uptime
2. Import monitors from `betterstack.yml` or create manually
3. Configure alerts (email/Slack)
4. Create public status page (optional)

---

## Step 10: Enable Automatic Deployments ✅

Once everything is verified:

1. Ensure all GitHub secrets are set
2. Push any change to `main` branch
3. GitHub Actions will automatically:
   - ✅ Build all packages
   - ✅ Build all apps
   - ✅ Deploy to Vercel (7 apps)
   - ✅ Deploy to Railway (API Gateway)
   - ✅ Send Slack notification (if configured)

**Test automatic deployment**:
```bash
git commit --allow-empty -m "test: verify automatic deployment"
git push origin main
```

- [ ] Check GitHub Actions tab
- [ ] Verify deployments in Vercel/Railway

---

## ✅ Deployment Complete!

### Your Live Applications:
1. Dashboard: https://_____.vercel.app
2. PUNCH-CLOCK: https://_____.vercel.app
3. FlairAi: https://_____.vercel.app
4. WaiterAi: https://_____.vercel.app
5. GuestAi: https://_____.vercel.app
6. Serene-AI: https://_____.vercel.app
7. Ai-Artisan: https://_____.vercel.app
8. API Gateway: https://_____.railway.app

### Monitoring:
- Vercel: https://vercel.com/dashboard
- Railway: https://railway.app/dashboard
- Sentry: https://sentry.io (if configured)
- Better Stack: https://betterstack.com (if configured)

---

## 💰 Cost Tracking

- [ ] Verify Railway usage (should be ~$5/month)
- [ ] Check Vercel bandwidth (free tier limits)
- [ ] Monitor Supabase database size
- [ ] Review costs monthly

---

## 📊 Success Metrics

After 24 hours, verify:
- [ ] All apps accessible 24/7
- [ ] API response times < 100ms
- [ ] Page load times < 2s
- [ ] No errors in Sentry
- [ ] Uptime > 99.9%
- [ ] Costs within budget ($5-15/month)

---

## 🆘 Troubleshooting

**Build fails in Vercel?**
→ Check build logs, verify environment variables

**API Gateway not responding?**
→ Check Railway logs, verify DATABASE_URL

**Apps can't connect to API?**
→ Verify API_GATEWAY_URL in Vercel environment variables

**More help?**
→ See `docs/DEPLOYMENT_EXECUTION.md` Section "Troubleshooting"

---

## 📞 Quick Reference

- **Deployment Guide**: `docs/DEPLOYMENT_EXECUTION.md`
- **Status Check**: `./scripts/verify-deployment-ready.sh`
- **Infrastructure Status**: `DEPLOYMENT_STATUS.md`
- **Summary**: `FINAL_SUMMARY.md`

---

**Estimated Total Time**: 2-4 hours (first deployment)  
**Future Deployments**: < 5 minutes (automatic via git push)

**Good luck with your deployment! 🚀**
