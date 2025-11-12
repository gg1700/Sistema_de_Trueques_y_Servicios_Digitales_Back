import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getUsuariosPorAccion(fechaInicio?: string, fechaFin?: string) {
  try {
    const params = [];
    if (fechaInicio) params.push(fechaInicio);
    if (fechaFin) params.push(fechaFin);

    const result = await prisma.$queryRawUnsafe(
      `SELECT * FROM sp_reporteUsuariosPorAccion(${fechaInicio ? '$1' : 'DEFAULT'}, ${fechaFin ? '$2' : 'DEFAULT'})`,
      ...params
    );

    return {
      success: true,
      data: result,
      message: 'Reporte de acciones generado exitosamente'
    };
  } catch (error) {
    console.error('Error en getUsuariosPorAccion:', error);
    throw new Error('Error al generar reporte de acciones');
  }
}

export async function getImpactoAmbientalPlataforma(anio?: number) {
  try {
    const result = await prisma.$queryRawUnsafe(
      `SELECT * FROM sp_reporteImpactoAmbientalPlataforma(${anio ? '$1' : 'DEFAULT'})`,
      ...(anio ? [anio] : [])
    );

    // Formatear para gráficos
    const formattedData = (result as any[]).map(row => ({
      mes: row.nombre_mes,
      co2_eliminado: parseFloat(row.total_co2_eliminado || 0),
      publicaciones: parseInt(row.cantidad_publicaciones || 0),
      usuarios_activos: parseInt(row.cantidad_usuarios_activos || 0),
      promedio_usuario: parseFloat(row.promedio_co2_usuario || 0)
    }));

    return {
      success: true,
      data: formattedData,
      resumen: {
        total_anual: formattedData.reduce((sum, m) => sum + m.co2_eliminado, 0),
        promedio_mensual: formattedData.reduce((sum, m) => sum + m.co2_eliminado, 0) / 12
      },
      message: 'Reporte de impacto ambiental generado exitosamente'
    };
  } catch (error) {
    console.error('Error en getImpactoAmbientalPlataforma:', error);
    throw new Error('Error al generar reporte de impacto ambiental');
  }
}

export async function getComprasTienda(anio?: number) {
  try {
    const result = await prisma.$queryRawUnsafe(
      `SELECT * FROM sp_reporteComprasTienda(${anio ? '$1' : 'DEFAULT'})`,
      ...(anio ? [anio] : [])
    );

    // Agrupar por mes para gráficos
    const datosPorMes = (result as any[]).reduce((acc, row) => {
      const mesKey = row.nombre_mes;
      if (!acc[mesKey]) {
        acc[mesKey] = {
          mes: mesKey,
          total_ventas: 0,
          total_ingresos: 0,
          productos: []
        };
      }

      acc[mesKey].total_ventas += parseInt(row.cantidad_ventas || 0);
      acc[mesKey].total_ingresos += parseFloat(row.ingresos_totales || 0);

      if (row.tipo_producto !== 'Sin ventas') {
        acc[mesKey].productos.push({
          tipo: row.tipo_producto,
          nombre: row.nombre_producto,
          ventas: parseInt(row.cantidad_ventas || 0),
          ingresos: parseFloat(row.ingresos_totales || 0)
        });
      }

      return acc;
    }, {});

    return {
      success: true,
      data: Object.values(datosPorMes),
      detalles: result,
      message: 'Reporte de compras generado exitosamente'
    };
  } catch (error) {
    console.error('Error en getComprasTienda:', error);
    throw new Error('Error al generar reporte de compras');
  }
}

export async function getReporteEventos(fechaInicio?: string, fechaFin?: string) {
  try {
    const params = [];
    if (fechaInicio) params.push(fechaInicio);
    if (fechaFin) params.push(fechaFin);

    const result = await prisma.$queryRawUnsafe(
      `SELECT * FROM sp_reporteEventos(${fechaInicio ? '$1' : 'DEFAULT'}, ${fechaFin ? '$2' : 'DEFAULT'})`,
      ...params
    );

    // Calcular estadísticas generales
    const eventos = result as any[];
    const totalInscritos = eventos.reduce((sum, e) => sum + parseInt(e.usuarios_inscritos || 0), 0);
    const totalGanancias = eventos.reduce((sum, e) => sum + parseFloat(e.ganancia_total || 0), 0);

    return {
      success: true,
      data: eventos,
      estadisticas: {
        total_eventos: eventos.length,
        total_inscritos: totalInscritos,
        total_ganancias: totalGanancias,
        promedio_inscritos: eventos.length > 0 ? totalInscritos / eventos.length : 0
      },
      message: 'Reporte de eventos generado exitosamente'
    };
  } catch (error) {
    console.error('Error en getReporteEventos:', error);
    throw new Error('Error al generar reporte de eventos');
  }
}