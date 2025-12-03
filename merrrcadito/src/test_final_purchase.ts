import axios from 'axios';

const API_URL = 'http://localhost:4000/api'; // Ajusta el puerto si es necesario

async function testPurchase() {
    try {
        // Usuario 7, Publicación 48 (servicio)
        const cod_us = 7;
        const cod_pub = 48;

        console.log(`\n=== Probando compra de servicio ===`);
        console.log(`Usuario: ${cod_us}`);
        console.log(`Publicación: ${cod_pub}\n`);

        const response = await axios.post(
            `${API_URL}/transactions/purchase_product?cod_us=${cod_us}`,
            { cod_pub }
        );

        console.log('✓ Compra exitosa!');
        console.log('Respuesta:', JSON.stringify(response.data, null, 2));
    } catch (error: any) {
        console.error('\n✗ Error en la compra');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Mensaje:', error.response.data.message);
            console.error('Error:', error.response.data.error);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testPurchase();
