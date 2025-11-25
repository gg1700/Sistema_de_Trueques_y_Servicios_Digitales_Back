$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"

# Read the file
$content = Get-Content -Path $path -Raw

# Fix all broken template literals - add backticks around them
$content = $content -replace '(\s+)(\$\{CATEGORIES_API_BASE\}\?tipo_cat=Producto)', '$1`$2`'
$content = $content -replace '(\s+)(\$\{SUBCATEGORIES_API_BASE\})', '$1`$2`'
$content = $content -replace '(\s+)(\$\{POSTS_API_BASE\}/all_active_product_posts)', '$1`$2`'
$content = $content -replace '(\$\{PUBLICATIONS_API_BASE\}/\$\{p\.cod_pub \?\? p\.id \?\? 0\}/image)', '`$1`'
$content = $content -replace '(\$\{SERVICES_API_BASE\}/user/\$\{codUs\})', '`$1`'
$content = $content -replace 'image: s\.foto_serv \? (\$\{Buffer\.from\(s\.foto_serv\)\.toString\(''base64''\)\})', 'image: s.foto_serv ? `data:image/jpeg;base64,$1`'
$content = $content -replace '(\$\{USERS_API_BASE\}/get_user_data\?handle_name=\$\{encodeURIComponent\()', '`$1'
$content = $content -replace '(resolvedHandle\s*\)\})', '$1`'
$content = $content -replace '(\$\{PRODUCTS_API_BASE\}/register\?cod_subcat_prod=\$\{encodeURIComponent\()', '`$1'
$content = $content -replace '(productForm\.subcategory\s*\)\})', '$1`'
$content = $content -replace '(\$\{POSTS_API_BASE\}/create\?cod_us=\$\{user\.cod_us\}&cod_prod=\$\{codProd\})', '`$1`'
$content = $content -replace 'alert\((\$\{err\.message\})\)', 'alert(`Error: $1`)'
$content = $content -replace '(\$\{user\.nom_us\} \$\{user\.ap_pat_us\} \$\{user\.ap_mat_us \?\? ""\})', '`$1`'
$content = $content -replace '(\$\{USERS_API_BASE\}/\$\{user\.cod_us\}/image)', '`$1`'

# Fix any remaining template literal issues
$content = $content -replace '`\s*\$\{', '`${'
$content = $content -replace '\}\s*`', '}`'

# Save with UTF-8 encoding
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)

Write-Host "All template literals fixed in UserProfile.tsx"
