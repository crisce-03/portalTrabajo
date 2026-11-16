import * as ofertasService from '../Services/OfertasService.js';
import { success } from '../Utils/Response.js';
import { ESTADOS_OFERTA } from '../Constants/ofertas.js';

const listar = async (req, res) => {
    const ofertas = await ofertasService.listar(req.empresa.id, req.consultaValidada.estado);

    return success(res, { ofertas });
};

const obtener = async (req, res) => {
    const oferta = await ofertasService.obtener(req.params.id, req.empresa.id);

    return success(res, { oferta });
};

const crear = async (req, res) => {
    const oferta = await ofertasService.crear(req.empresa.id, req.body);
    const mensaje = oferta.estado === ESTADOS_OFERTA.ACTIVA ? 'Oferta publicada' : 'Borrador guardado';

    return success(res, { oferta }, { status: 201, message: mensaje });
};

const actualizar = async (req, res) => {
    const oferta = await ofertasService.actualizar(req.params.id, req.empresa.id, req.body);

    return success(res, { oferta }, { message: 'Oferta actualizada' });
};

const publicar = async (req, res) => {
    const oferta = await ofertasService.publicar(req.params.id, req.empresa.id);

    return success(res, { oferta }, { message: 'Oferta publicada' });
};

const cerrar = async (req, res) => {
    const oferta = await ofertasService.cerrar(req.params.id, req.empresa.id);

    return success(res, { oferta }, { message: 'Oferta cerrada' });
};

const eliminar = async (req, res) => {
    await ofertasService.eliminar(req.params.id, req.empresa.id);

    return success(res, null, { message: 'Borrador eliminado' });
};

export { listar, obtener, crear, actualizar, publicar, cerrar, eliminar };
