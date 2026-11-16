import * as service from '../Services/AdminService.js';
import { success } from '../Utils/Response.js';

export const resumen = async (_req, res) => success(res, await service.resumen());
export const cambiarUsuario = async (req, res) => success(res, { usuario: await service.cambiarUsuario(req.usuario.id, req.params.id, req.body) }, { message: 'Estado del usuario actualizado' });
export const cambiarEmpresa = async (req, res) => success(res, { empresa: await service.cambiarEmpresa(req.params.id, req.body) }, { message: 'Estado de la empresa actualizado' });
export const cambiarOferta = async (req, res) => success(res, { oferta: await service.cambiarOferta(req.params.id, req.body) }, { message: 'Estado de la oferta actualizado' });
export const eliminar = async (req, res) => {
    await service.eliminar(req.usuario.id, req.params.tipo, req.params.id);
    return success(res, null, { message: 'Registro eliminado' });
};
export const resolverReporte = async (req, res) => success(res,
    await service.resolverReporte(req.params.id, req.body), { message: 'Reporte procesado' });
