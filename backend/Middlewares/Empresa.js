import * as empresasRepository from '../Repositories/EmpresasRepository.js';
import AppError from '../Utils/AppError.js';

export const cargarEmpresa = async (req, res, next) => {
    const empresa = await empresasRepository.buscarPorUsuario(req.usuario.id);

    if (!empresa) {
        throw AppError.notFound('Tu cuenta no tiene una empresa registrada');
    }

    req.empresa = empresa;
    next();
};