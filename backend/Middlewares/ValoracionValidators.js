import { z } from 'zod';
import { esquemaId } from './Validators.js';

export const valoracionSchema = z.object({
    empresaId: esquemaId,
    calificacion: z.coerce.number().int().min(1).max(5),
    comentario: z.string().trim().min(10).max(1000),
});

export const reporteValoracionSchema = z.object({
    motivo: z.string().trim().min(1).max(500).default('Reportada desde Valoraciones de empresas'),
});
