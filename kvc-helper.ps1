# KVC Self-Hosted Helper Script
# Usage: . .\kvc-helper.ps1
# Then use commands: kvc-start, kvc-stop, kvc-logs, kvc-ip, etc.

# Color output
$InfoColor = "Cyan"
$SuccessColor = "Green"
$ErrorColor = "Red"
$WarningColor = "Yellow"

# ============================================================
# Helper Functions
# ============================================================

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor $InfoColor
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor $SuccessColor
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor $ErrorColor
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor $WarningColor
}

# ============================================================
# Main Commands
# ============================================================

function kvc-start {
    <#
    .SYNOPSIS
    Start all KVC services
    .EXAMPLE
    kvc-start
    #>
    Write-Info "Starting KVC services..."
    
    if (-not (Test-Path "docker-compose.local.yml")) {
        Write-Error-Custom "docker-compose.local.yml not found in current directory"
        return
    }
    
    if (-not (Test-Path ".env.local")) {
        Write-Error-Custom ".env.local not found - please copy and edit .env.local first"
        Write-Info "Create from template: Copy-Item '.env.example' '.env.local'"
        return
    }
    
    docker-compose -f docker-compose.local.yml --env-file .env.local up -d
    
    Write-Success "Services starting..."
    Write-Info "Waiting 30 seconds for services to initialize..."
    Start-Sleep -Seconds 30
    
    kvc-status
}

function kvc-stop {
    <#
    .SYNOPSIS
    Stop all KVC services
    .EXAMPLE
    kvc-stop
    #>
    Write-Info "Stopping KVC services..."
    docker-compose -f docker-compose.local.yml down
    Write-Success "Services stopped"
}

function kvc-restart {
    <#
    .SYNOPSIS
    Restart all KVC services
    .EXAMPLE
    kvc-restart
    #>
    Write-Info "Restarting KVC services..."
    kvc-stop
    Start-Sleep -Seconds 2
    kvc-start
}

function kvc-status {
    <#
    .SYNOPSIS
    Show status of all KVC services
    .EXAMPLE
    kvc-status
    #>
    Write-Info "Service Status:"
    docker-compose -f docker-compose.local.yml ps
    
    Write-Host ""
    Write-Info "Quick Health Check:"
    
    # Check nginx
    $nginx = docker-compose -f docker-compose.local.yml ps nginx | Select-String "healthy"
    if ($nginx) {
        Write-Host "  🟢 nginx: Healthy" -ForegroundColor $SuccessColor
    } else {
        Write-Host "  🔴 nginx: Not Healthy" -ForegroundColor $ErrorColor
    }
    
    # Check backend
    $backend = docker-compose -f docker-compose.local.yml ps backend | Select-String "healthy"
    if ($backend) {
        Write-Host "  🟢 backend: Healthy" -ForegroundColor $SuccessColor
    } else {
        Write-Host "  🔴 backend: Not Healthy" -ForegroundColor $ErrorColor
    }
    
    # Check frontend
    $frontend = docker-compose -f docker-compose.local.yml ps frontend | Select-String "healthy"
    if ($frontend) {
        Write-Host "  🟢 frontend: Healthy" -ForegroundColor $SuccessColor
    } else {
        Write-Host "  🔴 frontend: Not Healthy" -ForegroundColor $ErrorColor
    }
    
    # Check postgres
    $postgres = docker-compose -f docker-compose.local.yml ps postgres | Select-String "healthy"
    if ($postgres) {
        Write-Host "  🟢 postgres: Healthy" -ForegroundColor $SuccessColor
    } else {
        Write-Host "  🔴 postgres: Not Healthy" -ForegroundColor $ErrorColor
    }
}

