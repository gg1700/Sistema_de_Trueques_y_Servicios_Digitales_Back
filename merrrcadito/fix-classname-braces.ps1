$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"

# Read file
$content = Get-Content -Path $path -Raw -Encoding UTF8

# Fix className with extra closing brace
$content = $content -replace 'className=\{`\$\{styles\.tab\} \}', 'className={`${styles.tab} ${activeTab === "offers" ? "tabActive" : ""}`}'
$content = $content -replace 'className=\{`\$\{styles\.sideMenuLink\} \}', 'className={`${styles.sideMenuLink} ${isActive ? "sideMenuLinkActive" : ""}`}'
$content = $content -replace 'className=\{`\$\{styles\.publishTab\} \}', 'className={`${styles.publishTab} ${publishType === "product" ? "publishTabActive" : ""}`}'

# Save with UTF-8 encoding
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)

Write-Host "Fixed className template literals with extra braces"
