import * as healthRepository from '../Repositories/HealthRepository.js';
import AppError from '../Utils/AppError.js';

export const getStatus = async () => {
    try {
        const result = await healthRepository.pingDatabase();
        
        return {
            status: 'ok',
            uptimeSeconds: Math.round(process.uptime()),
            database: { connected: true, time: result.hora_actual, version: result.version },
        };

    } catch (err) {
        console.error('Health check: fallo de base de datos:', err.message);
        throw new AppError('La base de datos no responde', 503);
    }
}