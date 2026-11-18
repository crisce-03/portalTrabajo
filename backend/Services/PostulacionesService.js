import { copyFile, rm } from 'node:fs/promises';
import path from 'node:path';
import * as repository from '../Repositories/PostulacionesRepository.js';
import * as candidatoRepository from '../Repositories/CandidatoRepository.js';
import AppError from '../Utils/AppError.js';
import { MODOS_CV_POSTULACION } from '../Constants/postulaciones.js';

export const crear = async (candidatoId, ofertaId, datos, archivo) => {
    let oferta;
    try { oferta = await repository.buscarOfertaActiva(ofertaId); }
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
    if (anterior.some(postulacion => postulacion.ofertaId === ofertaId)) {
        if (archivo) await rm(archivo.path, { force: true });
        throw AppError.conflict('Ya enviaste una postulación para esta oferta');
    }
    const perfilCv = archivo ? null : await candidatoRepository.obtenerCv(candidatoId);
    if (datos.cvMode === MODOS_CV_POSTULACION.NUEVO && !archivo) {
        throw AppError.badRequest('Selecciona el archivo de CV que quieres adjuntar');
    }
    if (datos.cvMode === MODOS_CV_POSTULACION.PERFIL && archivo) {
        await rm(archivo.path, { force: true });
        throw AppError.badRequest('Elige el CV del perfil o sube un archivo nuevo, pero no ambos');
    }
    if (datos.cvMode === MODOS_CV_POSTULACION.PERFIL && !perfilCv?.cv_ruta) {
        throw AppError.badRequest('Tu perfil aún no tiene un CV. Carga uno para esta postulación');
    }
    try { await candidatoRepository.updatePresentacion(candidatoId, datos); }
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
        return await repository.crear({ ofertaId, candidatoId, ...datos, cvNombre, cvRuta });
    } catch (error) {
        if (archivo) await rm(archivo.path, { force: true });
        else if (cvRuta && cvRuta !== perfilCv?.cv_ruta) await rm(cvRuta, { force: true });
        if (error.code === '23505') throw AppError.conflict('Ya enviaste una postulación para esta oferta');
        throw error;
    }
};

export const actualizarCv = async (candidatoId, postulacionId, archivo) => {
    if (!archivo) throw AppError.badRequest('Selecciona un archivo PDF o DOCX');
    let postulacion;
    try { postulacion = await repository.buscarPorCandidato(postulacionId, candidatoId); }
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
    try { actualizada = await repository.actualizarCv(postulacionId, candidatoId, nombre, archivo.path); }
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
export const listarEmpresa = (empresaId, filtros) => repository.listarPorEmpresa(empresaId, filtros);

export const obtenerDetalleEmpresa = async (empresaId, id) => {
    const postulacion = await repository.obtenerDetalleEmpresa(id, empresaId);
    if (!postulacion) throw AppError.notFound('Postulación no encontrada');
    return postulacion;
};

export const cambiarEstado = async (empresaId, id, datos) => {
    const result = await repository.actualizarEstado(id, empresaId, datos.estado);
    if (!result) throw AppError.notFound('Postulación no encontrada');
    return result;
};

export const obtenerCv = async (empresaId, id) => {
    const archivo = await repository.buscarCvEmpresa(id, empresaId);
    if (!archivo) throw AppError.notFound('Postulación no encontrada');
    if (!archivo.cv_ruta) throw AppError.notFound('El candidato no adjuntó un currículum');
    return archivo;
};
