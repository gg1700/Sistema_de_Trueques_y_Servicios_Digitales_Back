$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"
$content = Get-Content -Path $path -Raw -Encoding UTF8

# Target: The ExploreSection block followed immediately by the menuOverlay div
# We want to insert the opening of the isMenuOpen block between them.

$target = '        {!loading && !error && activeTab === "explore" && (
          <ExploreSection currentUserId={user?.cod_us ?? 0} />
        )}
          <div
            className={styles.menuOverlay}'

$replacement = '        {!loading && !error && activeTab === "explore" && (
          <ExploreSection currentUserId={user?.cod_us ?? 0} />
        )}

        {isMenuOpen && (
          <>
            <div
              className={styles.menuOverlay}'

# Normalize line endings
$content = $content -replace "`r`n", "`n"
$target = $target -replace "`r`n", "`n"
$replacement = $replacement -replace "`r`n", "`n"

# Also try a version with different whitespace just in case
$targetRegex = '(?s)\{!loading && !error && activeTab === "explore" && \(\s*<ExploreSection currentUserId=\{user\?\.cod_us \?\? 0\} />\s*\)\}\s*<div\s+className=\{styles\.menuOverlay\}'

if ($content.Contains($target)) {
    $content = $content.Replace($target, $replacement)
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
    Write-Host "Fixed isMenuOpen block successfully"
} elseif ($content -match $targetRegex) {
    # Construct replacement for regex match
    # We need to be careful with regex replacement to preserve the div content if we matched it
    # But here we are just matching the start of the div.
    
    # Let's try a simpler string replacement if the exact match failed due to whitespace
    # We'll look for the ExploreSection closing and the div start separately if needed, 
    # but let's try to be precise first.
    
    Write-Host "Exact match failed, trying regex..."
    $content = $content -replace $targetRegex, "$&" # This doesn't help modify it.
    
    # Let's just use string replacement on the div tag itself if it's unique enough in this context
    $divTarget = '<div
            className={styles.menuOverlay}
            onClick={() => setIsMenuOpen(false)}
          />'
          
    $divReplacement = '{isMenuOpen && (
          <>
            <div
              className={styles.menuOverlay}
              onClick={() => setIsMenuOpen(false)}
            />'
            
    $divTarget = $divTarget -replace "`r`n", "`n"
    $divReplacement = $divReplacement -replace "`r`n", "`n"
    
    if ($content.Contains($divTarget)) {
         $content = $content.Replace($divTarget, $divReplacement)
         $utf8NoBom = New-Object System.Text.UTF8Encoding $false
         [System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
         Write-Host "Fixed isMenuOpen block using div target"
    } else {
        Write-Host "Could not find target to fix"
    }
} else {
     # Fallback: Try to find the div by itself
    $divTarget = '<div
            className={styles.menuOverlay}
            onClick={() => setIsMenuOpen(false)}
          />'
          
    $divReplacement = '{isMenuOpen && (
          <>
            <div
              className={styles.menuOverlay}
              onClick={() => setIsMenuOpen(false)}
            />'
            
    $divTarget = $divTarget -replace "`r`n", "`n"
    $divReplacement = $divReplacement -replace "`r`n", "`n"
    
    if ($content.Contains($divTarget)) {
         $content = $content.Replace($divTarget, $divReplacement)
         $utf8NoBom = New-Object System.Text.UTF8Encoding $false
         [System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
         Write-Host "Fixed isMenuOpen block using div target (fallback)"
    } else {
        Write-Host "Could not find target to fix (fallback)"
    }
}
