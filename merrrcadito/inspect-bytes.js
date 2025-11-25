const fs = require('fs');
const path = 'C:\\Users\\MAT\\Documents\\Sistema_de_Trueques_y_Servicios_Digitales_Front\\merrrcadito\\src\\Components\\Templates\\ModalsProfile\\UserProfile.tsx';

try {
    const content = fs.readFileSync(path);
    const str = content.toString('utf8');

    // Search for the label
    const index = str.indexOf('>Categor');
    if (index !== -1) {
        console.log('Found ">Categor" at index', index);
        const slice = content.slice(index, index + 30);
        console.log('Hex values:', slice.toString('hex'));
        console.log('String values:', slice.toString('utf8'));
    } else {
        console.log('">Categor" not found');
    }

} catch (err) {
    console.error(err);
}
