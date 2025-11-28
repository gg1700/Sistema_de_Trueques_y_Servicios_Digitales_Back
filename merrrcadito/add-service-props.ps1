$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"

# Read the file
$content = Get-Content -Path $path -Raw

# 1. Add modal state after showSuccessModal
$oldState = '  const [showSuccessModal, setShowSuccessModal] = useState(false);'
$newState = @'
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("¡Publicación Exitosa!");
  const [modalMessage, setModalMessage] = useState("Tu producto ha sido publicado correctamente y ya está visible en el mercado.");
'@

if ($content -match [regex]::Escape($oldState) -and $content -notmatch 'const \[modalTitle') {
    $content = $content -replace [regex]::Escape($oldState), $newState
    Write-Host "Added modal state"
} else {
    Write-Host "Modal state already exists or pattern not found"
}

# 2. Add props to PublishSectionProps interface
$oldPropsInterface = @'
  categories: Category[];
  filteredSubcategories: Subcategory[];
  userId: number;
}
'@

$newPropsInterface = @'
  categories: Category[];
  filteredSubcategories: Subcategory[];
  userId: number;
  setModalTitle: (title: string) => void;
  setModalMessage: (msg: string) => void;
  setShowSuccessModal: (show: boolean) => void;
}
'@

if ($content -match [regex]::Escape($oldPropsInterface) -and $content -notmatch 'setModalTitle: \(title: string\)') {
    $content = $content -replace [regex]::Escape($oldPropsInterface), $newPropsInterface
    Write-Host "Updated PublishSectionProps interface"
} else {
    Write-Host "Props interface already updated or pattern not found"
}

# 3. Add props to PublishSection function signature
$oldFunctionSig = @'
  categories,
  filteredSubcategories,
  userId,
}: PublishSectionProps) {
'@

$newFunctionSig = @'
  categories,
  filteredSubcategories,
  userId,
  setModalTitle,
  setModalMessage,
  setShowSuccessModal,
}: PublishSectionProps) {
'@

if ($content -match [regex]::Escape($oldFunctionSig) -and $content -notmatch 'setModalTitle,\s*setModalMessage,\s*setShowSuccessModal,') {
    $content = $content -replace [regex]::Escape($oldFunctionSig), $newFunctionSig
    Write-Host "Updated PublishSection function signature"
} else {
    Write-Host "Function signature already updated or pattern not found"
}

# 4. Add props when rendering PublishSection
$oldRender = @'
            categories={categories}
            filteredSubcategories={filteredSubcategories}
            userId={user?.cod_us ?? 0}
          />
'@

$newRender = @'
            categories={categories}
            filteredSubcategories={filteredSubcategories}
            userId={user?.cod_us ?? 0}
            setModalTitle={setModalTitle}
            setModalMessage={setModalMessage}
            setShowSuccessModal={setShowSuccessModal}
          />
'@

if ($content -match [regex]::Escape($oldRender) -and $content -notmatch 'setModalTitle=\{setModalTitle\}') {
    $content = $content -replace [regex]::Escape($oldRender), $newRender
    Write-Host "Updated PublishSection render props"
} else {
    Write-Host "Render props already updated or pattern not found"
}

# 5. Update ServiceRegistrationForm to use callbacks
$oldServiceForm = '<ServiceRegistrationForm userId={userId} onSuccess={() => { }} />'
$newServiceForm = @'
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
'@

if ($content -match [regex]::Escape($oldServiceForm)) {
    $content = $content -replace [regex]::Escape($oldServiceForm), $newServiceForm
    Write-Host "Updated ServiceRegistrationForm callbacks"
} else {
    Write-Host "ServiceRegistrationForm already updated or pattern not found"
}

# 6. Update modal to use dynamic title and message
$oldModal = @'
            <h2 className={styles.successTitle}>¡Publicación Exitosa!</h2>
            <p className={styles.successMessage}>
              Tu producto ha sido publicado correctamente y ya está visible en el mercado.
            </p>
'@

$newModal = @'
            <h2 className={styles.successTitle}>{modalTitle}</h2>
            <p className={styles.successMessage}>
              {modalMessage}
            </p>
'@

if ($content -match [regex]::Escape($oldModal)) {
    $content = $content -replace [regex]::Escape($oldModal), $newModal
    Write-Host "Updated modal to use dynamic content"
} else {
    Write-Host "Modal already updated or pattern not found"
}

# 7. Update handleSubmitProduct to set modal content
$oldSubmitSuccess = @'
      console.log("Publicación creada con éxito!");
      setShowSuccessModal(true);
      handleCancelProduct();
'@

$newSubmitSuccess = @'
      console.log("Publicación creada con éxito!");
      
      setModalTitle("¡Publicación Exitosa!");
      setModalMessage("Tu producto ha sido publicado correctamente y ya está visible en el mercado.");
      setShowSuccessModal(true);
      
      handleCancelProduct();
'@

if ($content -match [regex]::Escape($oldSubmitSuccess)) {
    $content = $content -replace [regex]::Escape($oldSubmitSuccess), $newSubmitSuccess
    Write-Host "Updated handleSubmitProduct to set modal content"
} else {
    Write-Host "handleSubmitProduct already updated or pattern not found"
}

# Save with UTF-8 encoding
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)

Write-Host "`nAll updates completed successfully!"
