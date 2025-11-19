import { Request, Response } from 'express';
import * as ProductService from '../services/product.service';

export async function registerProduct(req: Request, res: Response) {
    try {
        const { cod_subcat_prod } = req.query;
        const attributes = req.body;
        if (!cod_subcat_prod || typeof cod_subcat_prod !== 'string') {
            return res.status(400).json({ 
                success: false, 
                message: 'Código de subcategoría inválido.' 
            });
        }
        if (!attributes) {
            return res.status(400).json({ 
                success: false, 
                message: 'Datos incompletos para registrar el producto.' 
            });
        }
        const result = await ProductService.register_product(cod_subcat_prod, attributes);
        return res.status(201).json({
            success: true, 
            message: 'Producto registrado correctamente.', 
            data: result 
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al registrar producto: ',
            error: (err as Error).message
        });
    }
}