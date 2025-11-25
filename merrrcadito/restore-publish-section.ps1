$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"
$content = Get-Content -Path $path -Raw -Encoding UTF8

$publishSectionCode = '
interface PublishSectionProps {
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
}

function PublishSection({
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
}: PublishSectionProps) {
  return (
    <div className={styles.publishSection}>
      <div className={styles.publishTabs}>
        <button
          type="button"
          className={`${styles.publishTab} ${publishType === "product" ? "publishTabActive" : ""}`}
          onClick={() => setPublishType("product")}
        >
          Producto
        </button>
        <button
          type="button"
          className={`${styles.publishTab} ${publishType === "service" ? "publishTabActive" : ""}`}
          onClick={() => setPublishType("service")}
        >
          Servicio
        </button>
        <button
          type="button"
          className={`${styles.publishTab} ${publishType === "exchange" ? "publishTabActive" : ""}`}
          onClick={() => setPublishType("exchange")}
        >
          Intercambio
        </button>
      </div>

      {publishType === "product" ? (
        <form
          onSubmit={handleSubmitProduct}
          className={styles.publishForm}
          noValidate
        >
          <div className={styles.formRow}>
            <div className={styles.formColFull}>
              <label className={styles.fieldLabel}>Nombre de Producto</label>
              <ProfileInput
                type="text"
                name="name"
                value={productForm.name}
                onChange={handleProductChange}
                placeholder="Ej. Cámara Canon EOS"
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formCol}>
              <label className={styles.fieldLabel}>Categoría</label>
              <select
                name="category"
                value={productForm.category}
                onChange={handleProductChange}
                className={styles.selectInput}
              >
                <option value="">Seleccionar</option>
                {categories.map((cat) => (
                  <option key={cat.cod_cat} value={cat.cod_cat}>
                    {cat.nom_cat}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formCol}>
              <label className={styles.fieldLabel}>Subcategoría</label>
              <select
                name="subcategory"
                value={productForm.subcategory}
                onChange={handleProductChange}
                className={styles.selectInput}
                disabled={!productForm.category}
              >
                <option value="">Seleccionar</option>
                {filteredSubcategories.map((sub) => (
                  <option key={sub.cod_subcat} value={sub.cod_subcat}>
                    {sub.nom_subcat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formColFull}>
              <label className={styles.fieldLabel}>Descripción</label>
              <textarea
                name="description"
                value={productForm.description}
                onChange={handleProductChange}
                className={styles.textarea}
                placeholder="Describe tu producto..."
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formCol}>
              <label className={styles.fieldLabel}>Precio Tokens</label>
              <ProfileInput
                type="text"
                name="priceTokens"
                value={productForm.priceTokens}
                onChange={handleProductChange}
                placeholder="Ej. 20"
              />
            </div>
            <div className={styles.formCol}>
              <label className={styles.fieldLabel}>Estado</label>
              <select
                name="condition"
                value={productForm.condition}
                onChange={handleProductChange}
                className={styles.selectInput}
              >
                <option value="Nuevo">Nuevo</option>
                <option value="Usado">Usado</option>
              </select>
            </div>
          </div>

          <div className={styles.formRowBottom}>
            <div className={styles.formColImage}>
              <label className={styles.fieldLabel}>
                Imagen (cuadrada, máx. 100KB)
              </label>
              <FileInput name="productImage" onChange={onChangeProductImage} />
            </div>

            <div className={styles.formColButtons}>
              <div className={styles.actionsRowInline}>
                <button type="submit" className={styles.submitButton}>
                  Publicar
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCancelProduct}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : publishType === "service" ? (
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
      ) : (
        <ExchangeRegistrationForm
          userId={userId}
          onSuccess={() => {
            setModalTitle("¡Intercambio Registrado!");
            setModalMessage("Tu intercambio ha sido registrado correctamente.");
            setShowSuccessModal(true);
          }}
        />
      )}
    </div>
  );
}
'

$target = 'export default function UserProfile({'
$content = $content.Replace($target, $publishSectionCode + "`n" + $target)

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
Write-Host "Restored PublishSection component"
