$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"

# Read content
$content = Get-Content -Path $path -Raw -Encoding UTF8

# Fix common mojibake patterns
$content = $content -replace 'Ã¡', 'á'
$content = $content -replace 'Ã©', 'é'
$content = $content -replace 'Ã­', 'í'
$content = $content -replace 'Ã³', 'ó'
$content = $content -replace 'Ãº', 'ú'
$content = $content -replace 'Ã±', 'ñ'
$content = $content -replace 'Â¡', '¡'
$content = $content -replace 'Â¿', '¿'

# Fix specific strings that are known to be wrong
$content = $content -replace 'PublicaciÃƒÆ''Ã‚Â³n', 'Publicación'
$content = $content -replace 'estÃƒÆ''Ã‚Â¡', 'está'
$content = $content -replace 'ÃƒÆ''Ã‚Â¡', 'á'
$content = $content -replace 'ÃƒÆ''Ã‚Â³', 'ó'

# Save with UTF-8 no BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)

Write-Host "Fixed encoding issues"
