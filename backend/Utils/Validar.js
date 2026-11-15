import { z } from 'zod';
import AppError from './AppError.js';

z.config(z.locales.es()); // mensajes de error en español

// Valida datos de entrada con un esquema de zod; si fallan, responde 400 con el detalle por campo.
export function validar(esquema, datos) {
    const result = esquema.safeParse(datos ?? {});
    if (!result.success) {
        throw AppError.badRequest('Datos inválidos',
            result.error.issues.map(i => ({ campo: i.path.join('.'), mensaje: i.message })));
    }
    return result.data;
}

export const esquemaId = z.coerce.number().int().positive();
