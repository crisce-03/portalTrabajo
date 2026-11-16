import { z } from 'zod';
import * as ofertasRepository from '../Repositories/OfertasRepository.js';
import AppError from '../Utils/AppError.js';
import { validar, esquemaId } from '../Utils/Validar.js';

const esquemaBusqueda = z.object({
    q: z.string().trim().max(120).default(''),
    ubicacion: z.string().trim().max(150).default(''),
    experiencia: z.union([z.string(), z.array(z.string())]).optional(),
    sector: z.union([z.string(), z.array(z.string())]).optional(),
    contrato: z.union([z.string(), z.array(z.string())]).optional(),
    modalidad: z.union([z.string(), z.array(z.string())]).optional(),
    salario: z.coerce.number().min(0).optional(),
    orden: z.enum(['fecha', 'salario']).default('fecha'),
    limite: z.coerce.number().int().min(1).max(100).default(100),
});

const lista = valor => valor === undefined ? [] : Array.isArray(valor) ? valor : [valor];

export const buscar = async query => {
    const filtros = validar(esquemaBusqueda, query);
    for (const campo of ['experiencia', 'sector', 'contrato', 'modalidad']) filtros[campo] = lista(filtros[campo]);
    const ofertas = await ofertasRepository.buscarPublicas(filtros);
    return { ofertas, total: ofertas.length };
};

export const detalle = async id => {
    const oferta = await ofertasRepository.buscarPublicaPorId(validar(esquemaId, id));
    if (!oferta) throw AppError.notFound('Oferta no encontrada o ya no está disponible');
    return oferta;
};
