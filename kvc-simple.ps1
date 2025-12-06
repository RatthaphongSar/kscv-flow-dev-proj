# KVC Helper - Quick Commands for Docker Services
# Usage: . ./kvc-simple.ps1

$KvcRoot = "C:\Users\PC\Downloads\kvc-fullstack"
$ComposeFile = "$KvcRoot\docker-compose.local.yml"
$EnvFile = "$KvcRoot\.env.local"

# Colors
$Success = "Green"
$ErrorColor = "Red"
$Info = "Cyan"
$Warn = "Yellow"

# ============ MAIN COMMANDS ============

function kvc-start {
    Write-Host "▶️  Starting KVC services..." -ForegroundColor $Info
    Push-Location $KvcRoot
    docker-compose -f $ComposeFile --env-file $EnvFile up -d
    Start-Sleep -Seconds 5
    docker-compose -f $ComposeFile ps
    Pop-Location
}

function kvc-stop {
    Write-Host "⏹️  Stopping KVC services..." -ForegroundColor $Warn
    Push-Location $KvcRoot
    docker-compose -f $ComposeFile down
    Pop-Location
}

function kvc-restart {
    Write-Host "🔄 Restarting KVC services..." -ForegroundColor $Warn
    kvc-stop
    Start-Sleep -Seconds 3
    kvc-start
}

function kvc-status {
    Write-Host "📊 KVC Service Status:" -ForegroundColor $Info
    Push-Location $KvcRoot
    docker-compose -f $ComposeFile ps
    Pop-Location
}

function kvc-logs {
    param([string]$Service = "all", [int]$Tail = 50)
    
    Write-Host "📜 KVC Service Logs" -ForegroundColor $Info
    Push-Location $KvcRoot
    
    if ($Service -eq "all") {
        Write-Host "Showing last $Tail lines from all services..." -ForegroundColor $Info
        docker-compose -f $ComposeFile logs --tail=$Tail
    } else {
        Write-Host "Showing last $Tail lines from $Service..." -ForegroundColor $Info
        docker-compose -f $ComposeFile logs $Service --tail=$Tail
    }
    
    Pop-Location
}

function kvc-ip {
    Write-Host "🌐 Your Windows PC IP Addresses:" -ForegroundColor $Info
    Write-Host ""
    
    # Get active network adapters with IPv4 addresses
    $configs = Get-NetIPConfiguration | Where-Object { $_.IPv4Address }
    
    foreach ($config in $configs) {
        $adapter = $config.NetAdapter.Name
        $ip = $config.IPv4Address.IPAddress
        
        # Skip loopback and Docker/WSL internal
        if ($adapter -notmatch "Loopback" -and $ip -ne "127.0.0.1") {
            Write-Host "  $adapter : $ip" -ForegroundColor $Success
        }
    }
    
    Write-Host ""
    Write-Host "Access from other devices on LAN:" -ForegroundColor $Success
    Write-Host "  http://192.168.1.101 (or your local IP from above)" -ForegroundColor $Info
}

function kvc-test {
    Write-Host "🧪 Testing KVC Services..." -ForegroundColor $Info
    Write-Host ""
    
    # Test Frontend
    Write-Host "Frontend (http://localhost)..." -ForegroundColor $Info -NoNewline
    try {
        $response = Invoke-WebRequest -Uri "http://localhost/" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host " ✅ OK (200)" -ForegroundColor $Success
        }
    } catch {
        Write-Host " ❌ FAILED" -ForegroundColor $ErrorColor
    }
    
    # Test Backend
    Write-Host "Backend (http://localhost:4001)..." -ForegroundColor $Info -NoNewline
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4001/" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        Write-Host " ✅ OK (200)" -ForegroundColor $Success
    } catch {
        Write-Host " ❌ FAILED" -ForegroundColor $ErrorColor
    }
    
    # Test Database
    Write-Host "Database (postgres:5432)..." -ForegroundColor $Info -NoNewline
    try {
        Push-Location $KvcRoot
        $result = docker-compose -f $ComposeFile exec -T postgres pg_isready -U kvc -d kvcdb 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✅ OK" -ForegroundColor $Success
        } else {
            Write-Host " ⚠️  Checking..." -ForegroundColor $Warn
        }
        Pop-Location
    } catch {
        Write-Host " ❌ FAILED" -ForegroundColor $ErrorColor
    }
    
    Write-Host ""
    Write-Host "Test complete!" -ForegroundColor $Success
}

function kvc-shell {
    param([string]$Service = "backend")
    
    Write-Host "🔗 Entering $Service container shell..." -ForegroundColor $Info
    Push-Location $KvcRoot
    docker-compose -f $ComposeFile exec $Service /bin/sh
    Pop-Location
}

function kvc-help {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor $Info
    Write-Host "║  KVC Self-Hosted Helper Commands                         ║" -ForegroundColor $Info
    Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor $Info
    Write-Host ""
    
    Write-Host "Service Management:" -ForegroundColor $Info
    Write-Host "  kvc-start          Start all services"
    Write-Host "  kvc-stop           Stop all services"
    Write-Host "  kvc-restart        Restart all services"
    Write-Host "  kvc-status         Show service status"
    Write-Host ""
    
    Write-Host "Monitoring:" -ForegroundColor $Info
    Write-Host "  kvc-logs           Show all service logs (last 50 lines)"
    Write-Host "  kvc-logs backend   Show backend logs"
    Write-Host "  kvc-logs frontend  Show frontend logs"
    Write-Host "  kvc-logs nginx     Show nginx logs"
    Write-Host "  kvc-logs postgres  Show database logs"
    Write-Host "  kvc-logs all 100   Show all logs (last 100 lines)"
    Write-Host ""
    
    Write-Host "Network & Access:" -ForegroundColor $Info
    Write-Host "  kvc-ip             Show your PC IP addresses"
    Write-Host "  kvc-test           Test all services"
    Write-Host ""
    
    Write-Host "Advanced:" -ForegroundColor $Info
    Write-Host "  kvc-shell          Enter backend container shell"
    Write-Host "  kvc-shell postgres Enter database container shell"
    Write-Host ""
    
    Write-Host "Quick Links:" -ForegroundColor $Success
    Write-Host "  Local:  http://localhost"
    Write-Host "  LAN:    http://192.168.1.101"
    Write-Host ""
}

# Display welcome message
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor $Success
Write-Host "║  KVC Helper Loaded - Type 'kvc-help' for commands       ║" -ForegroundColor $Success
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor $Success
Write-Host ""
