import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const API_URL = 'http://localhost:5000/api';
const prisma = new PrismaClient();

async function testServicePurchase() {
    try {
        // Buscar una publicación de servicio en la base de datos
        console.log('Buscando publicaciones de servicio en la BD...');
        const servicePublications = await prisma.$queryRaw`
            SELECT p.cod_pub, p.cod_us, p.estado_pub,
                   s.nom_serv, s.precio_serv
            FROM publicacion p
            INNER JOIN publicacion_servicio ps ON p.cod_pub = ps.cod_pub
            INNER JOIN servicio s ON ps.cod_serv = s.cod_serv
            WHERE p.estado_pub = 'activo'
            LIMIT 5
        ` as any[];

        console.log('Publicaciones de servicio encontradas:', servicePublications.length);

        if (servicePublications.length === 0) {
            console.log('No hay publicaciones de servicio activas');
            await prisma.$disconnect();
            return;
        }

        console.log('Servicios:', JSON.stringify(servicePublications, null, 2));

        // Intentar comprar el primer servicio
        const firstService = servicePublications[0];
        const cod_pub = firstService.cod_pub;
        const owner_id = firstService.cod_us;

        // Usar un usuario diferente al dueño
        const cod_us = owner_id === 7 ? 8 : 7;

        console.log('\nSimulando compra de servicio:');
        console.log(`- Usuario comprador: ${cod_us}`);
        console.log(`- Publicación: ${cod_pub}`);
        console.log(`- Dueño: ${owner_id}`);
        console.log(`- Servicio: ${firstService.nom_serv}`);
        console.log(`- Precio: ${firstService.precio_serv}`);

        const response = await axios.post(
            `${API_URL}/transactions/purchase_product?cod_us=${cod_us}`,
            { cod_pub }
        );

        console.log('\n✓ Compra exitosa:', JSON.stringify(response.data, null, 2));
        await prisma.$disconnect();
    } catch (error: any) {
        console.error('\n✗ Error en la compra:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error completo:', error);
        }
        await prisma.$disconnect();
    }
}

testServicePurchase();
