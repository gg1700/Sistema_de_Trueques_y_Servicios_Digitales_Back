
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function testPurchase() {
    try {
        // Usar IDs de los logs anteriores: Usuario 7, Publicación 46 (o 21, 42, 38, 36)
        // Intentaremos con una publicación que sepamos que existe y es de producto
        const cod_us = 7;
        const cod_pub = 48;

        console.log(`Simulando compra: Usuario ${cod_us}, Publicación ${cod_pub}`);

        const response = await axios.post(
            `${API_URL}/transactions/purchase_product?cod_us=${cod_us}`,
            { cod_pub }
        );

        console.log('Compra exitosa:', response.data);
    } catch (error: any) {
        console.error('Error en la compra:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testPurchase();
