import AppError from '../Utils/AppError.js';

export const validar = esquema => (req, res, next) => {
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