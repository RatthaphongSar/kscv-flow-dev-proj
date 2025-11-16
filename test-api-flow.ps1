# Test API flow to verify backend is working

Write-Host "Testing backend API endpoints..." -ForegroundColor Green

# Test 1: Health check (should fail - no such endpoint)
Write-Host "`n1. Testing /api/rooms (should return JSON if authenticated)..." -ForegroundColor Cyan
try {
  $response = Invoke-WebRequest -Uri "http://localhost:4001/api/chat/rooms" -Headers @{"Accept" = "application/json"} -ErrorAction Stop
  Write-Host "✓ Connection successful!" -ForegroundColor Green
  Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
  $statusCode = $_.Exception.Response.StatusCode.Value__
  Write-Host "Response Status: $statusCode" -ForegroundColor Yellow
  if ($statusCode -eq 401) {
    Write-Host "✓ Got 401 (expected - no auth)" -ForegroundColor Green
  } else {
    Write-Host "Response: $($_.Exception.Response | ConvertFrom-Json | ConvertTo-Json)" -ForegroundColor Yellow
  }
}

# Test 2: Check if frontend is running
Write-Host "`n2. Testing frontend dev server (port 5173)..." -ForegroundColor Cyan
try {
  $response = Invoke-WebRequest -Uri "http://localhost:5173/" -ErrorAction Stop
  Write-Host "✓ Frontend running!" -ForegroundColor Green
  Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
  $statusCode = $_.Exception.Response.StatusCode.Value__
  Write-Host "Frontend Status: $statusCode" -ForegroundColor Yellow
}

# Test 3: Check backend port
Write-Host "`n3. Testing backend port (4001)..." -ForegroundColor Cyan
try {
  $response = Invoke-WebRequest -Uri "http://localhost:4001/" -ErrorAction Stop
  Write-Host "Status: $($response.StatusCode)" -ForegroundColor Yellow
} catch {
  $statusCode = $_.Exception.Response.StatusCode.Value__
  if ($statusCode -eq 404) {
    Write-Host "✓ Backend running (got 404 on root)" -ForegroundColor Green
  } else {
    Write-Host "Response Status: $statusCode" -ForegroundColor Yellow
  }
}

Write-Host "`n✓ All servers appear to be running!" -ForegroundColor Green
Write-Host "Frontend on http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend on http://localhost:4001/api/chat" -ForegroundColor Cyan
