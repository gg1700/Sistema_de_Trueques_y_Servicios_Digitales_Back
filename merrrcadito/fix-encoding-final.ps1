$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"
$content = Get-Content -Path $path -Raw -Encoding UTF8

# Map of corrupted sequences to correct characters
$replacements = @{
    'CategorÃƒÂa' = 'Categoría'
    'CategorÃa' = 'Categoría'
    'SubcategorÃƒÂa' = 'Subcategoría'
    'SubcategorÃa' = 'Subcategoría'
    'DescripciÃƒÂ³n' = 'Descripción'
    'DescripciÃ³n' = 'Descripción'
    'mÃƒÂ¡x' = 'máx'
    'mÃ¡x' = 'máx'
    'CÃƒÂ¡mara' = 'Cámara'
    'CÃ¡mara' = 'Cámara'
    'tÃƒÂ­tulo' = 'título'
    'tÃ­tulo' = 'título'
    'aÃƒÂºn' = 'aún'
    'aÃºn' = 'aún'
    'PublicaciÃƒÂ³n' = 'Publicación'
    'PublicaciÃ³n' = 'Publicación'
    'Ã‚Â¡' = '¡'
    'Ã¡' = 'á'
    'Ã©' = 'é'
    'Ã­' = 'í'
    'Ã³' = 'ó'
    'Ãº' = 'ú'
    'Ã±' = 'ñ'
    'Ã' = 'í' # Be careful with this one, context matters, but often Ã followed by nothing valid is í in some mojibake
}

foreach ($key in $replacements.Keys) {
    $content = $content.Replace($key, $replacements[$key])
}

# Specific fixes for common words if the generic replacement missed them
$content = $content.Replace('CategorÃa', 'Categoría')
$content = $content.Replace('SubcategorÃa', 'Subcategoría')
$content = $content.Replace('DescripciÃ³n', 'Descripción')

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
Write-Host "Fixed encoding issues in UserProfile.tsx"
