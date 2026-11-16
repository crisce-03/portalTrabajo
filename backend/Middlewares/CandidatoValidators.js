import { z } from 'zod';
import { esquemaId } from './Validators.js';

export const perfilCandidatoSchema = z.object({
    nombre: z.string().trim().min(1).max(100),
    apellidos: z.string().trim().min(1).max(100),
    correo: z.string().trim().email().max(150),
    telefono: z.string().trim().max(30).optional().transform(t => t || null),
});

export const alertaCandidatoSchema = z.object({ termino: z.string().trim().min(1).max(150) });
export const estadoAlertaCandidatoSchema = z.object({ activa: z.boolean() });
export const idAlertaCandidatoParamsSchema = z.object({ id: esquemaId });
export const ofertaGuardadaParamsSchema = z.object({ ofertaId: esquemaId });
