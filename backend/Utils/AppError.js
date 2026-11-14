
export default class AppError extends Error {
    constructor(message, statusCode = 500, details = null) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message = 'Solicitud inválida', details) {
        return new AppError(message, 400, details);
    }
    static unauthorized(message = 'No autenticado') {
        return new AppError(message, 401);
    }
    static forbidden(message = 'No tienes permisos para esta acción') {
        return new AppError(message, 403);
    }
    static notFound(message = 'Recurso no encontrado') {
        return new AppError(message, 404);
    }
    static conflict(message = 'El recurso ya existe') {
        return new AppError(message, 409);
    }
}