#!/bin/bash

# Railway Rollback Script
# Rolls back to the previous successful deployment

set -e

echo "🔄 Railway Deployment Rollback"
echo "==============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    print_info "Install with: npm install -g @railway/cli"
    exit 1
fi

print_success "Railway CLI is installed"

# Check if logged in to Railway
if ! railway whoami &> /dev/null; then
    print_error "Not logged in to Railway"
    print_info "Run: railway login"
    exit 1
fi

RAILWAY_USER=$(railway whoami 2>/dev/null || echo "unknown")
print_success "Logged in as: $RAILWAY_USER"

# Get current deployment info
print_section "Current Deployment Status"

print_info "Fetching deployment information..."
if railway status > /tmp/railway-status.txt 2>&1; then
    cat /tmp/railway-status.txt
    print_success "Status retrieved"
else
    print_error "Could not get deployment status"
    exit 1
fi

# Confirm rollback
print_section "Rollback Confirmation"

print_warning "This will roll back the API Gateway to the previous deployment"
echo ""
read -p "Are you sure you want to proceed? (yes/no): " -r
echo

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    print_info "Rollback cancelled"
    exit 0
fi

# Get Railway service URL before rollback
RAILWAY_URL=$(railway domain 2>/dev/null || echo "")
if [ -n "$RAILWAY_URL" ]; then
    print_info "Service URL: https://$RAILWAY_URL"
else
    print_warning "Could not retrieve service URL"
fi

# Perform rollback using Railway CLI
print_section "Performing Rollback"

print_info "Rolling back to previous deployment..."

# Railway CLI doesn't have a direct rollback command, so we need to use the API
# For now, we'll provide manual instructions
print_warning "Automatic rollback via CLI is not available"
echo ""
print_info "To rollback manually:"
echo "  1. Visit: https://railway.app/dashboard"
echo "  2. Select your project and API Gateway service"
echo "  3. Go to 'Deployments' tab"
echo "  4. Find the last successful deployment"
echo "  5. Click 'Redeploy' on that deployment"
echo ""

# Alternative: Rollback by redeploying a previous commit
print_section "Git-based Rollback"

print_info "You can also rollback by deploying a previous commit:"
echo ""

# Show last 5 commits
print_info "Recent commits:"
git --no-pager log --oneline -5

echo ""
read -p "Enter commit SHA to rollback to (or press Enter to skip): " COMMIT_SHA

if [ -n "$COMMIT_SHA" ]; then
    print_info "Deploying commit: $COMMIT_SHA"
    
    # Checkout the specific commit
    CURRENT_BRANCH=$(git branch --show-current)
    git checkout "$COMMIT_SHA" 2>/dev/null || {
        print_error "Invalid commit SHA"
        exit 1
    }
    
    # Deploy
    if railway up --detach; then
        print_success "Rollback deployment initiated"
        
        # Return to original branch
        git checkout "$CURRENT_BRANCH" 2>/dev/null
        
        print_info "Waiting for deployment to complete..."
        sleep 10
        
        # Check health
        print_section "Health Check"
        
        if [ -n "$RAILWAY_URL" ]; then
            print_info "Verifying health of rolled-back deployment..."
            
            if ./scripts/health-check.sh "https://$RAILWAY_URL" 15 2; then
                print_success "Rollback successful and service is healthy!"
            else
                print_error "Rollback deployment is not responding to health checks"
                print_info "Check Railway logs: railway logs"
            fi
        else
            print_warning "Could not verify health - no service URL available"
        fi
    else
        print_error "Rollback deployment failed"
        git checkout "$CURRENT_BRANCH" 2>/dev/null
        exit 1
    fi
else
    print_info "Skipping git-based rollback"
fi

print_section "Rollback Complete"

echo ""
print_info "Useful commands:"
echo "  • Check status: railway status"
echo "  • View logs: railway logs --follow"
echo "  • Open dashboard: railway open"
echo ""
