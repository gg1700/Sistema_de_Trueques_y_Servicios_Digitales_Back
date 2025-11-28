$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"
$lines = Get-Content -Path $path -Encoding UTF8

$newLines = @()
$servicesApiAdded = $false
$handleSubmitServiceFound = $false

for ($i = 0; $i -lt $lines.Count; $i++) {
    # Add SERVICES_API_BASE after PUBLICATIONS_API_BASE
    if ($lines[$i] -match 'const PUBLICATIONS_API_BASE' -and -not $servicesApiAdded) {
        $newLines += $lines[$i]
        # Skip next 2 lines (the rest of PUBLICATIONS_API_BASE definition)
        $i++
        $newLines += $lines[$i]
        $i++
        $newLines += $lines[$i]
        
        # Add SERVICES_API_BASE
        $newLines += ""
        $newLines += "const SERVICES_API_BASE ="
        $newLines += "  process.env.NEXT_PUBLIC_SERVICES_API_BASE_URL ??"
        $newLines += '  "http://localhost:5000/api/services";'
        $servicesApiAdded = $true
        Write-Host "Added SERVICES_API_BASE constant"
        continue
    }
    
    # Replace handleSubmitService
    if ($lines[$i] -match 'const handleSubmitService = \(e: React\.FormEvent\) =>' -and -not $handleSubmitServiceFound) {
        $newLines += '  const handleSubmitService = async (e: React.FormEvent) => {'
        $newLines += '    e.preventDefault();'
        $newLines += ''
        $newLines += '    try {'
        $newLines += '      const response = await fetch(`${SERVICES_API_BASE}/create`, {'
        $newLines += "        method: 'POST',"
        $newLines += "        headers: { 'Content-Type': 'application/json' },"
        $newLines += '        body: JSON.stringify({'
        $newLines += '          cod_cat: parseInt(serviceForm.category),'
        $newLines += '          nom_serv: serviceForm.name,'
        $newLines += '          desc_serv: serviceForm.description,'
        $newLines += '          precio_serv: parseInt(serviceForm.priceTokens),'
        $newLines += '          duracion_serv: serviceForm.duration,'
        $newLines += '          cod_us: user?.cod_us,'
        $newLines += '          hrs_ini_dia_serv: "08:00",'
        $newLines += '          hrs_fin_dia_serv: "18:00",'
        $newLines += '          dif_dist_serv: 0'
        $newLines += '        })'
        $newLines += '      });'
        $newLines += ''
        $newLines += '      const json = await response.json();'
        $newLines += ''
        $newLines += '      if (response.status === 409) {'
        $newLines += '        // Servicio duplicado'
        $newLines += '        setModalTitle("¡Servicio Ya Registrado!");'
        $newLines += '        setModalMessage("Este servicio ya se encuentra registrado en tu perfil.");'
        $newLines += '        setShowSuccessModal(true);'
        $newLines += '      } else if (response.ok) {'
        $newLines += '        // Éxito'
        $newLines += '        setModalTitle("¡Servicio Registrado!");'
        $newLines += '        setModalMessage("Tu servicio ha sido registrado correctamente y ya está visible en el mercado.");'
        $newLines += '        setShowSuccessModal(true);'
        $newLines += ''
        $newLines += '        // Recargar servicios'
        $newLines += '        if (user?.cod_us) {'
        $newLines += '          await fetchServicesForUser(user.cod_us);'
        $newLines += '        }'
        $newLines += ''
        $newLines += '        // Limpiar formulario'
        $newLines += '        setServiceForm({'
        $newLines += '          name: "",'
        $newLines += '          duration: "",'
        $newLines += '          category: "",'
        $newLines += '          description: "",'
        $newLines += '          priceTokens: "",'
        $newLines += '          image: null,'
        $newLines += '        });'
        $newLines += '      } else {'
        $newLines += '        alert(`Error: ${json.message || "No se pudo registrar el servicio"}`);'
        $newLines += '      }'
        $newLines += '    } catch (err: any) {'
        $newLines += '      console.error("Error al registrar servicio:", err);'
        $newLines += '      alert("Error al registrar servicio");'
        $newLines += '    }'
        $newLines += '  };'
        
        # Skip the old implementation (next 3 lines)
        $i += 3
        $handleSubmitServiceFound = $true
        Write-Host "Replaced handleSubmitService function"
        continue
    }
    
    $newLines += $lines[$i]
}

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllLines($path, $newLines, $utf8NoBom)
Write-Host "UserProfile.tsx updated successfully"
