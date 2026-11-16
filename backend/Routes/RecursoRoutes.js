import { Router } from 'express';
import * as recursoController from '../Controllers/RecursoController.js';

const router = Router();

router.get('/', recursoController.getRecursos);

export default router;
