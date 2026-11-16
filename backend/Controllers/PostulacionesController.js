import path from 'node:path';
import * as service from '../Services/PostulacionesService.js';
import { success } from '../Utils/Response.js';

export const crear = async (req, res) => {
    const postulacion = await service.crear(req.usuario.id, req.body.ofertaId, req.body, req.file);
    return success(res, { postulacion }, { status: 201, message: 'Postulación enviada' });
};

export const listarCandidato = async (req, res) => success(res, { postulaciones: await service.listarCandidato(req.usuario.id) });
export const actualizarCvCandidato = async (req, res) => success(res,
    { postulacion: await service.actualizarCv(req.usuario.id, req.params.id, req.file) },
    { message: 'CV de la postulación actualizado' });
export const listarEmpresa = async (req, res) => success(res, { postulaciones: await service.listarEmpresa(req.empresa.id, req.query) });
export const obtenerDetalleEmpresa = async (req, res) => success(res,
    { postulacion: await service.obtenerDetalleEmpresa(req.empresa.id, req.params.id) });
export const cambiarEstado = async (req, res) => success(res, { postulacion: await service.cambiarEstado(req.empresa.id, req.params.id, req.body) }, { message: 'Estado actualizado' });

export const descargarCv = async (req, res) => {
    const archivo = await service.obtenerCv(req.empresa.id, req.params.id);
    return res.download(archivo.cv_ruta, path.basename(archivo.cv_nombre || 'curriculum'));
};
