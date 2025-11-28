$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"

# Read file
$content = Get-Content -Path $path -Raw -Encoding UTF8

# Fix line 396 - missing backticks around fetch URL
$content = $content -replace '(\s+)\{PRODUCTS_API_BASE\}/register\?cod_subcat_prod=\$\{encodeURIComponent\(', '$1`${PRODUCTS_API_BASE}/register?cod_subcat_prod=${encodeURIComponent('

# Fix line 479 - missing backticks around alert message
$content = $content -replace 'alert\(Error: \$\{err\.message\}\)', 'alert(`Error: ${err.message}`)'

# Fix line 515 - missing backticks around user name template
$content = $content -replace '(\s+)\$\{user\.nom_us\} \$\{user\.ap_pat_us\} \{user\.ap_mat_us', '$1`${user.nom_us} ${user.ap_pat_us} ${user.ap_mat_us'

# Fix lines 680-708 - className with double dollar signs
$content = $content -replace 'className=\{\$\$\{styles\.tab\}', 'className={`${styles.tab}'

# Fix line 790 - className with double dollar signs
$content = $content -replace 'className=\{\$\$\{styles\.sideMenuLink\}', 'className={`${styles.sideMenuLink}'

# Fix lines 1043-1057 - className with double dollar signs for publishTab
$content = $content -replace 'className=\{\$\$\{styles\.publishTab\}', 'className={`${styles.publishTab}'

# Fix lines 1063, 1208, 1223 - conditional rendering with wrong syntax
$content = $content -replace '(\s+)\$\{publishType === "product"', '$1{publishType === "product"'
$content = $content -replace '(\s+)\$\{publishType === "service"', '$1{publishType === "service"'
$content = $content -replace '(\s+)\$\{publishType === "exchange"', '$1{publishType === "exchange"'

# Save with UTF-8 encoding
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)

Write-Host "All template literal errors fixed!"
Write-Host "- Fixed line 396: fetch URL"
Write-Host "- Fixed line 479: alert message"
Write-Host "- Fixed line 515: user name template"
Write-Host "- Fixed lines 680-708: tab classNames"
Write-Host "- Fixed line 790: sideMenuLink className"
Write-Host "- Fixed lines 1043-1057: publishTab classNames"
Write-Host "- Fixed lines 1063, 1208, 1223: conditional rendering"
