import { Router } from 'express';
import * as empresasController from '../Controllers/EmpresasController.js';
import * as ofertasController from '../Controllers/OfertasController.js';
import { autenticar, permitirRoles } from '../Middlewares/Auth.js';
import { cargarEmpresa } from '../Middlewares/Empresa.js';
import { validar, validarConsulta, validarParametros } from '../Middlewares/Validators.js';
import { empresaSchema } from '../Middlewares/EmpresaValidators.js';
import { ofertaSchema, crearOfertaSchema, estadoOfertaQuerySchema, ofertaIdParamsSchema } from '../Middlewares/OfertaValidators.js';
import { ROLES } from '../Constants/roles.js';
import * as postulacionesController from '../Controllers/PostulacionesController.js';
import { filtrosPostulacionSchema, estadoPostulacionSchema, idPostulacionParamsSchema } from '../Middlewares/PostulacionesValidators.js';

const router = Router();

router.use(autenticar, permitirRoles(ROLES.EMPRESA), cargarEmpresa);

router.get('/perfil', empresasController.obtenerPerfil);
router.put('/perfil', validar(empresaSchema), empresasController.actualizarPerfil);
router.get('/resumen', empresasController.obtenerResumen);
router.get('/postulaciones', validarConsulta(filtrosPostulacionSchema), postulacionesController.listarEmpresa);
router.get('/postulaciones/:id', validarParametros(idPostulacionParamsSchema), postulacionesController.obtenerDetalleEmpresa);
router.patch('/postulaciones/:id/estado', validarParametros(idPostulacionParamsSchema), validar(estadoPostulacionSchema), postulacionesController.cambiarEstado);
router.get('/postulaciones/:id/cv', validarParametros(idPostulacionParamsSchema), postulacionesController.descargarCv);

router.get('/ofertas', validarConsulta(estadoOfertaQuerySchema), ofertasController.listar);
router.get('/ofertas/:id', validarParametros(ofertaIdParamsSchema), ofertasController.obtener);
router.post('/ofertas', validar(crearOfertaSchema), ofertasController.crear);
router.put('/ofertas/:id', validarParametros(ofertaIdParamsSchema), validar(ofertaSchema), ofertasController.actualizar);
router.patch('/ofertas/:id/publicar', validarParametros(ofertaIdParamsSchema), ofertasController.publicar);
router.patch('/ofertas/:id/cerrar', validarParametros(ofertaIdParamsSchema), ofertasController.cerrar);
router.delete('/ofertas/:id', validarParametros(ofertaIdParamsSchema), ofertasController.eliminar);

export default router;
