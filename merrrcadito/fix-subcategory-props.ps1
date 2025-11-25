$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"
$content = Get-Content -Path $path -Raw -Encoding UTF8

# Fix deduplication logic
$oldDedup = 'new Map(filtered.map((item) => [item.cod_subcat, item])).values()'
$newDedup = 'new Map(filtered.map((item) => [item.cod_subcat_prod, item])).values()'
$content = $content.Replace($oldDedup, $newDedup)

# Fix rendering logic
$oldRenderKey = 'key={sub.cod_subcat}'
$newRenderKey = 'key={sub.cod_subcat_prod}'
$content = $content.Replace($oldRenderKey, $newRenderKey)

$oldRenderValue = 'value={sub.cod_subcat}'
$newRenderValue = 'value={sub.cod_subcat_prod}'
$content = $content.Replace($oldRenderValue, $newRenderValue)

$oldRenderLabel = '{sub.nom_subcat}'
$newRenderLabel = '{sub.nom_subcat_prod}'
$content = $content.Replace($oldRenderLabel, $newRenderLabel)

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
Write-Host "Fixed property names in UserProfile.tsx"
