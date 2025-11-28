$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"
$lines = Get-Content -Path $path -Encoding UTF8

$newLines = @()
$added = $false

for ($i = 0; $i -lt $lines.Count; $i++) {
    $newLines += $lines[$i]
    
    # After the navList line, add the fetchViewerData useEffect
    if ($lines[$i] -match 'const navList = getNavItems\(navRole\);' -and -not $added) {
        $newLines += ""
        $newLines += "  useEffect(() => {"
        $newLines += "    const fetchViewerData = async () => {"
        $newLines += "      if (typeof window !== `"undefined`") {"
        $newLines += "        const handle = window.localStorage.getItem(`"currentUserHandle`");"
        $newLines += "        if (handle) {"
        $newLines += "          try {"
        $newLines += "            const res = await fetch("
        $newLines += "              ``${USERS_API_BASE}/get_user_data?handle_name=${encodeURIComponent(handle)}``"
        $newLines += "            );"
        $newLines += "            const json = await res.json();"
        $newLines += "            if (res.ok && json.success && json.data) {"
        $newLines += "              const data = Array.isArray(json.data) ? json.data[0] : json.data;"
        $newLines += "              setViewerId(data.cod_us);"
        $newLines += "            }"
        $newLines += "          } catch (err) {"
        $newLines += "            console.error(`"Error fetching viewer data:`", err);"
        $newLines += "          }"
        $newLines += "        }"
        $newLines += "      }"
        $newLines += "    };"
        $newLines += "    fetchViewerData();"
        $newLines += "  }, []);"
        $added = $true
        Write-Host "Added fetchViewerData useEffect"
    }
}

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllLines($path, $newLines, $utf8NoBom)
Write-Host "File updated successfully"
