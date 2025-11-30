import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listPaidEvents() {
    try {
        console.log('\n=== EVENTOS DE PAGO DISPONIBLES ===\n');

        const paidEvents = await prisma.$queryRaw`
      SELECT 
        e.cod_evento,
        e.titulo_evento,
        e.costo_inscripcion,
        e.cod_us_creador,
        e.estado_evento,
        e.tipo_evento,
        COUNT(ue.cod_us) as inscritos
      FROM EVENTO e
      LEFT JOIN USUARIO_EVENTO ue ON e.cod_evento = ue.cod_evento
      WHERE e.costo_inscripcion > 0
      GROUP BY e.cod_evento
      ORDER BY e.cod_evento
    ` as any[];

        if (paidEvents.length === 0) {
            console.log('❌ No hay eventos de pago en la base de datos\n');
        } else {
            paidEvents.forEach(event => {
                console.log(`ID: ${event.cod_evento}`);
                console.log(`  Título: ${event.titulo_evento}`);
                console.log(`  Costo: ${event.costo_inscripcion} CV`);
                console.log(`  Creador: ${event.cod_us_creador || 'NULL'}`);
                console.log(`  Estado: ${event.estado_evento}`);
                console.log(`  Tipo: ${event.tipo_evento}`);
                console.log(`  Inscritos: ${event.inscritos}`);
                console.log('');
            });
        }

        console.log('\n=== VERIFICAR INSCRIPCIONES DEL USUARIO 6 ===\n');

        const userEnrollments = await prisma.$queryRaw`
      SELECT 
        e.cod_evento,
        e.titulo_evento,
        e.costo_inscripcion
      FROM USUARIO_EVENTO ue
      INNER JOIN EVENTO e ON ue.cod_evento = e.cod_evento
      WHERE ue.cod_us = 6
      ORDER BY e.cod_evento
    ` as any[];

        if (userEnrollments.length === 0) {
            console.log('El usuario 6 no está inscrito en ningún evento\n');
        } else {
            console.log('El usuario 6 está inscrito en:');
            userEnrollments.forEach(e => {
                console.log(`  - ${e.cod_evento}: ${e.titulo_evento} (${e.costo_inscripcion} CV)`);
            });
            console.log('');
        }

    } catch (error) {
        console.error('❌ ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

listPaidEvents();
