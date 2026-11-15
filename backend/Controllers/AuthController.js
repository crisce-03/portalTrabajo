import * as authService from '../Services/AuthService.js';
import { success } from '../Utils/Response.js';

const registro = async (req, res) => {
    const result = await authService.registrar(req.body);

    return success(res, result, { status: 201, message: 'Cuenta creada correctamente' });
};

const login = async (req, res) => {
    const result = await authService.iniciarSesion(req.body);

    return success(res, result, { message: 'Sesión iniciada' });
};

const me = async (req, res) => {
    return success(res, { usuario: req.usuario });
};

export { registro, login, me };