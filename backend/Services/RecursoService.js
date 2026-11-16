import { z } from 'zod';
import * as recursoRepository from '../Repositories/RecursoRepository.js';
import { validar } from '../Utils/Validar.js';

const esquemaFiltro = z.object({
    categoria: z.enum(['Entrevistas', 'Currículum', 'Habilidades', 'Actualidad']).optional(),
});

export const getRecursos = (filtro) => recursoRepository.findPublicados(validar(esquemaFiltro, filtro).categoria);
