import * as valoracionRepository from '../Repositories/ValoracionRepository.js';

export const getEmpresas = () => valoracionRepository.findEmpresasConValoraciones();

export const save = (usuarioId, datos) => valoracionRepository.save(usuarioId, datos);

export const report = (usuarioId, valoracionId, datos) =>
    valoracionRepository.report(usuarioId, valoracionId, datos.motivo);
