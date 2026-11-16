import { Router } from 'express';
import * as controller from '../Controllers/EstadisticasController.js';

const router = Router();
router.get('/', controller.obtenerResumenPublico);

export default router;
