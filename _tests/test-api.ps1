#!/usr/bin/env pwsh
# API Testing Script for KVC Backend

$BASE_URL = "http://localhost:4001/api"
$STUDENT_USER = "student-demo"
$STUDENT_PASS = "Student123!"
$TEACHER_USER = "teacher-demo"
$TEACHER_PASS = "Teacher123!"

# Counters
$passed = 0
$failed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Headers,
        [object]$Body
    )
    
    try {
        Write-Host "🧪 Testing: $Name..." -ForegroundColor Cyan
        
        $params = @{
            Uri = "$BASE_URL$Endpoint"
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
        }
        
        if ($PSVersionTable.PSVersion.Major -lt 6) {
            $params.UseBasicParsing = $true
        }
        $params.ErrorAction = "Stop"
        $response = Invoke-WebRequest @params
        $statusCode = [int]$response.StatusCode
        
        if ($statusCode -ge 200 -and $statusCode -lt 300) {
            Write-Host "✅ PASS: $Name ($statusCode)" -ForegroundColor Green
            Write-Host "Response: $($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 2 | select-object -First 3)" -ForegroundColor Gray
            $script:passed++
            return $response.Content | ConvertFrom-Json
        } else {
            Write-Host "❌ FAIL: $Name ($statusCode)" -ForegroundColor Red
            Write-Host "Response: $($response.Content)" -ForegroundColor Red
            $script:failed++
            return $null
        }
    } catch {
        $statusCode = $null
        $errorContent = $null
        $webResponse = $_.Exception.Response
        if ($webResponse) {
            $statusCode = [int]$webResponse.StatusCode
            try {
                $stream = $webResponse.GetResponseStream()
                if ($stream) {
                    $reader = New-Object System.IO.StreamReader($stream)
                    $errorContent = $reader.ReadToEnd()
                    $reader.Close()
                }
            } catch {
            }
        }
        if ($statusCode) {
            Write-Host "❌ FAIL: $Name ($statusCode)" -ForegroundColor Red
            if ($errorContent) {
                Write-Host "Response: $errorContent" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ ERROR: $Name - $_" -ForegroundColor Red
        }
        $script:failed++
        return $null
    }
}

function Get-AccessToken {
    param([object]$Result)
    if (-not $Result) { return $null }
    if ($Result.accessToken) { return $Result.accessToken }
    if ($Result.access_token) { return $Result.access_token }
    if ($Result.data) {
        if ($Result.data.accessToken) { return $Result.data.accessToken }
        if ($Result.data.access_token) { return $Result.data.access_token }
    }
    return $null
}

Write-Host "`n========== KVC API TEST SUITE ==========" -ForegroundColor Yellow
Write-Host "Testing: $BASE_URL`n" -ForegroundColor Yellow

# 1. AUTHENTICATION TESTS
Write-Host "`n📌 1. AUTHENTICATION TESTS" -ForegroundColor Magenta
Write-Host "=================================" -ForegroundColor Magenta

# Login Student
$studentLogin = Test-Endpoint "Login - Student" "POST" "/auth/login" @{} @{
    username = $STUDENT_USER
    password = $STUDENT_PASS
}

$studentAccessToken = Get-AccessToken $studentLogin
if ($studentAccessToken) {
    $studentToken = "Bearer $studentAccessToken"
    Write-Host "✓ Student token: $($studentAccessToken.Substring(0,20))..." -ForegroundColor Green
} else {
    Write-Host "✗ Failed to get student token" -ForegroundColor Red
    exit 1
}

# Login Teacher
$teacherLogin = Test-Endpoint "Login - Teacher" "POST" "/auth/login" @{} @{
    username = $TEACHER_USER
    password = $TEACHER_PASS
}

$teacherAccessToken = Get-AccessToken $teacherLogin
if ($teacherAccessToken) {
    $teacherToken = "Bearer $teacherAccessToken"
    Write-Host "✓ Teacher token: $($teacherAccessToken.Substring(0,20))..." -ForegroundColor Green
}

# Get Current User
Test-Endpoint "Get Current User" "GET" "/auth/me" @{"Authorization" = $studentToken} $null | Out-Null

# 2. ATTENDANCE TESTS
Write-Host "`n📌 2. ATTENDANCE TESTS" -ForegroundColor Magenta
Write-Host "=================================" -ForegroundColor Magenta

Test-Endpoint "Check-In" "POST" "/attendance/checkin" @{"Authorization" = $studentToken} @{
    classId = "class1"
    date = "2025-11-15T00:00:00Z"
    status = "present"
    remark = "On time"
} | Out-Null

Test-Endpoint "My Attendance" "GET" "/attendance/my" @{"Authorization" = $studentToken} $null | Out-Null

Test-Endpoint "List Attendance by Class" "GET" "/attendance/class/class1" @{"Authorization" = $teacherToken} $null | Out-Null

