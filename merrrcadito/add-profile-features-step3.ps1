$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"

# Read the file
$content = Get-Content -Path $path -Raw -Encoding UTF8

# 1. Update OffersSection to pass services
$oldOffersRender = '        {!loading && !error && activeTab === "offers" && (
          <OffersSection offers={offers} />
        )}'

$newOffersRender = '        {!loading && !error && activeTab === "offers" && (
          <OffersSection offers={offers} services={services} />
        )}'

$content = $content.Replace($oldOffersRender, $newOffersRender)
Write-Host "✓ Updated OffersSection to include services"

# 2. Add Likes, Events, and Explore sections
$oldTabContent = '        {!loading && !error && activeTab === "likes" && (
          <div className={styles.placeholderTab}>
            <p>No hay me gustas</p>
          </div>
        )}

        {!loading && !error && activeTab === "events" && (
          <div className={styles.placeholderTab}>
            <p>No hay eventos</p>
          </div>
        )}'

$newTabContent = '        {!loading && !error && activeTab === "likes" && (
          <LikesSection userId={user?.cod_us ?? 0} />
        )}

        {!loading && !error && activeTab === "events" && (
          <EventsSection userId={user?.cod_us ?? 0} />
        )}

        {!loading && !error && activeTab === "explore" && (
          <ExploreSection currentUserId={user?.cod_us ?? 0} />
        )}'

$content = $content.Replace($oldTabContent, $newTabContent)
Write-Host "✓ Added Likes, Events, and Explore sections"

# 3. Update PublishSection props to include modal setters and userId
$oldPublishProps = '          <PublishSection
            publishType={publishType}
            setPublishType={setPublishType}
            productForm={productForm}
            serviceForm={serviceForm}
            handleProductChange={handleProductChange}
            handleServiceChange={handleServiceChange}
            handleSubmitProduct={handleSubmitProduct}
            handleSubmitService={handleSubmitService}
            handleCancelProduct={handleCancelProduct}
            handleCancelService={handleCancelService}
            onChangeProductImage={(file) =>
              setProductForm((prev) => ({ ...prev, image: file }))
            }
            onChangeServiceImage={(file) =>
              setServiceForm((prev) => ({ ...prev, image: file }))
            }
            categories={categories}
            filteredSubcategories={filteredSubcategories}
          />'

$newPublishProps = '          <PublishSection
            publishType={publishType}
            setPublishType={setPublishType}
            productForm={productForm}
            serviceForm={serviceForm}
            handleProductChange={handleProductChange}
            handleServiceChange={handleServiceChange}
            handleSubmitProduct={handleSubmitProduct}
            handleSubmitService={handleSubmitService}
            handleCancelProduct={handleCancelProduct}
            handleCancelService={handleCancelService}
            onChangeProductImage={(file) =>
              setProductForm((prev) => ({ ...prev, image: file }))
            }
            onChangeServiceImage={(file) =>
              setServiceForm((prev) => ({ ...prev, image: file }))
            }
            categories={categories}
            filteredSubcategories={filteredSubcategories}
            userId={user?.cod_us ?? 0}
            setModalTitle={setModalTitle}
            setModalMessage={setModalMessage}
            setShowSuccessModal={setShowSuccessModal}
          />'

$content = $content.Replace($oldPublishProps, $newPublishProps)
Write-Host "✓ Updated PublishSection props"

# 4. Update modal to use dynamic title and message
$oldModal = '            <h2 className={styles.successTitle}>¡Publicación Exitosa!</h2>
            <p className={styles.successMessage}>
              Tu producto ha sido publicado correctamente y ya está visible en el mercado.
            </p>'

$newModal = '            <h2 className={styles.successTitle}>{modalTitle}</h2>
            <p className={styles.successMessage}>
              {modalMessage}
            </p>'

$content = $content.Replace($oldModal, $newModal)
Write-Host "✓ Updated modal to use dynamic content"

# Save the file
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)

Write-Host "`n✅ Step 3 complete: Sections and modal updates added"
Write-Host "File saved successfully"
