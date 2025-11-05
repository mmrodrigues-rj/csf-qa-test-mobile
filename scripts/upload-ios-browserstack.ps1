# Upload iOS app to BrowserStack and test
# PowerShell version for Windows

Write-Host "🚀 Testing iOS Upload to BrowserStack..." -ForegroundColor Cyan
Write-Host ""

# Check credentials
if (-not $env:BROWSERSTACK_USERNAME -or -not $env:BROWSERSTACK_ACCESS_KEY) {
    Write-Host "❌ Missing credentials!" -ForegroundColor Red
    Write-Host "Set BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY environment variables"
    exit 1
}

Write-Host "✅ Credentials found" -ForegroundColor Green

# Create zip
Write-Host ""
Write-Host "📦 Creating iOS app zip..." -ForegroundColor Cyan
Push-Location apps\ios

if (Test-Path "wdiodemoapp.zip") {
    Remove-Item "wdiodemoapp.zip"
}

# Use PowerShell Compress-Archive
Compress-Archive -Path "Payload\*" -DestinationPath "wdiodemoapp.zip" -CompressionLevel Optimal

$zipSize = (Get-Item "wdiodemoapp.zip").Length / 1MB
Write-Host "✅ Created wdiodemoapp.zip ($([math]::Round($zipSize, 2)) MB)" -ForegroundColor Green
Pop-Location

# Upload to BrowserStack
Write-Host ""
Write-Host "☁️  Uploading to BrowserStack..." -ForegroundColor Cyan
$CUSTOM_ID = "wdio-native-demo-ios-v1_0_8"

$auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${env:BROWSERSTACK_USERNAME}:${env:BROWSERSTACK_ACCESS_KEY}"))

$boundary = [System.Guid]::NewGuid().ToString()
$filePath = Resolve-Path "apps\ios\wdiodemoapp.zip"
$fileBytes = [System.IO.File]::ReadAllBytes($filePath)
$fileName = [System.IO.Path]::GetFileName($filePath)

$bodyLines = @(
    "--$boundary",
    "Content-Disposition: form-data; name=`"file`"; filename=`"$fileName`"",
    "Content-Type: application/zip",
    "",
    [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString($fileBytes),
    "--$boundary",
    "Content-Disposition: form-data; name=`"custom_id`"",
    "",
    $CUSTOM_ID,
    "--$boundary--"
)

$body = $bodyLines -join "`r`n"

try {
    $response = Invoke-RestMethod -Uri "https://api-cloud.browserstack.com/app-automate/upload" `
        -Method Post `
        -Headers @{
            "Authorization" = "Basic $auth"
        } `
        -ContentType "multipart/form-data; boundary=$boundary" `
        -Body $body

    Write-Host ""
    Write-Host "📋 Upload Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10

    if ($response.app_url) {
        Write-Host ""
        Write-Host "✅ Upload successful!" -ForegroundColor Green
        Write-Host "App URL: $($response.app_url)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "📋 You can now run tests with:" -ForegroundColor Cyan
        Write-Host "  `$env:BROWSERSTACK_APP_URL = '$($response.app_url)'" -ForegroundColor White
        Write-Host "  npm run test:browserstack:ios" -ForegroundColor White
        
        # Set for current session
        $env:BROWSERSTACK_APP_URL = $response.app_url
        Write-Host ""
        Write-Host "✅ BROWSERSTACK_APP_URL set for current session" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Failed to extract app_url from response" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ Upload failed: $_" -ForegroundColor Red
    exit 1
}
