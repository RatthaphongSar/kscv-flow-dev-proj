#!/usr/bin/env pwsh

# ================================================================
# KVC WebApp - API Test Script (PowerShell)
# Purpose: Test backend APIs, Database, and Token generation
# Date: 2025-11-20
# ================================================================

param(
    [string]$Backend = "http://localhost:4001",
    [string]$Username = "testuser",
    [string]$Password = "Test@1234",
    [switch]$Verbose
)

# Colors for output
$Green = "`e[32m"
$Red = "`e[31m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"

# Global variables
$Global:AccessToken = $null
$Global:RefreshToken = $null
$Global:TestResults = @()
$Global:PassCount = 0
$Global:FailCount = 0

# ================================================================
# Helper Functions
# ================================================================

function Write-TestHeader {
    param([string]$Title)
    Write-Host "`n$Blue╔════════════════════════════════════════╗$Reset"
    Write-Host "$Blue║$Reset $Title"
    Write-Host "$Blue╚════════════════════════════════════════╝$Reset`n"
}

function Write-TestPass {
    param([string]$Message)
    Write-Host "$Green✓$Reset $Message"
    $Global:PassCount++
}

function Write-TestFail {
    param([string]$Message, [string]$Error)
    Write-Host "$Red✗$Reset $Message"
    if ($Error) { Write-Host "$Red  Error: $Error$Reset" }
    $Global:FailCount++
}

function Write-TestInfo {
    param([string]$Message)
    Write-Host "$Yellow→$Reset $Message"
}

function Test-Connection {
    param([string]$Url)
    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 5 -SkipHttpErrorCheck
        return $response.StatusCode -eq 200
    }
    catch {
        return $false
    }
}

function Invoke-API {
    param(
        [string]$Method = "GET",
        [string]$Endpoint,
        [hashtable]$Body,
        [hashtable]$Headers = @{},
        [switch]$SkipAuth
    )
    
    $Url = "$Backend$Endpoint"
    $Params = @{
        Uri             = $Url
        Method          = $Method
        ContentType     = "application/json"
        SkipHttpErrorCheck = $true
        TimeoutSec      = 10
    }
    
    # Add default headers
    if (-not $SkipAuth -and $Global:AccessToken) {
        $Headers["Authorization"] = "Bearer $($Global:AccessToken)"
    }
    
    if ($Headers.Count -gt 0) {
        $Params["Headers"] = $Headers
    }
    
    if ($Body) {
        $Params["Body"] = ($Body | ConvertTo-Json -Depth 10)
        if ($Verbose) { Write-Host "  Body: $($Body | ConvertTo-Json -Compress)" }
    }
    
    try {
        $response = Invoke-WebRequest @Params
        if ($Verbose) { Write-Host "  Response: $($response.StatusCode)" }
        
        $content = $null
        if ($response.Content) {
            $content = $response.Content | ConvertFrom-Json
        }
        
        return @{
            StatusCode = $response.StatusCode
            Content    = $content
            Success    = $response.StatusCode -ge 200 -and $response.StatusCode -lt 300
        }
    }
    catch {
        Write-TestFail "API Call Failed" $_.Exception.Message
        return @{
            StatusCode = $null
            Content    = $null
            Success    = $false
        }
    }
}

# ================================================================
# Test 1: Connection Tests
# ================================================================

function Test-Connections {
    Write-TestHeader "1. CONNECTION & INFRASTRUCTURE TESTS"
    
    # Test backend availability
    Write-TestInfo "Testing backend connection to $Backend..."
    if (Test-Connection $Backend) {
        Write-TestPass "Backend is reachable"
    } else {
        Write-TestFail "Backend is not responding" "Make sure backend is running on port 4001"
        return
    }
    
    # Test database connectivity (via health endpoint if available)
    Write-TestInfo "Testing database connectivity..."
    $healthResponse = Invoke-API -Method GET -Endpoint "/api/health" -SkipAuth
    if ($healthResponse.Success) {
        Write-TestPass "Database connection successful"
    } else {
        Write-TestInfo "Health endpoint not available (expected if not implemented)"
    }
}

# ================================================================
# Test 2: Authentication Tests
# ================================================================

function Test-Authentication {
    Write-TestHeader "2. AUTHENTICATION & TOKEN TESTS"
    
    # Test Login
    Write-TestInfo "Testing login with username: $Username..."
    $loginBody = @{
        username = $Username
        password = $Password
    }
    
    $loginResponse = Invoke-API -Method POST -Endpoint "/api/auth/login" -Body $loginBody -SkipAuth
    
    if ($loginResponse.Success) {
        Write-TestPass "Login successful (Status: $($loginResponse.StatusCode))"
        
        # Extract tokens
        $Global:AccessToken = $loginResponse.Content.accessToken
        $Global:RefreshToken = $loginResponse.Content.refreshToken
        
        if ($Global:AccessToken) {
            Write-TestPass "Access token received"
            if ($Verbose) { Write-TestInfo "Access Token: $($Global:AccessToken.Substring(0, 20))..." }
        } else {
            Write-TestFail "Access token missing from response"
        }
        
        if ($loginResponse.Content.user) {
            $user = $loginResponse.Content.user
            Write-TestPass "User data received: $($user.username) - Role: $($user.role)"
        }
    } else {
        Write-TestFail "Login failed (Status: $($loginResponse.StatusCode))"
        Write-TestInfo "Make sure user exists in database: $Username / $Password"
        return
    }
    
    # Test Refresh Token Flow
    if ($Global:RefreshToken) {
        Write-TestInfo "Testing token refresh..."
        $refreshResponse = Invoke-API -Method POST -Endpoint "/api/auth/refresh" -SkipAuth
        
        if ($refreshResponse.Success) {
            Write-TestPass "Token refresh successful"
            $Global:AccessToken = $refreshResponse.Content.accessToken
        } else {
            Write-TestFail "Token refresh failed"
        }
    }
}

