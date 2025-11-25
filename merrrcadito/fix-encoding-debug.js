const fs = require('fs');
const path = 'C:\\Users\\MAT\\Documents\\Sistema_de_Trueques_y_Servicios_Digitales_Front\\merrrcadito\\src\\Components\\Templates\\ModalsProfile\\UserProfile.tsx';

try {
    let content = fs.readFileSync(path, 'utf8');
    console.log('File read successfully. Length:', content.length);

    const patterns = [
        // Double encoded
        { from: /CategorÃƒÂ­a/g, to: 'Categoría' },
        { from: /SubcategorÃƒÂ­a/g, to: 'Subcategoría' },
        { from: /DescripciÃƒÂ³n/g, to: 'Descripción' },
        { from: /mÃƒÂ¡x/g, to: 'máx' },
        { from: /CÃƒÂ¡mara/g, to: 'Cámara' },
        { from: /tÃƒÂ­tulo/g, to: 'título' },
        { from: /aÃƒÂºn/g, to: 'aún' },
        { from: /PublicaciÃƒÂ³n/g, to: 'Publicación' },
        { from: /Ã‚Â¡/g, to: '¡' },

        // Single encoded (common mojibake)
        { from: /CategorÃ­a/g, to: 'Categoría' },
        { from: /SubcategorÃ­a/g, to: 'Subcategoría' },
        { from: /DescripciÃ³n/g, to: 'Descripción' },
        { from: /mÃ¡x/g, to: 'máx' },
        { from: /CÃ¡mara/g, to: 'Cámara' },
        { from: /tÃ­tulo/g, to: 'título' },
        { from: /aÃºn/g, to: 'aún' },
        { from: /PublicaciÃ³n/g, to: 'Publicación' },

        // Generic replacements for remaining garbage
        { from: /ÃƒÂ¡/g, to: 'á' },
        { from: /ÃƒÂ©/g, to: 'é' },
        { from: /ÃƒÂ­/g, to: 'í' },
        { from: /ÃƒÂ³/g, to: 'ó' },
        { from: /ÃƒÂº/g, to: 'ú' },
        { from: /ÃƒÂ±/g, to: 'ñ' },

        { from: /Ã¡/g, to: 'á' },
        { from: /Ã©/g, to: 'é' },
        { from: /Ã­/g, to: 'í' },
        { from: /Ã³/g, to: 'ó' },
        { from: /Ãº/g, to: 'ú' },
        { from: /Ã±/g, to: 'ñ' },
    ];

    let totalReplacements = 0;
    patterns.forEach(({ from, to }) => {
        const matches = content.match(from);
        if (matches) {
            console.log(`Found ${matches.length} matches for ${from}`);
            content = content.replace(from, to);
            totalReplacements += matches.length;
        }
    });

    if (totalReplacements > 0) {
        fs.writeFileSync(path, content, 'utf8');
        console.log(`Successfully made ${totalReplacements} replacements.`);
    } else {
        console.log('No patterns matched.');
    }

} catch (err) {
    console.error('Error:', err);
}
