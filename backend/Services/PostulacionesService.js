import { copyFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import * as repository from '../Repositories/PostulacionesRepository.js';
import * as candidatoRepository from '../Repositories/CandidatoRepository.js';
import AppError from '../Utils/AppError.js';
import { validar, esquemaId } from '../Utils/Validar.js';

const esquemaCrear = z.object({
    mensaje: z.string().trim().max(1500).optional().default(''),
    cvMode: z.enum(['perfil', 'nuevo']).optional().default('perfil'),
    ubicacion: z.string().trim().max(150).optional().default(''),
    resumen: z.string().trim().max(2000).optional().default(''),
    habilidades: z.preprocess(v => typeof v === 'string' ? v.split('\n').map(x => x.trim()).filter(Boolean) : v,
        z.array(z.string().trim().min(1).max(100)).max(30).optional().default([])),
    experiencia: z.preprocess(v => typeof v === 'string' ? v.split('\n').map(x => x.trim()).filter(Boolean) : v,
        z.array(z.string().trim().min(1).max(500)).max(30).optional().default([])),
    formacion: z.string().trim().max(2000).optional().default(''),
});
const ESTADOS_POSTULACION = ['pendiente', 'revision', 'contactado', 'aceptado', 'descartado'];
const esquemaEstado = z.object({ estado: z.enum(ESTADOS_POSTULACION) });
const esquemaFiltros = z.object({
    ofertaId: z.coerce.number().int().positive().optional(),
    estado: z.enum(ESTADOS_POSTULACION).optional(),
    buscar: z.string().trim().max(150).optional().default(''),
});

export const crear = async (candidatoId, ofertaId, datos, archivo) => {
    let id;
    try { id = validar(esquemaId, ofertaId); }
    catch (error) {
        if (archivo) await rm(archivo.path, { force: true });
        throw error;
    }
    let oferta;
    try { oferta = await repository.buscarOfertaActiva(id); }
    catch (error) {
        if (archivo) await rm(archivo.path, { force: true });
        throw error;
    }
    if (!oferta) {
        if (archivo) await rm(archivo.path, { force: true });
        throw AppError.notFound('La oferta no existe o ya no acepta postulaciones');
    }
    let anterior;
    try { anterior = await repository.listarPorCandidato(candidatoId); }
    catch (error) {
        if (archivo) await rm(archivo.path, { force: true });
        throw error;
    }
    if (anterior.some(postulacion => postulacion.ofertaId === id)) {
        if (archivo) await rm(archivo.path, { force: true });
        throw AppError.conflict('Ya enviaste una postulación para esta oferta');
    }
    const perfilCv = archivo ? null : await candidatoRepository.obtenerCv(candidatoId);
    let datosValidados;
    try { datosValidados = validar(esquemaCrear, datos); }
    catch (error) {
        if (archivo) await rm(archivo.path, { force: true });
        throw error;
    }
    if (datosValidados.cvMode === 'nuevo' && !archivo) {
        throw AppError.badRequest('Selecciona el archivo de CV que quieres adjuntar');
    }
    if (datosValidados.cvMode === 'perfil' && archivo) {
        await rm(archivo.path, { force: true });
        throw AppError.badRequest('Elige el CV del perfil o sube un archivo nuevo, pero no ambos');
    }
    if (datosValidados.cvMode === 'perfil' && !perfilCv?.cv_ruta) {
        throw AppError.badRequest('Tu perfil aún no tiene un CV. Carga uno para esta postulación');
    }
    try { await candidatoRepository.updatePresentacion(candidatoId, datosValidados); }
    catch (error) {
        if (archivo) await rm(archivo.path, { force: true });
        throw error;
    }
    let cvRuta = archivo?.path ?? null;
    const cvNombre = archivo
        ? Buffer.from(archivo.originalname, 'latin1').toString('utf8').slice(-200)
        : perfilCv?.cv_nombre;
    if (!archivo && perfilCv?.cv_ruta) {
        cvRuta = path.join(path.dirname(perfilCv.cv_ruta), `${candidatoId}-${Date.now()}-postulacion${path.extname(perfilCv.cv_ruta)}`);
        try { await copyFile(perfilCv.cv_ruta, cvRuta); }
        catch { throw AppError.badRequest('No se pudo leer el CV del perfil. Sube otro archivo para postularte'); }
    }
    try {
        return await repository.crear({ ofertaId: id, candidatoId, ...datosValidados, cvNombre, cvRuta });
    } catch (error) {
        if (archivo) await rm(archivo.path, { force: true });
        else if (cvRuta && cvRuta !== perfilCv?.cv_ruta) await rm(cvRuta, { force: true });
        if (error.code === '23505') throw AppError.conflict('Ya enviaste una postulación para esta oferta');
        throw error;
    }
};

export const actualizarCv = async (candidatoId, postulacionId, archivo) => {
    if (!archivo) throw AppError.badRequest('Selecciona un archivo PDF o DOCX');
    let id;
    try { id = validar(esquemaId, postulacionId); }
    catch (error) {
        await rm(archivo.path, { force: true });
        throw error;
    }
    let postulacion;
    try { postulacion = await repository.buscarPorCandidato(id, candidatoId); }
    catch (error) {
        await rm(archivo.path, { force: true });
        throw error;
    }
    if (!postulacion) {
        await rm(archivo.path, { force: true });
        throw AppError.notFound('Postulación no encontrada');
    }
    const nombre = Buffer.from(archivo.originalname, 'latin1').toString('utf8').slice(-200);
    let actualizada;
    try { actualizada = await repository.actualizarCv(id, candidatoId, nombre, archivo.path); }
    catch (error) {
        await rm(archivo.path, { force: true });
        throw error;
    }
    if (!actualizada) {
        await rm(archivo.path, { force: true });
        throw AppError.notFound('Postulación no encontrada');
    }
    if (postulacion.cv_ruta && postulacion.cv_ruta !== archivo.path) {
        try {
            const perfil = await candidatoRepository.obtenerCv(candidatoId);
            if (postulacion.cv_ruta !== perfil?.cv_ruta) await rm(postulacion.cv_ruta, { force: true });
        } catch { /* La postulación ya se actualizó; no se revierte por limpiar un archivo anterior. */ }
    }
    return actualizada;
};

export const listarCandidato = candidatoId => repository.listarPorCandidato(candidatoId);
export const listarEmpresa = (empresaId, query) => repository.listarPorEmpresa(empresaId, validar(esquemaFiltros, query));

export const obtenerDetalleEmpresa = async (empresaId, id) => {
    const postulacion = await repository.obtenerDetalleEmpresa(validar(esquemaId, id), empresaId);
    if (!postulacion) throw AppError.notFound('Postulación no encontrada');
    return postulacion;
};

export const cambiarEstado = async (empresaId, id, datos) => {
    const result = await repository.actualizarEstado(validar(esquemaId, id), empresaId, validar(esquemaEstado, datos).estado);
    if (!result) throw AppError.notFound('Postulación no encontrada');
    return result;
};

export const obtenerCv = async (empresaId, id) => {
    const archivo = await repository.buscarCvEmpresa(validar(esquemaId, id), empresaId);
    if (!archivo) throw AppError.notFound('Postulación no encontrada');
    if (!archivo.cv_ruta) throw AppError.notFound('El candidato no adjuntó un currículum');
    return archivo;
};
