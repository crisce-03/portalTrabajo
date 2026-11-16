import { Router } from 'express';
import * as empresasController from '../Controllers/EmpresasController.js';
import * as ofertasController from '../Controllers/OfertasController.js';
import { autenticar, permitirRoles } from '../Middlewares/Auth.js';
import { cargarEmpresa } from '../Middlewares/Empresa.js';
import { validar } from '../Middlewares/Validators.js';
import { empresaSchema } from '../Middlewares/EmpresaValidators.js';
import { ofertaSchema, crearOfertaSchema } from '../Middlewares/OfertaValidators.js';
import { ROLES } from '../Constants/roles.js';
import * as postulacionesController from '../Controllers/PostulacionesController.js';

const router = Router();

router.use(autenticar, permitirRoles(ROLES.EMPRESA), cargarEmpresa);

router.get('/perfil', empresasController.obtenerPerfil);
router.put('/perfil', validar(empresaSchema), empresasController.actualizarPerfil);
router.get('/resumen', empresasController.obtenerResumen);
router.get('/postulaciones', postulacionesController.listarEmpresa);
router.get('/postulaciones/:id', postulacionesController.obtenerDetalleEmpresa);
router.patch('/postulaciones/:id/estado', postulacionesController.cambiarEstado);
router.get('/postulaciones/:id/cv', postulacionesController.descargarCv);

router.get('/ofertas', ofertasController.listar);
router.get('/ofertas/:id', ofertasController.obtener);
router.post('/ofertas', validar(crearOfertaSchema), ofertasController.crear);
router.put('/ofertas/:id', validar(ofertaSchema), ofertasController.actualizar);
router.patch('/ofertas/:id/publicar', ofertasController.publicar);
router.patch('/ofertas/:id/cerrar', ofertasController.cerrar);
router.delete('/ofertas/:id', ofertasController.eliminar);

export default router;
