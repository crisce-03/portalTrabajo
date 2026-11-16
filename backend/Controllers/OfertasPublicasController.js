import * as ofertasService from '../Services/OfertasPublicasService.js';
import { success } from '../Utils/Response.js';

export const buscar = async (req, res) => success(res, await ofertasService.buscar(req.query));
export const detalle = async (req, res) => success(res, { oferta: await ofertasService.detalle(req.params.id) });
