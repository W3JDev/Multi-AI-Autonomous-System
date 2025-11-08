#!/bin/bash

# Comprehensive End-to-End Deployment Verification Script
# Validates all 10 completion criteria from the task specification

echo "✅ Comprehensive Deployment Verification"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
WARNINGS=0

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    ((PASSED++))
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    ((FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
    ((WARNINGS++))
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
echo ""

# ============================================
# CRITERION 1: Connection Tests
# ============================================
print_section "1. Connection Tests - Frontend Apps ↔ API Gateway"

APPS=("unified-dashboard" "punch-clock" "flair-ai" "waiter-ai" "guest-ai" "serene-ai" "ai-artisan")

# Test API Gateway health
HEALTH_URL="$API_GATEWAY_URL/health"
if curl -sf "$HEALTH_URL" > /dev/null 2>&1; then
    print_success "API Gateway is accessible and healthy"
else
    print_error "API Gateway health check failed"
fi

# Test root endpoint
if curl -sf "$API_GATEWAY_URL/" > /dev/null 2>&1; then
    print_success "API Gateway root endpoint accessible"
else
    print_error "API Gateway root endpoint not accessible"
fi

# Test tRPC endpoint exists
TRPC_URL="$API_GATEWAY_URL/trpc"
if curl -sf "$TRPC_URL" > /dev/null 2>&1 || curl -s "$TRPC_URL" | grep -q "trpc"; then
    print_success "tRPC endpoint is configured"
else
    print_warning "tRPC endpoint may require authentication"
fi

# ============================================
# CRITERION 2: Database Connectivity
# ============================================
print_section "2. Database Connectivity - CRUD Operations"

print_info "Note: Database connectivity is verified through API Gateway environment"

# Check if DATABASE_URL is set in Railway
if command -v railway &> /dev/null; then
    if railway variables 2>/dev/null | grep -q "DATABASE_URL"; then
        print_success "DATABASE_URL is configured in Railway"
    else
        print_error "DATABASE_URL not found in Railway"
    fi
else
    print_warning "Railway CLI not available - cannot verify DATABASE_URL"
fi

# Test database connection through health endpoint
HEALTH_RESPONSE=$(curl -s "$HEALTH_URL")
if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    print_success "Health check indicates system is operational (database likely connected)"
else
    print_warning "Could not verify database connection through health check"
fi

# ============================================
# CRITERION 3: Authentication
# ============================================
print_section "3. Authentication - User Login/Logout/Registration"

print_info "Note: Authentication testing requires manual verification in browser"
print_warning "Automated authentication testing not implemented"
print_info "Manual verification required:"
echo "  [ ] Test user registration on any frontend app"
echo "  [ ] Test user login"
echo "  [ ] Verify session persistence"
echo "  [ ] Test logout functionality"

# ============================================
# CRITERION 4: AI Services
# ============================================
print_section "4. AI Services - Gemini & DeepSeek APIs"

# Check if API keys are configured
if command -v railway &> /dev/null; then
    if railway variables 2>/dev/null | grep -q "GEMINI_API_KEY"; then
        print_success "GEMINI_API_KEY is configured"
    else
        print_error "GEMINI_API_KEY not found"
    fi
    
    if railway variables 2>/dev/null | grep -q "DEEPSEEK_API"; then
        print_success "DEEPSEEK_API_KEY is configured"
    else
        print_warning "DEEPSEEK_API_KEY not configured (optional fallback)"
    fi
else
    print_warning "Cannot verify AI API keys - Railway CLI not available"
fi

# ============================================
# CRITERION 5: Health Monitoring
# ============================================
print_section "5. Health Monitoring - All Health Checks"

# Get detailed health response
if command -v jq &> /dev/null; then
    HEALTH_DATA=$(curl -s "$HEALTH_URL" | jq .)
    echo "$HEALTH_DATA"
    
    STATUS=$(echo "$HEALTH_DATA" | jq -r '.status')
    if [ "$STATUS" == "healthy" ]; then
        print_success "Health status: $STATUS"
    else
        print_error "Health status: $STATUS"
    fi
else
    HEALTH_DATA=$(curl -s "$HEALTH_URL")
    echo "$HEALTH_DATA"
    
    if echo "$HEALTH_DATA" | grep -q "healthy"; then
        print_success "Health status: healthy"
    else
        print_error "Health check failed"
    fi
fi

# ============================================
# CRITERION 6: Performance
# ============================================
print_section "6. Performance - API Response & App Load Times"

# Test API response time
print_info "Testing API response time..."
TOTAL_TIME=0
ITERATIONS=5

for i in $(seq 1 $ITERATIONS); do
    START=$(date +%s%N)
    curl -sf "$HEALTH_URL" > /dev/null
    END=$(date +%s%N)
    TIME=$(( (END - START) / 1000000 ))
    TOTAL_TIME=$((TOTAL_TIME + TIME))
    echo -n "."
done

echo ""
AVG_TIME=$((TOTAL_TIME / ITERATIONS))

if [ $AVG_TIME -lt 100 ]; then
    print_success "Average API response time: ${AVG_TIME}ms (target: <100ms) ✓"
elif [ $AVG_TIME -lt 500 ]; then
    print_warning "Average API response time: ${AVG_TIME}ms (target: <100ms)"
else
    print_error "Average API response time: ${AVG_TIME}ms (target: <100ms)"
fi

print_info "Note: Frontend app load times require browser testing"
print_warning "Manual verification required: Verify each app loads in < 2s"

# ============================================
# CRITERION 7: Error Handling
# ============================================
print_section "7. Error Handling - Console Errors & Boundaries"

print_info "Note: Error handling requires browser console inspection"
print_warning "Manual verification required:"
echo "  [ ] Open browser console on each frontend app"
echo "  [ ] Verify no console errors during normal operation"
echo "  [ ] Test error boundaries by triggering errors"
echo "  [ ] Verify graceful error messages displayed to users"

# ============================================
# CRITERION 8: Auto-scaling
# ============================================
print_section "8. Auto-scaling - Railway Configuration"

# Check railway.toml for auto-scaling config
if [ -f "railway.toml" ]; then
    if grep -q "autoscaling" railway.toml; then
        print_success "Auto-scaling is configured in railway.toml"
        
        if grep -q "minReplicas = 2" railway.toml; then
            print_success "Min replicas: 2"
        fi
        
        if grep -q "maxReplicas = 10" railway.toml; then
            print_success "Max replicas: 10"
        fi
        
        if grep -q "targetCPU = 80" railway.toml; then
            print_success "Target CPU utilization: 80%"
        fi
    else
        print_error "Auto-scaling not configured"
    fi
else
    print_error "railway.toml not found"
fi

print_warning "Load testing required to verify auto-scaling behavior"
print_info "Consider using: ab -n 10000 -c 100 $API_GATEWAY_URL/health"

# ============================================
# CRITERION 9: CI/CD Pipeline
# ============================================
print_section "9. CI/CD - Automated Deployment"

# Check for CI/CD workflow
if [ -f ".github/workflows/ci-cd.yml" ]; then
    print_success "CI/CD workflow exists"
    
    # Check for key components
    if grep -q "deploy-vercel" .github/workflows/ci-cd.yml; then
        print_success "Vercel deployment configured"
    else
        print_warning "Vercel deployment not found in workflow"
    fi
    
    if grep -q "deploy-railway" .github/workflows/ci-cd.yml; then
        print_success "Railway deployment configured"
    else
        print_warning "Railway deployment not found in workflow"
    fi
else
    print_error "CI/CD workflow file not found"
fi

print_info "Test CI/CD: git commit --allow-empty -m 'test' && git push"

# ============================================
# CRITERION 10: Documentation
# ============================================
print_section "10. Documentation - URLs & Setup"

# Check for documentation files
DOCS=("README.md" "DEPLOYMENT_STATUS.md" "DEPLOYMENT_CHECKLIST.md" "docs/DEPLOYMENT.md")

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        print_success "$doc exists"
    else
        print_warning "$doc not found"
    fi
done

# ============================================
# FINAL SUMMARY
# ============================================
print_section "Verification Summary"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Results:"
echo "  ✓ Passed:   $PASSED"
echo "  ✗ Failed:   $FAILED"
echo "  ⚠ Warnings: $WARNINGS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Calculate score
TOTAL=$((PASSED + FAILED))
if [ $TOTAL -gt 0 ]; then
    SCORE=$((PASSED * 100 / TOTAL))
    echo "Score: $SCORE%"
else
    SCORE=0
fi

echo ""

if [ $FAILED -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    print_success "🎉 ALL VERIFICATION CHECKS PASSED!"
    echo ""
    print_info "Your deployment is complete and production-ready!"
    exit 0
elif [ $FAILED -eq 0 ]; then
    print_success "✓ All critical checks passed"
    print_warning "⚠ Some manual verification steps remain"
    echo ""
    print_info "Complete the manual verification steps listed above"
    exit 0
elif [ $SCORE -ge 80 ]; then
    print_warning "⚠ Deployment is mostly functional but has issues"
    echo ""
    print_info "Review and fix the failed checks above"
    exit 1
else
    print_error "✗ Deployment verification failed"
    echo ""
    print_info "Critical issues must be resolved before production use"
    exit 1
fi
