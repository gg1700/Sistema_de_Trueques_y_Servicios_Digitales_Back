$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\ServiceRegistrationForm.tsx"
$content = Get-Content $path -Raw

# 1. Update Props interface
$oldProps = 'interface Props {
    userId: number;
    onSuccess?: () => void;
}'
$newProps = 'interface Props {
    userId: number;
    onSuccess?: () => void;
    onDuplicate?: () => void;
}'

# 2. Update component signature
$oldSig = 'export default function ServiceRegistrationForm({ userId, onSuccess }: Props) {'
$newSig = 'export default function ServiceRegistrationForm({ userId, onSuccess, onDuplicate }: Props) {'

# 3. Update error handling in handleSubmit
# We need to find the block where we check !res.ok and handle 409
# I'll replace the whole block I updated earlier

$oldErrorBlock = '            // Check if response is ok before trying to parse JSON
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
            }'

$newErrorBlock = '            // Check if response is ok before trying to parse JSON
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
            }'

# Normalize line endings
$content = $content.Replace("`r`n", "`n")
$oldProps = $oldProps.Replace("`r`n", "`n")
$newProps = $newProps.Replace("`r`n", "`n")
$oldSig = $oldSig.Replace("`r`n", "`n")
$newSig = $newSig.Replace("`r`n", "`n")
$oldErrorBlock = $oldErrorBlock.Replace("`r`n", "`n")
$newErrorBlock = $newErrorBlock.Replace("`r`n", "`n")

# Apply replacements
if ($content.Contains($oldProps)) {
    $content = $content.Replace($oldProps, $newProps)
    Write-Host "Props interface updated."
} else {
    Write-Host "Props interface NOT updated."
}

if ($content.Contains($oldSig)) {
    $content = $content.Replace($oldSig, $newSig)
    Write-Host "Component signature updated."
} else {
    Write-Host "Component signature NOT updated."
}

if ($content.Contains($oldErrorBlock)) {
    $content = $content.Replace($oldErrorBlock, $newErrorBlock)
    Write-Host "Error handling updated."
} else {
    Write-Host "Error handling NOT updated."
    # Debug
    Write-Host "Looking for:"
    $oldErrorBlock
}

Set-Content -Path $path -Value $content -Encoding UTF8
