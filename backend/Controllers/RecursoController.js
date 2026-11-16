import * as recursoService from '../Services/RecursoService.js';
import { success } from '../Utils/Response.js';

export const getRecursos = async (req, res) => {
    return success(res, await recursoService.getRecursos(req.query));
}
