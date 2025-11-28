$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"
$content = Get-Content -Path $path -Raw -Encoding UTF8

# Find and replace the entire OffersSection function
$oldFunction = @'
function OffersSection({ offers, services }: OffersSectionProps) {
    if (!offers.length) {
      return (
        <div className={styles.placeholderTab}>
          <p>Este usuario aún no tiene ofertas publicadas.</p>
        </div>
      );
    }

    return (
      <div className={styles.offersSection}>
        {offers.map((offer) => (
          <article key={offer.id} className={styles.offerCard}>
            <div className={styles.offerImage}>
              {offer.image && (
                <img
                  src={offer.image}
                  alt={offer.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "12px",
                  }}
                />
              )}
            </div>
            <div className={styles.offerInfo}>
              <h2 className={styles.offerTitle}>{offer.title}</h2>
              <p className={styles.offerDescription}>{offer.description}</p>
            </div>
'@

$newFunction = @'
function OffersSection({ offers, services }: OffersSectionProps) {
    const hasProducts = offers.length > 0;
    const hasServices = services.length > 0;
    
    if (!hasProducts && !hasServices) {
      return (
        <div className={styles.placeholderTab}>
          <p>Este usuario aún no tiene ofertas publicadas.</p>
        </div>
      );
    }

    return (
      <div className={styles.offersSection}>
        {/* Sección de Productos */}
        {hasProducts && (
          <>
            <h3 className={styles.subsectionTitle}>Productos</h3>
            <div className={styles.offersGrid}>
              {offers.map((offer) => (
                <article key={offer.id} className={styles.offerCard}>
                  <div className={styles.offerImage}>
                    {offer.image && (
                      <img
                        src={offer.image}
                        alt={offer.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "12px",
                        }}
                      />
                    )}
                  </div>
                  <div className={styles.offerInfo}>
                    <h2 className={styles.offerTitle}>{offer.title}</h2>
                    <p className={styles.offerDescription}>{offer.description}</p>
                  </div>
'@

# Replace the function start
$content = $content.Replace($oldFunction, $newFunction)

# Now we need to find where the offers.map closes and add the services section
# This is tricky, so let's use a different approach - find the closing of the offersSection div

$oldClosing = @'
        ))}
      </div>
    );
  }
'@

$newClosing = @'
                ))}
              </div>
            </div>
          </>
        )}
        
        {/* Sección de Servicios */}
        {hasServices && (
          <>
            <h3 className={styles.subsectionTitle}>Servicios</h3>
            <div className={styles.offersGrid}>
              {services.map((service) => (
                <article key={service.id} className={styles.offerCard}>
                  <div className={styles.offerImage}>
                    {service.image && (
                      <img
                        src={service.image}
                        alt={service.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "12px",
                        }}
                      />
                    )}
                  </div>
                  <div className={styles.offerInfo}>
                    <h2 className={styles.offerTitle}>{service.title}</h2>
                    <p className={styles.offerDescription}>{service.description}</p>
                  </div>
                  {service.price !== undefined && (
                    <div className={styles.offerPrice}>
                      <span>{service.price} tokens</span>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }
'@

$content = $content.Replace($oldClosing, $newClosing)

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
Write-Host "OffersSection updated with Products and Services subsections"
