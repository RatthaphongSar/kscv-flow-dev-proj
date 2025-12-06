# infra/scripts/build.ps1
# PowerShell script to build KVC App for self-hosted deployment

param(
    [switch]$SkipFrontend = $false
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $ProjectRoot

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🏗️  Building KVC App for Self-Hosted" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Step 1: Build Frontend
if (-not $SkipFrontend) {
    Write-Host ""
    Write-Host "📦 Building Frontend..." -ForegroundColor Yellow
    
    $FrontendDir = Join-Path $ProjectRoot "frontend"
    if (-not (Test-Path "$FrontendDir/package.json")) {
        Write-Host "❌ frontend/package.json not found!" -ForegroundColor Red
        exit 1
    }

    Set-Location $FrontendDir
    npm install --no-save
    npm run build

    if (-not (Test-Path "dist")) {
        Write-Host "❌ Frontend build failed - dist folder not created!" -ForegroundColor Red
        exit 1
    }

    $DistSize = (Get-ChildItem -Recurse dist | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "✅ Frontend built successfully ($([math]::Round($DistSize, 2)) MB)" -ForegroundColor Green
} else {
    Write-Host "⏭️  Skipping frontend build (use -SkipFrontend flag)" -ForegroundColor Yellow
}

# Step 2: Backend message
Write-Host ""
Write-Host "📦 Backend will be built by Docker Compose..." -ForegroundColor Yellow

# Step 3: Done
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ Build completed!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Fill in .env.production with your secrets"
Write-Host "  2. Run: docker compose -f docker-compose.self-hosted.yml --env-file .env.production up -d"
Write-Host "  3. Visit: http://localhost"
Write-Host ""
