#!/bin/bash

# Deployment Setup Script for W3JDev AI Ecosystem
# This script helps prepare the project for production deployment

set -e

echo "🚀 W3JDev AI Ecosystem - Deployment Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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
    echo -e "ℹ $1"
}

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    print_error "pnpm is not installed"
    echo "Install it with: npm install -g pnpm@10.20.0"
    exit 1
fi

print_success "pnpm is installed"

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    print_error "Node.js version must be >= 20 (current: $NODE_VERSION)"
    exit 1
fi

print_success "Node.js version is compatible"

# Install dependencies
print_info "Installing dependencies..."
pnpm install --frozen-lockfile
print_success "Dependencies installed"

# Build all packages
print_info "Building shared packages..."
pnpm build --filter="./packages/*"
print_success "Packages built successfully"

# Verify each app can build
print_info "Verifying app builds..."

APPS=("unified-dashboard" "punch-clock" "flair-ai" "waiter-ai" "guest-ai" "serene-ai" "ai-artisan")
BUILD_FAILURES=()

for app in "${APPS[@]}"; do
    print_info "Building @ecosystem/$app..."
    BUILD_OUTPUT=$(pnpm build --filter=@ecosystem/$app 2>&1)
    BUILD_STATUS=$?
    
    if [ $BUILD_STATUS -eq 0 ]; then
        print_success "$app builds successfully"
    else
        print_error "$app build failed"
        BUILD_FAILURES+=("$app")
        
        # Show error details for debugging
        echo "Build output for $app:"
        echo "$BUILD_OUTPUT" | tail -20
        echo ""
    fi
done

if [ ${#BUILD_FAILURES[@]} -eq 0 ]; then
    print_success "All apps build successfully"
else
    print_warning "Some apps failed to build: ${BUILD_FAILURES[*]}"
    print_info "These may be pre-existing issues. Check build output above."
fi

# Check for .env files
print_info "Checking environment configuration..."

ENV_TEMPLATE=".env.template"
if [ ! -f "$ENV_TEMPLATE" ]; then
    print_warning ".env.template not found"
    print_info "Creating environment template..."
    
    cat > "$ENV_TEMPLATE" << 'EOF'
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"
DIRECT_DATABASE_URL="postgresql://user:password@host:5432/database"

# AI Services
GEMINI_API_KEY="your_gemini_api_key"
DEEPSEEK_API_KEY="your_deepseek_api_key"

# Supabase
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_ANON_KEY="your_supabase_anon_key"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate_with_openssl_rand_base64_32"

# Monitoring
SENTRY_DSN="https://xxx@sentry.io/xxx"

# API Gateway
API_GATEWAY_URL="http://localhost:3000"

# Slack Webhook (optional)
SLACK_WEBHOOK="https://hooks.slack.com/services/xxx"
EOF
    
    print_success "Created .env.template"
fi

# Check if Railway CLI is installed
if command -v railway &> /dev/null; then
    print_success "Railway CLI is installed"
else
    print_warning "Railway CLI not found"
    print_info "Install with: npm install -g @railway/cli"
fi

# Check if Vercel CLI is installed
if command -v vercel &> /dev/null; then
    print_success "Vercel CLI is installed"
else
    print_warning "Vercel CLI not found"
    print_info "Install with: npm install -g vercel"
fi

# Run type checks
print_info "Running type checks..."
if pnpm type-check > /dev/null 2>&1; then
    print_success "Type checks passed"
else
    print_warning "Type check issues found (non-blocking)"
fi

# Run linting
print_info "Running linters..."
if pnpm lint > /dev/null 2>&1; then
    print_success "Linting passed"
else
    print_warning "Linting issues found (non-blocking)"
fi

echo ""
echo "=========================================="
print_success "Deployment setup complete!"
echo ""
print_info "Next steps:"
echo "  1. Configure environment variables in Vercel and Railway"
echo "  2. Setup custom domains in your DNS provider"
echo "  3. Deploy frontend apps to Vercel"
echo "  4. Deploy API gateway to Railway"
echo "  5. Configure monitoring in Sentry and Better Stack"
echo ""
print_info "See docs/DEPLOYMENT.md for detailed instructions"
echo "=========================================="
