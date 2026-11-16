import * as empresasRepository from '../Repositories/EmpresasRepository.js';
import AppError from '../Utils/AppError.js';

const actualizarPerfil = async (empresaId, datos) => {
    const mismoNombre = await empresasRepository.buscarPorNombre(datos.nombre);
    
    if (mismoNombre && mismoNombre.id !== empresaId) {
        throw AppError.conflict('Ya existe una empresa con ese nombre');
    }

    return empresasRepository.actualizar(empresaId, datos);
};

const obtenerResumen = async empresaId => {
    const indicadores = await empresasRepository.obtenerIndicadores(empresaId);
    const candidatosRecientes = await empresasRepository.obtenerCandidatosRecientes(empresaId);

    return { indicadores, candidatosRecientes };
};

export { actualizarPerfil, obtenerResumen };