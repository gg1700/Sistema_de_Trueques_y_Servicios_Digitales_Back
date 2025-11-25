$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\EventsSection.tsx"
$content = Get-Content -Path $path -Raw -Encoding UTF8

# Update the API base URL
$old = 'const ENROLLMENTS_API_BASE =
    process.env.NEXT_PUBLIC_ENROLLMENTS_API_BASE_URL ??
    "http://localhost:5000/api/enrollments";'

$new = 'const ENROLLMENTS_API_BASE =
    process.env.NEXT_PUBLIC_ENROLLMENTS_API_BASE_URL ??
    "http://localhost:5000/api/event-enrollments";'

$content = $content.Replace($old, $new)

# Normalize line endings
$content = $content -replace "`r`n", "`n"

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
Write-Host "EventsSection API URL updated successfully"
