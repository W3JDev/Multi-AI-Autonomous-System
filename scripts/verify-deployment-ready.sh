#!/bin/bash

# Deployment Readiness Verification Script
# This script verifies that all infrastructure is ready for production deployment

# Don't exit on error - we want to check everything
# set -e

echo "🔍 W3JDev AI Ecosystem - Deployment Readiness Check"
echo "===================================================="
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

# Check 1: Verify all configuration files exist
print_section "Configuration Files"

check_file() {
    if [ -f "$1" ]; then
        print_success "$1 exists"
        return 0
    else
        print_error "$1 is missing"
        return 1
    fi
}

check_file "vercel.json"
check_file "railway.toml"
check_file "betterstack.yml"
check_file ".github/workflows/ci-cd.yml"
check_file "docs/DEPLOYMENT.md"

# Check individual app vercel configs
APPS=("unified-dashboard" "punch-clock" "flair-ai" "waiter-ai" "guest-ai" "serene-ai" "ai-artisan")
for app in "${APPS[@]}"; do
    check_file "apps/$app/vercel.json"
done

# Check 2: Verify all apps build successfully
print_section "Build Verification"

print_info "Testing full build..."
if pnpm build > /tmp/build-output.log 2>&1; then
    print_success "All packages and apps build successfully"
else
    print_error "Build failed - check /tmp/build-output.log"
    tail -30 /tmp/build-output.log
fi

# Check 3: Verify package.json scripts
print_section "NPM Scripts"

if grep -q '"build"' package.json; then
    print_success "Build script exists"
else
    print_error "Build script missing in package.json"
fi

if grep -q '"dev"' package.json; then
    print_success "Dev script exists"
else
    print_warning "Dev script missing in package.json"
fi

# Check 4: Verify monitoring package is built
print_section "Monitoring Package"

if [ -d "packages/monitoring/dist" ]; then
    print_success "Monitoring package is built"
else
    print_error "Monitoring package not built"
fi

if [ -f "packages/monitoring/src/health-check.ts" ]; then
    print_success "Health check implementation exists"
else
    print_error "Health check implementation missing"
fi

if [ -f "packages/monitoring/src/sentry.ts" ]; then
    print_success "Sentry integration exists"
else
    print_error "Sentry integration missing"
fi

# Check 5: Verify API Gateway
print_section "API Gateway"

if [ -d "packages/api-gateway" ]; then
    print_success "API Gateway package exists"
else
    print_error "API Gateway package missing"
fi

if [ -f "packages/api-gateway/src/index.ts" ]; then
    print_success "API Gateway entry point exists"
else
    print_error "API Gateway entry point missing"
fi

# Check 6: Verify Railway configuration
print_section "Railway Configuration"

if grep -q "builder = \"NIXPACKS\"" railway.toml; then
    print_success "Railway builder configured"
else
    print_error "Railway builder not configured"
fi

if grep -q "healthcheckPath = \"/health\"" railway.toml; then
    print_success "Health check path configured"
else
    print_error "Health check path not configured"
fi

if grep -E "autoscaling|enabled.*true" railway.toml > /dev/null; then
    print_success "Auto-scaling enabled"
else
    print_warning "Auto-scaling may not be configured"
fi

# Check 7: Verify Vercel configuration
print_section "Vercel Configuration"

if grep -q "buildCommand" vercel.json; then
    print_success "Build command configured in vercel.json"
else
    print_error "Build command missing in vercel.json"
fi

if grep -q "installCommand" vercel.json; then
    print_success "Install command configured in vercel.json"
else
    print_error "Install command missing in vercel.json"
fi

# Check 8: Verify CI/CD Pipeline
print_section "CI/CD Pipeline"

if grep -q "deploy-vercel" .github/workflows/ci-cd.yml; then
    print_success "Vercel deployment job exists"
else
    print_error "Vercel deployment job missing"
fi

if grep -q "deploy-railway" .github/workflows/ci-cd.yml; then
    print_success "Railway deployment job exists"
else
    print_error "Railway deployment job missing"
fi

if grep -q "migrate-database" .github/workflows/ci-cd.yml; then
    print_success "Database migration job exists"
else
    print_warning "Database migration job missing"
fi

# Check 9: Verify Environment Variable Templates
print_section "Environment Variables"

if [ -f ".env.template" ]; then
    print_success ".env.template exists"
    
    # Check for required variables
    required_vars=("DATABASE_URL" "GEMINI_API_KEY" "NEXTAUTH_SECRET" "SENTRY_DSN")
    for var in "${required_vars[@]}"; do
        if grep -q "$var" .env.template; then
            print_success "$var documented in template"
        else
            print_warning "$var not found in template"
        fi
    done
else
    print_error ".env.template missing"
fi

# Check 10: Verify Database Schema
print_section "Database"

if [ -f "packages/database/prisma/schema.prisma" ]; then
    print_success "Prisma schema exists"
else
    print_error "Prisma schema missing"
fi

if [ -d "packages/database/prisma/migrations" ]; then
    print_success "Database migrations exist"
else
    print_warning "No database migrations found"
fi

# Check 11: Verify Documentation
print_section "Documentation"

if [ -f "README.md" ]; then
    print_success "README.md exists"
else
    print_warning "README.md missing"
fi

if [ -f "docs/DEPLOYMENT.md" ]; then
    print_success "Deployment documentation exists"
    
    # Check if deployment doc has key sections
    if grep -q "Pre-Deployment Checklist" docs/DEPLOYMENT.md; then
        print_success "Pre-deployment checklist documented"
    else
        print_warning "Pre-deployment checklist missing"
    fi
    
    if grep -q "Deploy to Vercel" docs/DEPLOYMENT.md; then
        print_success "Vercel deployment documented"
    else
        print_warning "Vercel deployment steps missing"
    fi
    
    if grep -q "Deploy to Railway" docs/DEPLOYMENT.md; then
        print_success "Railway deployment documented"
    else
        print_warning "Railway deployment steps missing"
    fi
else
    print_error "Deployment documentation missing"
fi

# Check 12: Verify shared-ui package
print_section "Shared UI Package"

if [ -f "packages/shared-ui/src/lib/utils.ts" ]; then
    print_success "UI utilities (cn function) exists"
else
    print_error "UI utilities missing"
fi

if [ -d "packages/shared-ui/src/components" ]; then
    print_success "UI components directory exists"
else
    print_error "UI components directory missing"
fi

# Check 13: Git Status
print_section "Git Status"

if git diff --quiet && git diff --cached --quiet; then
    print_success "No uncommitted changes"
else
    print_warning "Uncommitted changes detected"
fi

if git rev-parse --verify HEAD > /dev/null 2>&1; then
    print_success "Git repository initialized"
else
    print_error "Not a git repository"
fi

# Summary
echo ""
echo "===================================================="
echo -e "${BLUE}📊 Deployment Readiness Summary${NC}"
echo "===================================================="
echo -e "${GREEN}Passed:   $PASSED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo -e "${RED}Failed:   $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}✅ All checks passed! Ready for deployment.${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠️  Ready for deployment with warnings.${NC}"
        echo -e "${YELLOW}Review warnings above before proceeding.${NC}"
        exit 0
    fi
else
    echo -e "${RED}❌ Not ready for deployment.${NC}"
    echo -e "${RED}Fix the failed checks before deploying.${NC}"
    exit 1
fi
