# infra/scripts/ops.ps1
# PowerShell script for Docker Compose operations

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("start", "stop", "restart", "logs", "status", "clean")]
    [string]$Action,

    [string]$Service = ""
)

$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $ProjectRoot

$EnvFile = ".env.production"

if (-not (Test-Path $EnvFile)) {
    Write-Host "❌ .env.production not found!" -ForegroundColor Red
    Write-Host "   Copy and edit .env.production file first"
    exit 1
}

switch ($Action) {
    "start" {
        Write-Host "🚀 Starting KVC services..." -ForegroundColor Green
        docker compose -f docker-compose.self-hosted.yml --env-file $EnvFile up -d
        Start-Sleep -Seconds 3
        Write-Host "✅ Services started!"
        Write-Host "   Access: http://localhost"
        Write-Host "   API: http://localhost/api"
        Write-Host "   Check status: docker compose ps"
    }

    "stop" {
        Write-Host "⏹️  Stopping KVC services..." -ForegroundColor Yellow
        docker compose -f docker-compose.self-hosted.yml stop
        Write-Host "✅ Services stopped"
    }

    "restart" {
        Write-Host "🔄 Restarting KVC services..." -ForegroundColor Yellow
        docker compose -f docker-compose.self-hosted.yml restart
        Start-Sleep -Seconds 2
        Write-Host "✅ Services restarted"
    }

    "logs" {
        $Service = if ($Service) { $Service } else { "" }
        Write-Host "📋 Showing logs (press Ctrl+C to exit)..." -ForegroundColor Cyan
        docker compose -f docker-compose.self-hosted.yml logs -f $Service
    }

    "status" {
        Write-Host "📊 Service Status:" -ForegroundColor Cyan
        docker compose -f docker-compose.self-hosted.yml ps --no-trunc
    }

    "clean" {
        Write-Host "🧹 Cleaning up (removing containers & volumes)..." -ForegroundColor Red
        Write-Host "   ⚠️  WARNING: This will delete your database data!" -ForegroundColor Red
        $confirm = Read-Host "   Type 'yes' to confirm"
        if ($confirm -eq "yes") {
            docker compose -f docker-compose.self-hosted.yml down -v
            Write-Host "✅ Cleaned up"
        } else {
            Write-Host "   Cancelled"
        }
    }
}
