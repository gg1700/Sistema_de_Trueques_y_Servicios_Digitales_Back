$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"

# Read file
$lines = Get-Content -Path $path -Encoding UTF8

# Fix line 272 - missing backticks and quotes around the data URI
$badLine = '          image: s.foto_serv ? data:image/jpeg;base64,${Buffer.from(s.foto_serv).toString(''base64'')} : undefined,'
$goodLine = '          image: s.foto_serv ? `data:image/jpeg;base64,${Buffer.from(s.foto_serv).toString(''base64'')}` : undefined,'

for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'image: s\.foto_serv \? data:image/jpeg') {
        $lines[$i] = $goodLine
        Write-Host "Fixed line $($i + 1): Added backticks around data URI template literal"
        break
    }
}

# Save with UTF-8 encoding
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllLines($path, $lines, $utf8NoBom)

Write-Host "Line 272 fixed successfully!"
