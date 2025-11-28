$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\ServiceRegistrationForm.tsx"
$lines = Get-Content $path

# We need to find the double closing brace pattern
# It looks like:
#             }
#             }
# 
#             const json = await res.json();

for ($i = 0; $i -lt $lines.Count - 1; $i++) {
    $line = $lines[$i].Trim()
    $nextLine = $lines[$i+1].Trim()
    $nextNextLine = if ($i+2 -lt $lines.Count) { $lines[$i+2].Trim() } else { "" }
    
    if ($line -eq "throw new Error(errorMessage);" -and $nextLine -eq "}") {
        # Check if the line after is also a closing brace
        if ($nextNextLine -eq "}") {
            Write-Host "Found extra brace at line $($i+3)"
            
            # Reconstruct content without that line
            # We want to keep lines 0..i+1 (the throw and the first })
            # And skip i+2 (the second })
            # And keep i+3..end
            
            $before = $lines[0..($i+1)]
            $after = $lines[($i+3)..($lines.Count-1)]
            $newContent = $before + $after
            
            Set-Content -Path $path -Value $newContent -Encoding UTF8
            Write-Host "Fixed extra brace."
            exit
        }
    }
}

Write-Host "Could not find the specific pattern to fix."
