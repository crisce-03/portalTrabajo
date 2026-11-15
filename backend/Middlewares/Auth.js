import { verifyToken } from '../Utils/Token.js';
import * as usuariosRepository from '../Repositories/UsuariosRepository.js';
import AppError from '../Utils/AppError.js';

const autenticar = async (req, res, next) => {
    const cabecera = req.headers.authorization || '';

    if (!cabecera.startsWith('Bearer ')) {
        throw AppError.unauthorized('Debes iniciar sesión');
    }

    let datos;
    try {
        datos = verifyToken(cabecera.slice(7));
    } catch {
        throw AppError.unauthorized('La sesión no es válida o ya expiró');
    }

    const usuario = await usuariosRepository.buscarPorId(datos.id);

    if (!usuario || !usuario.activo) {
        throw AppError.unauthorized('La cuenta no existe o está deshabilitada');
    }

    req.usuario = usuario;
    next();
};

const permitirRoles = (...roles) => (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
        throw AppError.forbidden();
    }
    next();
};

export { autenticar, permitirRoles };