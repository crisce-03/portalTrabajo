import * as ofertasRepository from '../Repositories/OfertasRepository.js';
import AppError from '../Utils/AppError.js';

export const buscar = async filtros => {
    const ofertas = await ofertasRepository.buscarPublicas(filtros);
    return { ofertas, total: ofertas.length };
};

export const detalle = async id => {
    const oferta = await ofertasRepository.buscarPublicaPorId(id);
    if (!oferta) throw AppError.notFound('Oferta no encontrada o ya no está disponible');
    return oferta;
};
