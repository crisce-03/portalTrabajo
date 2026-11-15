import { pool } from '../Data/db.js';
import AppError from '../Utils/AppError.js';

// Contrato para las rutas privadas: después de autenticar, req.usuario = { id, rol }.
// shortcut: sin login real, el usuario sale de AUTH_DEMO_USUARIO_ID en .env (solo fuera de producción);
// cuando exista la autenticación, reemplazar el cuerpo de autenticar por la verificación del token
export const autenticar = async (req, res, next) => {
    const id = Number(process.env.AUTH_DEMO_USUARIO_ID);
    if (!id || process.env.NODE_ENV === 'production') throw AppError.unauthorized();

    const result = await pool.query('SELECT id, rol FROM usuarios WHERE id = $1 AND activo', [id]);
    if (!result.rows[0]) throw AppError.unauthorized();

    req.usuario = result.rows[0];
    next();
}

export const requiereRol = (...roles) => (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) throw AppError.forbidden();
    next();
}
