#!/usr/bin/env pwsh

# Test the Class Join System using PowerShell
$BaseUrl = "http://localhost:4001/api"
$TeacherToken = "Bearer mock-teacher-token"
$StudentToken = "Bearer mock-student-token"

function Invoke-API {
    param(
        [string]$Endpoint,
        [string]$Method = "GET",
        [hashtable]$Body = $null,
        [string]$Token = $TeacherToken
    )
    
    $headers = @{
        "Authorization" = $Token
        "Content-Type" = "application/json"
    }
    
    $params = @{
        Uri = "$BaseUrl$Endpoint"
        Method = $Method
        Headers = $headers
        ErrorAction = "Stop"
    }
    
    if ($Body) {
        $params["Body"] = ($Body | ConvertTo-Json)
    }
    
    try {
        $response = Invoke-WebRequest @params
        return ($response.Content | ConvertFrom-Json)
    }
    catch {
        Write-Host "❌ Error: $_"
        throw $_
    }
}

Write-Host "🧪 Testing Class Join System`n"

try {
    # Step 1: Teacher creates class
    Write-Host "📝 Step 1: Teacher creates a new class"
    $classData = @{
        code = "TEST-$(Get-Date -Format yyyyMMddHHmmss)"
        name = "Test Class for Join System"
        section = "1"
        credits = 3
        semester = "1/2567"
        room = "101"
        capacity = 50
    }
    
    $createResult = Invoke-API -Endpoint "/classes" -Method "POST" -Body $classData -Token $TeacherToken
    $classId = $createResult.data.id
    Write-Host "✅ Class created: $classId`n"

    # Step 2: Student can see the class
    Write-Host "🔍 Step 2: Student lists available classes"
    $studentClasses = Invoke-API -Endpoint "/classes" -Method "GET" -Token $StudentToken
    $foundClass = $studentClasses.data | Where-Object { $_.id -eq $classId }
    
    if ($foundClass) {
        Write-Host "✅ Student can see the newly created class: '$($foundClass.name)'"
        Write-Host "   Enrollment Status: $($foundClass.enrollmentStatus)`n"
    }
    else {
        Write-Host "❌ Student CANNOT see the newly created class`n"
        throw "Student should see the newly created class"
    }

    # Step 3: Student requests to join
    Write-Host "🤝 Step 3: Student requests to join the class"
    $joinResult = Invoke-API -Endpoint "/classes/$classId/join-request" -Method "POST" -Token $StudentToken
    Write-Host "✅ Join request created"
    Write-Host "   Status: $($joinResult.data.status)`n"

    # Step 4: Teacher views join requests
    Write-Host "👁️ Step 4: Teacher views pending join requests"
    $requests = Invoke-API -Endpoint "/classes/$classId/join-requests" -Method "GET" -Token $TeacherToken
    Write-Host "✅ Teacher sees $($requests.data.Count) join request(s)`n"

    # Step 5: Teacher approves
    if ($requests.data.Count -gt 0) {
        Write-Host "✅ Step 5: Teacher approves the join request"
        $requestId = $requests.data[0].id
        $approveResult = Invoke-API -Endpoint "/enrollment/join-requests/$requestId/approve" -Method "POST" -Token $TeacherToken
        Write-Host "✅ Join request approved`n"
    }

    Write-Host "✨ All tests completed successfully!`n"

}
catch {
    Write-Host "`n🔴 Test failed: $_"
    exit 1
}
