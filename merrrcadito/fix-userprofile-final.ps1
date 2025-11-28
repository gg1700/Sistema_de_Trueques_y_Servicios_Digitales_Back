$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"
$content = Get-Content -Path $path -Raw -Encoding UTF8

# 1. Add Explore Tab Button
$oldTab = '          <button
            type="button"
            className={`${styles.tab} ${activeTab === "events" ? "tabActive" : ""
              }`}
            onClick={() => setActiveTab("events")}
          >
            Eventos
          </button>
        </nav>'

$newTab = '          <button
            type="button"
            className={`${styles.tab} ${activeTab === "events" ? "tabActive" : ""
              }`}
            onClick={() => setActiveTab("events")}
          >
            Eventos
          </button>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === "explore" ? "tabActive" : ""
              }`}
            onClick={() => setActiveTab("explore")}
          >
            Explorar
          </button>
        </nav>'

# Normalize line endings for replacement
$content = $content -replace "`r`n", "`n"
$oldTab = $oldTab -replace "`r`n", "`n"
$newTab = $newTab -replace "`r`n", "`n"

if ($content.Contains($oldTab)) {
    $content = $content.Replace($oldTab, $newTab)
    Write-Host "✓ Added Explore tab button"
} else {
    Write-Host "⚠ Could not find Explore tab button target"
}

# 2. Fix Events Section JSX
$oldEvents = '        {!loading && !error && activeTab === "events" && (
          <EventsSection userId={user?.cod_us ?? 0} />




        {!loading && !error && activeTab === "explore" && ('

$newEvents = '        {!loading && !error && activeTab === "events" && (
          <EventsSection userId={user?.cod_us ?? 0} />
        )}

        {!loading && !error && activeTab === "explore" && ('

# Normalize line endings for replacement
$oldEvents = $oldEvents -replace "`r`n", "`n"
$newEvents = $newEvents -replace "`r`n", "`n"

if ($content.Contains($oldEvents)) {
    $content = $content.Replace($oldEvents, $newEvents)
    Write-Host "✓ Fixed EventsSection JSX"
} else {
    Write-Host "⚠ Could not find EventsSection JSX target"
    # Fallback: try to find it with flexible whitespace
    $regexPattern = '\{!loading && !error && activeTab === "events" && \(\s*<EventsSection userId=\{user\?\.cod_us \?\? 0\} />\s*\{!loading && !error && activeTab === "explore" && \('
    if ($content -match $regexPattern) {
         $content = $content -replace $regexPattern, $newEvents
         Write-Host "✓ Fixed EventsSection JSX using regex"
    }
}

# Save file
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
Write-Host "File saved"
