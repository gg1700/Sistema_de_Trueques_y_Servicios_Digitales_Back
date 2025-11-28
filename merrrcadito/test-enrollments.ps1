# Test script to verify enrollments endpoint
$userId = 2
$url = "http://localhost:5000/api/enrollments/user/$userId"

Write-Host "Testing endpoint: $url"
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $url -Method Get -ErrorAction Stop
    Write-Host "✓ Endpoint responded successfully"
    Write-Host ""
    Write-Host "Response:"
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "✗ Error calling endpoint:"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        Write-Host "Status Code:" $_.Exception.Response.StatusCode.value__
    }
}
