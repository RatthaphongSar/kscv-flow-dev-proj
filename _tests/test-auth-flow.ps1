# Test authentication flow with proper cookie handling
$ErrorActionPreference = 'Continue'

# Create cookie container to maintain session
$cookieJar = New-Object System.Net.CookieContainer
$session = [Microsoft.PowerShell.Commands.WebRequestSession]::new()
$session.Cookies = $cookieJar

$baseUrl = "http://localhost:4001"

Write-Host "=== TESTING AUTH FLOW ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Login
Write-Host "TEST 1: Login with student1" -ForegroundColor Yellow
$loginResponse = Invoke-WebRequest -Uri "$baseUrl/auth/login" `
  -Method POST `
  -Headers @{"Content-Type" = "application/json"} `
  -Body '{"username":"student1","password":"password123"}' `
  -WebSession $session `
  -Verbose

Write-Host "Status: $($loginResponse.StatusCode)" -ForegroundColor Green
Write-Host "Set-Cookie Headers:" -ForegroundColor Yellow
$loginResponse.Headers | Where-Object {$_ -like "*Set-Cookie*"} | ForEach-Object {
  Write-Host "  $_"
}
Write-Host ""

# Test 2: Get current user (should work with cookie)
Write-Host "TEST 2: Get current user (using stored cookie)" -ForegroundColor Yellow
try {
  $userResponse = Invoke-WebRequest -Uri "$baseUrl/auth/me" `
    -Method GET `
    -WebSession $session `
    -Verbose
  Write-Host "Status: $($userResponse.StatusCode)" -ForegroundColor Green
  $userData = $userResponse.Content | ConvertFrom-Json
  Write-Host "User: $($userData.username) (Role: $($userData.role))" -ForegroundColor Green
} catch {
  Write-Host "ERROR: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
  Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Get pinned rooms
Write-Host "TEST 3: Get pinned rooms (using stored cookie)" -ForegroundColor Yellow
try {
  $pinnedResponse = Invoke-WebRequest -Uri "$baseUrl/api/chat/me/pinned" `
    -Method GET `
    -WebSession $session `
    -Verbose
  Write-Host "Status: $($pinnedResponse.StatusCode)" -ForegroundColor Green
  $pinnedData = $pinnedResponse.Content | ConvertFrom-Json
  Write-Host "Pinned Rooms Count: $($pinnedData.Length)" -ForegroundColor Green
  $pinnedData | ForEach-Object { Write-Host "  - $($_.name)" }
} catch {
  Write-Host "ERROR: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
  Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Pin a room
Write-Host "TEST 4: Pin room ID=2" -ForegroundColor Yellow
try {
  $pinResponse = Invoke-WebRequest -Uri "$baseUrl/api/chat/rooms/2/pin" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body '{}' `
    -WebSession $session `
    -Verbose
  Write-Host "Status: $($pinResponse.StatusCode)" -ForegroundColor Green
  $pinData = $pinResponse.Content | ConvertFrom-Json
  Write-Host "Pinned: $($pinData.roomId)" -ForegroundColor Green
} catch {
  Write-Host "ERROR: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
  Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 5: Get updated pinned rooms
Write-Host "TEST 5: Get pinned rooms again" -ForegroundColor Yellow
try {
  $pinnedResponse2 = Invoke-WebRequest -Uri "$baseUrl/api/chat/me/pinned" `
    -Method GET `
    -WebSession $session `
    -Verbose
  Write-Host "Status: $($pinnedResponse2.StatusCode)" -ForegroundColor Green
  $pinnedData2 = $pinnedResponse2.Content | ConvertFrom-Json
  Write-Host "Pinned Rooms Count: $($pinnedData2.Length)" -ForegroundColor Green
  $pinnedData2 | ForEach-Object { Write-Host "  - $($_.name)" }
} catch {
  Write-Host "ERROR: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
  Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== TEST COMPLETE ===" -ForegroundColor Cyan
