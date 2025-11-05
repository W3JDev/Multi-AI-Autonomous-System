#!/bin/bash
set -e

echo "🚀 Setting up W3JDev AI Ecosystem development environment..."
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first:"
    echo "   npm install -g pnpm"
    exit 1
fi

echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "🔨 Building shared packages..."
pnpm build --filter="./packages/*"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Available commands:"
echo "  pnpm dev              - Start all applications in dev mode"
echo "  pnpm build            - Build all applications and packages"
echo "  pnpm lint             - Lint all code"
echo "  pnpm type-check       - Type check all code"
echo "  pnpm test             - Run all tests"
echo ""
echo "Start developing with: pnpm dev"
