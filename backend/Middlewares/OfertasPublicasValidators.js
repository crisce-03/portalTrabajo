import { z } from 'zod';
import { ORDENES_BUSQUEDA_OFERTAS } from '../Constants/ofertas.js';

const filtroLista = z.preprocess(
    valor => valor === undefined ? [] : Array.isArray(valor) ? valor : [valor],
    z.array(z.string())
);

export const busquedaOfertasSchema = z.object({
    q: z.string().trim().max(120).default(''),
    ubicacion: z.string().trim().max(150).default(''),
    experiencia: filtroLista,
    sector: filtroLista,
    contrato: filtroLista,
    modalidad: filtroLista,
    salario: z.coerce.number().min(0).optional(),
    orden: z.enum(ORDENES_BUSQUEDA_OFERTAS).default('fecha'),
    limite: z.coerce.number().int().min(1).max(100).default(100),
});

