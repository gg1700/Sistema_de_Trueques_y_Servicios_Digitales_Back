
// Obtener solicitudes de intercambio pendientes (para el usuario destino/ofertante)
export async function get_pending_exchange_requests(cod_us: number) {
    try {
        console.log(`Obteniendo solicitudes pendientes para usuario ${cod_us}`);

        const pendingRequests: any[] = await prisma.$queryRaw`
            SELECT 
                i.cod_inter,
                i.cod_us_1,
                i.cod_us_2,
                i.cant_prod_origen,
                i.unidad_medida_origen,
                i.cant_prod_destino,
                i.unidad_medida_destino,
                i.impacto_amb_inter,
                i.foto_inter,
                i.estado_inter,
                u1.nom_us || ' ' || u1.ap_pat_us || COALESCE(' ' || u1.ap_mat_us, '') as nombre_usuario_origen,
                u1.handle_name as handle_name_origen,
                p_origen.nom_prod as nombre_prod_origen,
                p_destino.nom_prod as nombre_prod_destino,
                ip.fecha_inter
            FROM intercambio i
            INNER JOIN usuario u1 ON i.cod_us_1 = u1.cod_us
            INNER JOIN intercambio_producto ip ON i.cod_inter = ip.cod_inter
            LEFT JOIN producto p_origen ON ip.cod_prod_origen = p_origen.cod_prod
            LEFT JOIN producto p_destino ON ip.cod_prod_destino = p_destino.cod_prod
            WHERE i.cod_us_2 = ${cod_us} 
            AND i.estado_inter = 'pendiente'
            ORDER BY ip.fecha_inter DESC
        `;

        const processedRequests = pendingRequests.map(req => ({
            ...req,
            tiene_foto: req.foto_inter !== null && req.foto_inter !== undefined,
            foto_inter: undefined,
            fecha_inter: req.fecha_inter ? new Date(req.fecha_inter).toISOString() : new Date().toISOString()
        }));

        console.log(`✅ Encontradas ${processedRequests.length} solicitudes pendientes`);
        return processedRequests;
    } catch (err) {
        console.error('Error en get_pending_exchange_requests:', err);
        throw new Error((err as Error).message);
    }
}

// Aceptar una propuesta de intercambio
export async function accept_exchange_proposal(cod_inter: number, cod_us: number) {
    try {
        console.log(`Usuario ${cod_us} aceptando propuesta de intercambio ${cod_inter}`);

        return await prisma.$transaction(async (tx) => {
            // 1. Verificar que el intercambio existe y está pendiente
            const intercambioData: any[] = await tx.$queryRaw`
                SELECT cod_inter, cod_us_2, estado_inter
                FROM intercambio
                WHERE cod_inter = ${cod_inter}
            `;

            if (!intercambioData || intercambioData.length === 0) {
                throw new Error('Intercambio no encontrado.');
            }

            const intercambio = intercambioData[0];

            // 2. Validar que solo el usuario destino puede aceptar
            if (intercambio.cod_us_2 !== cod_us) {
                throw new Error('No tienes permiso para aceptar esta propuesta.');
            }

            // 3. Validar que el estado sea pendiente
            if (intercambio.estado_inter !== 'pendiente') {
                throw new Error('Esta propuesta no está pendiente.');
            }

            // 4. Actualizar estado a satisfactorio
            await tx.$queryRaw`
                UPDATE intercambio
                SET estado_inter = 'satisfactorio'::"ExchangeState"
                WHERE cod_inter = ${cod_inter}
            `;

            // 5. Actualizar estado en intercambio_producto
            await tx.$queryRaw`
                UPDATE intercambio_producto
                SET estado_inter = 'satisfactorio'::"TransactionState"
                WHERE cod_inter = ${cod_inter}
            `;

            console.log(`✅ Propuesta ${cod_inter} aceptada exitosamente`);

            return {
                success: true,
                message: 'Propuesta de intercambio aceptada exitosamente'
            };
        });
    } catch (err) {
        console.error('Error en accept_exchange_proposal:', err);
        throw new Error((err as Error).message);
    }
}

// Rechazar una propuesta de intercambio y volver a estado abierto
export async function reject_exchange_proposal(cod_inter: number, cod_us: number) {
    try {
        console.log(`Usuario ${cod_us} rechazando propuesta de intercambio ${cod_inter}`);

        return await prisma.$transaction(async (tx) => {
            // 1. Verificar que el intercambio existe y está pendiente
            const intercambioData: any[] = await tx.$queryRaw`
                SELECT cod_inter, cod_us_2, estado_inter
                FROM intercambio
                WHERE cod_inter = ${cod_inter}
            `;

            if (!intercambioData || intercambioData.length === 0) {
                throw new Error('Intercambio no encontrado.');
            }

            const intercambio = intercambioData[0];

            // 2. Validar que solo el usuario destino puede rechazar
            if (intercambio.cod_us_2 !== cod_us) {
                throw new Error('No tienes permiso para rechazar esta propuesta.');
            }

            // 3. Validar que el estado sea pendiente
            if (intercambio.estado_inter !== 'pendiente') {
                throw new Error('Esta propuesta no está pendiente.');
            }

            // 4. Resetear intercambio a estado abierto
            await tx.$queryRaw`
                UPDATE intercambio
                SET cod_us_1 = NULL,
                    cant_prod_origen = 0,
                    unidad_medida_origen = NULL,
                    estado_inter = 'no_satisfactorio'::"ExchangeState"
                WHERE cod_inter = ${cod_inter}
            `;

            // 5. Resetear intercambio_producto
            await tx.$queryRaw`
                UPDATE intercambio_producto
                SET cod_prod_origen = NULL,
                    estado_inter = 'no_satisfactorio'::"TransactionState"
                WHERE cod_inter = ${cod_inter}
            `;

            console.log(`✅ Propuesta ${cod_inter} rechazada, intercambio vuelve a estar abierto`);

            return {
                success: true,
                message: 'Propuesta rechazada. El intercambio vuelve a estar disponible.'
            };
        });
    } catch (err) {
        console.error('Error en reject_exchange_proposal:', err);
        throw new Error((err as Error).message);
    }
}
