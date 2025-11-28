$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"
$content = Get-Content -Path $path -Raw -Encoding UTF8

# Target string (Malformed Events section)
$target = '        {!loading && !error && activeTab === "events" && (
          <EventsSection userId={user?.cod_us ?? 0} />




        {!loading && !error && activeTab === "explore" && ('

# Replacement string (Corrected Events section)
$replacement = '        {!loading && !error && activeTab === "events" && (
          <EventsSection userId={user?.cod_us ?? 0} />
        )}

        {!loading && !error && activeTab === "explore" && ('

# Normalize line endings
$content = $content -replace "`r`n", "`n"
$target = $target -replace "`r`n", "`n"
$replacement = $replacement -replace "`r`n", "`n"

if ($content.Contains($target)) {
    $content = $content.Replace($target, $replacement)
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
    Write-Host "Events JSX fixed successfully"
} else {
    Write-Host "Target for Events JSX not found"
    # Debug: print what it found around that area
    $lines = $content -split "`n"
    for ($i=0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match 'EventsSection') {
            Write-Host "Found at line $i : $($lines[$i])"
            Write-Host "Next line: $($lines[$i+1])"
            Write-Host "Next line: $($lines[$i+2])"
        }
    }
}
