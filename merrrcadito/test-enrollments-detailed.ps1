# Direct test of the enrollments endpoint
Write-Host "Testing enrollments endpoint..."
Write-Host ""

$userId = 2
$baseUrl = "http://localhost:5000"

# Test 1: Check if base API is responding
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api" -Method Get -TimeoutSec 3
    Write-Host "✓ Base API responding"
} catch {
    Write-Host "✗ Base API not responding"
    Write-Host "  Error: $($_.Exception.Message)"
}

Write-Host ""

# Test 2: Try the enrollments endpoint
$endpoints = @(
    "/api/event-enrollments/user/$userId",
    "/api/enrollments/user/$userId"
)

foreach ($endpoint in $endpoints) {
    $url = "$baseUrl$endpoint"
    Write-Host "Testing: $url"
    try {
        $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 3
        Write-Host "  ✓ Status: $($response.StatusCode)"
        Write-Host "  Content-Type: $($response.Headers['Content-Type'])"
        $content = $response.Content
        if ($content.StartsWith("<!DOCTYPE") -or $content.StartsWith("<html")) {
            Write-Host "  ✗ WARNING: Received HTML instead of JSON"
            Write-Host "  First 100 chars: $($content.Substring(0, [Math]::Min(100, $content.Length)))"
        } else {
            Write-Host "  ✓ Received JSON response"
            $json = $content | ConvertFrom-Json
            Write-Host "  Data: $($json | ConvertTo-Json -Compress)"
        }
    } catch {
        Write-Host "  ✗ Error: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            Write-Host "  Status Code: $($_.Exception.Response.StatusCode.value__)"
        }
    }
    Write-Host ""
}
