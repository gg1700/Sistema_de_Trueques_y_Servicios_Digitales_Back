$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"
$lines = Get-Content -Path $path -Encoding UTF8

# Find where the file currently ends (line 993)
$newLines = $lines[0..992]  # Keep everything up to line 993

# Add the complete product card content
$newLines += '                <div className={styles.offerImage}>'
$newLines += '                  {offer.image && ('
$newLines += '                    <img'
$newLines += '                      src={offer.image}'
$newLines += '                      alt={offer.title}'
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
$newLines += '                  <h2 className={styles.offerTitle}>{offer.title}</h2>'
$newLines += '                  <p className={styles.offerDescription}>{offer.description}</p>'
$newLines += '                </div>'
$newLines += '                {offer.price !== undefined && ('
$newLines += '                  <div className={styles.offerPrice}>'
$newLines += '                    <span>{offer.price} tokens</span>'
$newLines += '                  </div>'
$newLines += '                )}'
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

# Add the rest of the file if there's anything after line 993
if ($lines.Count > 993) {
    $newLines += $lines[993..($lines.Count-1)]
}

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllLines($path, $newLines, $utf8NoBom)
Write-Host "Fixed OffersSection - added missing card content and services section"
