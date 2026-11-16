import * as ofertasRepository from '../Repositories/OfertasRepository.js';
import { ESTADOS_OFERTA } from '../Constants/ofertas.js';
import AppError from '../Utils/AppError.js';

const CAMPOS_OBLIGATORIOS = ['ubicacion', 'modalidad', 'contrato', 'correoContacto', 'descripcion'];

const verificarCompleta = oferta => {
    const faltan = CAMPOS_OBLIGATORIOS.filter(campo => !oferta[campo]);
    
    if (!oferta.requisitos || oferta.requisitos.length === 0) faltan.push('requisitos');

    if (faltan.length > 0) {
        throw AppError.badRequest(`Para publicar la oferta faltan estos datos: ${faltan.join(', ')}`, faltan);
    }
};

const listar = async (empresaId, estado) => {
    if (estado && !Object.values(ESTADOS_OFERTA).includes(estado)) {
        throw AppError.badRequest('El estado debe ser borrador, activa o cerrada');
    }

    return ofertasRepository.listarPorEmpresa(empresaId, estado);
};

const obtener = async (id, empresaId) => {
    const oferta = await ofertasRepository.buscarPorId(id, empresaId);
    
    if (!oferta) {
        throw AppError.notFound('Oferta no encontrada');
    }

    return oferta;
};

const crear = async (empresaId, datos) => {
    if (datos.estado === ESTADOS_OFERTA.ACTIVA) verificarCompleta(datos);

    return ofertasRepository.crear(empresaId, datos);
};

const actualizar = async (id, empresaId, datos) => {
    const oferta = await obtener(id, empresaId);

    if (oferta.estado === ESTADOS_OFERTA.CERRADA) {
        throw AppError.conflict('Una oferta cerrada no se puede editar; vuelve a publicarla primero');
    }
    if (oferta.estado === ESTADOS_OFERTA.ACTIVA) verificarCompleta(datos);

    return ofertasRepository.actualizar(id, empresaId, datos);
};

const publicar = async (id, empresaId) => {
    const oferta = await obtener(id, empresaId);

    if (oferta.estado === ESTADOS_OFERTA.ACTIVA) {
        throw AppError.conflict('La oferta ya está publicada');
    }
    verificarCompleta(oferta);

    return ofertasRepository.cambiarEstado(id, empresaId, ESTADOS_OFERTA.ACTIVA);
};

const cerrar = async (id, empresaId) => {
    const oferta = await obtener(id, empresaId);

    if (oferta.estado !== ESTADOS_OFERTA.ACTIVA) {
        throw AppError.conflict('Solo se pueden cerrar las ofertas activas');
    }

    return ofertasRepository.cambiarEstado(id, empresaId, ESTADOS_OFERTA.CERRADA);
};

const eliminar = async (id, empresaId) => {
    const oferta = await obtener(id, empresaId);

    if (oferta.estado !== ESTADOS_OFERTA.BORRADOR) {
        throw AppError.conflict('Solo se pueden eliminar borradores; cierra la oferta en su lugar');
    }

    await ofertasRepository.eliminar(id, empresaId);
};

export { listar, crear, obtener, actualizar, publicar, cerrar, eliminar };