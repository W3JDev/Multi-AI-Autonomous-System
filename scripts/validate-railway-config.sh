#!/bin/bash

# Railway Configuration Validation Script
# This script validates that Railway will only detect the API Gateway service

# Don't exit on error - we want to see all validation results
# set -e

echo "🔍 Railway Configuration Validation"
echo "====================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Function to print colored output
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

# Check 1: Verify .railwayignore exists
print_section "Railway Ignore Configuration"

if [ -f ".railwayignore" ]; then
    print_success ".railwayignore file exists"
    
    # Verify it ignores frontend apps
    APPS=("unified-dashboard" "punch-clock" "flair-ai" "waiter-ai" "guest-ai" "serene-ai" "ai-artisan")
    ALL_IGNORED=true
    
    for app in "${APPS[@]}"; do
        if grep -q "apps/$app/" .railwayignore; then
            print_success "Frontend app '$app' is in .railwayignore"
        else
            print_error "Frontend app '$app' is NOT ignored"
            ALL_IGNORED=false
        fi
    done
    
    if [ "$ALL_IGNORED" = true ]; then
        print_success "All 7 frontend apps are properly ignored"
    else
        print_error "Some frontend apps are not ignored - Railway may auto-detect them"
    fi
else
    print_error ".railwayignore file is missing"
    print_info "Create it to prevent Railway from detecting frontend apps"
fi

# Check 2: Verify railway.toml configuration
print_section "Railway TOML Configuration"

if [ -f "railway.toml" ]; then
    print_success "railway.toml file exists"
    
    # Check for API Gateway specific configuration
    if grep -q "api-gateway" railway.toml; then
        print_success "API Gateway is targeted in railway.toml"
    else
        print_warning "API Gateway not explicitly mentioned in railway.toml"
    fi
    
    # Check for build command
    if grep -q "buildCommand" railway.toml; then
        print_success "Build command is configured"
        BUILD_CMD=$(grep "buildCommand" railway.toml)
        echo "  $BUILD_CMD"
    else
        print_error "Build command not configured"
    fi
    
    # Check for start command
    if grep -q "startCommand" railway.toml; then
        print_success "Start command is configured"
        START_CMD=$(grep "startCommand" railway.toml)
        echo "  $START_CMD"
    else
        print_error "Start command not configured"
    fi
    
    # Check for health check
    if grep -q "healthcheckPath" railway.toml; then
        print_success "Health check path is configured"
        HEALTH_PATH=$(grep "healthcheckPath" railway.toml)
        echo "  $HEALTH_PATH"
    else
        print_warning "Health check path not configured"
    fi
    
    # Check for auto-scaling
    if grep -q "\[deploy.autoscaling\]" railway.toml; then
        print_success "Auto-scaling is configured"
        
        if grep -q "minReplicas = 2" railway.toml; then
            print_success "Min replicas set to 2"
        fi
        
        if grep -q "maxReplicas = 10" railway.toml; then
            print_success "Max replicas set to 10"
        fi
    else
        print_warning "Auto-scaling not configured"
    fi
else
    print_error "railway.toml file is missing"
    exit 1
fi

# Check 3: Verify API Gateway exists and builds
print_section "API Gateway Package"

if [ -d "packages/api-gateway" ]; then
    print_success "API Gateway package exists"
    
    if [ -f "packages/api-gateway/package.json" ]; then
        print_success "API Gateway package.json exists"
        
        # Check package name
        if grep -q '"name": "@repo/api-gateway"' packages/api-gateway/package.json; then
            print_success "Package name is correct: @repo/api-gateway"
        else
            print_error "Package name mismatch in API Gateway"
        fi
        
        # Check for required scripts
        if grep -q '"build"' packages/api-gateway/package.json; then
            print_success "Build script exists"
        else
            print_error "Build script missing"
        fi
        
        if grep -q '"start"' packages/api-gateway/package.json; then
            print_success "Start script exists"
        else
            print_error "Start script missing"
        fi
    else
        print_error "API Gateway package.json not found"
    fi
    
    if [ -f "packages/api-gateway/src/index.ts" ]; then
        print_success "API Gateway source code exists"
        
        # Check for health endpoint
        if grep -q "/health" packages/api-gateway/src/index.ts; then
            print_success "Health endpoint is implemented"
        else
            print_warning "Health endpoint may not be implemented"
        fi
    else
        print_error "API Gateway source code not found"
    fi
else
    print_error "API Gateway package directory not found"
fi

# Check 4: Verify frontend apps are properly separated
print_section "Frontend Applications Structure"

APPS=("unified-dashboard" "punch-clock" "flair-ai" "waiter-ai" "guest-ai" "serene-ai" "ai-artisan")
for app in "${APPS[@]}"; do
    if [ -d "apps/$app" ]; then
        print_success "Frontend app '$app' exists in apps/"
        
        # Check for Vercel configuration
        if [ -f "apps/$app/vercel.json" ]; then
            print_success "  ↳ Has vercel.json (will deploy to Vercel)"
        else
            print_warning "  ↳ Missing vercel.json"
        fi
    else
        print_error "Frontend app '$app' not found"
    fi
done

# Check 5: Test build command
print_section "Build Test (API Gateway Only)"

print_info "Testing if API Gateway builds successfully..."
if pnpm build --filter=@repo/api-gateway > /tmp/railway-build-test.log 2>&1; then
    print_success "API Gateway builds successfully"
else
    print_error "API Gateway build failed"
    print_info "Check /tmp/railway-build-test.log for details"
    tail -20 /tmp/railway-build-test.log
fi

# Check 6: Verify no frontend apps in build output
print_section "Build Isolation Verification"

if grep -qi "unified-dashboard\|punch-clock\|flair-ai\|waiter-ai\|guest-ai\|serene-ai\|ai-artisan" /tmp/railway-build-test.log; then
    print_warning "Frontend app names appear in API Gateway build output"
    print_info "This may indicate unwanted dependencies"
else
    print_success "Build output contains only API Gateway (no frontend apps)"
fi

# Final summary
print_section "Validation Summary"

echo ""
echo "Results:"
echo "  ✓ Passed:   $PASSED"
echo "  ✗ Failed:   $FAILED"
echo "  ⚠ Warnings: $WARNINGS"
echo ""

if [ $FAILED -eq 0 ]; then
    print_success "Railway configuration is valid!"
    echo ""
    print_info "Railway will only detect and deploy the API Gateway service"
    print_info "All 7 frontend apps will be ignored and must be deployed to Vercel separately"
    echo ""
    print_info "Next steps:"
    echo "  1. Deploy to Railway: ./scripts/railway-deploy.sh"
    echo "  2. Get Railway URL: railway domain"
    echo "  3. Update Vercel apps: ./scripts/update-vercel-envs.sh"
    exit 0
else
    print_error "Railway configuration has issues that must be fixed"
    print_info "Fix the errors above before deploying to Railway"
    exit 1
fi
