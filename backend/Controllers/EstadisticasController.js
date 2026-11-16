import * as service from '../Services/EstadisticasService.js';
import { success } from '../Utils/Response.js';

export const obtenerResumenPublico = async (_req, res) => success(res, await service.obtenerResumenPublico());