# 3. EXAMS TESTS
Write-Host "`n📌 3. EXAMS TESTS" -ForegroundColor Magenta
Write-Host "=================================" -ForegroundColor Magenta

Test-Endpoint "List Exams" "GET" "/exams?page=1&limit=10" @{"Authorization" = $studentToken} $null | Out-Null

Test-Endpoint "Create Exam" "POST" "/exams" @{"Authorization" = $teacherToken} @{
    title = "Midterm 2025"
    date = "2025-12-10T09:00:00Z"
    classId = "class1"
} | Out-Null

Test-Endpoint "My Exams" "GET" "/exams/my" @{"Authorization" = $studentToken} $null | Out-Null

# 4. GRADES TESTS
Write-Host "`n📌 4. GRADES TESTS" -ForegroundColor Magenta
Write-Host "=================================" -ForegroundColor Magenta

Test-Endpoint "Get Transcript" "GET" "/grades/transcript" @{"Authorization" = $studentToken} $null | Out-Null

Test-Endpoint "Create Grade" "POST" "/grades" @{"Authorization" = $teacherToken} @{
    examId = "exam1"
    studentId = "student123"
    score = 85
} | Out-Null

# 5. LEAVES TESTS
Write-Host "`n📌 5. LEAVES TESTS" -ForegroundColor Magenta
Write-Host "=================================" -ForegroundColor Magenta

Test-Endpoint "Submit Leave Request" "POST" "/leaves" @{"Authorization" = $studentToken} @{
    type = "sick"
    startDate = "2025-11-20T00:00:00Z"
    endDate = "2025-11-21T00:00:00Z"
} | Out-Null

Test-Endpoint "My Leaves" "GET" "/leaves/my?status=pending" @{"Authorization" = $studentToken} $null | Out-Null

# 6. CLUBS TESTS
Write-Host "`n📌 6. CLUBS TESTS" -ForegroundColor Magenta
Write-Host "=================================" -ForegroundColor Magenta

Test-Endpoint "List All Clubs" "GET" "/clubs?page=1&limit=20" @{"Authorization" = $studentToken} $null | Out-Null

Test-Endpoint "Enroll to Club" "POST" "/clubs/enroll" @{"Authorization" = $studentToken} @{
    clubId = "club1"
} | Out-Null

Test-Endpoint "My Clubs" "GET" "/clubs/my" @{"Authorization" = $studentToken} $null | Out-Null

# 7. SCHEDULE TESTS
Write-Host "`n📌 7. SCHEDULE TESTS" -ForegroundColor Magenta
Write-Host "=================================" -ForegroundColor Magenta

Test-Endpoint "Get Schedule" "GET" "/schedule?classId=class1&dayOfWeek=1" @{"Authorization" = $studentToken} $null | Out-Null

Test-Endpoint "My Schedule" "GET" "/schedule/my" @{"Authorization" = $studentToken} $null | Out-Null

# 8. ASSIGNMENTS TESTS
Write-Host "`n📌 8. ASSIGNMENTS TESTS" -ForegroundColor Magenta
Write-Host "=================================" -ForegroundColor Magenta

Test-Endpoint "List Assignments" "GET" "/assignments?classId=class1" @{"Authorization" = $studentToken} $null | Out-Null

Test-Endpoint "Create Assignment" "POST" "/assignments" @{"Authorization" = $teacherToken} @{
    classId = "class1"
    title = "Chapter 1 Reading"
    description = "Read pages 1-20"
    dueDate = "2025-11-30T23:59:00Z"
} | Out-Null

# 9. ADVISOR TESTS
Write-Host "`n📌 9. ADVISOR TESTS" -ForegroundColor Magenta
Write-Host "=================================" -ForegroundColor Magenta

Test-Endpoint "My Advisor Contact" "GET" "/advisor/contact" @{"Authorization" = $studentToken} $null | Out-Null

Test-Endpoint "List All Advisors" "GET" "/advisor" @{"Authorization" = $studentToken} $null | Out-Null

# 10. RESOURCES TESTS
Write-Host "`n📌 10. RESOURCES TESTS" -ForegroundColor Magenta
Write-Host "=================================" -ForegroundColor Magenta

Test-Endpoint "List Resources" "GET" "/resources?classId=class1" @{"Authorization" = $studentToken} $null | Out-Null

Test-Endpoint "Create Resource" "POST" "/resources" @{"Authorization" = $teacherToken} @{
    classId = "class1"
    title = "Lecture Notes Week 1"
    fileUrl = "https://example.com/notes.pdf"
    fileType = "pdf"
} | Out-Null

# SUMMARY
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "TEST SUMMARY" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "✅ Passed: $passed" -ForegroundColor Green
Write-Host "❌ Failed: $failed" -ForegroundColor Red
Write-Host "📊 Total:  $($passed + $failed)" -ForegroundColor Cyan

if ($failed -eq 0) {
    Write-Host "`n🎉 ALL TESTS PASSED!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Some tests failed. Check output above." -ForegroundColor Yellow
}
