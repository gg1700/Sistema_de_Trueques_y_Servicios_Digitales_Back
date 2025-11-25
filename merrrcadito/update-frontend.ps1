$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\ServiceRegistrationForm.tsx"
$content = Get-Content $path -Raw

$oldCode = @"
            // Check if response is ok before trying to parse JSON
            if (!res.ok) {
                if (res.status === 404) {
                    throw new Error("El endpoint de servicios no estÃ¡ disponible. Verifica que el backend estÃ© corriendo.");
                }
                const errorText = await res.text();
                console.error("Service creation error response:", errorText);
                throw new Error(`Error del servidor (${res.status}): ${res.statusText}`);
            }
"@

$newCode = @"
            // Check if response is ok before trying to parse JSON
            if (!res.ok) {
                if (res.status === 404) {
                    throw new Error("El endpoint de servicios no está disponible. Verifica que el backend esté corriendo.");
                }
                
                const errorText = await res.text();
                console.error("Service creation error response:", errorText);
                
                let errorMessage = `Error del servidor (${res.status}): ${res.statusText}`;
                try {
                    const errorJson = JSON.parse(errorText);
                    if (errorJson.message) {
                        errorMessage = errorJson.message;
                    }
                } catch (e) {
                    // Not JSON, keep default message
                }
                
                throw new Error(errorMessage);
            }
"@

# Handle potential encoding/newline differences by normalizing
$content = $content.Replace("`r`n", "`n")
$oldCode = $oldCode.Replace("`r`n", "`n")
$newCode = $newCode.Replace("`r`n", "`n")

if ($content.Contains($oldCode)) {
    $newContent = $content.Replace($oldCode, $newCode)
    Set-Content -Path $path -Value $newContent -Encoding UTF8
    Write-Host "Successfully updated ServiceRegistrationForm.tsx"
} else {
    Write-Host "Could not find the code block to replace."
    # Debug: print a small chunk to see what's wrong
    Write-Host "File content sample:"
    $content.Substring($content.IndexOf("if (!res.ok)"), 200)
}
