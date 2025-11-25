$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"
$content = Get-Content -Path $path -Raw -Encoding UTF8

# Sequential replacements to avoid hash map syntax errors
$content = $content.Replace('CategorÃƒÂ­a', 'Categoría')
$content = $content.Replace('SubcategorÃƒÂ­a', 'Subcategoría')
$content = $content.Replace('DescripciÃƒÂ³n', 'Descripción')
$content = $content.Replace('mÃƒÂ¡x', 'máx')
$content = $content.Replace('CÃƒÂ¡mara', 'Cámara')
$content = $content.Replace('tÃƒÂ­tulo', 'título')
$content = $content.Replace('aÃƒÂºn', 'aún')
$content = $content.Replace('PublicaciÃƒÂ³n', 'Publicación')
$content = $content.Replace('Ã‚Â¡', '¡')
$content = $content.Replace('categorÃ­as/subcategorÃ­as', 'categorías/subcategorías')

# Also try the single-encoded versions just in case
$content = $content.Replace('CategorÃ­a', 'Categoría')
$content = $content.Replace('SubcategorÃ­a', 'Subcategoría')
$content = $content.Replace('DescripciÃ³n', 'Descripción')
$content = $content.Replace('mÃ¡x', 'máx')
$content = $content.Replace('CÃ¡mara', 'Cámara')
$content = $content.Replace('tÃ­tulo', 'título')
$content = $content.Replace('aÃºn', 'aún')
$content = $content.Replace('PublicaciÃ³n', 'Publicación')

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
Write-Host "Fixed encoding issues in UserProfile.tsx"
