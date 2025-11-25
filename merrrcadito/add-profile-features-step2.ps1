$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"

# Read the file
$content = Get-Content -Path $path -Raw -Encoding UTF8

# 1. Add fetchServicesForUser function after fetchOffersForUser
$oldFetch = '  const fetchOffersForUser = async (codUs: number) => {
    try {
      const resPosts = await fetch(
        `${POSTS_API_BASE}/all_active_product_posts`
      );
      const jsonPosts = await resPosts.json().catch(() => ({} as any));

      if (resPosts.ok && jsonPosts.data && Array.isArray(jsonPosts.data)) {
        const mappedOffers: Offer[] = jsonPosts.data
          .filter((p: any) => p.cod_us === codUs)
          .map((p: any) => ({
            id: p.cod_pub ?? p.id ?? 0,
            title: p.nom_prod ?? p.titulo_pub ?? p.title ?? "Sin título",
            description: p.descr_pub ?? p.desc_prod ?? p.contenido ?? "",
            image: `${PUBLICATIONS_API_BASE}/${p.cod_pub ?? p.id ?? 0}/image`,
            price: p.precio_pub ?? p.precio_prod ?? 0,
          }));

        setOffers(mappedOffers);
      } else {
        setOffers([]);
      }
    } catch (err) {
      console.error("Error al cargar publicaciones de productos:", err);
      setOffers([]);
    }
  };

  useEffect(() => {'

$newFetch = '  const fetchOffersForUser = async (codUs: number) => {
    try {
      const resPosts = await fetch(
        `${POSTS_API_BASE}/all_active_product_posts`
      );
      const jsonPosts = await resPosts.json().catch(() => ({} as any));

      if (resPosts.ok && jsonPosts.data && Array.isArray(jsonPosts.data)) {
        const mappedOffers: Offer[] = jsonPosts.data
          .filter((p: any) => p.cod_us === codUs)
          .map((p: any) => ({
            id: p.cod_pub ?? p.id ?? 0,
            title: p.nom_prod ?? p.titulo_pub ?? p.title ?? "Sin título",
            description: p.descr_pub ?? p.desc_prod ?? p.contenido ?? "",
            image: `${PUBLICATIONS_API_BASE}/${p.cod_pub ?? p.id ?? 0}/image`,
            price: p.precio_pub ?? p.precio_prod ?? 0,
          }));

        setOffers(mappedOffers);
      } else {
        setOffers([]);
      }
    } catch (err) {
      console.error("Error al cargar publicaciones de productos:", err);
      setOffers([]);
    }
  };

  const fetchServicesForUser = async (codUs: number) => {
    try {
      const resServices = await fetch(`${SERVICES_API_BASE}/user/${codUs}`);
      const jsonServices = await resServices.json().catch(() => ({} as any));

      if (resServices.ok && jsonServices.data && Array.isArray(jsonServices.data)) {
        const mappedServices: Offer[] = jsonServices.data.map((s: any) => ({
          id: s.cod_serv ?? s.id ?? 0,
          title: s.nom_serv ?? "Sin título",
          description: s.descr_serv ?? "",
          image: s.foto_serv ? `data:image/jpeg;base64,${Buffer.from(s.foto_serv).toString(''base64'')}` : undefined,
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

  useEffect(() => {'

$content = $content.Replace($oldFetch, $newFetch)
Write-Host "✓ Added fetchServicesForUser function"

# 2. Update the useEffect to call fetchServicesForUser
$oldEffect = '        if (userData.cod_us) {
          await fetchOffersForUser(userData.cod_us);
        }'

$newEffect = '        if (userData.cod_us) {
          await fetchOffersForUser(userData.cod_us);
          await fetchServicesForUser(userData.cod_us);
        }'

$content = $content.Replace($oldEffect, $newEffect)
Write-Host "✓ Updated useEffect to fetch services"

# 3. Update handleSubmitProduct to use modal state
$oldSubmit = '      console.log("Publicación creada con éxito!");
      setShowSuccessModal(true);
      handleCancelProduct();'

$newSubmit = '      console.log("Publicación creada con éxito!");
      setModalTitle("¡Publicación Exitosa!");
      setModalMessage("Tu producto ha sido publicado correctamente y ya está visible en el mercado.");
      setShowSuccessModal(true);
      handleCancelProduct();'

$content = $content.Replace($oldSubmit, $newSubmit)
Write-Host "✓ Updated handleSubmitProduct to use modal state"

# 4. Add Explore tab button after Events button
$oldTabs = '          <button
            type="button"
            className={`${styles.tab} ${activeTab === "events" ? "tabActive" : ""}`}
            onClick={() => setActiveTab("events")}
          >
            Eventos
          </button>
        </nav>'

$newTabs = '          <button
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
        </nav>'

$content = $content.Replace($oldTabs, $newTabs)
Write-Host "✓ Added Explore tab button"

# Save the file
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)

Write-Host "`n✅ Step 2 complete: Functions and Explore tab added"
Write-Host "File saved successfully"
