$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"
$content = Get-Content -Path $path -Raw -Encoding UTF8

# Target string (Events button closing tag and nav closing tag)
$target = '            onClick={() => setActiveTab("events")}
          >
            Eventos
          </button>
        </nav>'

# Replacement string (Events button, Explore button, nav closing tag)
$replacement = '            onClick={() => setActiveTab("events")}
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

# Normalize line endings
$content = $content -replace "`r`n", "`n"
$target = $target -replace "`r`n", "`n"
$replacement = $replacement -replace "`r`n", "`n"

if ($content.Contains($target)) {
    $content = $content.Replace($target, $replacement)
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
    Write-Host "Explore tab added successfully"
} else {
    Write-Host "Target for Explore tab not found"
}
