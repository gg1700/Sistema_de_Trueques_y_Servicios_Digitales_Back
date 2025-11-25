$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\ServiceRegistrationForm.tsx"
$lines = Get-Content $path

# Lines 87 to 95 (1-based) correspond to indices 86 to 94 (0-based)
$startIndex = 86
$endIndex = 94

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
"@ -split "`r`n"

# Verify we are replacing the right lines
$currentLines = $lines[$startIndex..$endIndex]
Write-Host "Replacing lines:"
$currentLines
Write-Host "----------------"

# Create new content
$before = $lines[0..($startIndex-1)]
$after = $lines[($endIndex+1)..($lines.Count-1)]
$newContent = $before + $newCode + $after

Set-Content -Path $path -Value $newContent -Encoding UTF8
Write-Host "Successfully updated ServiceRegistrationForm.tsx by line numbers."
