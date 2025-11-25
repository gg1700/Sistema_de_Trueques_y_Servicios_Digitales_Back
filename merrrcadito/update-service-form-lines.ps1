$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\ServiceRegistrationForm.tsx"
$lines = Get-Content $path

# Lines 87 to 107 (1-based) correspond to indices 86 to 106 (0-based)
$startIndex = 86
$endIndex = 106

$newCode = @"
            // Check if response is ok before trying to parse JSON
            if (!res.ok) {
                if (res.status === 404) {
                    throw new Error("El endpoint de servicios no está disponible. Verifica que el backend esté corriendo.");
                }
                
                // Handle duplicate service (409)
                if (res.status === 409 && onDuplicate) {
                    onDuplicate();
                    setLoading(false);
                    return;
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
"@ -split "`r`n"

# Verify we are replacing the right lines (check first line)
$firstLine = $lines[$startIndex]
Write-Host "Replacing block starting with: $firstLine"

# Create new content
$before = $lines[0..($startIndex-1)]
$after = $lines[($endIndex+1)..($lines.Count-1)]
$newContent = $before + $newCode + $after

Set-Content -Path $path -Value $newContent -Encoding UTF8
Write-Host "Successfully updated ServiceRegistrationForm.tsx error handling."
