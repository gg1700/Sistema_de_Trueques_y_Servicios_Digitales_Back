$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"

# Read the file as raw bytes to preserve encoding
$bytes = [System.IO.File]::ReadAllBytes($path)
$content = [System.Text.Encoding]::UTF8.GetString($bytes)

# Fix mojibake - these are double-encoded UTF-8 characters
$fixes = @{
    'Ãƒâ€šÃ‚Â¡' = '¡'
    'ÃƒÆ'Ã‚Â³' = 'ó'
    'ÃƒÆ'Ã‚Â¡' = 'á'
    'ÃƒÆ'Ã‚Â©' = 'é'
    'ÃƒÆ'Ã‚Â­' = 'í'
    'ÃƒÆ'Ã‚Âº' = 'ú'
    'ÃƒÆ'Ã‚Â±' = 'ñ'
    'ÃƒÆ'Ã¢â‚¬Å¡Ã‚Â¿' = '¿'
    'Ã¡' = 'á'
    'Ã©' = 'é'
    'Ã­' = 'í'
    'Ã³' = 'ó'
    'Ãº' = 'ú'
    'Ã±' = 'ñ'
    'Â¡' = '¡'
    'Â¿' = '¿'
}

foreach ($bad in $fixes.Keys) {
    $good = $fixes[$bad]
    $content = $content.Replace($bad, $good)
}

# Save with proper UTF-8 encoding (no BOM)
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)

Write-Host "Encoding issues fixed in UserProfile.tsx"
