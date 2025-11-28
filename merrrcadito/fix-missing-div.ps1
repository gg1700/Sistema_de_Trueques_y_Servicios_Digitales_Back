$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"
$content = Get-Content -Path $path -Raw -Encoding UTF8

# Target: ExploreSection block
$target = '        {!loading && !error && activeTab === "explore" && (
          <ExploreSection currentUserId={user?.cod_us ?? 0} />
        )}'

# Replacement: ExploreSection block + closing div
$replacement = '        {!loading && !error && activeTab === "explore" && (
          <ExploreSection currentUserId={user?.cod_us ?? 0} />
        )}
      </div>'

# Normalize line endings
$content = $content -replace "`r`n", "`n"
$target = $target -replace "`r`n", "`n"
$replacement = $replacement -replace "`r`n", "`n"

if ($content.Contains($target)) {
    # Check if div is already closed to avoid double closing
    $checkStr = $target + "`n      </div>"
    $checkStr = $checkStr -replace "`r`n", "`n"
    
    if ($content.Contains($checkStr)) {
        Write-Host "Div already closed"
    } else {
        $content = $content.Replace($target, $replacement)
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
        Write-Host "Added missing closing div successfully"
    }
} else {
    Write-Host "Target for ExploreSection not found"
}
