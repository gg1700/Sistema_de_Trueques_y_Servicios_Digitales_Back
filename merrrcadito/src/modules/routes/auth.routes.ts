import { Router } from 'express';
import multer from 'multer';
import * as AuthController from '../controllers/auth.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/auth/login
 * Autenticación de usuario con validación bcrypt
 * 
 * Body (JSON):
 * {
 *   correo_us: string,
 *   contra_us: string
 * }
 * 
 * Respuestas:
 * - 200: Login exitoso con datos del usuario
 * - 401: Credenciales inválidas
 * - 400: Datos faltantes o formato inválido
 * - 500: Error del servidor
 */
router.post('/login', AuthController.login);

/**
 * POST /api/auth/register
 * Registro transaccional de nuevo usuario
 * 
 * Crea automáticamente:
 * - Usuario en tabla usuario
 * - Billetera con 3333 Bs de bono de bienvenida
 * - Detalle de usuario con contadores en 0
 * 
 * Body (multipart/form-data):
 * - nom_us: string (requerido)
 * - ap_pat_us: string (requerido)
 * - ap_mat_us: string (opcional)
 * - ci: string (requerido)
 * - handle_name: string (requerido, único)
 * - correo_us: string (requerido, único)
 * - telefono_us: string (requerido)
 * - contra_us: string (requerido)
 * - fecha_nacimiento: string YYYY-MM-DD (requerido)
 * - sexo: 'M' | 'F' (requerido)
 * - rol: string (opcional, default: 'usuario_comun')
 * - foto_us: file (opcional, usa imagen por defecto si no se proporciona)
 */
router.post('/register', upload.single('foto_us'), AuthController.registerUser);

/**
 * POST /api/auth/register-organization
 * Registro de organizaciones con CIF como contraseña
 * 
 * Body (multipart/form-data):
 * - nom_com_org, nom_leg_org, tipo_org, rubro_org, cif, correo_org, telf_org, dir_org, sitio_web (opcional)
 * - logo_org (file)
 */
router.post('/register-organization', upload.single('logo_org'), AuthController.registerOrganization);

/**
 * POST /api/auth/login-organization
 * Login de organizaciones con correo y CIF
 * 
 * Body (JSON):
 * {
 *   correo_org: string,
 *   cif: string
 * }
 */
router.post('/login-organization', AuthController.loginOrganization);

export default router;
