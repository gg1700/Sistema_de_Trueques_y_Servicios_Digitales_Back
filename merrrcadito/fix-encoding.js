const fs = require('fs');
const path = 'C:\\Users\\MAT\\Documents\\Sistema_de_Trueques_y_Servicios_Digitales_Front\\merrrcadito\\src\\Components\\Templates\\ModalsProfile\\UserProfile.tsx';

try {
    let content = fs.readFileSync(path, 'utf8');

    const replacements = [
        ['CategorÃƒÂ­a', 'Categoría'],
        ['SubcategorÃƒÂ­a', 'Subcategoría'],
        ['DescripciÃƒÂ³n', 'Descripción'],
        ['mÃƒÂ¡x', 'máx'],
        ['CÃƒÂ¡mara', 'Cámara'],
        ['tÃƒÂ­tulo', 'título'],
        ['aÃƒÂºn', 'aún'],
        ['PublicaciÃƒÂ³n', 'Publicación'],
        ['Ã‚Â¡', '¡'],
        ['categorÃ­as/subcategorÃ­as', 'categorías/subcategorías'],

        // Single encoded versions
        ['CategorÃ­a', 'Categoría'],
        ['SubcategorÃ­a', 'Subcategoría'],
        ['DescripciÃ³n', 'Descripción'],
        ['mÃ¡x', 'máx'],
        ['CÃ¡mara', 'Cámara'],
        ['tÃ­tulo', 'título'],
        ['aÃºn', 'aún'],
        ['PublicaciÃ³n', 'Publicación'],
        ['Ã¡', 'á'],
        ['Ã©', 'é'],
        ['Ã­', 'í'],
        ['Ã³', 'ó'],
        ['Ãº', 'ú'],
        ['Ã±', 'ñ'],
        ['Ã‘', 'Ñ']
    ];

    replacements.forEach(([from, to]) => {
        // Global replace
        content = content.split(from).join(to);
    });

    fs.writeFileSync(path, content, 'utf8');
    console.log('Successfully fixed encoding in UserProfile.tsx');
} catch (err) {
    console.error('Error fixing encoding:', err);
}
