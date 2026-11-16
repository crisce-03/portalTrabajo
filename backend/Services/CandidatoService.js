import { rm } from 'node:fs/promises';
import { z } from 'zod';
import * as candidatoRepository from '../Repositories/CandidatoRepository.js';
import AppError from '../Utils/AppError.js';
import { validar, esquemaId } from '../Utils/Validar.js';
import * as ofertasRepository from '../Repositories/OfertasRepository.js';

const esquemaPerfil = z.object({
    nombre: z.string().trim().min(1).max(100),
    apellidos: z.string().trim().min(1).max(100),
    correo: z.string().trim().email().max(150),
    telefono: z.string().trim().max(30).optional().transform(t => t || null),
});
const esquemaAlerta = z.object({ termino: z.string().trim().min(1).max(150) });
const esquemaEstado = z.object({ activa: z.boolean() });

export const getPerfil = (usuarioId) => candidatoRepository.findPerfil(usuarioId);

export const updatePerfil = async (usuarioId, datos, archivo) => {
    try {
        await candidatoRepository.updateDatos(usuarioId, validar(esquemaPerfil, datos));
        if (archivo) {
            // multer entrega el nombre en latin1; así se conservan tildes y eñes
            const nombre = Buffer.from(archivo.originalname, 'latin1').toString('utf8').slice(-200);
            const anterior = await candidatoRepository.saveCv(usuarioId, nombre, archivo.path);
            if (anterior) {
                try {
                    if (!await candidatoRepository.cvUsadoEnPostulaciones(anterior)) await rm(anterior, { force: true });
                } catch { /* Se conserva el archivo anterior si no se puede confirmar que esté libre. */ }
            }
        }
    } catch (err) {
        if (archivo) await rm(archivo.path, { force: true }); // no dejar archivos sin dueño
        throw err;
    }

    return getPerfil(usuarioId);
}

export const getAlertas = (usuarioId) => candidatoRepository.findAlertas(usuarioId);

export const createAlerta = (usuarioId, datos) =>
    candidatoRepository.createAlerta(usuarioId, validar(esquemaAlerta, datos).termino);

export const updateAlerta = async (usuarioId, id, datos) => {
    const alerta = await candidatoRepository.updateAlerta(usuarioId, validar(esquemaId, id), validar(esquemaEstado, datos).activa);
    if (!alerta) throw AppError.notFound('Alerta no encontrada');

    return alerta;
}

export const listarOfertasGuardadas = usuarioId => candidatoRepository.listarOfertasGuardadas(usuarioId);

export const guardarOferta = async (usuarioId, ofertaId) => {
    const id = validar(esquemaId, ofertaId);
    if (!await ofertasRepository.buscarPublicaPorId(id)) throw AppError.notFound('Oferta no encontrada o ya no está disponible');
    await candidatoRepository.guardarOferta(usuarioId, id);
    return { ofertaId: id, guardada: true };
};

export const quitarOfertaGuardada = async (usuarioId, ofertaId) => {
    const id = validar(esquemaId, ofertaId);
    await candidatoRepository.quitarOfertaGuardada(usuarioId, id);
    return { ofertaId: id, guardada: false };
};
