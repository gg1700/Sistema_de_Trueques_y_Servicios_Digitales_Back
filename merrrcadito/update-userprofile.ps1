$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"
$content = Get-Content $path -Raw

# 1. Add state
$oldState = 'const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [publishType, setPublishType] = useState<PublishType>("product");'
$newState = 'const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("¡Publicación Exitosa!");
    const [modalMessage, setModalMessage] = useState("Tu producto ha sido publicado correctamente y ya está visible en el mercado.");
    const [publishType, setPublishType] = useState<PublishType>("product");'

# 2. Update Modal JSX
$oldModal = '<h2 className={styles.successTitle}>¡Publicación Exitosa!</h2>
              <p className={styles.successMessage}>
                Tu producto ha sido publicado correctamente y ya está visible en el mercado.
              </p>'
$newModal = '<h2 className={styles.successTitle}>{modalTitle}</h2>
              <p className={styles.successMessage}>
                {modalMessage}
              </p>'

# 3. Update ServiceRegistrationForm usage
$oldService = '{publishType === "service" && (
        <ServiceRegistrationForm userId={userId} onSuccess={() => { }} />
      )}'
$newService = '{publishType === "service" && (
        <ServiceRegistrationForm 
          userId={userId} 
          onSuccess={() => {
            setModalTitle("¡Servicio Registrado!");
            setModalMessage("Tu servicio ha sido registrado correctamente y ya está visible en el mercado.");
            setShowSuccessModal(true);
          }}
          onDuplicate={() => {
            setModalTitle("¡Servicio Ya Registrado!");
            setModalMessage("Este servicio ya se encuentra registrado en tu perfil.");
            setShowSuccessModal(true);
          }}
        />
      )}'

# Normalize line endings
$content = $content.Replace("`r`n", "`n")
$oldState = $oldState.Replace("`r`n", "`n")
$newState = $newState.Replace("`r`n", "`n")
$oldModal = $oldModal.Replace("`r`n", "`n")
$newModal = $newModal.Replace("`r`n", "`n")
$oldService = $oldService.Replace("`r`n", "`n")
$newService = $newService.Replace("`r`n", "`n")

# Apply replacements
if ($content.Contains($oldState)) {
    $content = $content.Replace($oldState, $newState)
    Write-Host "State updated."
} else {
    Write-Host "State NOT updated."
}

if ($content.Contains($oldModal)) {
    $content = $content.Replace($oldModal, $newModal)
    Write-Host "Modal JSX updated."
} else {
    Write-Host "Modal JSX NOT updated. Searching for partial match..."
    # Fallback for modal if exact match fails due to whitespace
    $content = $content -replace '<h2 className=\{styles.successTitle\}>¡Publicación Exitosa!</h2>\s*<p className=\{styles.successMessage\}>\s*Tu producto ha sido publicado correctamente y ya está visible en el mercado.\s*</p>', $newModal
}

if ($content.Contains($oldService)) {
    $content = $content.Replace($oldService, $newService)
    Write-Host "Service usage updated."
} else {
    Write-Host "Service usage NOT updated."
}

Set-Content -Path $path -Value $content -Encoding UTF8
