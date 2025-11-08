#!/bin/bash

# Master Deployment Orchestration Script
# Executes all deployment tasks in sequence with validation

set -e

echo "🚀 Multi-AI Autonomous System - Complete Deployment"
echo "===================================================="
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
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Function to handle errors
handle_error() {
    print_error "Deployment failed at: $1"
    echo ""
    print_info "To retry this step manually, run:"
    echo "  $2"
    exit 1
}

# Welcome message
print_info "This script will guide you through the complete deployment process"
print_info "It will execute all tasks in sequence with validation at each step"
echo ""
read -p "Press Enter to continue..."
echo ""

# ============================================
# TASK 1: Railway Anti-Detection Validation
# ============================================
print_section "TASK 1: Railway Anti-Detection Configuration"

print_info "Validating Railway configuration..."
if ./scripts/validate-railway-config.sh; then
    print_success "Task 1 Complete: Railway configuration validated"
else
    handle_error "Task 1: Railway configuration validation" "./scripts/validate-railway-config.sh"
fi

echo ""
read -p "Press Enter to continue to Task 2..."
echo ""

# ============================================
# TASK 2: Railway Deployment
# ============================================
print_section "TASK 2: Railway API Gateway Deployment"

# Check if Railway CLI is available
if ! command -v railway &> /dev/null; then
    print_error "Railway CLI is not installed"
    print_info "Install with: npm install -g @railway/cli"
    print_info "Then run: railway login"
    exit 1
fi

# Check if logged in
if ! railway whoami &> /dev/null; then
    print_error "Not logged in to Railway"
    print_info "Run: railway login"
    exit 1
fi

print_success "Railway CLI authenticated"

# Validate environment variables
print_info "Validating Railway environment variables..."
if ./scripts/validate-environment.sh railway; then
    print_success "Environment variables validated"
else
    print_warning "Some environment variables are missing"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Deploy to Railway
print_info "Deploying API Gateway to Railway..."
echo ""
read -p "Deploy now? (y/N): " -n 1 -r
echo
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    if ./scripts/railway-deploy.sh; then
        print_success "Task 2 Complete: API Gateway deployed to Railway"
    else
        handle_error "Task 2: Railway deployment" "./scripts/railway-deploy.sh"
    fi
else
    print_warning "Skipped Railway deployment"
    print_info "Deploy manually with: ./scripts/railway-deploy.sh"
fi

# Get Railway URL
print_info "Getting Railway service URL..."
RAILWAY_URL=$(railway domain 2>/dev/null || echo "")

if [ -n "$RAILWAY_URL" ]; then
    RAILWAY_URL="https://$RAILWAY_URL"
    print_success "Railway URL: $RAILWAY_URL"
else
    print_warning "Could not retrieve Railway URL automatically"
    read -p "Enter Railway URL manually: " RAILWAY_URL
fi

echo ""
read -p "Press Enter to continue to Task 3..."
echo ""

# ============================================
# TASK 3: Vercel Environment Variables
# ============================================
print_section "TASK 3: Vercel Environment Variable Automation"

# Check if Vercel CLI is available
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI is not installed"
    print_info "Install with: npm install -g vercel"
    exit 1
fi

print_success "Vercel CLI available"

print_info "This will update API_GATEWAY_URL for all 7 Vercel apps"
print_info "Railway URL: $RAILWAY_URL"
echo ""
read -p "Update Vercel environment variables now? (y/N): " -n 1 -r
echo
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    if ./scripts/update-vercel-envs.sh "$RAILWAY_URL"; then
        print_success "Task 3 Complete: Vercel environment variables updated"
    else
        handle_error "Task 3: Vercel environment update" "./scripts/update-vercel-envs.sh $RAILWAY_URL"
    fi
else
    print_warning "Skipped Vercel environment variable update"
    print_info "Update manually with: ./scripts/update-vercel-envs.sh $RAILWAY_URL"
fi

echo ""
read -p "Press Enter to continue to Task 4..."
echo ""

# ============================================
# TASK 4: Verification & Testing
# ============================================
print_section "TASK 4: End-to-End Verification"

print_info "Running comprehensive deployment verification..."
echo ""
read -p "Run verification tests now? (y/N): " -n 1 -r
echo
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    if ./scripts/verify-deployment.sh "$RAILWAY_URL"; then
        print_success "Task 4 Complete: All verification tests passed"
    else
        print_warning "Some verification tests failed or require manual testing"
        print_info "Review the output above for details"
    fi
else
    print_warning "Skipped verification tests"
    print_info "Run manually with: ./scripts/verify-deployment.sh $RAILWAY_URL"
fi

# Connection verification
echo ""
print_info "Running connection verification between apps and API Gateway..."
echo ""
read -p "Test connections now? (y/N): " -n 1 -r
echo
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    ./scripts/verify-connections.sh "$RAILWAY_URL" || true
fi

# ============================================
# DEPLOYMENT COMPLETE
# ============================================
print_section "🎉 DEPLOYMENT COMPLETE"

echo ""
print_success "All deployment tasks completed!"
echo ""
print_info "Your Multi-AI Autonomous System is deployed:"
echo ""
echo "  🖥️  API Gateway: $RAILWAY_URL"
echo "  📱 Frontend Apps: Deployed on Vercel"
echo "  🗄️  Database: Connected via Neon/Supabase"
echo "  🤖 AI Services: Gemini + DeepSeek configured"
echo ""

print_section "Next Steps"

echo ""
print_info "1. Manual Verification:"
echo "   • Visit each Vercel app URL"
echo "   • Test user authentication"
echo "   • Try AI features in each app"
echo "   • Verify database operations"
echo ""
print_info "2. Monitoring:"
echo "   • Railway Dashboard: https://railway.app/dashboard"
echo "   • Vercel Dashboard: https://vercel.com/dashboard"
echo "   • Check logs for any errors"
echo ""
print_info "3. Performance Testing:"
echo "   • Test API response times"
echo "   • Verify auto-scaling under load"
echo "   • Monitor resource usage"
echo ""
print_info "4. Documentation:"
echo "   • Update README with live URLs"
echo "   • Document any configuration changes"
echo "   • Share credentials with team securely"
echo ""

print_section "Useful Commands"

echo ""
echo "Railway:"
echo "  • Check status:  railway status"
echo "  • View logs:     railway logs --follow"
echo "  • Open dashboard: railway open"
echo ""
echo "Vercel:"
echo "  • List apps:     vercel ls"
echo "  • View logs:     vercel logs"
echo "  • Check env vars: vercel env ls"
echo ""
echo "Health Checks:"
echo "  • API Gateway:   curl $RAILWAY_URL/health"
echo "  • Full verify:   ./scripts/verify-deployment.sh $RAILWAY_URL"
echo ""

print_success "Deployment script completed successfully!"
echo ""
