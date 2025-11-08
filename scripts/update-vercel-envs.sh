#!/bin/bash

# Vercel Environment Variable Update Script
# Updates API_GATEWAY_URL for all 7 Vercel apps

set -e

echo "🔧 Vercel Environment Variable Updater"
echo "========================================"
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

# Get API Gateway URL
API_GATEWAY_URL="${1:-}"

if [ -z "$API_GATEWAY_URL" ]; then
    # Try to get from Railway
    if command -v railway &> /dev/null; then
        print_info "Attempting to get Railway URL..."
        DOMAIN=$(railway domain 2>/dev/null)
        if [ -n "$DOMAIN" ]; then
            API_GATEWAY_URL="https://$DOMAIN"
            print_success "Found Railway URL: $API_GATEWAY_URL"
        fi
    fi
fi

if [ -z "$API_GATEWAY_URL" ]; then
    print_error "API Gateway URL is required"
    print_info "Usage: $0 <API_GATEWAY_URL>"
    print_info "Example: $0 https://api-gateway-production-xxxx.up.railway.app"
    exit 1
fi

# Ensure URL has protocol
if [[ ! "$API_GATEWAY_URL" =~ ^https?:// ]]; then
    API_GATEWAY_URL="https://$API_GATEWAY_URL"
fi

print_success "API Gateway URL: $API_GATEWAY_URL"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI is not installed"
    print_info "Install with: npm install -g vercel"
    exit 1
fi

print_success "Vercel CLI is installed"

# List of all 7 apps
APPS=(
    "unified-dashboard"
    "punch-clock"
    "flair-ai"
    "waiter-ai"
    "guest-ai"
    "serene-ai"
    "ai-artisan"
)

print_section "Updating Environment Variables"

UPDATED=0
FAILED=0

for app in "${APPS[@]}"; do
    print_info "Processing $app..."
    
    APP_DIR="apps/$app"
    
    if [ ! -d "$APP_DIR" ]; then
        print_error "  ↳ Directory not found: $APP_DIR"
        ((FAILED++))
        continue
    fi
    
    cd "$APP_DIR"
    
    # Remove existing API_GATEWAY_URL (if any)
    vercel env rm API_GATEWAY_URL production --yes > /dev/null 2>&1 || true
    vercel env rm API_GATEWAY_URL preview --yes > /dev/null 2>&1 || true
    
    # Add new API_GATEWAY_URL for production
    if echo "$API_GATEWAY_URL" | vercel env add API_GATEWAY_URL production > /dev/null 2>&1; then
        print_success "  ↳ Production environment updated"
    else
        print_error "  ↳ Failed to update production environment"
        ((FAILED++))
        cd ../..
        continue
    fi
    
    # Add new API_GATEWAY_URL for preview
    if echo "$API_GATEWAY_URL" | vercel env add API_GATEWAY_URL preview > /dev/null 2>&1; then
        print_success "  ↳ Preview environment updated"
    else
        print_warning "  ↳ Failed to update preview environment (non-critical)"
    fi
    
    ((UPDATED++))
    cd ../..
done

print_section "Update Summary"

echo ""
echo "Results:"
echo "  ✓ Updated: $UPDATED apps"
echo "  ✗ Failed:  $FAILED apps"
echo ""

if [ $FAILED -eq 0 ]; then
    print_success "All apps updated successfully!"
    
    # Ask about redeployment
    print_section "Redeployment"
    
    echo ""
    print_warning "The apps need to be redeployed for changes to take effect"
    read -p "Redeploy all apps now? (y/N): " -n 1 -r
    echo
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Starting redeployment of all apps..."
        
        for app in "${APPS[@]}"; do
            print_info "Redeploying $app..."
            
            cd "apps/$app"
            
            if vercel --prod --yes > /dev/null 2>&1; then
                print_success "  ↳ $app redeployed"
            else
                print_error "  ↳ Failed to redeploy $app"
            fi
            
            cd ../..
        done
        
        print_success "Redeployment complete!"
    else
        print_info "Skipped redeployment"
        print_warning "Remember to redeploy apps manually or trigger via git push"
    fi
else
    print_error "Some apps failed to update"
    print_info "Check the errors above and try again"
    exit 1
fi

# Verify connections
print_section "Connection Verification"

echo ""
read -p "Test connections from frontend to API Gateway? (y/N): " -n 1 -r
echo
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "This will be implemented in the verification script"
    print_info "Run: ./scripts/verify-deployment.sh"
else
    print_info "Skipped connection verification"
fi

print_section "Update Complete"

echo ""
print_success "Environment variables updated for all 7 apps!"
echo ""
print_info "Next steps:"
echo "  1. Wait for redeployments to complete (~5 minutes)"
echo "  2. Verify each app can reach the API Gateway"
echo "  3. Test end-to-end functionality"
echo "  4. Monitor for any errors in Vercel logs"
echo ""
print_info "Useful commands:"
echo "  • Check deployments: vercel ls"
echo "  • View logs: vercel logs <deployment-url>"
echo "  • List env vars: vercel env ls"
echo ""
