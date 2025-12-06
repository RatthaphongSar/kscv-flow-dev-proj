# deploy.ps1 - Simple Docker Hub + Railway deployment

Write-Host "🚀 KVC App Deployment Script" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

# Get Docker Hub credentials
$DOCKER_USERNAME = Read-Host "Enter Docker Hub username"
$DOCKER_PASSWORD = Read-Host "Enter Docker Hub password" -AsSecureString
$DOCKER_PASSWORD_PLAIN = [System.Net.NetworkCredential]::new("", $DOCKER_PASSWORD).Password

# Login to Docker Hub
Write-Host "📝 Logging in to Docker Hub..." -ForegroundColor Yellow
$DOCKER_PASSWORD_PLAIN | docker login -u $DOCKER_USERNAME --password-stdin
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker login failed" -ForegroundColor Red
    exit 1
}

# Build images
Write-Host "🔨 Building Docker images..." -ForegroundColor Yellow
docker-compose build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Tag images
Write-Host "🏷️  Tagging images..." -ForegroundColor Yellow
docker tag kvc-fullstack-backend "${DOCKER_USERNAME}/kvc-backend:latest"
docker tag kvc-fullstack-frontend "${DOCKER_USERNAME}/kvc-frontend:latest"

# Push to Docker Hub
Write-Host "📤 Pushing to Docker Hub..." -ForegroundColor Yellow
docker push "${DOCKER_USERNAME}/kvc-backend:latest"
docker push "${DOCKER_USERNAME}/kvc-frontend:latest"

Write-Host ""
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
Write-Host ""
Write-Host "📌 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Go to Railway: https://railway.app" 
Write-Host "2. Create new project"
Write-Host "3. Select 'Deploy from Docker Image'"
Write-Host ""
Write-Host "4. Backend:"
Write-Host "   Image: $DOCKER_USERNAME/kvc-backend:latest"
Write-Host "   Port: 4001"
Write-Host ""
Write-Host "5. Frontend:"
Write-Host "   Image: $DOCKER_USERNAME/kvc-frontend:latest"
Write-Host "   Port: 3000"
Write-Host ""
Write-Host "6. Add Environment Variables:"
Write-Host "   DATABASE_URL=postgresql://..."
Write-Host "   CORS_ORIGIN=*"
Write-Host ""
Write-Host "🎉 Done!" -ForegroundColor Green
