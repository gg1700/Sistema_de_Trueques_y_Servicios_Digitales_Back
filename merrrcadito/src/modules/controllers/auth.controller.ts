import { Request, Response } from "express";
import * as AuthService from "../services/auth.service";
import { ImageService } from "../services/image.service";
import * as path from 'path';
import * as fs from 'fs';

const defaultImagePath = path.join(__dirname, '../../images/user_default_image.png');
const image_buffer = fs.readFileSync(defaultImagePath);
const hexa_string = image_buffer.toString('hex');

/**
 * LOGIN - Autenticación de usuario
 * POST /api/auth/login
 * 
 * Body (JSON):
 * {
 *   correo_us: string,
 *   contra_us: string
 * }
 */
export async function login(req: Request, res: Response) {
    try {
        const { correo_us, contra_us } = req.body;

        // Validaciones básicas
        if (!correo_us || !contra_us) {
            return res.status(400).json({
                success: false,
                message: 'Correo/Usuario y contraseña son requeridos'
            });
        }

        // NOTA: No validamos formato de email para permitir login con handle_name o correo

        // Intentar login
        const result = await AuthService.login(correo_us, contra_us);

        if (!result.success) {
            return res.status(401).json({
                success: false,
                message: result.message
            });
        }

        // Login exitoso
        return res.status(200).json({
            success: true,
            message: result.message,
            user: result.user
        });

    } catch (error) {
        console.error('[AUTH CONTROLLER LOGIN ERROR]', error);
        return res.status(500).json({
            success: false,
            message: 'Error en el servidor al procesar el login',
            error: (error as Error).message
        });
    }
}

/**
 * Controlador para registro transaccional de usuario
 * POST /api/auth/register
 * 
 * Body esperado:
 * {
 *   nom_us: string,
 *   ap_pat_us: string,
 *   ap_mat_us?: string,
 *   ci: string,
 *   handle_name: string,
 *   correo_us: string,
 *   telefono_us: string,
 *   contra_us: string,
 *   fecha_nacimiento: string, // YYYY-MM-DD
 *   sexo: 'M' | 'F',
 *   rol: string // 'usuario_comun', 'emprendedor', etc.
 * }
 * 
 * File (opcional): foto_us (multipart/form-data)
 */
export async function registerUser(req: Request, res: Response) {
    try {
        const userData = req.body;
        console.log('[AUTH CONTROLLER] Datos recibidos:', { ...userData, contra_us: '***' });

        // Validaciones básicas
        if (!userData.nom_us || !userData.ap_pat_us || !userData.ci ||
            !userData.handle_name || !userData.correo_us || !userData.telefono_us ||
            !userData.contra_us || !userData.fecha_nacimiento || !userData.sexo) {
            console.log('[AUTH CONTROLLER] ❌ Validación fallida: Datos incompletos');
            return res.status(400).json({
                success: false,
                message: 'Datos incompletos. Todos los campos obligatorios deben estar presentes.'
            });
        }
        console.log('[AUTH CONTROLLER] ✅ Validación básica pasada');

        // Validar formato de correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.correo_us)) {
            console.log('[AUTH CONTROLLER] ❌ Validación fallida: Formato de correo inválido');
            return res.status(400).json({
                success: false,
                message: 'El formato del correo electrónico no es válido.'
            });
        }
        console.log('[AUTH CONTROLLER] ✅ Validación de correo pasada');

        // Validar sexo
        if (userData.sexo !== 'M' && userData.sexo !== 'F') {
            console.log('[AUTH CONTROLLER] ❌ Validación fallida: Sexo inválido');
            return res.status(400).json({
                success: false,
                message: 'El sexo debe ser "M" o "F".'
            });
        }
        console.log('[AUTH CONTROLLER] ✅ Validación de sexo pasada');

        // Establecer rol por defecto si no se proporciona
        if (!userData.rol) {
            userData.rol = 'usuario_comun';
        }
        console.log('[AUTH CONTROLLER] ✅ Rol establecido:', userData.rol);

        // Procesar imagen
        let processedImage: Buffer;

        if (!req.file) {
            // Usar imagen por defecto
            console.log('[AUTH CONTROLLER] Usando imagen por defecto');
            const validImage = await ImageService.processImage(Buffer.from(hexa_string, 'hex'));
            if (!validImage) {
                return res.status(400).json({
                    success: false,
                    message: 'Error al procesar la imagen predeterminada.'
                });
            }
            processedImage = Buffer.from(validImage);
        } else {
            // Procesar imagen subida
            console.log('[AUTH CONTROLLER] Procesando imagen subida');
            const validImage = await ImageService.processImage(req.file.buffer, {
                width: 800,
                height: 800,
                quality: 85,
                format: 'jpeg',
            });
            if (!validImage) {
                return res.status(400).json({
                    success: false,
                    message: 'Error al procesar la imagen.'
                });
            }
            processedImage = Buffer.from(validImage);
        }

        // Registrar usuario de forma transaccional
        const result = await AuthService.register_user_transactional(userData, processedImage);

        return res.status(201).json({
            success: true,
            message: result.message,
            data: {
                cod_us: result.cod_us,
                handle_name: userData.handle_name,
                bono_bienvenida: '3333 Bs'
            }
        });

    } catch (error) {
        console.error('[AUTH CONTROLLER ERROR]', error);

        const errorMessage = (error as Error).message;

        // Errores de validación de negocio (400)
        if (errorMessage.includes('ya existe') ||
            errorMessage.includes('ya está') ||
            errorMessage.includes('no es válido')) {
            return res.status(400).json({
                success: false,
                message: errorMessage
            });
        }

        // Error interno del servidor (500)
        return res.status(500).json({
            success: false,
            message: 'Error al registrar el usuario.',
            error: errorMessage
        });
    }
}