# ================================================================
# Test 3: Class System Tests
# ================================================================

function Test-ClassSystem {
    Write-TestHeader "3. CLASS SYSTEM API TESTS"
    
    if (-not $Global:AccessToken) {
        Write-TestFail "Skipping class tests - no valid token"
        return
    }
    
    # Get Classes List
    Write-TestInfo "Fetching user's classes..."
    $classesResponse = Invoke-API -Method GET -Endpoint "/api/classes"
    
    if ($classesResponse.Success) {
        $classCount = if ($classesResponse.Content -is [array]) { 
            $classesResponse.Content.Count 
        } else { 
            1 
        }
        Write-TestPass "Classes fetched (Count: $classCount) - Status: $($classesResponse.StatusCode)"
        
        if ($classesResponse.Content -and $classesResponse.Content.Count -gt 0) {
            $firstClass = $classesResponse.Content[0]
            $Global:TestClassId = $firstClass.id
            Write-TestInfo "First class: $($firstClass.code) - $($firstClass.name)"
        }
    } else {
        Write-TestFail "Failed to fetch classes" "Status: $($classesResponse.StatusCode)"
        return
    }
    
    # Get Class Details
    if ($Global:TestClassId) {
        Write-TestInfo "Fetching class details for $Global:TestClassId..."
        $classDetailResponse = Invoke-API -Method GET -Endpoint "/api/classes/$Global:TestClassId"
        
        if ($classDetailResponse.Success) {
            Write-TestPass "Class details fetched - Status: $($classDetailResponse.StatusCode)"
        } else {
            Write-TestFail "Failed to fetch class details"
        }
        
        # Get Class Students
        Write-TestInfo "Fetching enrolled students..."
        $studentsResponse = Invoke-API -Method GET -Endpoint "/api/classes/$Global:TestClassId/students"
        
        if ($studentsResponse.Success) {
            Write-TestPass "Students fetched - Status: $($studentsResponse.StatusCode)"
        } else {
            Write-TestFail "Failed to fetch students"
        }
        
        # Get Assignments
        Write-TestInfo "Fetching assignments..."
        $assignmentsResponse = Invoke-API -Method GET -Endpoint "/api/classes/$Global:TestClassId/assignments"
        
        if ($assignmentsResponse.Success) {
            Write-TestPass "Assignments fetched - Status: $($assignmentsResponse.StatusCode)"
        } else {
            Write-TestFail "Failed to fetch assignments"
        }
        
        # Get Attendance
        Write-TestInfo "Fetching attendance records..."
        $attendanceResponse = Invoke-API -Method GET -Endpoint "/api/classes/$Global:TestClassId/attendance"
        
        if ($attendanceResponse.Success) {
            Write-TestPass "Attendance records fetched - Status: $($attendanceResponse.StatusCode)"
        } else {
            Write-TestFail "Failed to fetch attendance"
        }
    }
}

# ================================================================
# Test 4: Join Request Tests
# ================================================================

function Test-JoinRequests {
    Write-TestHeader "4. JOIN REQUEST FLOW TESTS"
    
    if (-not $Global:AccessToken) {
        Write-TestFail "Skipping join request tests - no valid token"
        return
    }
    
    if (-not $Global:TestClassId) {
        Write-TestInfo "No test class available, skipping join request tests"
        return
    }
    
    # Try to request join (may fail if already enrolled)
    Write-TestInfo "Attempting to send join request..."
    $joinBody = @{
        reason = "Test join request"
    }
    
    $joinResponse = Invoke-API -Method POST -Endpoint "/api/classes/$Global:TestClassId/join-request" -Body $joinBody
    
    if ($joinResponse.Success) {
        Write-TestPass "Join request sent - Status: $($joinResponse.StatusCode)"
        
        if ($joinResponse.Content.id) {
            Write-TestInfo "Join Request ID: $($joinResponse.Content.id)"
        }
    } else {
        Write-TestInfo "Join request endpoint returned: $($joinResponse.StatusCode) (may be expected if already enrolled)"
    }
    
    # Get pending join requests (teacher endpoint)
    Write-TestInfo "Fetching pending join requests (teacher)..."
    $pendingResponse = Invoke-API -Method GET -Endpoint "/api/classes/$Global:TestClassId/join-requests"
    
    if ($pendingResponse.Success) {
        Write-TestPass "Pending join requests fetched - Status: $($pendingResponse.StatusCode)"
    } else {
        Write-TestInfo "Join requests endpoint returned: $($pendingResponse.StatusCode) (may require teacher role)"
    }
}

