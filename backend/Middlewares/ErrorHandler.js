import AppError from '../Utils/AppError.js';

function fromPostgres(err) {
    switch (err.code) {
        case '23505': return new AppError('Ya existe un registro con esos datos', 409);   // UNIQUE
        case '23503': return new AppError('Referencia a un registro que no existe', 409); // FOREIGN KEY
        case '23502': return new AppError('Falta un dato obligatorio', 400);              // NOT NULL
        case '22P02': return new AppError('Formato de dato inválido', 400);               // tipo/ID inválido
        default: return null;
    }
}

export default function errorHandler(err, req, res, next) {
    let error = err;

    if (err.type === 'entity.parse.failed') {
        error = AppError.badRequest('El cuerpo de la petición no es un JSON válido');
    } else if (!(err instanceof AppError)) {
        error = fromPostgres(err) || err;
    }

    const isKnown = error instanceof AppError;
    const statusCode = isKnown ? error.statusCode : 500;

    if (!isKnown || statusCode >= 500) {
        console.error(err);
    }

    const body = {
        success: false,
        message: isKnown ? error.message : 'Error interno del servidor',
    };
    if (isKnown && error.details) body.details = error.details;

    res.status(statusCode).json(body);
}