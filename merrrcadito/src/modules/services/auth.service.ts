import { PrismaClient, Prisma } from "@prisma/client";
import * as bcrypt from 'bcryptjs';

// 🔍 DEBUG: Verificar qué DATABASE_URL está usando Prisma
console.log('🔍 [PRISMA] DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
console.log('🔍 [PRISMA] DIRECT_URL:', process.env.DIRECT_URL?.substring(0, 50) + '...');

const prisma = new PrismaClient();

interface RegisterUserData {
    // Datos del usuario
    nom_us: string;
    ap_pat_us: string;
    ap_mat_us?: string | null;
    ci: string;
    handle_name: string;
    correo_us: string;
    telefono_us: string;
    contra_us: string;
    fecha_nacimiento: string; // YYYY-MM-DD
    sexo: 'M' | 'F';
    rol: string; // 'usuario_comun', 'emprendedor', etc.
    cod_disp?: number | null;
}

interface RegisterUserResult {
    success: boolean;
    message: string;
    cod_us?: number;
}

interface LoginResult {
    success: boolean;
    message: string;
    user?: {
        cod_us: number;
        nom_us: string;
        handle_name: string;
        correo_us: string;
        rol: string;
    };
}

/**
 * LOGIN - Autenticación con validación bcrypt
 * NO USA STORED PROCEDURES - Solo SQL nativo
 */
export async function login(correo_us: string, contra_us: string): Promise<LoginResult> {
    try {
        console.log('========================================');
        console.log('🔐 [AUTH LOGIN] INTENTO DE LOGIN');
        console.log('========================================');
        console.log('📧 Correo recibido:', correo_us);
        console.log('🔑 Contraseña recibida (primeros 3 chars):', contra_us.substring(0, 3) + '***');
        console.log('📏 Longitud contraseña recibida:', contra_us.length);

        // 1. Buscar usuario por correo con JOIN a rol
        const userResult = await prisma.$queryRaw`
            SELECT 
                u.cod_us, 
                u.contra_us, 
                u.nom_us, 
                u.handle_name,
                u.correo_us, 
                u.estado_us,
                r.nom_rol 
            FROM usuario u
            INNER JOIN rol r ON u.cod_rol = r.cod_rol
            WHERE u.correo_us = ${correo_us}
        ` as any[];

        // 2. Verificar si el usuario existe
        if (!userResult || userResult.length === 0) {
            console.log('❌ [AUTH LOGIN] Usuario no encontrado');
            console.log('========================================\n');
            return {
                success: false,
                message: 'Credenciales inválidas'
            };
        }

        const user = userResult[0];

        console.log('✅ Usuario encontrado en BD');
        console.log('👤 cod_us:', user.cod_us);
        console.log('👤 nom_us:', user.nom_us);
        console.log('👤 handle_name:', user.handle_name);
        console.log('👤 estado_us:', user.estado_us);
        console.log('🔐 Hash en BD (primeros 10 chars):', user.contra_us.substring(0, 10) + '...');
        console.log('📏 Longitud hash en BD:', user.contra_us.length);

        // Detectar si la contraseña está en texto plano
        const isBcryptHash = user.contra_us.startsWith('$2a$') || user.contra_us.startsWith('$2b$');
        console.log('🔍 ¿Es hash bcrypt?:', isBcryptHash);

        if (!isBcryptHash) {
            console.log('⚠️  ADVERTENCIA: La contraseña en BD NO es un hash bcrypt!');
            console.log('⚠️  Parece estar en texto plano. Comparando directamente...');

            // Si está en texto plano, comparar directamente
            if (contra_us === user.contra_us) {
                console.log('✅ Contraseñas coinciden (texto plano)');
                console.log('⚠️  URGENTE: Debes hashear esta contraseña!');

                // Login exitoso pero con advertencia
                await prisma.$queryRaw`
                    INSERT INTO acceso (cod_us, estado_acc, fecha_acc, contra_acc)
                    VALUES (
                        ${user.cod_us}::INTEGER,
                        'exitoso'::"AccessState",
                        NOW(),
                        ${contra_us}::VARCHAR
                    )
                `;

                console.log('========================================\n');

                return {
                    success: true,
                    message: 'Login exitoso (ADVERTENCIA: contraseña sin hashear)',
                    user: {
                        cod_us: Number(user.cod_us),
                        nom_us: user.nom_us,
                        handle_name: user.handle_name,
                        correo_us: user.correo_us,
                        rol: user.nom_rol
                    }
                };
            } else {
                console.log('❌ Contraseñas NO coinciden (texto plano)');
                console.log('========================================\n');

                await prisma.$queryRaw`
                    INSERT INTO acceso (cod_us, estado_acc, fecha_acc, contra_acc)
                    VALUES (
                        ${user.cod_us}::INTEGER,
                        'no_exitoso'::"AccessState",
                        NOW(),
                        ${contra_us}::VARCHAR
                    )
                `;

                return {
                    success: false,
                    message: 'Credenciales inválidas'
                };
            }
        }

        // 3. Verificar si el usuario está activo
        if (user.estado_us !== 'activo') {
            console.log(`❌ [AUTH LOGIN] Usuario inactivo o suspendido: ${user.estado_us}`);
            console.log('========================================\n');
            return {
                success: false,
                message: 'Usuario inactivo o suspendido'
            };
        }

        // 4. CRÍTICO: Validar contraseña con bcrypt
        console.log('🔄 Comparando con bcrypt...');
        const isPasswordValid = await bcrypt.compare(contra_us, user.contra_us);
        console.log('🎯 Resultado bcrypt.compare():', isPasswordValid);

        if (!isPasswordValid) {
            console.log('❌ [AUTH LOGIN] Contraseña incorrecta (bcrypt)');
            console.log('========================================\n');

            // Registrar intento fallido en tabla acceso
            console.log('📝 [ACCESO] Registrando intento fallido...');
            try {
                await prisma.$queryRaw`
                    INSERT INTO acceso (cod_us, estado_acc, fecha_acc, contra_acc)
                    VALUES (
                        ${user.cod_us}::INTEGER,
                        'no_exitoso'::"AccessState",
                        NOW(),
                        ${contra_us}::VARCHAR
                    )
                `;
                console.log('✅ [ACCESO] Intento fallido registrado correctamente');
            } catch (accesoError) {
                console.error('❌ [ACCESO] Error al insertar intento fallido:', (accesoError as Error).message);
            }

            return {
                success: false,
                message: 'Credenciales inválidas'
            };
        }

        // 5. Login exitoso - Registrar acceso exitoso
        console.log('✅ [AUTH LOGIN] Login exitoso (bcrypt)');

        console.log('📝 [ACCESO] Intentando registrar acceso exitoso en BD...');
        console.log('📝 [ACCESO] cod_us:', user.cod_us);
        console.log('📝 [ACCESO] estado_acc: exitoso');

        try {
            const insertResult = await prisma.$queryRaw`
                INSERT INTO acceso (cod_us, estado_acc, fecha_acc, contra_acc)
                VALUES (
                    ${user.cod_us}::INTEGER,
                    'exitoso'::"AccessState",
                    NOW(),
                    ${contra_us}::VARCHAR
                )
                RETURNING cod_acc, cod_us, estado_acc, fecha_acc
            `;
            console.log('✅ [ACCESO] INSERT ejecutado. Resultado:', insertResult);

            // 🔍 VERIFICACIÓN: Hacer SELECT inmediatamente después del INSERT
            console.log('🔍 [ACCESO] Verificando si el registro realmente se guardó...');
            const verification: any = await prisma.$queryRaw`
                SELECT cod_acc, cod_us, estado_acc, fecha_acc
                FROM acceso
                WHERE cod_us = ${user.cod_us}::INTEGER
                ORDER BY fecha_acc DESC
                LIMIT 1
            `;

            if (verification && verification.length > 0) {
                console.log('✅ [ACCESO] ¡VERIFICADO! Registro encontrado en BD:', verification[0]);
            } else {
                console.log('❌ [ACCESO] ¡PROBLEMA! No se encontró el registro después del INSERT');
            }

            // 🔍 Contar cuántos registros tiene este usuario en total
            const count: any = await prisma.$queryRaw`
                SELECT COUNT(*)::INTEGER as total
                FROM acceso
                WHERE cod_us = ${user.cod_us}::INTEGER
            `;
            console.log(`📊 [ACCESO] Total de accesos para cod_us ${user.cod_us}:`, count[0]?.total);

        } catch (accesoError) {
            console.error('❌ [ACCESO] Error al insertar en tabla acceso:', accesoError);
            console.error('❌ [ACCESO] Detalles del error:', (accesoError as Error).message);
        }

        console.log('========================================\n');

        // 6. Retornar datos del usuario (SIN la contraseña)
        return {
            success: true,
            message: 'Login exitoso',
            user: {
                cod_us: Number(user.cod_us),
                nom_us: user.nom_us,
                handle_name: user.handle_name,
                correo_us: user.correo_us,
                rol: user.nom_rol
            }
        };

    } catch (error) {
        console.error('💥 [AUTH LOGIN ERROR]', error);
        console.log('========================================\n');
        throw new Error(`Error en login: ${(error as Error).message}`);
    }
}

/**
 * Registro transaccional de usuario con inicialización de billetera
 * GARANTIZA: Usuario + Billetera (3333 Bs) + Detalle Usuario en una sola transacción
 */
export async function register_user_transactional(
    userData: RegisterUserData,
    foto_us: Buffer
): Promise<RegisterUserResult> {
    try {
        return await prisma.$transaction(async (tx) => {
            console.log('[REGISTER] Iniciando registro transaccional de usuario...');

            // 1. Verificar que el handle_name no exista
            const existingUser = await tx.$queryRaw`
                SELECT handle_name FROM usuario WHERE handle_name = ${userData.handle_name}
            ` as any[];

            if (existingUser.length > 0) {
                throw new Error('El handle name ya existe.');
            }

            // 2. Verificar que el correo no exista
            console.log('[REGISTER] Verificando correo:', userData.correo_us);
            const existingEmail = await tx.$queryRaw`
                SELECT correo_us FROM usuario WHERE correo_us = ${userData.correo_us}
            ` as any[];

            console.log('[REGISTER] Correos encontrados:', existingEmail.length);
            if (existingEmail.length > 0) {
                console.log('[REGISTER] ❌ Correo duplicado encontrado:', existingEmail[0].correo_us);
                throw new Error('El correo electrónico ya está registrado.');
            }
            console.log('[REGISTER] ✅ Correo disponible');

            // 3. Obtener cod_rol basado en el string del rol
            const rolResult = await tx.$queryRaw`
                SELECT cod_rol FROM rol WHERE nom_rol = ${userData.rol}::"RoleName"
            ` as any[];

            if (rolResult.length === 0) {
                throw new Error(`El rol '${userData.rol}' no existe en el sistema.`);
            }

            const cod_rol = rolResult[0].cod_rol;
            console.log(`[REGISTER] Rol encontrado: ${userData.rol} -> cod_rol: ${cod_rol}`);

            // 4. Hashear la contraseña
            console.log('========================================');
            console.log('🔐 [REGISTER] HASHEANDO CONTRASEÑA');
            console.log('========================================');
            console.log('📝 Contraseña ORIGINAL (primeros 3 chars):', userData.contra_us.substring(0, 3) + '***');
            console.log('📏 Longitud contraseña original:', userData.contra_us.length);

            const hashedPassword = await bcrypt.hash(userData.contra_us, 10);

            console.log('✅ Contraseña HASHEADA (primeros 20 chars):', hashedPassword.substring(0, 20) + '...');
            console.log('📏 Longitud hash:', hashedPassword.length);
            console.log('🔍 ¿Empieza con $2b$?:', hashedPassword.startsWith('$2b$'));
            console.log('========================================');

            // 5. Insertar usuario en la tabla usuario
            console.log('📝 [REGISTER] Insertando usuario en BD...');
            console.log('🔐 Usando hash (primeros 20 chars):', hashedPassword.substring(0, 20) + '...');

            const userInsertResult = await tx.$queryRaw`
                INSERT INTO usuario (
                    cod_rol,
                    cod_disp,
                    ci,
                    nom_us,
                    handle_name,
                    ap_pat_us,
                    ap_mat_us,
                    contra_us,
                    fecha_nacimiento,
                    sexo,
                    estado_us,
                    correo_us,
                    telefono_us,
                    foto_us
                ) VALUES (
                    ${cod_rol}::INTEGER,
                    ${userData.cod_disp ?? null}::INTEGER,
                    ${userData.ci}::VARCHAR,
                    ${userData.nom_us}::VARCHAR,
                    ${userData.handle_name}::VARCHAR,
                    ${userData.ap_pat_us}::VARCHAR,
                    ${userData.ap_mat_us ?? null}::VARCHAR,
                    ${hashedPassword}::VARCHAR,
                    ${userData.fecha_nacimiento}::DATE,
                    ${userData.sexo}::"Sex",
                    'activo'::"UserState",
                    ${userData.correo_us}::VARCHAR,
                    ${userData.telefono_us}::VARCHAR,
                    ${foto_us}::BYTEA
                )
                RETURNING cod_us
            ` as any[];

            const cod_us = userInsertResult[0].cod_us;
            console.log(`[REGISTER] Usuario creado con cod_us: ${cod_us}`);

            // 6. Crear billetera con bono de bienvenida de 3333 Bs
            const cuenta_bancaria = `BNB-${cod_us}-${Date.now()}`;

            await tx.$queryRaw`
                INSERT INTO billetera (
                    cod_us,
                    saldo_actual,
                    saldo_real,
                    cuenta_bancaria
                ) VALUES (
                    ${cod_us}::INTEGER,
                    0::DECIMAL,
                    3333::DECIMAL,
                    ${cuenta_bancaria}::VARCHAR
                )
            `;
            console.log(`[REGISTER] Billetera creada con saldo_real: 3333 Bs`);

            // 7. Crear detalle_usuario (inicializar con valores por defecto)
            // Solo insertamos cod_us y fecha_registro, el resto usa valores por defecto de la BD
            await tx.$queryRaw`
                INSERT INTO detalle_usuario (cod_us, fecha_registro)
                VALUES (${cod_us}::INTEGER, NOW())
            `;
            console.log('[REGISTER] Detalle de usuario inicializado');

            console.log('[REGISTER] ✅ Usuario registrado exitosamente con todas las tablas relacionadas');

            return {
                success: true,
                message: 'Usuario registrado correctamente con bono de bienvenida de 3333 Bs',
                cod_us: Number(cod_us)
            };
        });

    } catch (error) {
        console.error('[REGISTER ERROR] Error en registro transaccional:', {
            message: (error as Error).message,
            stack: (error as Error).stack
        });

        // Mensajes de error específicos para el frontend
        const errorMessage = (error as Error).message;
        if (errorMessage.includes('handle name')) {
            throw new Error('El nombre de usuario ya está en uso.');
        }
        if (errorMessage.includes('correo')) {
            throw new Error('El correo electrónico ya está registrado.');
        }
        if (errorMessage.includes('rol')) {
            throw new Error('El rol especificado no es válido.');
        }

        throw new Error(`Error al registrar usuario: ${errorMessage}`);
    }
}

/**
 * REGISTRO DE ORGANIZACIÓN
 * Usa el CIF como contraseña (hasheada con bcrypt)
 */
export async function registerOrganization(
    orgData: {
        nom_com_org: string;
        nom_leg_org: string;
        tipo_org: 'con_fines_lucro' | 'sin_fines_lucro';
        rubro_org: string;
        cif: string;
        correo_org: string;
        telf_org: string;
        dir_org: string;
        sitio_web?: string;
    },
    logo_org: Buffer
): Promise<{ success: boolean; message: string; cod_org?: number }> {
    try {
        console.log('[ORG REGISTER] Iniciando registro de organización...');
        console.log('[ORG REGISTER] Correo:', orgData.correo_org);

        // 1. Verificar que el correo no exista
        const existingEmail = await prisma.$queryRaw`
            SELECT correo_org FROM organizacion WHERE correo_org = ${orgData.correo_org}
        ` as any[];

        if (existingEmail.length > 0) {
            throw new Error('El correo electrónico ya está registrado.');
        }

        // 2. Verificar que el CIF no exista
        const existingCIF = await prisma.$queryRaw`
            SELECT cif FROM organizacion WHERE cif = ${orgData.cif}
        ` as any[];

        if (existingCIF.length > 0) {
            throw new Error('El CIF ya está registrado.');
        }

        // 3. Hashear el CIF (se usa como contraseña)
        console.log('[ORG REGISTER] Hasheando CIF...');
        const hashedCIF = await bcrypt.hash(orgData.cif, 10);
        console.log('[ORG REGISTER] CIF hasheado correctamente');

        // 4. Insertar organización
        const orgInsertResult = await prisma.$queryRaw`
            INSERT INTO organizacion (
                nom_com_org,
                nom_leg_org,
                tipo_org,
                rubro_org,
                cif,
                correo_org,
                telf_org,
                dir_org,
                sitio_web,
                logo_org
            ) VALUES (
                ${orgData.nom_com_org}::VARCHAR,
                ${orgData.nom_leg_org}::VARCHAR,
                ${orgData.tipo_org}::"OrgType",
                ${orgData.rubro_org}::VARCHAR,
                ${hashedCIF}::VARCHAR,
                ${orgData.correo_org}::VARCHAR,
                ${orgData.telf_org}::VARCHAR,
                ${orgData.dir_org}::VARCHAR,
                ${orgData.sitio_web || null}::VARCHAR,
                ${logo_org}::BYTEA
            )
            RETURNING cod_org
        ` as any[];

        const cod_org = orgInsertResult[0].cod_org;
        console.log(`[ORG REGISTER] ✅ Organización registrada con cod_org: ${cod_org}`);

        return {
            success: true,
            message: 'Organización registrada correctamente',
            cod_org: Number(cod_org)
        };

    } catch (error) {
        console.error('[ORG REGISTER ERROR]', error);
        const errorMessage = (error as Error).message;

        if (errorMessage.includes('correo')) {
            throw new Error('El correo electrónico ya está registrado.');
        }
        if (errorMessage.includes('CIF')) {
            throw new Error('El CIF ya está registrado.');
        }

        throw new Error(`Error al registrar organización: ${errorMessage}`);
    }
}

/**
 * LOGIN DE ORGANIZACIÓN
 * Usa correo y CIF original para autenticación
 */
export async function loginOrganization(
    correo_org: string,
    cif_original: string
): Promise<{ success: boolean; message: string; organization?: any }> {
    try {
        console.log('========================================');
        console.log('🏢 [ORG LOGIN] INTENTO DE LOGIN');
        console.log('========================================');
        console.log('📧 Correo:', correo_org);
        console.log('🔑 CIF (primeros 3 chars):', cif_original.substring(0, 3) + '***');

        // 1. Buscar organización por correo
        const orgResult = await prisma.$queryRaw`
            SELECT 
                cod_org,
                nom_com_org,
                nom_leg_org,
                correo_org,
                cif
            FROM organizacion
            WHERE correo_org = ${correo_org}
        ` as any[];

        if (!orgResult || orgResult.length === 0) {
            console.log('❌ [ORG LOGIN] Organización no encontrada');
            console.log('========================================\n');
            return {
                success: false,
                message: 'Credenciales inválidas'
            };
        }

        const org = orgResult[0];
        console.log('✅ Organización encontrada:', org.nom_com_org);
        console.log('🔐 CIF hasheado en BD (primeros 10 chars):', org.cif.substring(0, 10) + '...');

        // 2. Verificar CIF con bcrypt
        console.log('🔄 Comparando CIF con bcrypt...');
        const isCIFValid = await bcrypt.compare(cif_original, org.cif);
        console.log('🎯 Resultado bcrypt.compare():', isCIFValid);

        if (!isCIFValid) {
            console.log('❌ [ORG LOGIN] CIF incorrecto');
            console.log('========================================\n');
            return {
                success: false,
                message: 'Credenciales inválidas'
            };
        }

        console.log('✅ [ORG LOGIN] Login exitoso');
        console.log('========================================\n');

        return {
            success: true,
            message: 'Login exitoso',
            organization: {
                cod_org: Number(org.cod_org),
                nom_com_org: org.nom_com_org,
                nom_leg_org: org.nom_leg_org,
                correo_org: org.correo_org
            }
        };

    } catch (error) {
        console.error('💥 [ORG LOGIN ERROR]', error);
        console.log('========================================\n');
        throw new Error(`Error en login de organización: ${(error as Error).message}`);
    }
}
