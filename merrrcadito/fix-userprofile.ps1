$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"
$content = Get-Content $path -Raw

# 1. Update PublishSectionProps
$oldProps = '    handleCancelProduct: () => void;
    handleCancelService: () => void;
    categories: Category[];'
$newProps = '    handleCancelProduct: () => void;
    handleCancelService: () => void;
    setModalTitle: (title: string) => void;
    setModalMessage: (msg: string) => void;
    setShowSuccessModal: (show: boolean) => void;
    categories: Category[];'

# 2. Update PublishSection signature
$oldSig = '    handleCancelProduct,
    handleCancelService,
    categories,
    filteredSubcategories,
    userId,
  }: PublishSectionProps) {'
$newSig = '    handleCancelProduct,
    handleCancelService,
    setModalTitle,
    setModalMessage,
    setShowSuccessModal,
    categories,
    filteredSubcategories,
    userId,
  }: PublishSectionProps) {'

# 3. Update UserProfile rendering of PublishSection
$oldRender = '              handleCancelProduct={handleCancelProduct}
              handleCancelService={handleCancelService}
              categories={categories}
              filteredSubcategories={filteredSubcategories}
              userId={user.cod_us}
            />'
$newRender = '              handleCancelProduct={handleCancelProduct}
              handleCancelService={handleCancelService}
              setModalTitle={setModalTitle}
              setModalMessage={setModalMessage}
              setShowSuccessModal={setShowSuccessModal}
              categories={categories}
              filteredSubcategories={filteredSubcategories}
              userId={user.cod_us}
            />'

# Normalize line endings
$content = $content.Replace("`r`n", "`n")
$oldProps = $oldProps.Replace("`r`n", "`n")
$newProps = $newProps.Replace("`r`n", "`n")
$oldSig = $oldSig.Replace("`r`n", "`n")
$newSig = $newSig.Replace("`r`n", "`n")
$oldRender = $oldRender.Replace("`r`n", "`n")
$newRender = $newRender.Replace("`r`n", "`n")

# Apply replacements
if ($content.Contains($oldProps)) {
    $content = $content.Replace($oldProps, $newProps)
    Write-Host "Props updated."
} else {
    Write-Host "Props NOT updated."
}

if ($content.Contains($oldSig)) {
    $content = $content.Replace($oldSig, $newSig)
    Write-Host "Signature updated."
} else {
    Write-Host "Signature NOT updated."
}

if ($content.Contains($oldRender)) {
    $content = $content.Replace($oldRender, $newRender)
    Write-Host "Render updated."
} else {
    Write-Host "Render NOT updated."
}

# 4. Fix encoding issues
$content = $content.Replace("Ã¡", "á")
$content = $content.Replace("Ã©", "é")
$content = $content.Replace("Ã­", "í")
$content = $content.Replace("Ã³", "ó")
$content = $content.Replace("Ãº", "ú")
$content = $content.Replace("Ã±", "ñ")
$content = $content.Replace("Ã‘", "Ñ")
$content = $content.Replace("Â¡", "¡")
$content = $content.Replace("Â¿", "¿")

Set-Content -Path $path -Value $content -Encoding UTF8
Write-Host "Encoding fixed."
