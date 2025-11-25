$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"
$content = Get-Content -Path $path -Raw -Encoding UTF8

# Target string
$target = 'function OffersSection({ offers }: OffersSectionProps) {'

# Replacement string
$replacement = 'function OffersSection({ offers, services }: OffersSectionProps) {'

if ($content.Contains($target)) {
    $content = $content.Replace($target, $replacement)
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
    Write-Host "OffersSection signature fixed successfully"
} else {
    Write-Host "Target for OffersSection signature not found"
}
