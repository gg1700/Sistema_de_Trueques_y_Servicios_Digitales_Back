$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"

# Read the file
$content = Get-Content -Path $path -Raw -Encoding UTF8

# 1. Add Service and Exchange tabs to PublishSection
$oldPublishTabs = '      <div className={styles.publishTabs}>
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
      </div>'

$newPublishTabs = '      <div className={styles.publishTabs}>
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
      </div>'

$content = $content.Replace($oldPublishTabs, $newPublishTabs)
Write-Host "✓ Added Exchange tab to PublishSection"

# 2. Replace service form with ServiceRegistrationForm component
$oldServiceForm = '      ) : (
        <form
          onSubmit={handleSubmitService}
          className={styles.publishForm}
          noValidate
        >
          <div className={styles.formRow}>
            <div className={styles.formColFull}>
              <label className={styles.fieldLabel}>Nombre de Servicio</label>
              <ProfileInput
                type="text"
                name="name"
                value={serviceForm.name}
                onChange={handleServiceChange as any}
                placeholder="Ej. Asesoría de marketing"
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formCol}>
              <label className={styles.fieldLabel}>Duración</label>
              <ProfileInput
                type="text"
                name="duration"
                value={serviceForm.duration}
                onChange={handleServiceChange as any}
                placeholder="Ej. 2 horas"
              />
            </div>
            <div className={styles.formCol}>
              <label className={styles.fieldLabel}>Categoría</label>
              <select
                name="category"
                value={serviceForm.category}
                onChange={handleServiceChange}
                className={styles.selectInput}
              >
                <option value="">Seleccionar</option>
                <option value="marketing">Marketing</option>
                <option value="soporte">Soporte</option>
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formColFull}>
              <label className={styles.fieldLabel}>Descripción</label>
              <textarea
                name="description"
                value={serviceForm.description}
                onChange={handleServiceChange}
                className={styles.textarea}
                placeholder="Describe tu servicio..."
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formCol}>
              <label className={styles.fieldLabel}>Precio Tokens</label>
              <ProfileInput
                type="text"
                name="priceTokens"
                value={serviceForm.priceTokens}
                onChange={handleServiceChange as any}
                placeholder="Ej. 15"
              />
            </div>
          </div>

          <div className={styles.formRowBottom}>
            <div className={styles.formColImage}>
              <label className={styles.fieldLabel}>
                Imagen (cuadrada, máx. 100KB)
              </label>
              <FileInput name="serviceImage" onChange={onChangeServiceImage} />
            </div>

            <div className={styles.formColButtons}>
              <div className={styles.actionsRowInline}>
                <button type="submit" className={styles.submitButton}>
                  Ofertar
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCancelService}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </form>
      )}'

$newServiceForm = '      ) : publishType === "service" ? (
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
      )}'

$content = $content.Replace($oldServiceForm, $newServiceForm)
Write-Host "✓ Replaced service form with ServiceRegistrationForm and added ExchangeRegistrationForm"

# Save the file
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)

Write-Host "`n✅ Step 5 complete: All features added successfully!"
Write-Host "File saved successfully"
Write-Host "`n🎉 UserProfile.tsx has been fully updated with all requested features!"
