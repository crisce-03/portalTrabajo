import { z } from 'zod';
import { ESTADOS_POSTULACION, MODOS_CV_POSTULACION, VALORES_MODOS_CV_POSTULACION } from '../Constants/postulaciones.js';
import { esquemaId } from './Validators.js';

export const postulacionSchema = z.object({
    mensaje: z.string().trim().max(1500).optional().default(''),
    cvMode: z.enum(VALORES_MODOS_CV_POSTULACION).optional().default(MODOS_CV_POSTULACION.PERFIL),
    ubicacion: z.string().trim().max(150).optional().default(''),
    resumen: z.string().trim().max(2000).optional().default(''),
    habilidades: z.preprocess(v => typeof v === 'string' ? v.split('\n').map(x => x.trim()).filter(Boolean) : v,
        z.array(z.string().trim().min(1).max(100)).max(30).optional().default([])),
    experiencia: z.preprocess(v => typeof v === 'string' ? v.split('\n').map(x => x.trim()).filter(Boolean) : v,
        z.array(z.string().trim().min(1).max(500)).max(30).optional().default([])),
    formacion: z.string().trim().max(2000).optional().default(''),
});

export const estadoPostulacionSchema = z.object({ estado: z.enum(ESTADOS_POSTULACION) });
export const crearPostulacionRequestSchema = postulacionSchema.extend({ ofertaId: esquemaId });
export const idPostulacionParamsSchema = z.object({ id: esquemaId });
export const filtrosPostulacionSchema = z.object({
    ofertaId: z.coerce.number().int().positive().optional(),
    estado: z.enum(ESTADOS_POSTULACION).optional(),
    buscar: z.string().trim().max(150).optional().default(''),
});
