#!/bin/bash
# Simple deploy script for Docker Hub + Railway

set -e

echo "🚀 KVC App Deployment Script"
echo "============================"

# Get Docker Hub username
read -p "Enter Docker Hub username: " DOCKER_USERNAME
read -p "Enter Docker Hub password: " -s DOCKER_PASSWORD
echo ""

# Login to Docker Hub
echo "📝 Logging in to Docker Hub..."
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

# Build images
echo "🔨 Building Docker images..."
docker-compose build

# Tag images
echo "🏷️  Tagging images..."
docker tag kvc-fullstack-backend "$DOCKER_USERNAME/kvc-backend:latest"
docker tag kvc-fullstack-frontend "$DOCKER_USERNAME/kvc-frontend:latest"

# Push to Docker Hub
echo "📤 Pushing to Docker Hub..."
docker push "$DOCKER_USERNAME/kvc-backend:latest"
docker push "$DOCKER_USERNAME/kvc-frontend:latest"

echo ""
echo "✅ Deployment Complete!"
echo "========================"
echo ""
echo "📌 Next Steps:"
echo "1. Go to Railway: https://railway.app"
echo "2. Create new project"
echo "3. Select 'Deploy from Docker Image'"
echo ""
echo "4. Backend:"
echo "   Image: $DOCKER_USERNAME/kvc-backend:latest"
echo "   Port: 4001"
echo ""
echo "5. Frontend:"
echo "   Image: $DOCKER_USERNAME/kvc-frontend:latest"
echo "   Port: 3000"
echo ""
echo "🎉 Done!"
