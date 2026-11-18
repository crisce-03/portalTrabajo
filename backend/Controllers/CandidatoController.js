import * as candidatoService from '../Services/CandidatoService.js';
import { success } from '../Utils/Response.js';

export const getPerfil = async (req, res) => {
    return success(res, await candidatoService.getPerfil(req.usuario.id));
}

export const updatePerfil = async (req, res) => {
    const perfil = await candidatoService.updatePerfil(req.usuario.id, req.body, req.file);

    return success(res, perfil, { message: 'Datos guardados' });
}

export const getAlertas = async (req, res) => {
    return success(res, await candidatoService.getAlertas(req.usuario.id));
}

export const createAlerta = async (req, res) => {
    const alerta = await candidatoService.createAlerta(req.usuario.id, req.body);

    return success(res, alerta, { status: 201, message: 'Alerta creada' });
}

export const updateAlerta = async (req, res) => {
    const alerta = await candidatoService.updateAlerta(req.usuario.id, req.params.id, req.body);

    return success(res, alerta, { message: 'Alerta actualizada' });
}

export const getGuardadas = async (req, res) => success(res, { ofertas: await candidatoService.listarOfertasGuardadas(req.usuario.id) });

export const saveGuardada = async (req, res) => success(res,
    await candidatoService.guardarOferta(req.usuario.id, req.params.ofertaId), { message: 'Oferta guardada' });

export const removeGuardada = async (req, res) => success(res,
    await candidatoService.quitarOfertaGuardada(req.usuario.id, req.params.ofertaId), { message: 'Oferta quitada de guardadas' });
