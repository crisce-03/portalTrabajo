import { z } from 'zod';
import * as valoracionRepository from '../Repositories/ValoracionRepository.js';
import { validar, esquemaId } from '../Utils/Validar.js';

const esquemaValoracion = z.object({
    empresaId: esquemaId,
    calificacion: z.coerce.number().int().min(1).max(5),
    comentario: z.string().trim().min(10).max(1000),
});
const esquemaReporte = z.object({
    motivo: z.string().trim().min(1).max(500).default('Reportada desde Valoraciones de empresas'),
});

export const getEmpresas = () => valoracionRepository.findEmpresasConValoraciones();

export const save = (usuarioId, datos) => valoracionRepository.save(usuarioId, validar(esquemaValoracion, datos));

export const report = (usuarioId, valoracionId, datos) =>
    valoracionRepository.report(usuarioId, validar(esquemaId, valoracionId), validar(esquemaReporte, datos).motivo);
