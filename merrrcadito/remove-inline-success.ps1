$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\ServiceRegistrationForm.tsx"
$lines = Get-Content $path

# Lines 148 to 153 (1-based) correspond to indices 147 to 152 (0-based)
$startIndex = 147
$endIndex = 152

# Verify we are removing the right lines
$firstLine = $lines[$startIndex]
Write-Host "Removing block starting with: $firstLine"

# Create new content
$before = $lines[0..($startIndex-1)]
$after = $lines[($endIndex+1)..($lines.Count-1)]
$newContent = $before + $after

Set-Content -Path $path -Value $newContent -Encoding UTF8
Write-Host "Successfully removed inline success message."
