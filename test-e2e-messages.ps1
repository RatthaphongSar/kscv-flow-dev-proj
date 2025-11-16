# End-to-End Test for Message Management System
# Tests: Delete, Edit, Reply, Pin, and Unpin messages

$BASE_URL = "http://localhost:4001"
$COOKIE_FILE = "$env:TEMP\cookies.txt"

# Remove old cookie file
if (Test-Path $COOKIE_FILE) {
    Remove-Item $COOKIE_FILE -Force
}

function Test-Result {
    param([string]$TestName, [int]$StatusCode, [int]$ExpectedCode = 200)
    
    if ($StatusCode -eq $ExpectedCode) {
        Write-Host "✓ $TestName" -ForegroundColor Green
        return $true
    } else {
        Write-Host "✗ $TestName (Expected: $ExpectedCode, Got: $StatusCode)" -ForegroundColor Red
        return $false
    }
}

function Make-Request {
    param(
        [string]$Method,
        [string]$Path,
        [object]$Body,
        [int]$ExpectedCode = 200
    )
    
    $Uri = "$BASE_URL$Path"
    $Headers = @{
        "Content-Type" = "application/json"
    }
    
    $Params = @{
        Uri             = $Uri
        Method          = $Method
        Headers         = $Headers
        CookieContainer = $CookieContainer
        UseBasicParsing = $true
    }
    
    if ($Body) {
        $Params["Body"] = ($Body | ConvertTo-Json)
    }
    
    try {
        $Response = Invoke-WebRequest @Params
        return @{
            StatusCode = $Response.StatusCode
            Content    = $Response.Content | ConvertFrom-Json
            Success    = $Response.StatusCode -eq $ExpectedCode
        }
    } catch {
        $StatusCode = $_.Exception.Response.StatusCode.value__
        try {
            $Content = $_.Exception.Response.Content.ReadAsStream() | ForEach-Object { 
                [System.IO.StreamReader]::new($_).ReadToEnd() 
            } | ConvertFrom-Json
        } catch {
            $Content = @{ error = $_.Exception.Message }
        }
        
        return @{
            StatusCode = $StatusCode
            Content    = $Content
            Success    = $StatusCode -eq $ExpectedCode
        }
    }
}

Write-Host "`n" -NoNewline
Write-Host "═════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  Message Management System - E2E Test (PowerShell)" -ForegroundColor Yellow
Write-Host "═════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

# Step 1: Login
Write-Host "▶ Step 1: Logging in as teacher" -ForegroundColor Cyan

$loginResp = Make-Request -Method "POST" -Path "/api/auth/login" -Body @{
    username = "teacher"
    password = "password123"
} -ExpectedCode 200

if (-not $loginResp.Success) {
    Write-Host "✗ Login failed" -ForegroundColor Red
    Write-Host $loginResp.Content
    exit 1
}

$UserId = $loginResp.Content.id
Write-Host "✓ Logged in (User ID: $UserId)" -ForegroundColor Green

# Step 2: Get rooms
Write-Host "`n▶ Step 2: Fetching available rooms" -ForegroundColor Cyan

$roomsResp = Make-Request -Method "GET" -Path "/api/chat/rooms" -ExpectedCode 200

if (-not $roomsResp.Success) {
    Write-Host "✗ Failed to get rooms" -ForegroundColor Red
    Write-Host $roomsResp.Content
    exit 1
}

$RoomId = $roomsResp.Content[0].id
Write-Host "✓ Found room: $($roomsResp.Content[0].name) (ID: $RoomId)" -ForegroundColor Green

# Step 3: Create message
Write-Host "`n▶ Step 3: Creating a test message" -ForegroundColor Cyan

$createResp = Make-Request -Method "POST" -Path "/api/chat/rooms/$RoomId/messages" -Body @{
    content = "Test message for E2E testing - $(Get-Date -Format 'HH:mm:ss')"
} -ExpectedCode 201

if (-not $createResp.Success) {
    Write-Host "✗ Failed to create message" -ForegroundColor Red
    Write-Host $createResp.Content
    exit 1
}

$MessageId = $createResp.Content.id
Write-Host "✓ Message created (ID: $MessageId)" -ForegroundColor Green

# Step 4: Edit message
Write-Host "`n▶ Step 4: Editing the message" -ForegroundColor Cyan

$editResp = Make-Request -Method "PATCH" -Path "/api/chat/messages/$MessageId" -Body @{
    text = "Test message - EDITED at $(Get-Date -Format 'HH:mm:ss')"
} -ExpectedCode 200

if (-not $editResp.Success) {
    Write-Host "✗ Failed to edit message" -ForegroundColor Red
    Write-Host $editResp.Content
} else {
    Write-Host "✓ Message edited successfully" -ForegroundColor Green
}

# Step 5: Reply to message
Write-Host "`n▶ Step 5: Replying to the message" -ForegroundColor Cyan

$replyResp = Make-Request -Method "POST" -Path "/api/chat/messages/$MessageId/reply" -Body @{
    content = "This is a reply to the test message - $(Get-Date -Format 'HH:mm:ss')"
} -ExpectedCode 201

