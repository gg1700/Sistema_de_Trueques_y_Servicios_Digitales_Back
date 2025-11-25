$userId = 2
$url = "http://localhost:5000/api/enrollments/user/$userId"

Write-Host "Testing endpoint: $url"

try {
    $response = Invoke-RestMethod -Uri $url -Method Get
    Write-Host "Success! Response:"
    $response | ConvertTo-Json
} catch {
    Write-Host "Error: $_"
}
