import AppError from '../Utils/AppError.js';

export default function notFound(req, res, next) {
    next(AppError.notFound(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}