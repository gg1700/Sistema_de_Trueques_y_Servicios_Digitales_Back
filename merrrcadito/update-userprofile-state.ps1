$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"
$content = Get-Content $path -Raw

$oldState = 'const [showSuccessModal, setShowSuccessModal] = useState(false);'
$newState = 'const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("¡Publicación Exitosa!");
  const [modalMessage, setModalMessage] = useState("Tu producto ha sido publicado correctamente y ya está visible en el mercado.");'

# Normalize line endings
$content = $content.Replace("`r`n", "`n")
$oldState = $oldState.Replace("`r`n", "`n")
$newState = $newState.Replace("`r`n", "`n")

if ($content.Contains($oldState)) {
    $content = $content.Replace($oldState, $newState)
    Set-Content -Path $path -Value $content -Encoding UTF8
    Write-Host "State updated successfully."
} else {
    Write-Host "State NOT updated. Could not find match."
    # Debug
    $content | Select-String "const \[showSuccessModal" -Context 0,2
}
