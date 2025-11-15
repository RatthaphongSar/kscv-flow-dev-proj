# Test send message flow
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

Write-Host "🔐 Login..."
$body = @{
  username = "test-aj-123"
  password = "123456"
} | ConvertTo-Json

$login = Invoke-RestMethod -Uri "http://localhost:4001/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body `
  -WebSession $session

Write-Host "✅ Logged in as: $($login.username)"

Write-Host "`n📝 Creating room..."
$ts = Get-Date -Format "HHmmss"
$roomBody = @{ name = "Test $ts" } | ConvertTo-Json

$room = Invoke-RestMethod -Uri "http://localhost:4001/api/chat/rooms" `
  -Method POST `
  -ContentType "application/json" `
  -Body $roomBody `
  -WebSession $session

Write-Host "✅ Room created: $($room.name) (ID: $($room.id))"

Write-Host "`n📤 Sending message..."
$msgBody = @{ content = "สวัสดี โลก" } | ConvertTo-Json

try {
  $msg = Invoke-RestMethod -Uri "http://localhost:4001/api/chat/rooms/$($room.id)/messages" `
    -Method POST `
    -ContentType "application/json" `
    -Body $msgBody `
    -WebSession $session
  
  Write-Host "✅ Message sent: $($msg.content) (ID: $($msg.id))"
} catch {
  Write-Host "❌ Error: $($_.Exception.Message)"
}

Write-Host "`n📋 Getting messages..."
$msgs = Invoke-RestMethod -Uri "http://localhost:4001/api/chat/rooms/$($room.id)/messages" `
  -Method GET `
  -WebSession $session

Write-Host "✅ Total messages: $($msgs.Length)"
if ($msgs) { $msgs | ForEach-Object { Write-Host "  - $($_.content)" } }

