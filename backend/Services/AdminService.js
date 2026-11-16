import * as repository from '../Repositories/AdminRepository.js';
import AppError from '../Utils/AppError.js';
import { ESTADOS_OFERTA } from '../Constants/ofertas.js';
import { ESTADOS_REPORTE, TIPOS_REGISTRO_ADMIN, DECISIONES_REPORTE } from '../Constants/administracion.js';

export const resumen = async () => {
    const [indicadores, registros, reportes, postulacionesMensuales] = await Promise.all([
        repository.obtenerIndicadores(), repository.listarRegistros(), repository.listarReportesPendientes(),
        repository.obtenerPostulacionesMensuales(),
    ]);
    return { indicadores, registros, reportes, postulacionesMensuales };
};

export const cambiarUsuario = async (adminId, id, datos) => {
    const { activo } = datos;
    if (id === adminId && !activo) throw AppError.conflict('No puedes deshabilitar tu propia cuenta de administrador');
    const usuario = await repository.cambiarUsuarioActivo(id, activo);
    if (!usuario) throw AppError.notFound('Usuario no encontrado');
    return usuario;
};

export const cambiarEmpresa = async (id, datos) => {
    const empresa = await repository.cambiarEmpresa(id, datos);
    if (!empresa) throw AppError.notFound('Empresa no encontrada');
    return empresa;
};

export const cambiarOferta = async (id, datos) => {
    const { estado } = datos;
    const existente = await repository.buscarOfertaAdmin(id);
    if (!existente) throw AppError.notFound('Oferta no encontrada');
    if (estado === ESTADOS_OFERTA.ACTIVA && !existente.completa) {
        throw AppError.badRequest('No se puede publicar: la vacante aún tiene datos obligatorios incompletos');
    }
    const oferta = await repository.cambiarEstadoOferta(id, estado);
    if (!oferta) throw AppError.notFound('Oferta no encontrada');
    return oferta;
};

export const eliminar = async (adminId, tipo, id) => {
    if (tipo === TIPOS_REGISTRO_ADMIN.USUARIO && id === adminId) throw AppError.conflict('No puedes eliminar tu propia cuenta de administrador');
    const eliminado = await repository.eliminarRegistro(tipo, id);
    if (!eliminado) throw AppError.notFound('Registro no encontrado');
};

export const resolverReporte = async (id, datos) => {
    const { decision } = datos;
    const reporte = await repository.buscarReporte(id);
    if (!reporte || reporte.estado !== ESTADOS_REPORTE.PENDIENTE) throw AppError.notFound('Reporte pendiente no encontrado');
    if (decision === DECISIONES_REPORTE.APROBAR) {
        const actualizado = await repository.aprobarReporte(id);
        if (!actualizado) throw AppError.conflict('El reporte ya fue revisado');
        return { id, decision };
    }
    await repository.eliminarContenidoReportado(reporte);
    return { id, decision };
};
