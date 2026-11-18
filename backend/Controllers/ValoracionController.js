import * as valoracionService from '../Services/ValoracionService.js';
import { success } from '../Utils/Response.js';

export const getEmpresas = async (req, res) => {
    return success(res, await valoracionService.getEmpresas());
}

export const save = async (req, res) => {
    const valoracion = await valoracionService.save(req.usuario.id, req.body);

    return success(res, valoracion, { status: 201, message: 'Valoración guardada' });
}

export const report = async (req, res) => {
    await valoracionService.report(req.usuario.id, req.params.id, req.body);

    return success(res, null, { status: 201, message: 'Reporte enviado a moderación' });
}
