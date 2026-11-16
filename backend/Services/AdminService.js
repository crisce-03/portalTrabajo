import { z } from 'zod';
import * as repository from '../Repositories/AdminRepository.js';
import AppError from '../Utils/AppError.js';
import { validar, esquemaId } from '../Utils/Validar.js';

const esquemaActivo = z.object({ activo: z.boolean() });
const esquemaEmpresa = z.object({ activo: z.boolean().optional(), verificada: z.boolean().optional() })
    .refine(datos => datos.activo !== undefined || datos.verificada !== undefined, 'Debes indicar el estado que quieres cambiar');
const esquemaOferta = z.object({ estado: z.enum(['borrador', 'activa', 'cerrada']) });
const esquemaDecision = z.object({ decision: z.enum(['aprobar', 'eliminar']) });

export const resumen = async () => {
    const [indicadores, registros, reportes, postulacionesMensuales] = await Promise.all([
        repository.obtenerIndicadores(), repository.listarRegistros(), repository.listarReportesPendientes(),
        repository.obtenerPostulacionesMensuales(),
    ]);
    return { indicadores, registros, reportes, postulacionesMensuales };
};

export const cambiarUsuario = async (adminId, id, datos) => {
    const usuarioId = validar(esquemaId, id);
    const { activo } = validar(esquemaActivo, datos);
    if (usuarioId === adminId && !activo) throw AppError.conflict('No puedes deshabilitar tu propia cuenta de administrador');
    const usuario = await repository.cambiarUsuarioActivo(usuarioId, activo);
    if (!usuario) throw AppError.notFound('Usuario no encontrado');
    return usuario;
};

export const cambiarEmpresa = async (id, datos) => {
    const empresa = await repository.cambiarEmpresa(validar(esquemaId, id), validar(esquemaEmpresa, datos));
    if (!empresa) throw AppError.notFound('Empresa no encontrada');
    return empresa;
};

export const cambiarOferta = async (id, datos) => {
    const ofertaId = validar(esquemaId, id);
    const { estado } = validar(esquemaOferta, datos);
    const existente = await repository.buscarOfertaAdmin(ofertaId);
    if (!existente) throw AppError.notFound('Oferta no encontrada');
    if (estado === 'activa' && !existente.completa) {
        throw AppError.badRequest('No se puede publicar: la vacante aún tiene datos obligatorios incompletos');
    }
    const oferta = await repository.cambiarEstadoOferta(ofertaId, estado);
    if (!oferta) throw AppError.notFound('Oferta no encontrada');
    return oferta;
};

export const eliminar = async (adminId, tipo, id) => {
    if (!['usuario', 'empresa', 'vacante'].includes(tipo)) throw AppError.badRequest('Tipo de registro no válido');
    const registroId = validar(esquemaId, id);
    if (tipo === 'usuario' && registroId === adminId) throw AppError.conflict('No puedes eliminar tu propia cuenta de administrador');
    const eliminado = await repository.eliminarRegistro(tipo, registroId);
    if (!eliminado) throw AppError.notFound('Registro no encontrado');
};

export const resolverReporte = async (id, datos) => {
    const reporteId = validar(esquemaId, id);
    const { decision } = validar(esquemaDecision, datos);
    const reporte = await repository.buscarReporte(reporteId);
    if (!reporte || reporte.estado !== 'pendiente') throw AppError.notFound('Reporte pendiente no encontrado');
    if (decision === 'aprobar') {
        const actualizado = await repository.aprobarReporte(reporteId);
        if (!actualizado) throw AppError.conflict('El reporte ya fue revisado');
        return { id: reporteId, decision };
    }
    await repository.eliminarContenidoReportado(reporte);
    return { id: reporteId, decision };
};
