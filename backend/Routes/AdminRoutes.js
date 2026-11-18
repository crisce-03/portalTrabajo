import { Router } from 'express';
import * as controller from '../Controllers/AdminController.js';
import { autenticar, permitirRoles } from '../Middlewares/Auth.js';
import { ROLES } from '../Constants/roles.js';
import { validar, validarParametros } from '../Middlewares/Validators.js';
import {
    estadoUsuarioAdminSchema,
    estadoEmpresaAdminSchema,
    estadoOfertaAdminSchema,
    decisionReporteAdminSchema,
    idAdminParamsSchema,
    registroAdminParamsSchema,
} from '../Middlewares/AdminValidators.js';

const router = Router();
router.use(autenticar, permitirRoles(ROLES.ADMIN));
router.get('/', controller.resumen);
router.patch('/usuarios/:id', validarParametros(idAdminParamsSchema), validar(estadoUsuarioAdminSchema), controller.cambiarUsuario);
router.patch('/empresas/:id', validarParametros(idAdminParamsSchema), validar(estadoEmpresaAdminSchema), controller.cambiarEmpresa);
router.patch('/ofertas/:id', validarParametros(idAdminParamsSchema), validar(estadoOfertaAdminSchema), controller.cambiarOferta);
router.delete('/:tipo/:id', validarParametros(registroAdminParamsSchema), controller.eliminar);
router.patch('/reportes/:id', validarParametros(idAdminParamsSchema), validar(decisionReporteAdminSchema), controller.resolverReporte);

export default router;
