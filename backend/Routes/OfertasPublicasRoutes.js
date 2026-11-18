import { Router } from 'express';
import * as controller from '../Controllers/OfertasPublicasController.js';
import { validarConsulta, validarParametros, idParamSchema } from '../Middlewares/Validators.js';
import { busquedaOfertasSchema } from '../Middlewares/OfertasPublicasValidators.js';

const router = Router();
router.get('/', validarConsulta(busquedaOfertasSchema), controller.buscar);
router.get('/:id', validarParametros(idParamSchema), controller.detalle);

export default router;
