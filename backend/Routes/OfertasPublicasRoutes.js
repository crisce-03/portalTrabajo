import { Router } from 'express';
import * as controller from '../Controllers/OfertasPublicasController.js';

const router = Router();
router.get('/', controller.buscar);
router.get('/:id', controller.detalle);

export default router;