/**
 * REGISTRO DE ORGANIZACIÓN
 * POST /api/auth/register-organization
 * 
 * Body (multipart/form-data):
 * - nom_com_org, nom_leg_org, tipo_org, rubro_org, cif, correo_org, telf_org, dir_org, sitio_web (opcional)
 * - logo_org (file)
 */
export async function registerOrganization(req: Request, res: Response) {
    try {
        const orgData = req.body;
        console.log('[AUTH CONTROLLER ORG] Datos recibidos:', { ...orgData, cif: '***' });

        // Validaciones básicas
        if (!orgData.nom_com_org || !orgData.nom_leg_org || !orgData.tipo_org ||
            !orgData.rubro_org || !orgData.cif || !orgData.correo_org ||
            !orgData.telf_org || !orgData.dir_org) {
            return res.status(400).json({
                success: false,
                message: 'Datos incompletos. Todos los campos obligatorios deben estar presentes.'
            });
        }

        // Validar formato de correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(orgData.correo_org)) {
            return res.status(400).json({
                success: false,
                message: 'El formato del correo electrónico no es válido.'
            });
        }

        // Procesar logo
        let processedLogo: Buffer;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'El logo de la organización es obligatorio.'
            });
        }

        console.log('[AUTH CONTROLLER ORG] Procesando logo...');
        const validLogo = await ImageService.processImage(req.file.buffer, {
            width: 800,
            height: 800,
            quality: 85,
            format: 'jpeg',
        });

        if (!validLogo) {
            return res.status(400).json({
                success: false,
                message: 'Error al procesar el logo.'
            });
        }

        processedLogo = Buffer.from(validLogo);

        // Registrar organización
        const result = await AuthService.registerOrganization(orgData, processedLogo);

        return res.status(201).json({
            success: true,
            message: result.message,
            data: {
                cod_org: result.cod_org,
                nom_com_org: orgData.nom_com_org
            }
        });

    } catch (error) {
        console.error('[AUTH CONTROLLER ORG ERROR]', error);
        const errorMessage = (error as Error).message;

        if (errorMessage.includes('ya está') || errorMessage.includes('ya existe')) {
            return res.status(400).json({
                success: false,
                message: errorMessage
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error al registrar la organización.',
            error: errorMessage
        });
    }
}

/**
 * LOGIN DE ORGANIZACIÓN
 * POST /api/auth/login-organization
 * 
 * Body (JSON):
 * {
 *   correo_org: string,
 *   cif: string
 * }
 */
export async function loginOrganization(req: Request, res: Response) {
    try {
        const { correo_org, cif } = req.body;

        if (!correo_org || !cif) {
            return res.status(400).json({
                success: false,
                message: 'Correo y CIF son obligatorios.'
            });
        }

        const result = await AuthService.loginOrganization(correo_org, cif);

        if (!result.success) {
            return res.status(401).json(result);
        }

        return res.status(200).json(result);

    } catch (error) {
        console.error('[AUTH CONTROLLER ORG LOGIN ERROR]', error);
        return res.status(500).json({
            success: false,
            message: 'Error en el login de organización.',
            error: (error as Error).message
        });
    }
}
