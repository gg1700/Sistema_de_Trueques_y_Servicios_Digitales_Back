import { register_product } from './src/modules/services/product.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
    try {
        console.log("Simulating product registration...");
        // Use an existing subcategory ID (e.g., 1)
        const result = await register_product("1", {
            nom_prod: "Test Product CO2 String",
            peso_prod: 1.5,
            precio_prod: 100,
            cod_mat: "5" as any, // Test string input
            desc_prod: "Test description string"
        });

        console.log("Result:", result);

        if (result.success && result.cod_prod) {
            // Check if material was linked
            const link = await prisma.$queryRaw`
                SELECT * FROM material_producto WHERE cod_prod = ${result.cod_prod}::INTEGER
            `;
            console.log("Material Link:", link);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
})();
