#!/bin/bash
# infra/scripts/build.sh
# Build frontend and backend for production

set -e  # Exit on error

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$PROJECT_ROOT"

echo "=========================================="
echo "🏗️  Building KVC App for Self-Hosted"
echo "=========================================="

# Step 1: Build Frontend
echo ""
echo "📦 Building Frontend..."
cd "$PROJECT_ROOT/frontend"
if [ ! -f "package.json" ]; then
    echo "❌ frontend/package.json not found!"
    exit 1
fi
npm install --no-save
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Frontend build failed - dist folder not created!"
    exit 1
fi

echo "✅ Frontend built successfully ($(du -sh dist | cut -f1))"

# Step 2: Build Backend Docker image (happens in docker compose)
echo ""
echo "📦 Backend will be built by Docker Compose..."

# Step 3: Done
echo ""
echo "=========================================="
echo "✅ Build completed!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Fill in .env.production with your secrets"
echo "  2. Run: docker compose -f docker-compose.self-hosted.yml --env-file .env.production up -d"
echo "  3. Visit: http://localhost"
echo ""
