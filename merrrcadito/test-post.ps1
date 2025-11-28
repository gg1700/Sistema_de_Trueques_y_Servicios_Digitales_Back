# Test POST request to create publication
$body = @{
    estado_pub = "activo"
    contenido = "Test publication"
    cant_prod = 10
    unidad_medida = "kg"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/posts/create?cod_us=1&cod_prod=1" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -UseBasicParsing

Write-Host "Status Code: $($response.StatusCode)"
Write-Host "Response: $($response.Content)"
