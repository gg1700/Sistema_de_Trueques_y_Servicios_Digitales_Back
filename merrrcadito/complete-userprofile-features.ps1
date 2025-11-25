$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"

# Read the file
$content = Get-Content -Path $path -Raw -Encoding UTF8

# 1. Check if fetchServicesForUser exists, if not add it
if ($content -notmatch 'const fetchServicesForUser') {
    $fetchPattern = '  const fetchOffersForUser = async \(codUs: number\) => \{[^}]+\}[^}]+\};'
    if ($content -match $fetchPattern) {
        $fetchOffersFunc = $matches[0]
        $newFetch = $fetchOffersFunc + @'


  const fetchServicesForUser = async (codUs: number) => {
    try {
      const resServices = await fetch(`${SERVICES_API_BASE}/user/${codUs}`);
      const jsonServices = await resServices.json().catch(() => ({} as any));

      if (resServices.ok && jsonServices.data && Array.isArray(jsonServices.data)) {
        const mappedServices: Offer[] = jsonServices.data.map((s: any) => ({
          id: s.cod_serv ?? s.id ?? 0,
          title: s.nom_serv ?? "Sin título",
          description: s.descr_serv ?? "",
          image: s.foto_serv ? `data:image/jpeg;base64,${Buffer.from(s.foto_serv).toString('base64')}` : undefined,
          price: s.precio_serv_token ?? 0,
        }));
        setServices(mappedServices);
      } else {
        setServices([]);
      }
    } catch (err) {
      console.error("Error al cargar servicios:", err);
      setServices([]);
    }
  };
'@
        $content = $content.Replace($fetchOffersFunc, $newFetch)
        Write-Host "✓ Added fetchServicesForUser function"
    }
}

# 2. Update useEffect to call fetchServicesForUser
if ($content -match 'await fetchOffersForUser\(userData\.cod_us\);' -and $content -notmatch 'await fetchServicesForUser\(userData\.cod_us\);') {
    $content = $content.Replace(
        'await fetchOffersForUser(userData.cod_us);',
        @'
await fetchOffersForUser(userData.cod_us);
          await fetchServicesForUser(userData.cod_us);
'@
    )
    Write-Host "✓ Updated useEffect to fetch services"
}

# 3. Add Explore tab if not present
if ($content -notmatch 'activeTab === "explore"') {
    $oldExploreTab = @'
          <button
            type="button"
            className={`${styles.tab} ${activeTab === "events" ? "tabActive" : ""}`}
            onClick={() => setActiveTab("events")}
          >
            Eventos
          </button>
        </nav>
'@
    $newExploreTab = @'
          <button
            type="button"
            className={`${styles.tab} ${activeTab === "events" ? "tabActive" : ""}`}
            onClick={() => setActiveTab("events")}
          >
            Eventos
          </button>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === "explore" ? "tabActive" : ""}`}
            onClick={() => setActiveTab("explore")}
          >
            Explorar
          </button>
        </nav>
'@
    $content = $content.Replace($oldExploreTab, $newExploreTab)
    Write-Host "✓ Added Explore tab"
}

# 4. Replace placeholder sections with actual components
$oldLikesSection = @'
        {!loading && !error && activeTab === "likes" && (
          <div className={styles.placeholderTab}>
            <p>No hay me gustas</p>
          </div>
        )}

        {!loading && !error && activeTab === "events" && (
          <div className={styles.placeholderTab}>
            <p>No hay eventos</p>
          </div>
        )}
'@

$newSections = @'
        {!loading && !error && activeTab === "likes" && (
          <LikesSection userId={user?.cod_us ?? 0} />
        )}

        {!loading && !error && activeTab === "events" && (
          <EventsSection userId={user?.cod_us ?? 0} />
        )}

        {!loading && !error && activeTab === "explore" && (
          <ExploreSection currentUserId={user?.cod_us ?? 0} />
        )}
'@

$content = $content.Replace($oldLikesSection, $newSections)
Write-Host "✓ Replaced placeholder sections with actual components"

# 5. Update modal to use dynamic content
if ($content -match '<h2 className=\{styles\.successTitle\}>¡Publicación Exitosa!</h2>') {
    $content = $content.Replace(
        '<h2 className={styles.successTitle}>¡Publicación Exitosa!</h2>',
        '<h2 className={styles.successTitle}>{modalTitle}</h2>'
    )
    $content = $content.Replace(
        '<p className={styles.successMessage}>
              Tu producto ha sido publicado correctamente y ya está visible en el mercado.
            </p>',
        '<p className={styles.successMessage}>
              {modalMessage}
            </p>'
    )
    Write-Host "✓ Updated modal to use dynamic content"
}

# Save the file
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)

Write-Host "`n✅ All missing features added successfully!"
Write-Host "File saved"
