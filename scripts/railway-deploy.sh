#!/bin/bash

# Railway Deployment Script for API Gateway
# This script automates the deployment of the API Gateway to Railway

set -e

echo "🚂 Railway API Gateway Deployment Script"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_section() {
    echo ""
    echo -e "${BLUE}━━━ $1 ━━━${NC}"
}

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    print_error "Railway CLI is not installed"
    print_info "Install it with: npm install -g @railway/cli"
    print_info "Or using curl: curl -fsSL https://railway.app/install.sh | sh"
    exit 1
fi

print_success "Railway CLI is installed"

# Check if logged in to Railway
print_section "Authentication Check"
if railway whoami &> /dev/null; then
    RAILWAY_USER=$(railway whoami 2>/dev/null || echo "unknown")
    print_success "Logged in to Railway as: $RAILWAY_USER"
else
    print_error "Not logged in to Railway"
    print_info "Run: railway login"
    exit 1
fi

# Verify .railwayignore exists
print_section "Configuration Verification"
if [ -f ".railwayignore" ]; then
    print_success ".railwayignore exists - frontend apps will be ignored"
else
    print_warning ".railwayignore not found - Railway may auto-detect unwanted services"
fi

if [ -f "railway.toml" ]; then
    print_success "railway.toml exists"
else
    print_error "railway.toml not found"
    exit 1
fi

# Build API Gateway locally first to verify it works
print_section "Pre-Deployment Build Verification"
print_info "Building API Gateway locally..."

if pnpm install --frozen-lockfile > /dev/null 2>&1; then
    print_success "Dependencies installed"
else
    print_error "Failed to install dependencies"
    exit 1
fi

if pnpm build --filter=@repo/api-gateway > /dev/null 2>&1; then
    print_success "API Gateway builds successfully"
else
    print_error "API Gateway build failed"
    print_info "Fix build errors before deploying to Railway"
    exit 1
fi

# Check for required environment variables
print_section "Environment Variables Check"
print_info "Checking Railway environment variables..."

REQUIRED_VARS=("DATABASE_URL" "GEMINI_API_KEY" "NODE_ENV")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if railway variables | grep -q "^$var"; then
        print_success "$var is set"
    else
        print_warning "$var is not set in Railway"
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    print_warning "Missing environment variables: ${MISSING_VARS[*]}"
    print_info "Set them with: railway variables set <VAR_NAME>=<value>"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Deploy to Railway
print_section "Deployment"
print_info "Deploying API Gateway to Railway..."

if railway up --detach; then
    print_success "Deployment initiated successfully"
else
    print_error "Deployment failed"
    exit 1
fi

print_info "Waiting for deployment to complete..."
sleep 5

# Get deployment status
print_section "Deployment Status"
if railway status; then
    print_success "Deployment status retrieved"
else
    print_warning "Could not get deployment status"
fi

# Try to get the deployment URL
print_section "Service URL"
RAILWAY_URL=$(railway domain 2>/dev/null || echo "")
if [ -n "$RAILWAY_URL" ]; then
    print_success "Service URL: https://$RAILWAY_URL"
    echo ""
    print_info "Save this URL for configuring Vercel apps:"
    echo "  API_GATEWAY_URL=https://$RAILWAY_URL"
else
    print_warning "Could not retrieve service URL automatically"
    print_info "Get it from: railway domain"
fi

# Wait for health check
print_section "Health Check Verification"
if [ -n "$RAILWAY_URL" ]; then
    print_info "Waiting for service to be healthy..."
    RETRIES=0
    MAX_RETRIES=30
    
    while [ $RETRIES -lt $MAX_RETRIES ]; do
        if curl -sf "https://$RAILWAY_URL/health" > /dev/null 2>&1; then
            print_success "Health check passed!"
            
            # Show health check response
            HEALTH_RESPONSE=$(curl -s "https://$RAILWAY_URL/health")
            echo ""
            print_info "Health check response:"
            echo "$HEALTH_RESPONSE" | jq . 2>/dev/null || echo "$HEALTH_RESPONSE"
            break
        else
            ((RETRIES++))
            echo -n "."
            sleep 2
        fi
    done
    
    if [ $RETRIES -eq $MAX_RETRIES ]; then
        print_error "Health check failed after $MAX_RETRIES attempts"
        print_info "Check Railway logs: railway logs"
        exit 1
    fi
else
    print_warning "Skipping health check - no URL available"
    print_info "Manually verify: railway domain && curl https://\$(railway domain)/health"
fi

# Show logs preview
print_section "Recent Logs"
print_info "Last 20 log lines:"
railway logs --tail 20 || print_warning "Could not fetch logs"

# Final summary
print_section "Deployment Complete"
print_success "API Gateway deployed successfully!"
echo ""
print_info "Next steps:"
echo "  1. Verify health endpoint: curl https://$RAILWAY_URL/health"
echo "  2. Update Vercel apps with API_GATEWAY_URL=https://$RAILWAY_URL"
echo "  3. Test API endpoints from frontend apps"
echo "  4. Monitor logs: railway logs --follow"
echo ""
print_info "Useful commands:"
echo "  • View service: railway open"
echo "  • Check status: railway status"
echo "  • View logs: railway logs"
echo "  • Set env var: railway variables set KEY=value"
echo ""
print_success "Deployment script completed successfully!"
