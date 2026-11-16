import { z } from 'zod';
import { rm } from 'node:fs/promises';
import AppError from '../Utils/AppError.js';

z.config(z.locales.es());

const textoObligatorio = (mensaje, max) => z.string(mensaje).trim().min(1, mensaje).max(max, 'El texto es demasiado largo');

const textoOpcional = (max) => z.string().trim().max(max, 'El texto es demasiado largo').optional();

const esquemaId = z.coerce.number().int().positive();
const idParamSchema = z.object({ id: esquemaId });

const validarFuente = async (esquema, datos, req) => {
    const result = esquema.safeParse(datos ?? {});

    if (!result.success) {
        if (req.file?.path) await rm(req.file.path, { force: true }).catch(() => {});
        const detalles = result.error.issues.map((error) => ({
            campo: error.path.join('.'),
            mensaje: error.message,
        }));
        throw AppError.badRequest(detalles[0].mensaje, detalles);
    }

    return result.data;
};

const validar = esquema => async (req, res, next) => {
    req.body = await validarFuente(esquema, req.body, req);
    next();
};

const validarParametros = esquema => async (req, res, next) => {
    req.params = await validarFuente(esquema, req.params, req);
    next();
};

const validarConsulta = esquema => async (req, res, next) => {
    req.consultaValidada = await validarFuente(esquema, req.query, req);
    next();
};

export { validar, validarParametros, validarConsulta, esquemaId, idParamSchema, textoObligatorio, textoOpcional };