function kvc-logs {
    <#
    .SYNOPSIS
    Show logs for all services (real-time)
    .PARAMETER Service
    Specific service: nginx, backend, frontend, postgres
    .EXAMPLE
    kvc-logs
    kvc-logs -Service backend
    #>
    param(
        [Parameter(Mandatory=$false)]
        [ValidateSet("nginx", "backend", "frontend", "postgres")]
        [string]$Service
    )
    
    if ($Service) {
        Write-Info "Logs for: $Service (Ctrl+C to exit)"
        docker-compose -f docker-compose.local.yml logs -f $Service
    } else {
        Write-Info "Logs for all services (Ctrl+C to exit)"
        docker-compose -f docker-compose.local.yml logs -f
    }
}

function kvc-ip {
    <#
    .SYNOPSIS
    Show your Windows PC's IP address for LAN access
    .EXAMPLE
    kvc-ip
    #>
    Write-Info "Your Windows PC IP Address:"
    Write-Host ""
    
    $adapters = Get-NetIPConfiguration | Where-Object { $_.IPv4Address -and $_.NetAdapter.Status -eq "Up" }
    
    foreach ($adapter in $adapters) {
        $ipAddress = $adapter.IPv4Address.IPAddress
        $name = $adapter.NetAdapter.Name
        Write-Host "  [Network] $name : $ipAddress" -ForegroundColor $InfoColor
    }
    
    Write-Host ""
    Write-Info "Access KVC from another device:"
    Write-Host "  http://192.168.x.x (replace x.x with your IP)" -ForegroundColor $SuccessColor
}

function kvc-test {
    <#
    .SYNOPSIS
    Test API endpoints
    .EXAMPLE
    kvc-test
    #>
    Write-Info "Testing API endpoints..."
    Write-Host ""
    
    # Test health endpoint
    Write-Info "Testing: http://localhost/api/health"
    try {
        $response = curl -s "http://localhost/api/health"
        Write-Success "✓ Backend responding: $response"
    } catch {
        Write-Error-Custom "✗ Backend not responding"
    }
    
    Write-Host ""
    Write-Info "Testing: http://localhost (frontend)"
    try {
        $response = curl -s -o /dev/null -w "%{http_code}" "http://localhost"
        if ($response -eq 200) {
            Write-Success "✓ Frontend responding: HTTP $response"
        } else {
            Write-Error-Custom "✗ Frontend returned HTTP $response"
        }
    } catch {
        Write-Error-Custom "✗ Frontend not responding"
    }
}

function kvc-rebuild {
    <#
    .SYNOPSIS
    Rebuild all Docker images (without cache)
    .EXAMPLE
    kvc-rebuild
    #>
    Write-Warning-Custom "Rebuilding Docker images (this may take 2-5 minutes)..."
    docker-compose -f docker-compose.local.yml build --no-cache
    Write-Success "Build complete"
}

function kvc-clean {
    <#
    .SYNOPSIS
    Remove all KVC containers and volumes
    .EXAMPLE
    kvc-clean
    #>
    Write-Warning-Custom "This will DELETE all data (containers, volumes)!"
    $confirm = Read-Host "Type 'yes' to confirm"
    
    if ($confirm -eq "yes") {
        Write-Info "Cleaning up KVC..."
        docker-compose -f docker-compose.local.yml down -v
        Write-Success "Cleanup complete"
    } else {
        Write-Info "Cancelled"
    }
}

function kvc-backup-db {
    <#
    .SYNOPSIS
    Backup PostgreSQL database
    .EXAMPLE
    kvc-backup-db
    #>
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $filename = "kvc-backup-$timestamp.sql"
    
    Write-Info "Backing up database to: $filename"
    
    try {
        docker exec kvc-postgres-local pg_dump -U postgres kvcdb | Out-File -Encoding utf8 $filename
        Write-Success "Database backed up to: $filename"
    } catch {
        Write-Error-Custom "Backup failed: $_"
    }
}

