# KVC WebApp Development Start Script
# ============================================

Write-Host "`n" -ForegroundColor Green
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   KVC FULLSTACK - Development Environment Startup         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Kill any existing node processes on ports 4001, 5173, 5174
Write-Host "🔄 Cleaning up old processes..." -ForegroundColor Yellow
$processes = Get-NetTCPConnection -State Established, Listen -ErrorAction SilentlyContinue | 
    Where-Object { $_.LocalPort -in @(4001, 5173, 5174) }

foreach ($proc in $processes) {
    $process = Get-Process -Id $proc.OwningProcess -ErrorAction SilentlyContinue
    if ($process) {
        try {
            Stop-Process -Id $proc.OwningProcess -Force
            Write-Host "✓ Killed process on port $($proc.LocalPort)" -ForegroundColor Green
        }
        catch {
            Write-Host "⚠ Could not kill process on port $($proc.LocalPort)" -ForegroundColor Yellow
        }
    }
}

Write-Host "`nℹ️ Starting services..." -ForegroundColor Cyan
Write-Host ""

# Function to start backend
function Start-Backend {
    Write-Host "📦 Starting Backend Server..." -ForegroundColor Magenta
    Write-Host "   Port: 4001" -ForegroundColor Gray
    Write-Host "   URL: http://localhost:4001" -ForegroundColor Gray
    Set-Location "$PSScriptRoot\backend"
    
    if (-not (Test-Path "node_modules")) {
        Write-Host "   Installing dependencies..." -ForegroundColor Yellow
        npm install
    }
    
    npm run dev
}

# Function to start frontend
function Start-Frontend {
    Write-Host "`n📱 Starting Frontend Server..." -ForegroundColor Magenta
    Write-Host "   Port: 5173" -ForegroundColor Gray
    Write-Host "   URL: http://localhost:5173" -ForegroundColor Gray
    Set-Location "$PSScriptRoot\frontend"
    
    if (-not (Test-Path "node_modules")) {
        Write-Host "   Installing dependencies..." -ForegroundColor Yellow
        npm install
    }
    
    npm run dev
}

# Main menu
Write-Host "Select what to start:" -ForegroundColor Cyan
Write-Host "1) Backend only (Port 4001)" -ForegroundColor White
Write-Host "2) Frontend only (Port 5173)" -ForegroundColor White
Write-Host "3) Both (start backend first, then frontend in new window)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-3)"

switch ($choice) {
    "1" {
        Start-Backend
    }
    "2" {
        Start-Frontend
    }
    "3" {
        # Start backend in background
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot'; & '$PSScriptRoot\backend\npm.cmd' run dev"
        Start-Sleep -Seconds 3
        Write-Host "`n✓ Backend started in new window" -ForegroundColor Green
        Write-Host "`n⏳ Waiting for backend to initialize..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        
        # Start frontend in new window
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot'; cd frontend; npm run dev"
        Write-Host "✓ Frontend started in new window" -ForegroundColor Green
        Write-Host ""
        Write-Host "🚀 Both servers are running!" -ForegroundColor Green
        Write-Host "   Backend: http://localhost:4001" -ForegroundColor Cyan
        Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Cyan
    }
    default {
        Write-Host "Invalid choice" -ForegroundColor Red
    }
}
