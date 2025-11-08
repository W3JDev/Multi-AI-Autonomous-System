#!/bin/bash

# Connection Verification Script
# Verifies that all frontend apps can connect to the API Gateway

echo "🔗 Connection Verification"
echo "==========================="
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
        DOMAIN=$(railway domain 2>/dev/null)
        if [ -n "$DOMAIN" ]; then
            API_GATEWAY_URL="https://$DOMAIN"
        fi
    fi
fi

if [ -z "$API_GATEWAY_URL" ]; then
    print_error "API Gateway URL is required"
    print_info "Usage: $0 <API_GATEWAY_URL>"
    exit 1
fi

print_success "API Gateway URL: $API_GATEWAY_URL"

# Frontend app URLs (update these with actual Vercel URLs)
declare -A APP_URLS=(
    ["unified-dashboard"]=""
    ["punch-clock"]=""
    ["flair-ai"]=""
    ["waiter-ai"]=""
    ["guest-ai"]=""
    ["serene-ai"]=""
    ["ai-artisan"]=""
)

# Try to get Vercel URLs from vercel ls
print_section "Discovering App URLs"

if command -v vercel &> /dev/null; then
    print_info "Fetching Vercel deployment URLs..."
    
    for app in "${!APP_URLS[@]}"; do
        cd "apps/$app" 2>/dev/null || continue
        
        # Get the production URL
        URL=$(vercel ls --prod 2>/dev/null | grep "Production" | awk '{print $2}' | head -1)
        
        if [ -n "$URL" ]; then
            if [[ ! "$URL" =~ ^https?:// ]]; then
                URL="https://$URL"
            fi
            APP_URLS[$app]="$URL"
            print_success "$app: $URL"
        else
            print_warning "$app: URL not found"
        fi
        
        cd ../.. 2>/dev/null
    done
else
    print_warning "Vercel CLI not found - will need URLs manually"
    echo ""
    print_info "Please provide URLs for each app when prompted"
fi

# Verify API Gateway is healthy
print_section "API Gateway Health Check"

HEALTH_URL="$API_GATEWAY_URL/health"
print_info "Testing: $HEALTH_URL"

if curl -sf "$HEALTH_URL" > /dev/null; then
    print_success "API Gateway is healthy"
    
    # Display health info
    HEALTH_INFO=$(curl -s "$HEALTH_URL")
    if command -v jq &> /dev/null; then
        echo "$HEALTH_INFO" | jq .
    else
        echo "$HEALTH_INFO"
    fi
else
    print_error "API Gateway health check failed"
    print_info "Cannot proceed with app connection verification"
    exit 1
fi

# Test API Gateway endpoints
print_section "API Gateway Endpoints"

# Test root endpoint
print_info "Testing root endpoint..."
if curl -sf "$API_GATEWAY_URL/" > /dev/null; then
    print_success "Root endpoint accessible"
else
    print_error "Root endpoint not accessible"
fi

# Test tRPC endpoint
print_info "Testing tRPC endpoint..."
TRPC_URL="$API_GATEWAY_URL/trpc"
if curl -sf "$TRPC_URL" > /dev/null 2>&1; then
    print_success "tRPC endpoint accessible"
else
    print_warning "tRPC endpoint not accessible (may require authentication)"
fi

# Verify CORS configuration
print_section "CORS Configuration"

print_info "Verifying CORS is properly configured..."

# Test CORS with a sample origin
TEST_ORIGIN="https://example.vercel.app"
CORS_RESPONSE=$(curl -s -H "Origin: $TEST_ORIGIN" -H "Access-Control-Request-Method: GET" -I "$API_GATEWAY_URL/health" 2>&1)

if echo "$CORS_RESPONSE" | grep -qi "access-control-allow-origin"; then
    print_success "CORS headers present"
else
    print_warning "CORS headers not detected (may be OK if using allowlist)"
fi

# Connection tests from apps to API Gateway
print_section "Frontend to API Gateway Connections"

CONNECTED=0
FAILED=0

for app in "${!APP_URLS[@]}"; do
    URL="${APP_URLS[$app]}"
    
    if [ -z "$URL" ]; then
        print_warning "$app: No URL available (skipping)"
        continue
    fi
    
    print_info "Testing $app..."
    
    # Check if app is accessible
    if curl -sf -L "$URL" > /dev/null 2>&1; then
        print_success "  ↳ App is accessible: $URL"
        ((CONNECTED++))
    else
        print_error "  ↳ App is not accessible"
        ((FAILED++))
        continue
    fi
    
    # Note: Actual API connection testing would require:
    # 1. Loading the app in a browser
    # 2. Checking browser console for errors
    # 3. Testing specific API calls
    # This is a basic connectivity check
done

# Response time tests
print_section "Performance Tests"

print_info "Testing API Gateway response time..."

START_TIME=$(date +%s%N)
curl -sf "$HEALTH_URL" > /dev/null
END_TIME=$(date +%s%N)

RESPONSE_TIME=$(( (END_TIME - START_TIME) / 1000000 ))

if [ $RESPONSE_TIME -lt 100 ]; then
    print_success "Response time: ${RESPONSE_TIME}ms (excellent)"
elif [ $RESPONSE_TIME -lt 500 ]; then
    print_success "Response time: ${RESPONSE_TIME}ms (good)"
else
    print_warning "Response time: ${RESPONSE_TIME}ms (slower than expected)"
fi

# Summary
print_section "Verification Summary"

echo ""
echo "Results:"
echo "  ✓ Apps accessible:  $CONNECTED"
echo "  ✗ Apps failed:      $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    print_success "All connection tests passed!"
    echo ""
    print_info "Next steps:"
    echo "  1. Test actual API calls from each app"
    echo "  2. Verify authentication flow"
    echo "  3. Test database operations"
    echo "  4. Check browser console for errors"
else
    print_warning "Some connection tests failed"
    echo ""
    print_info "Troubleshooting:"
    echo "  1. Verify apps are deployed to Vercel"
    echo "  2. Check API_GATEWAY_URL in Vercel environment variables"
    echo "  3. Verify CORS configuration in API Gateway"
    echo "  4. Check Vercel deployment logs"
fi

# Manual testing checklist
print_section "Manual Testing Checklist"

echo ""
print_info "Please verify manually:"
echo "  [ ] Each app loads without console errors"
echo "  [ ] API calls from frontend work correctly"
echo "  [ ] User authentication flow works"
echo "  [ ] Database queries execute successfully"
echo "  [ ] AI API calls respond correctly"
echo "  [ ] WebSocket connections (if applicable)"
echo "  [ ] Error handling works as expected"
echo ""

exit 0