function kvc-restore-db {
    <#
    .SYNOPSIS
    Restore PostgreSQL database from backup
    .PARAMETER BackupFile
    Path to backup SQL file
    .EXAMPLE
    kvc-restore-db -BackupFile "kvc-backup-20250101-120000.sql"
    #>
    param(
        [Parameter(Mandatory=$true)]
        [string]$BackupFile
    )
    
    if (-not (Test-Path $BackupFile)) {
        Write-Error-Custom "Backup file not found: $BackupFile"
        return
    }
    
    Write-Warning-Custom "This will OVERWRITE the database!"
    $confirm = Read-Host "Type 'yes' to confirm"
    
    if ($confirm -eq "yes") {
        Write-Info "Restoring database from: $BackupFile"
        
        try {
            Get-Content $BackupFile | docker exec -i kvc-postgres-local psql -U postgres kvcdb
            Write-Success "Database restored successfully"
        } catch {
            Write-Error-Custom "Restore failed: $_"
        }
    } else {
        Write-Info "Cancelled"
    }
}

function kvc-edit-env {
    <#
    .SYNOPSIS
    Open .env.local in default editor
    .EXAMPLE
    kvc-edit-env
    #>
    if (Test-Path ".env.local") {
        notepad ".env.local"
    } else {
        Write-Error-Custom ".env.local not found"
    }
}

function kvc-help {
    <#
    .SYNOPSIS
    Show available commands
    .EXAMPLE
    kvc-help
    #>
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor $InfoColor
    Write-Host "║          KVC Self-Hosted Helper Commands                  ║" -ForegroundColor $InfoColor
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor $InfoColor
    Write-Host ""
    
    Write-Host "Core Commands:" -ForegroundColor $WarningColor
    Write-Host "  kvc-start ..................... Start all services" -ForegroundColor White
    Write-Host "  kvc-stop ..................... Stop all services" -ForegroundColor White
    Write-Host "  kvc-restart .................. Restart all services" -ForegroundColor White
    Write-Host "  kvc-status ................... Show service status" -ForegroundColor White
    Write-Host ""
    
    Write-Host "Monitoring:" -ForegroundColor $WarningColor
    Write-Host "  kvc-logs ..................... View logs (all services)" -ForegroundColor White
    Write-Host "  kvc-logs -Service backend ... View logs (specific service)" -ForegroundColor White
    Write-Host "  kvc-test ..................... Test API endpoints" -ForegroundColor White
    Write-Host "  kvc-status ................... Show health status" -ForegroundColor White
    Write-Host ""
    
    Write-Host "Configuration:" -ForegroundColor $WarningColor
    Write-Host "  kvc-ip ....................... Show your PC's IP address" -ForegroundColor White
    Write-Host "  kvc-edit-env ................. Edit .env.local configuration" -ForegroundColor White
    Write-Host ""
    
    Write-Host "Maintenance:" -ForegroundColor $WarningColor
    Write-Host "  kvc-rebuild .................. Rebuild Docker images" -ForegroundColor White
    Write-Host "  kvc-backup-db ............... Backup database to SQL file" -ForegroundColor White
    Write-Host "  kvc-restore-db -BackupFile X Restore database from SQL file" -ForegroundColor White
    Write-Host "  kvc-clean .................... Delete all data (be careful!)" -ForegroundColor White
    Write-Host ""
    
    Write-Host "Help:" -ForegroundColor $WarningColor
    Write-Host "  kvc-help ..................... Show this help message" -ForegroundColor White
    Write-Host "  Get-Help kvc-start .......... Get help for specific command" -ForegroundColor White
    Write-Host ""
    
    Write-Host "Quick Start:" -ForegroundColor $SuccessColor
    Write-Host "  1. kvc-start" -ForegroundColor White
    Write-Host "  2. kvc-ip (to find your PC's IP)" -ForegroundColor White
    Write-Host "  3. http://localhost or http://192.168.x.x" -ForegroundColor White
    Write-Host ""
}

# ============================================================
# Print Welcome Message
# ============================================================

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    KVC Self-Hosted Helper Script Loaded                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Available commands:" -ForegroundColor Yellow
Write-Host "  kvc-start    kvc-stop    kvc-restart   kvc-status" -ForegroundColor Cyan
Write-Host "  kvc-logs     kvc-test    kvc-ip        kvc-help" -ForegroundColor Cyan
Write-Host ""
Write-Host "Type 'kvc-help' for full list of commands" -ForegroundColor White
Write-Host ""
