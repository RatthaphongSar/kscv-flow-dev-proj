# Script to Clean Up Old Railway/Cloudflare Deployment Files
# Run this ONCE to remove old deployment configs
# Usage: powershell -ExecutionPolicy Bypass -File cleanup-old-deploy.ps1

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     KVC Deployment Reset - Cleanup Old Railway Configs     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "docker-compose.local.yml")) {
    Write-Host "❌ Error: docker-compose.local.yml not found!" -ForegroundColor Red
    Write-Host "   Please run this script from the project root folder" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found docker-compose.local.yml - we're in the right place" -ForegroundColor Green
Write-Host ""

# Confirm before deletion
Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "  1. Delete Railway & Cloudflare configuration files" -ForegroundColor White
Write-Host "  2. Archive old deployment documentation" -ForegroundColor White
Write-Host "  3. Keep backend/ and frontend/ source code" -ForegroundColor White
Write-Host "  4. Keep docker/ and new docker-compose.local.yml" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Continue? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "❌ Cancelled" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🗑️  Deleting old Railway/Cloudflare files..." -ForegroundColor Cyan
Write-Host ""

# Files to delete
$filesToDelete = @(
    ".railwayignore",
    "Procfile",
    "generate-cert.js",
    "nginx-cloudflare.conf",
    "docker-compose-cloudflare.yml",
    "deploy-production.bat",
    "deploy-production.sh",
    "deploy.ps1",
    "deploy.sh"
)

$deletedCount = 0
foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Deleted: $file" -ForegroundColor Green
        $deletedCount++
    } else {
        Write-Host "  ○ Skipped (not found): $file" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "📦 Archiving old documentation..." -ForegroundColor Cyan
Write-Host ""

# Create archive folder if needed
if (-not (Test-Path "_archive")) {
    New-Item -ItemType Directory -Name "_archive" -Force | Out-Null
    Write-Host "  ✓ Created: _archive/" -ForegroundColor Green
}

# Files to archive
$filesToArchive = @(
    "RAILWAY_DEPLOYMENT.md",
    "RAILWAY_DEPLOY_STEP_BY_STEP.md",
    "RAILWAY_STEP4_5_DETAILED.md",
    "CLOUDFLARE_DEPLOYMENT_COMPLETE.md",
    "CLOUDFLARE_INTEGRATION_GUIDE.md",
    "CLOUDFLARE_QUICK_START.md",
    "DEPLOYMENT_STATUS.md",
    "DEPLOYMENT_VERIFICATION.md"
)

$archivedCount = 0
foreach ($file in $filesToArchive) {
    if (Test-Path $file) {
        Move-Item $file "_archive/$file" -Force
        Write-Host "  ✓ Archived: $file" -ForegroundColor Green
        $archivedCount++
    } else {
        Write-Host "  ○ Skipped (not found): $file" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "✅ Cleanup Complete!" -ForegroundColor Green
Write-Host "  • Deleted: $deletedCount files" -ForegroundColor White
Write-Host "  • Archived: $archivedCount files" -ForegroundColor White
Write-Host ""

Write-Host "📋 New Self-Hosted Setup Files:" -ForegroundColor Cyan
Write-Host "  • docker-compose.local.yml .......... Main Docker Compose" -ForegroundColor White
Write-Host "  • .env.local ........................ Configuration (edit this!)" -ForegroundColor White
Write-Host "  • docker/nginx/default.conf ........ Nginx reverse proxy" -ForegroundColor White
Write-Host "  • SELF_HOSTED_SETUP_GUIDE.md ....... Detailed instructions" -ForegroundColor White
Write-Host "  • QUICK_START.md ................... Quick reference" -ForegroundColor White
Write-Host ""

Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Edit .env.local with secure passwords:" -ForegroundColor White
Write-Host "     notepad .env.local" -ForegroundColor White
Write-Host ""
Write-Host "  2. Start services:" -ForegroundColor White
Write-Host "     docker-compose -f docker-compose.local.yml --env-file .env.local up -d" -ForegroundColor White
Write-Host ""
Write-Host "  3. Access at http://localhost" -ForegroundColor White
Write-Host ""

Write-Host "💡 For full instructions, read: SELF_HOSTED_SETUP_GUIDE.md" -ForegroundColor Yellow
