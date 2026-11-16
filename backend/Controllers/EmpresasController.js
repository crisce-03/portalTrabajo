import * as empresasService from '../Services/EmpresasService.js';
import { success } from '../Utils/Response.js';

const obtenerPerfil = async (req, res) => {
    return success(res, { empresa: req.empresa });
};

const actualizarPerfil = async (req, res) => {
    const empresa = await empresasService.actualizarPerfil(req.empresa.id, req.body);

    return success(res, { empresa }, { message: 'Datos de la empresa actualizados' });
};

const obtenerResumen = async (req, res) => {
    const resumen = await empresasService.obtenerResumen(req.empresa.id);

    return success(res, resumen);
};

export { obtenerPerfil, actualizarPerfil, obtenerResumen };