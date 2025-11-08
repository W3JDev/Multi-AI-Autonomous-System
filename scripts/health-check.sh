#!/bin/bash

# Health Check Verification Script
# Verifies API Gateway health endpoint with retry logic

# Default values
URL="${1:-}"
MAX_RETRIES="${2:-30}"
RETRY_INTERVAL="${3:-2}"

echo "🏥 API Gateway Health Check"
echo "============================"
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

# If no URL provided, try to get it from Railway
if [ -z "$URL" ]; then
    if command -v railway &> /dev/null; then
        print_info "Getting Railway service URL..."
        DOMAIN=$(railway domain 2>/dev/null)
        if [ -n "$DOMAIN" ]; then
            URL="https://$DOMAIN"
            print_success "Found Railway URL: $URL"
        else
            print_error "Could not retrieve Railway URL"
            print_info "Usage: $0 <URL> [max_retries] [retry_interval]"
            print_info "Example: $0 https://api-gateway.railway.app 30 2"
            exit 1
        fi
    else
        print_error "No URL provided and Railway CLI not available"
        print_info "Usage: $0 <URL> [max_retries] [retry_interval]"
        exit 1
    fi
fi

# Ensure URL has protocol
if [[ ! "$URL" =~ ^https?:// ]]; then
    URL="https://$URL"
fi

# Add /health if not already present
if [[ ! "$URL" =~ /health$ ]]; then
    HEALTH_URL="$URL/health"
else
    HEALTH_URL="$URL"
fi

print_info "Target: $HEALTH_URL"
print_info "Max retries: $MAX_RETRIES"
print_info "Retry interval: ${RETRY_INTERVAL}s"
echo ""

# Function to check health
check_health() {
    local response
    local http_code
    
    # Try to get response
    response=$(curl -s -w "\n%{http_code}" "$HEALTH_URL" 2>&1)
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" == "200" ]; then
        return 0
    else
        return 1
    fi
}

# Main retry loop
print_info "Starting health check..."
RETRIES=0

while [ $RETRIES -lt $MAX_RETRIES ]; do
    if check_health; then
        echo ""
        print_success "Health check passed!"
        echo ""
        
        # Get and display full health response
        HEALTH_RESPONSE=$(curl -s "$HEALTH_URL")
        
        print_info "Health check response:"
        echo ""
        
        # Try to pretty-print JSON if jq is available
        if command -v jq &> /dev/null; then
            echo "$HEALTH_RESPONSE" | jq .
        else
            echo "$HEALTH_RESPONSE"
        fi
        
        echo ""
        
        # Parse and display key metrics
        if command -v jq &> /dev/null; then
            STATUS=$(echo "$HEALTH_RESPONSE" | jq -r '.status' 2>/dev/null)
            UPTIME=$(echo "$HEALTH_RESPONSE" | jq -r '.uptime' 2>/dev/null)
            ENV=$(echo "$HEALTH_RESPONSE" | jq -r '.environment' 2>/dev/null)
            
            if [ -n "$STATUS" ] && [ "$STATUS" != "null" ]; then
                print_success "Status: $STATUS"
            fi
            
            if [ -n "$UPTIME" ] && [ "$UPTIME" != "null" ]; then
                # Convert uptime to human-readable format
                UPTIME_SECONDS=$(echo "$UPTIME" | awk '{print int($1)}')
                UPTIME_HUMAN=$(printf '%dd %dh %dm %ds' $((UPTIME_SECONDS/86400)) $((UPTIME_SECONDS%86400/3600)) $((UPTIME_SECONDS%3600/60)) $((UPTIME_SECONDS%60)))
                print_success "Uptime: $UPTIME_HUMAN"
            fi
            
            if [ -n "$ENV" ] && [ "$ENV" != "null" ]; then
                print_success "Environment: $ENV"
            fi
        fi
        
        # Test response time
        print_info "Testing response time..."
        RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' "$HEALTH_URL")
        RESPONSE_MS=$(echo "$RESPONSE_TIME * 1000" | bc)
        
        if (( $(echo "$RESPONSE_TIME < 0.1" | bc -l) )); then
            print_success "Response time: ${RESPONSE_MS}ms (excellent)"
        elif (( $(echo "$RESPONSE_TIME < 0.5" | bc -l) )); then
            print_success "Response time: ${RESPONSE_MS}ms (good)"
        else
            print_warning "Response time: ${RESPONSE_MS}ms (slower than expected)"
        fi
        
        exit 0
    else
        ((RETRIES++))
        if [ $RETRIES -lt $MAX_RETRIES ]; then
            echo -n "."
            sleep "$RETRY_INTERVAL"
        fi
    fi
done

# If we get here, health check failed
echo ""
echo ""
print_error "Health check failed after $MAX_RETRIES attempts"
echo ""
print_info "Troubleshooting steps:"
echo "  1. Check if the service is running: railway status"
echo "  2. View recent logs: railway logs --tail 50"
echo "  3. Verify the URL is correct: $HEALTH_URL"
echo "  4. Check Railway dashboard for deployment status"
echo ""

# Try to get error details
print_info "Attempting to get error details..."
ERROR_RESPONSE=$(curl -s -w "\n%{http_code}" "$HEALTH_URL" 2>&1)
ERROR_CODE=$(echo "$ERROR_RESPONSE" | tail -n1)
ERROR_BODY=$(echo "$ERROR_RESPONSE" | head -n-1)

if [ -n "$ERROR_CODE" ] && [ "$ERROR_CODE" != "000" ]; then
    echo "HTTP Status: $ERROR_CODE"
    echo "Response: $ERROR_BODY"
fi

exit 1
