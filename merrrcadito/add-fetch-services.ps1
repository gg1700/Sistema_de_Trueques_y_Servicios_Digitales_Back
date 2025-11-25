$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"
$content = Get-Content -Path $path -Raw -Encoding UTF8

# Target string (End of fetchOffersForUser)
$target = '    } catch (err) {
      console.error("Error al cargar publicaciones de productos:", err);
      setOffers([]);
    }
  };'

# Replacement string (End of fetchOffersForUser + fetchServicesForUser)
$replacement = '    } catch (err) {
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
  };'

# Normalize line endings
$content = $content -replace "`r`n", "`n"
$target = $target -replace "`r`n", "`n"
$replacement = $replacement -replace "`r`n", "`n"

if ($content.Contains($target)) {
    $content = $content.Replace($target, $replacement)
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
    Write-Host "fetchServicesForUser added successfully"
} else {
    Write-Host "Target for fetchServicesForUser not found"
}