# ================================================================
# Test 5: Error Handling Tests
# ================================================================

function Test-ErrorHandling {
    Write-TestHeader "5. ERROR HANDLING & EDGE CASES"
    
    # Test without token
    Write-TestInfo "Testing API call without authentication token..."
    $noAuthResponse = Invoke-API -Method GET -Endpoint "/api/classes" -SkipAuth
    
    if ($noAuthResponse.StatusCode -eq 401) {
        Write-TestPass "Correctly rejected unauthenticated request (401)"
    } else {
        Write-TestFail "Expected 401 for unauthenticated request" "Got: $($noAuthResponse.StatusCode)"
    }
    
    # Test invalid token
    Write-TestInfo "Testing API call with invalid token..."
    $invalidHeaders = @{
        Authorization = "Bearer invalid.token.here"
    }
    $invalidResponse = Invoke-API -Method GET -Endpoint "/api/classes" -Headers $invalidHeaders
    
    if ($invalidResponse.StatusCode -eq 401 -or $invalidResponse.StatusCode -eq 403) {
        Write-TestPass "Correctly rejected invalid token (Status: $($invalidResponse.StatusCode))"
    } else {
        Write-TestFail "Expected 401/403 for invalid token" "Got: $($invalidResponse.StatusCode)"
    }
    
    # Test non-existent resource
    Write-TestInfo "Testing non-existent class endpoint..."
    $notFoundResponse = Invoke-API -Method GET -Endpoint "/api/classes/nonexistent-id"
    
    if ($notFoundResponse.StatusCode -eq 404) {
        Write-TestPass "Correctly returned 404 for non-existent resource"
    } else {
        Write-TestInfo "Non-existent resource returned: $($notFoundResponse.StatusCode)"
    }
}

# ================================================================
# Test 6: Database Tests
# ================================================================

function Test-Database {
    Write-TestHeader "6. DATABASE VERIFICATION"
    
    if (-not $Global:AccessToken) {
        Write-TestFail "Skipping database tests - no valid token"
        return
    }
    
    # Check if we can get multiple classes (indicates DB has data)
    Write-TestInfo "Checking database has sample data..."
    $classesResponse = Invoke-API -Method GET -Endpoint "/api/classes"
    
    if ($classesResponse.Success) {
        $classCount = if ($classesResponse.Content -is [array]) { 
            $classesResponse.Content.Count 
        } else { 
            1 
        }
        
        if ($classCount -gt 0) {
            Write-TestPass "Database has class data ($classCount classes)"
        } else {
            Write-TestInfo "Database appears empty (no classes found)"
        }
    }
    
    # Verify data structure
    if ($classesResponse.Content -and $classesResponse.Content[0]) {
        $sample = $classesResponse.Content[0]
        $requiredFields = @("id", "code", "name", "teacherId")
        $missingFields = @()
        
        foreach ($field in $requiredFields) {
            if (-not $sample.PSObject.Properties.Name.Contains($field)) {
                $missingFields += $field
            }
        }
        
        if ($missingFields.Count -eq 0) {
            Write-TestPass "Class data structure is valid"
        } else {
            Write-TestFail "Class data missing fields: $($missingFields -join ', ')"
        }
    }
}

# ================================================================
# Test Summary
# ================================================================

function Write-TestSummary {
    Write-TestHeader "TEST SUMMARY"
    
    $Total = $Global:PassCount + $Global:FailCount
    $PassPercent = if ($Total -gt 0) { [math]::Round(($Global:PassCount / $Total) * 100) } else { 0 }
    
    Write-Host "$Green Passed: $($Global:PassCount)$Reset"
    Write-Host "$Red Failed: $($Global:FailCount)$Reset"
    Write-Host "Total:  $Total"
    Write-Host "`nSuccess Rate: $PassPercent%`n"
    
    if ($Global:FailCount -eq 0) {
        Write-Host "$Green✓ ALL TESTS PASSED!$Reset`n"
    } else {
        Write-Host "$Yellow⚠ Some tests failed. Review output above.$Reset`n"
    }
}

# ================================================================
# Main Execution
# ================================================================

Write-Host "$Blue╔════════════════════════════════════════╗$Reset"
Write-Host "$Blue║$Reset   KVC WebApp - API Test Suite"
Write-Host "$Blue║$Reset   Backend: $Backend"
Write-Host "$Blue╚════════════════════════════════════════╝$Reset`n"

# Run all tests
Test-Connections
Test-Authentication
Test-ClassSystem
Test-JoinRequests
Test-ErrorHandling
Test-Database

# Summary
Write-TestSummary

# Exit with appropriate code
exit $(if ($Global:FailCount -gt 0) { 1 } else { 0 })
