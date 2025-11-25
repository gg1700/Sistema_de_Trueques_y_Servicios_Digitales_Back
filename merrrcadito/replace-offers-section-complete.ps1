$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"
$lines = Get-Content -Path $path -Encoding UTF8
$newLines = @()
$inOffersSection = $false
$braceCount = 0
$functionStartLine = -1

for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'function OffersSection') {
        $functionStartLine = $i
        $inOffersSection = $true
        $braceCount = 0
        
        # Add the new implementation
        $newLines += 'function OffersSection({ offers, services }: OffersSectionProps) {'
        $newLines += '  const hasProducts = offers.length > 0;'
        $newLines += '  const hasServices = services.length > 0;'
        $newLines += '  '
        $newLines += '  if (!hasProducts && !hasServices) {'
        $newLines += '    return ('
        $newLines += '      <div className={styles.placeholderTab}>'
        $newLines += '        <p>Este usuario aún no tiene ofertas publicadas.</p>'
        $newLines += '      </div>'
        $newLines += '    );'
        $newLines += '  }'
        $newLines += ''
        $newLines += '  return ('
        $newLines += '    <div className={styles.offersSection}>'
        $newLines += '      {/* Sección de Productos */}'
        $newLines += '      {hasProducts && ('
        $newLines += '        <>'
        $newLines += '          <h3 className={styles.subsectionTitle}>Productos</h3>'
        $newLines += '          <div className={styles.offersGrid}>'
        $newLines += '            {offers.map((offer) => ('
        $newLines += '              <article key={offer.id} className={styles.offerCard}>'
        
        continue
    }
    
    if ($inOffersSection) {
        # Count braces to find the end of the function
        $openBraces = ($lines[$i] -split '\{').Count - 1
        $closeBraces = ($lines[$i] -split '\}').Count - 1
        $braceCount += $openBraces - $closeBraces
        
        # Check if we've reached the end of the function
        if ($braceCount -le 0 -and $i > $functionStartLine) {
            # Add the closing of products section and services section
            $newLines += '              </article>'
            $newLines += '            ))}'
            $newLines += '          </div>'
            $newLines += '        </>'
            $newLines += '      )}'
            $newLines += ''
            $newLines += '      {/* Sección de Servicios */}'
            $newLines += '      {hasServices && ('
            $newLines += '        <>'
            $newLines += '          <h3 className={styles.subsectionTitle}>Servicios</h3>'
            $newLines += '          <div className={styles.offersGrid}>'
            $newLines += '            {services.map((service) => ('
            $newLines += '              <article key={service.id} className={styles.offerCard}>'
            $newLines += '                <div className={styles.offerImage}>'
            $newLines += '                  {service.image && ('
            $newLines += '                    <img'
            $newLines += '                      src={service.image}'
            $newLines += '                      alt={service.title}'
            $newLines += '                      style={{'
            $newLines += '                        width: "100%",'
            $newLines += '                        height: "100%",'
            $newLines += '                        objectFit: "cover",'
            $newLines += '                        borderRadius: "12px",'
            $newLines += '                      }}'
            $newLines += '                    />'
            $newLines += '                  )}'
            $newLines += '                </div>'
            $newLines += '                <div className={styles.offerInfo}>'
            $newLines += '                  <h2 className={styles.offerTitle}>{service.title}</h2>'
            $newLines += '                  <p className={styles.offerDescription}>{service.description}</p>'
            $newLines += '                </div>'
            $newLines += '                {service.price !== undefined && ('
            $newLines += '                  <div className={styles.offerPrice}>'
            $newLines += '                    <span>{service.price} tokens</span>'
            $newLines += '                  </div>'
            $newLines += '                )}'
            $newLines += '              </article>'
            $newLines += '            ))}'
            $newLines += '          </div>'
            $newLines += '        </>'
            $newLines += '      )}'
            $newLines += '    </div>'
            $newLines += '  );'
            $newLines += '}'
            
            $inOffersSection = $false
            Write-Host "Replaced OffersSection function (lines $($functionStartLine+1) to $($i+1))"
            continue
        }
        # Skip old lines while inside the function
        continue
    }
    
    $newLines += $lines[$i]
}

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllLines($path, $newLines, $utf8NoBom)
Write-Host "File updated successfully"
