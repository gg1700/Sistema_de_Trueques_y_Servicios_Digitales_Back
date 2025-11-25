$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"

# Read the file
$content = Get-Content -Path $path -Raw -Encoding UTF8

# 1. Update OffersSectionProps interface
$oldOfferInterface = 'interface OffersSectionProps {
  offers: Offer[];
}'

$newOfferInterface = 'interface OffersSectionProps {
  offers: Offer[];
  services: Offer[];
}'

$content = $content.Replace($oldOfferInterface, $newOfferInterface)
Write-Host "✓ Updated OffersSectionProps interface"

# 2. Update OffersSection function signature
$oldOfferFunc = 'function OffersSection({ offers }: OffersSectionProps) {'

$newOfferFunc = 'function OffersSection({ offers, services }: OffersSectionProps) {'

$content = $content.Replace($oldOfferFunc, $newOfferFunc)
Write-Host "✓ Updated OffersSection function signature"

# 3. Update OffersSection to display products and services separately
$oldOfferContent = 'function OffersSection({ offers, services }: OffersSectionProps) {
  if (!offers.length) {
    return (
      <div className={styles.placeholderTab}>
        <p>Este usuario aún no tiene ofertas publicadas.</p>
      </div>
    );
  }

  return (
    <div className={styles.offersSection}>
      {offers.map((offer) => ('

$newOfferContent = 'function OffersSection({ offers, services }: OffersSectionProps) {
  const hasOffers = offers.length > 0 || services.length > 0;

  if (!hasOffers) {
    return (
      <div className={styles.placeholderTab}>
        <p>Este usuario aún no tiene ofertas publicadas.</p>
      </div>
    );
  }

  return (
    <div className={styles.offersSection}>
      {offers.length > 0 && (
        <>
          <h3 className={styles.sectionTitle}>Productos</h3>
          {offers.map((offer) => ('

$content = $content.Replace($oldOfferContent, $newOfferContent)
Write-Host "✓ Updated OffersSection content structure"

# 4. Add services section after products
$oldOfferEnd = '        </article>
      ))}
    </div>
  );
}'

$newOfferEnd = '        </article>
      ))}
        </>
      )}

      {services.length > 0 && (
        <>
          <h3 className={styles.sectionTitle}>Servicios</h3>
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
              <div className={styles.offerActions}>
                <div style={{
                  display: ''flex'',
                  alignItems: ''center'',
                  gap: ''12px''
                }}>
                  <div style={{
                    display: ''flex'',
                    alignItems: ''baseline'',
                    gap: ''4px''
                  }}>
                    <span style={{
                      fontSize: ''20px'',
                      fontWeight: ''700'',
                      color: ''#1fb7a1''
                    }}>
                      {service.price ?? 0}
                    </span>
                    <span style={{
                      fontSize: ''13px'',
                      color: ''#6b7785'',
                      fontWeight: ''500''
                    }}>
                      Tokens
                    </span>
                  </div>
                  <button
                    type="button"
                    className={styles.iconButton}
                    title="Compartir"
                  >
                    <i className="bi bi-share" />
                  </button>
                  <button
                    type="button"
                    className={styles.iconButton}
                    title="Favorito"
                  >
                    <i className="bi bi-heart" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </>
      )}
    </div>
  );
}'

$content = $content.Replace($oldOfferEnd, $newOfferEnd)
Write-Host "✓ Added services display section"

# 5. Update PublishSectionProps interface
$oldPublishInterface = 'interface PublishSectionProps {
  publishType: PublishType;
  setPublishType: (type: PublishType) => void;
  productForm: ProductFormState;
  serviceForm: ServiceFormState;
  onChangeProductImage: (file: File | null) => void;
  onChangeServiceImage: (file: File | null) => void;
  handleProductChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleServiceChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleSubmitProduct: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  handleSubmitService: (e: React.FormEvent) => void;
  handleCancelProduct: () => void;
  handleCancelService: () => void;
  categories: Category[];
  filteredSubcategories: Subcategory[];
}'

$newPublishInterface = 'interface PublishSectionProps {
  publishType: PublishType;
  setPublishType: (type: PublishType) => void;
  productForm: ProductFormState;
  serviceForm: ServiceFormState;
  onChangeProductImage: (file: File | null) => void;
  onChangeServiceImage: (file: File | null) => void;
  handleProductChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleServiceChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleSubmitProduct: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  handleSubmitService: (e: React.FormEvent) => void;
  handleCancelProduct: () => void;
  handleCancelService: () => void;
  categories: Category[];
  filteredSubcategories: Subcategory[];
  userId: number;
  setModalTitle: (title: string) => void;
  setModalMessage: (msg: string) => void;
  setShowSuccessModal: (show: boolean) => void;
}'

$content = $content.Replace($oldPublishInterface, $newPublishInterface)
Write-Host "✓ Updated PublishSectionProps interface"

# 6. Update PublishSection function signature
$oldPublishFunc = 'function PublishSection({
  publishType,
  setPublishType,
  productForm,
  serviceForm,
  onChangeProductImage,
  onChangeServiceImage,
  handleProductChange,
  handleServiceChange,
  handleSubmitProduct,
  handleSubmitService,
  handleCancelProduct,
  handleCancelService,
  categories,
  filteredSubcategories,
}: PublishSectionProps) {'

$newPublishFunc = 'function PublishSection({
  publishType,
  setPublishType,
  productForm,
  serviceForm,
  onChangeProductImage,
  onChangeServiceImage,
  handleProductChange,
  handleServiceChange,
  handleSubmitProduct,
  handleSubmitService,
  handleCancelProduct,
  handleCancelService,
  categories,
  filteredSubcategories,
  userId,
  setModalTitle,
  setModalMessage,
  setShowSuccessModal,
}: PublishSectionProps) {'

$content = $content.Replace($oldPublishFunc, $newPublishFunc)
Write-Host "✓ Updated PublishSection function signature"

# Save the file
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)

Write-Host "`n✅ Step 4 complete: Interfaces and component implementations updated"
Write-Host "File saved successfully"
