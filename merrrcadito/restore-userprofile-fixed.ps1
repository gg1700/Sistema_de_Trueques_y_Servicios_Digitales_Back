$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"

# Read the original content you provided
$content = Get-Content -Path $path -Raw -Encoding UTF8

# Fix the broken template literals
$content = $content -replace '\$\{CATEGORIES_API_BASE\}', '${CATEGORIES_API_BASE}'
$content = $content -replace '\$\{SUBCATEGORIES_API_BASE\}', '${SUBCATEGORIES_API_BASE}'
$content = $content -replace '\$\{POSTS_API_BASE\}', '${POSTS_API_BASE}'
$content = $content -replace '\$\{PUBLICATIONS_API_BASE\}', '${PUBLICATIONS_API_BASE}'
$content = $content -replace '\$\{SERVICES_API_BASE\}', '${SERVICES_API_BASE}'
$content = $content -replace '\$\{USERS_API_BASE\}', '${USERS_API_BASE}'

# Write back with UTF8 encoding
Set-Content -Path $path -Value $content -Encoding UTF8 -NoNewline
Write-Host "Template literals fixed in UserProfile.tsx"
