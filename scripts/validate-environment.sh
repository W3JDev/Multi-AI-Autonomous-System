#!/bin/bash

# Environment Validation Script for Railway Deployment
# Validates all required environment variables before deployment

echo "🔐 Environment Variables Validation"
echo "===================================="
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

# Parse command line arguments
PLATFORM="${1:-local}"  # Default to local if no argument

print_section "Environment: $PLATFORM"

# Define required environment variables
REQUIRED_VARS=(
    "DATABASE_URL"
    "GEMINI_API_KEY"
    "NODE_ENV"
)

OPTIONAL_VARS=(
    "DEEPSEEK_API_KEY"
    "SENTRY_DSN"
    "PORT"
    "WS_PORT"
)

# Function to check variable in local environment
check_local_var() {
    local var_name="$1"
    if [ -n "${!var_name}" ]; then
        print_success "$var_name is set"
        return 0
    else
        print_error "$var_name is NOT set"
        return 1
    fi
}

# Function to check variable in Railway
check_railway_var() {
    local var_name="$1"
    if railway variables | grep -q "^$var_name"; then
        print_success "$var_name is set in Railway"
        return 0
    else
        print_error "$var_name is NOT set in Railway"
        return 1
    fi
}

# Check required variables
print_section "Required Variables"

if [ "$PLATFORM" == "railway" ]; then
    # Check if Railway CLI is available
    if ! command -v railway &> /dev/null; then
        print_error "Railway CLI not installed"
        print_info "Install with: npm install -g @railway/cli"
        exit 1
    fi
    
    # Check if logged in
    if ! railway whoami &> /dev/null; then
        print_error "Not logged in to Railway"
        print_info "Run: railway login"
        exit 1
    fi
    
    # Check Railway environment variables
    for var in "${REQUIRED_VARS[@]}"; do
        check_railway_var "$var"
    done
else
    # Check for .env file
    if [ -f ".env" ]; then
        print_success ".env file exists"
        # Source the .env file
        set -a
        source .env 2>/dev/null || true
        set +a
    else
        print_warning ".env file not found"
        print_info "Checking system environment variables..."
    fi
    
    # Check local environment variables
    for var in "${REQUIRED_VARS[@]}"; do
        check_local_var "$var"
    done
fi

# Check optional variables
print_section "Optional Variables"

if [ "$PLATFORM" == "railway" ]; then
    for var in "${OPTIONAL_VARS[@]}"; do
        if railway variables | grep -q "^$var"; then
            print_success "$var is set in Railway"
        else
            print_warning "$var is not set (optional)"
        fi
    done
else
    for var in "${OPTIONAL_VARS[@]}"; do
        if [ -n "${!var}" ]; then
            print_success "$var is set"
        else
            print_warning "$var is not set (optional)"
        fi
    done
fi

# Validate DATABASE_URL format
print_section "Database Connection Validation"

if [ "$PLATFORM" == "railway" ]; then
    DB_URL=$(railway variables | grep "^DATABASE_URL" | cut -d= -f2-)
else
    DB_URL="${DATABASE_URL}"
fi

if [ -n "$DB_URL" ]; then
    if [[ "$DB_URL" =~ ^postgres(ql)?:// ]]; then
        print_success "DATABASE_URL format is valid (PostgreSQL)"
    else
        print_error "DATABASE_URL format is invalid (must be postgres:// or postgresql://)"
    fi
else
    print_error "DATABASE_URL is empty"
fi

# Validate API keys are not placeholders
print_section "API Key Validation"

if [ "$PLATFORM" == "railway" ]; then
    GEMINI_KEY=$(railway variables | grep "^GEMINI_API_KEY" | cut -d= -f2-)
else
    GEMINI_KEY="${GEMINI_API_KEY}"
fi

if [ -n "$GEMINI_KEY" ]; then
    if [[ "$GEMINI_KEY" == "your_"* ]] || [[ "$GEMINI_KEY" == "placeholder"* ]]; then
        print_error "GEMINI_API_KEY is still a placeholder"
    else
        print_success "GEMINI_API_KEY appears to be set correctly"
    fi
else
    print_error "GEMINI_API_KEY is empty"
fi

# Validate NODE_ENV
print_section "Environment Configuration"

if [ "$PLATFORM" == "railway" ]; then
    NODE_ENV_VAL=$(railway variables | grep "^NODE_ENV" | cut -d= -f2-)
else
    NODE_ENV_VAL="${NODE_ENV}"
fi

if [ -n "$NODE_ENV_VAL" ]; then
    if [[ "$NODE_ENV_VAL" == "production" ]]; then
        print_success "NODE_ENV is set to production"
    else
        print_warning "NODE_ENV is '$NODE_ENV_VAL' (expected: production)"
    fi
else
    print_warning "NODE_ENV is not set (will default to development)"
fi

# Summary
print_section "Validation Summary"
echo ""
echo "Results:"
echo "  ✓ Passed:   $PASSED"
echo "  ✗ Failed:   $FAILED"
echo "  ⚠ Warnings: $WARNINGS"
echo ""

if [ $FAILED -eq 0 ]; then
    print_success "Environment validation passed!"
    echo ""
    if [ "$PLATFORM" == "railway" ]; then
        print_info "Railway environment is ready for deployment"
    else
        print_info "Local environment is properly configured"
    fi
    exit 0
else
    print_error "Environment validation failed!"
    echo ""
    print_info "Fix the errors above before proceeding with deployment"
    echo ""
    if [ "$PLATFORM" == "railway" ]; then
        print_info "Set missing variables with: railway variables set KEY=value"
    else
        print_info "Update your .env file or set environment variables"
    fi
    exit 1
fi
