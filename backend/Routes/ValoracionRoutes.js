import { Router } from 'express';
import * as valoracionController from '../Controllers/ValoracionController.js';
import { autenticar, permitirRoles } from '../Middlewares/Auth.js';
import { ROLES } from '../Constants/roles.js';
import { validar, validarParametros, idParamSchema } from '../Middlewares/Validators.js';
import { valoracionSchema, reporteValoracionSchema } from '../Middlewares/ValoracionValidators.js';

const router = Router();

router.get('/', valoracionController.getEmpresas);
router.post('/', autenticar, permitirRoles(ROLES.CANDIDATO), validar(valoracionSchema), valoracionController.save);
router.post('/:id/reportes', autenticar, validarParametros(idParamSchema), validar(reporteValoracionSchema), valoracionController.report);

export default router;
