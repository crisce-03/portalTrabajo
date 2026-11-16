import { Router } from 'express';
import * as controller from '../Controllers/AdminController.js';
import { autenticar, permitirRoles } from '../Middlewares/Auth.js';
import { ROLES } from '../Constants/roles.js';

const router = Router();
router.use(autenticar, permitirRoles(ROLES.ADMIN));
router.get('/', controller.resumen);
router.patch('/usuarios/:id', controller.cambiarUsuario);
router.patch('/empresas/:id', controller.cambiarEmpresa);
router.patch('/ofertas/:id', controller.cambiarOferta);
router.delete('/:tipo/:id', controller.eliminar);
router.patch('/reportes/:id', controller.resolverReporte);

export default router;
