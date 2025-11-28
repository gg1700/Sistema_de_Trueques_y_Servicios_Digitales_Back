$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"

# Read file
$lines = Get-Content -Path $path -Encoding UTF8

# Fix line 207 - missing backticks
if ($lines[206] -match '^\s+const resSub = await fetch\(\$\{SUBCATEGORIES_API_BASE\}\);') {
    $lines[206] = $lines[206] -replace 'fetch\(\$\{SUBCATEGORIES_API_BASE\}\)', 'fetch(`${SUBCATEGORIES_API_BASE}`)'
    Write-Host "Fixed line 207"
}

# Fix line 238 if needed
if ($lines[237] -match '^\s+\$\{POSTS_API_BASE\}/all_active_product_posts' -and $lines[237] -notmatch '`\$\{POSTS_API_BASE\}') {
    $lines[237] = $lines[237] -replace '(\s+)(\$\{POSTS_API_BASE\}/all_active_product_posts)', '$1`$2`'
    Write-Host "Fixed line 238"
}

# Fix line 264 if needed
if ($lines[263] -match '^\s+\$\{SERVICES_API_BASE\}/user/\$\{codUs\}' -and $lines[263] -notmatch '`\$\{SERVICES_API_BASE\}') {
    $lines[263] = $lines[263] -replace '(\s+)(\$\{SERVICES_API_BASE\}/user/\$\{codUs\})', '$1`$2`'
    Write-Host "Fixed line 264"
}

# Fix line 296 if needed
if ($lines[295] -match '^\s+\$\{USERS_API_BASE\}/get_user_data' -and $lines[295] -notmatch '`\$\{USERS_API_BASE\}') {
    $lines[295] = $lines[295] -replace '(\s+)(\$\{USERS_API_BASE\}/get_user_data\?handle_name=\$\{encodeURIComponent\()', '$1`$2'
    Write-Host "Fixed line 296"
}

# Fix line 456 if needed  
if ($lines[455] -match '^\s+\$\{POSTS_API_BASE\}/create' -and $lines[455] -notmatch '`\$\{POSTS_API_BASE\}') {
    $lines[455] = $lines[455] -replace '(\s+)(\$\{POSTS_API_BASE\}/create\?cod_us=\$\{user\.cod_us\}&cod_prod=\$\{codProd\})', '$1`$2`'
    Write-Host "Fixed line 456"
}

# Save with UTF-8 encoding
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllLines($path, $lines, $utf8NoBom)

Write-Host "All template literal lines fixed!"
