# Quick API Test
$BASE_URL = "http://localhost:4001/api"

Write-Host "🧪 API Quick Test" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan

# 1. Test Login
Write-Host "`n1️⃣  Testing Login..." -ForegroundColor Yellow
$body = @{username="student-demo"; password="Student123!"} | ConvertTo-Json
$response = try {
  Invoke-WebRequest -Uri "$BASE_URL/auth/login" -Method POST -ContentType "application/json" -Body $body -ErrorAction Stop
} catch {
  $_.Exception.Response
}

if ($response.StatusCode -eq 200) {
  $data = $response.Content | ConvertFrom-Json
  Write-Host "✅ Login Success" -ForegroundColor Green
  Write-Host "   User: $($data.username)" -ForegroundColor Green
  $token = $data.access_token
} else {
  Write-Host "❌ Login Failed: $($response.StatusCode)" -ForegroundColor Red
  exit 1
}

# 2. Test Get Current User
Write-Host "`n2️⃣  Testing Get Current User..." -ForegroundColor Yellow
$response = try {
  Invoke-WebRequest -Uri "$BASE_URL/auth/me" -Method GET -ErrorAction Stop
} catch {
  $_.Exception.Response
}

if ($response.StatusCode -eq 200) {
  $data = $response.Content | ConvertFrom-Json
  Write-Host "✅ Get User Success" -ForegroundColor Green
  Write-Host "   ID: $($data.id)" -ForegroundColor Green
  Write-Host "   Username: $($data.username)" -ForegroundColor Green
}

# 3. Test Attendance Check-In
Write-Host "`n3️⃣  Testing Check-In..." -ForegroundColor Yellow
$body = @{
  classId = "class1"
  date = "2025-11-15T00:00:00Z"
  status = "present"
  remark = "On time"
} | ConvertTo-Json

$response = try {
  Invoke-WebRequest -Uri "$BASE_URL/attendance/checkin" -Method POST -ContentType "application/json" -Body $body -ErrorAction Stop
} catch {
  $_.Exception.Response
}

if ($response.StatusCode -eq 200) {
  Write-Host "✅ Check-In Success" -ForegroundColor Green
} else {
  Write-Host "⚠️  Check-In Status: $($response.StatusCode)" -ForegroundColor Yellow
}

# 4. Test Get Exams
Write-Host "`n4️⃣  Testing List Exams..." -ForegroundColor Yellow
$response = try {
  Invoke-WebRequest -Uri "$BASE_URL/exams?page=1&limit=10" -Method GET -ErrorAction Stop
} catch {
  $_.Exception.Response
}

if ($response.StatusCode -eq 200) {
  Write-Host "✅ List Exams Success" -ForegroundColor Green
} else {
  Write-Host "⚠️  Status: $($response.StatusCode)" -ForegroundColor Yellow
}

# 5. Test Get Transcript
Write-Host "`n5️⃣  Testing Get Transcript..." -ForegroundColor Yellow
$response = try {
  Invoke-WebRequest -Uri "$BASE_URL/grades/transcript" -Method GET -ErrorAction Stop
} catch {
  $_.Exception.Response
}

if ($response.StatusCode -eq 200) {
  Write-Host "✅ Get Transcript Success" -ForegroundColor Green
} else {
  Write-Host "⚠️  Status: $($response.StatusCode)" -ForegroundColor Yellow
}

Write-Host "`n✅ API Tests Completed!" -ForegroundColor Green
