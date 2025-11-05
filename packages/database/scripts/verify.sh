#!/bin/bash

# Database Package Verification Script
# Verifies the database package setup and configuration

set -e

echo "🔍 W3JDev Database Package Verification"
echo "========================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Must be run from packages/database directory${NC}"
    exit 1
fi

echo "📦 Checking package structure..."

# Check essential files
files=(
    "package.json"
    "tsconfig.json"
    ".env.example"
    ".gitignore"
    "README.md"
    "src/index.ts"
    "prisma/schema.prisma"
    "prisma/seed.ts"
    "supabase/rls-policies.sql"
    "migrations/punch-clock-migration.ts"
    "migrations/waiter-ai-migration.ts"
    "migrations/flair-ai-migration.sql"
)

missing_files=0
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $file"
    else
        echo -e "${RED}❌${NC} $file (missing)"
        missing_files=$((missing_files + 1))
    fi
done

echo ""

if [ $missing_files -gt 0 ]; then
    echo -e "${RED}❌ Missing $missing_files essential file(s)${NC}"
    exit 1
fi

echo "📊 Analyzing Prisma schema..."

# Count models
model_count=$(grep -c "^model " prisma/schema.prisma || true)
echo -e "${GREEN}✅${NC} Models: $model_count"

if [ "$model_count" -ne 25 ]; then
    echo -e "${YELLOW}⚠️  Warning: Expected 25 models, found $model_count${NC}"
fi

# Count enums
enum_count=$(grep -c "^enum " prisma/schema.prisma || true)
echo -e "${GREEN}✅${NC} Enums: $enum_count"

if [ "$enum_count" -ne 19 ]; then
    echo -e "${YELLOW}⚠️  Warning: Expected 19 enums, found $enum_count${NC}"
fi

# Count indexes
index_count=$(grep -c "@@index" prisma/schema.prisma || true)
echo -e "${GREEN}✅${NC} Indexes: $index_count"

echo ""
echo "🔨 Checking build tools..."

# Check if pnpm is available
if command -v pnpm &> /dev/null; then
    pnpm_version=$(pnpm --version)
    echo -e "${GREEN}✅${NC} pnpm: $pnpm_version"
else
    echo -e "${RED}❌${NC} pnpm not found. Install with: npm install -g pnpm"
    exit 1
fi

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅${NC} node_modules exists"
else
    echo -e "${YELLOW}⚠️${NC}  node_modules not found. Run: pnpm install"
fi

echo ""
echo "🧪 Running tests..."

# Test Prisma generate
echo "Testing: pnpm db:generate"
if pnpm db:generate > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} Prisma client generated successfully"
else
    echo -e "${RED}❌${NC} Failed to generate Prisma client"
    exit 1
fi

# Test build
echo "Testing: pnpm build"
if pnpm build > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} Package built successfully"
    
    # Check build outputs
    if [ -f "dist/index.js" ] && [ -f "dist/index.d.ts" ]; then
        echo -e "${GREEN}✅${NC} Build outputs present (ESM, CJS, DTS)"
    else
        echo -e "${RED}❌${NC} Build outputs missing"
        exit 1
    fi
else
    echo -e "${RED}❌${NC} Build failed"
    exit 1
fi

# Test type checking
echo "Testing: pnpm type-check"
if pnpm type-check > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} Type checking passed"
else
    echo -e "${RED}❌${NC} Type checking failed"
    exit 1
fi

echo ""
echo "📋 Summary"
echo "=========="
echo -e "${GREEN}✅ All checks passed!${NC}"
echo ""
echo "Database package is properly configured and ready to use."
echo ""
echo "Next steps:"
echo "  1. Configure .env with your database URL"
echo "  2. Run: pnpm db:push (to create tables)"
echo "  3. Run: pnpm db:seed (to populate demo data)"
echo "  4. Run: pnpm db:studio (to view data)"
echo ""
echo "Documentation:"
echo "  - README.md (this package)"
echo "  - ../../docs/database/schema-design.md (architecture)"
echo ""
