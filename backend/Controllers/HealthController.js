import * as healthService from '../Services/HealthService.js';
import { success } from '../Utils/Response.js';

export const check = async (req, res) => {
    const status = await healthService.getStatus();
    
    return success(res, status, { message: 'Servicio operativo' });
}