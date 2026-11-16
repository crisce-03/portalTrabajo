import { z } from 'zod';
import AppError from '../Utils/AppError.js';

const textoObligatorio = (mensaje, max) => z.string(mensaje).trim().min(1, mensaje).max(max, 'El texto es demasiado largo');

const textoOpcional = (max) => z.string().trim().max(max, 'El texto es demasiado largo').optional();

const sinVacios = (datos) => Object.fromEntries(Object.entries(datos ?? {}).filter(([, valor]) => valor !== ''));

const validar = esquema => (req, res, next) => {
    const result = esquema.safeParse(req.body);

    if (!result.success) {
        const detalles = result.error.issues.map((error) => ({
            campo: error.path.join('.'),
            mensaje: error.message,
        }));
        throw AppError.badRequest(detalles[0].mensaje, detalles);
    }

    req.body = result.data;
    next();
};

export { validar, textoObligatorio, textoOpcional };