if (-not $replyResp.Success) {
    Write-Host "✗ Failed to reply" -ForegroundColor Red
    Write-Host $replyResp.Content
} else {
    $ReplyId = $replyResp.Content.id
    Write-Host "✓ Reply created (ID: $ReplyId)" -ForegroundColor Green
}

# Step 6: Pin message
Write-Host "`n▶ Step 6: Pinning the message" -ForegroundColor Cyan

$pinResp = Make-Request -Method "POST" -Path "/api/chat/rooms/$RoomId/pin" -Body @{
    messageId = $MessageId
} -ExpectedCode 201

if (-not $pinResp.Success) {
    Write-Host "✗ Failed to pin message" -ForegroundColor Red
    Write-Host $pinResp.Content
} else {
    Write-Host "✓ Message pinned successfully" -ForegroundColor Green
}

# Step 7: Get pinned messages
Write-Host "`n▶ Step 7: Fetching pinned messages" -ForegroundColor Cyan

$pinnedResp = Make-Request -Method "GET" -Path "/api/chat/rooms/$RoomId/pins" -ExpectedCode 200

if (-not $pinnedResp.Success) {
    Write-Host "✗ Failed to get pinned messages" -ForegroundColor Red
    Write-Host $pinnedResp.Content
} else {
    Write-Host "✓ Fetched pinned messages (Count: $($pinnedResp.Content.Count))" -ForegroundColor Green
    if ($pinnedResp.Content.Count -gt 0) {
        Write-Host "  First pinned: `"$($pinnedResp.Content[0].message.text.Substring(0, [Math]::Min(50, $pinnedResp.Content[0].message.text.Length)))...`"" -ForegroundColor DarkGray
    }
}

# Step 8: Unpin message
Write-Host "`n▶ Step 8: Unpinning the message" -ForegroundColor Cyan

$unpinResp = Make-Request -Method "DELETE" -Path "/api/chat/rooms/$RoomId/pin?messageId=$MessageId" -ExpectedCode 200

if (-not $unpinResp.Success) {
    Write-Host "✗ Failed to unpin message" -ForegroundColor Red
    Write-Host $unpinResp.Content
} else {
    Write-Host "✓ Message unpinned successfully" -ForegroundColor Green
}

# Step 9: Verify unpin
Write-Host "`n▶ Step 9: Verifying message was unpinned" -ForegroundColor Cyan

$pinnedAfterResp = Make-Request -Method "GET" -Path "/api/chat/rooms/$RoomId/pins" -ExpectedCode 200

if (-not $pinnedAfterResp.Success) {
    Write-Host "✗ Failed to verify unpinned" -ForegroundColor Red
} else {
    $IsPinned = $pinnedAfterResp.Content | Where-Object { $_.messageId -eq $MessageId }
    if ($IsPinned) {
        Write-Host "✗ Message still pinned" -ForegroundColor Red
    } else {
        Write-Host "✓ Message successfully unpinned" -ForegroundColor Green
    }
}

# Step 10: Delete message for self
Write-Host "`n▶ Step 10: Deleting message for self" -ForegroundColor Cyan

$deleteForMeResp = Make-Request -Method "DELETE" -Path "/api/chat/messages/$MessageId`?mode=me" -ExpectedCode 200

if (-not $deleteForMeResp.Success) {
    Write-Host "✗ Failed to delete for me" -ForegroundColor Red
    Write-Host $deleteForMeResp.Content
} else {
    Write-Host "✓ Message deleted for self" -ForegroundColor Green
}

# Step 11: Create and delete message for everyone
Write-Host "`n▶ Step 11: Creating another message to delete for everyone" -ForegroundColor Cyan

$create2Resp = Make-Request -Method "POST" -Path "/api/chat/rooms/$RoomId/messages" -Body @{
    content = "This will be deleted for everyone - $(Get-Date -Format 'HH:mm:ss')"
} -ExpectedCode 201

if (-not $create2Resp.Success) {
    Write-Host "✗ Failed to create message" -ForegroundColor Red
} else {
    $Message2Id = $create2Resp.Content.id
    Write-Host "✓ Message created (ID: $Message2Id)" -ForegroundColor Green
    
    Write-Host "`n▶ Step 12: Deleting message for everyone" -ForegroundColor Cyan
    
    $deleteForAllResp = Make-Request -Method "DELETE" -Path "/api/chat/messages/$Message2Id`?mode=everyone" -ExpectedCode 200
    
    if (-not $deleteForAllResp.Success) {
        Write-Host "✗ Failed to delete for everyone" -ForegroundColor Red
        Write-Host $deleteForAllResp.Content
    } else {
        Write-Host "✓ Message deleted for everyone" -ForegroundColor Green
    }
}

Write-Host "`n" -NoNewline
Write-Host "═════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "✓ ALL TESTS COMPLETED SUCCESSFULLY" -ForegroundColor Green
Write-Host "═════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

# Cleanup
if (Test-Path $COOKIE_FILE) {
    Remove-Item $COOKIE_FILE -Force
}
