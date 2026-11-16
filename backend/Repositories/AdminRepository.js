import { pool } from '../Data/db.js';
import { aCamelCase } from '../Utils/CamelCase.js';

export const obtenerIndicadores = async () => {
    const result = await pool.query(`
        SELECT
            (SELECT COUNT(*)::int FROM usuarios) AS usuarios,
            (SELECT COUNT(*)::int FROM usuarios WHERE rol = 'candidato') AS candidatos,
            (SELECT COUNT(*)::int FROM empresas) AS empresas,
            (SELECT COUNT(*)::int FROM empresas WHERE verificada) AS empresas_verificadas,
            (SELECT COUNT(*)::int FROM usuarios WHERE NOT activo) AS cuentas_deshabilitadas,
            (SELECT COUNT(*)::int FROM ofertas WHERE estado = 'activa') AS ofertas_activas,
            (SELECT COUNT(*)::int FROM reportes WHERE estado = 'pendiente') AS reportes_pendientes`);
    return aCamelCase(result.rows[0]);
};

export const obtenerPostulacionesMensuales = async () => {
    const result = await pool.query(`
        SELECT EXTRACT(MONTH FROM creado_en)::int AS mes, COUNT(*)::int AS total
        FROM postulaciones
        WHERE creado_en >= date_trunc('month', NOW()) - INTERVAL '5 months'
        GROUP BY EXTRACT(MONTH FROM creado_en)
        ORDER BY mes`);
    return result.rows;
};

export const listarRegistros = async () => {
    const result = await pool.query(`
        SELECT u.id, 'usuario' AS tipo, CONCAT_WS(' ', u.nombre, u.apellidos) AS nombre,
               u.correo AS detalle, CASE WHEN u.activo THEN 'Habilitado' ELSE 'Deshabilitado' END AS estado,
               u.activo, NULL::boolean AS verificada
        FROM usuarios u
        UNION ALL
        SELECT e.id, 'empresa' AS tipo, e.nombre,
               CONCAT_WS(' · ', e.sector, e.correo_contacto) AS detalle,
               CASE WHEN NOT u.activo THEN 'Suspendida' WHEN e.verificada THEN 'Verificada' ELSE 'Pendiente' END AS estado,
               u.activo, e.verificada
        FROM empresas e JOIN usuarios u ON u.id = e.usuario_id
        UNION ALL
        SELECT o.id, 'vacante' AS tipo, o.titulo,
               CONCAT_WS(' · ', e.nombre, o.ubicacion) AS detalle,
               CASE o.estado WHEN 'activa' THEN 'Activa' WHEN 'cerrada' THEN 'Cerrada' ELSE 'Borrador' END AS estado,
               NULL::boolean AS activo, NULL::boolean AS verificada
        FROM ofertas o JOIN empresas e ON e.id = o.empresa_id
        ORDER BY tipo, nombre`);
    return aCamelCase(result.rows);
};

export const listarReportesPendientes = async () => {
    const result = await pool.query(`
        SELECT r.id, r.motivo, r.creado_en, CONCAT_WS(' ', autor.nombre, autor.apellidos) AS reportado_por,
               'valoracion' AS tipo, r.valoracion_id AS contenido_id, e.nombre AS contexto,
               v.comentario AS contenido, CONCAT_WS(' ', uv.nombre, uv.apellidos) AS autor_contenido
        FROM reportes r
        JOIN usuarios autor ON autor.id = r.reportado_por
        JOIN valoraciones v ON v.id = r.valoracion_id
        JOIN empresas e ON e.id = v.empresa_id
        JOIN usuarios uv ON uv.id = v.usuario_id
        WHERE r.estado = 'pendiente'
        ORDER BY r.creado_en ASC`);
    return aCamelCase(result.rows);
};

export const cambiarUsuarioActivo = async (id, activo) => {
    const result = await pool.query('UPDATE usuarios SET activo = $2 WHERE id = $1 RETURNING id, activo', [id, activo]);
    return aCamelCase(result.rows[0]);
};

export const cambiarEmpresa = async (id, datos) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        let empresa;
        if (datos.verificada !== undefined) {
            const result = await client.query('UPDATE empresas SET verificada = $2 WHERE id = $1 RETURNING id, verificada', [id, datos.verificada]);
            empresa = result.rows[0];
        } else {
            const result = await client.query('SELECT id, verificada FROM empresas WHERE id = $1', [id]);
            empresa = result.rows[0];
        }
        if (!empresa) {
            await client.query('ROLLBACK');
            return undefined;
        }
        let activo;
        if (datos.activo !== undefined) {
            const result = await client.query(`UPDATE usuarios u SET activo = $2 FROM empresas e
                WHERE e.id = $1 AND e.usuario_id = u.id RETURNING u.activo`, [id, datos.activo]);
            activo = result.rows[0]?.activo;
        }
        await client.query('COMMIT');
        return { id, verificada: empresa.verificada, activo };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally { client.release(); }
};

export const cambiarEstadoOferta = async (id, estado) => {
    const result = await pool.query('UPDATE ofertas SET estado = $2, publicada_en = CASE WHEN $2 = \'activa\' THEN COALESCE(publicada_en, NOW()) ELSE publicada_en END WHERE id = $1 RETURNING id, estado', [id, estado]);
    return aCamelCase(result.rows[0]);
};

export const buscarOfertaAdmin = async id => {
    const result = await pool.query(`SELECT id,
        (ubicacion IS NOT NULL AND modalidad IS NOT NULL AND contrato IS NOT NULL
         AND correo_contacto IS NOT NULL AND descripcion IS NOT NULL AND cardinality(requisitos) > 0) AS completa
        FROM ofertas WHERE id = $1`, [id]);
    return result.rows[0];
};

export const eliminarRegistro = async (tipo, id) => {
    const tabla = { usuario: 'usuarios', empresa: 'empresas', vacante: 'ofertas' }[tipo];
    const result = await pool.query(`DELETE FROM ${tabla} WHERE id = $1 RETURNING id`, [id]);
    return result.rowCount > 0;
};

export const buscarReporte = async id => {
    const result = await pool.query(`SELECT id, valoracion_id, estado
        FROM reportes WHERE id = $1`, [id]);
    return result.rows[0];
};

export const aprobarReporte = async id => {
    const result = await pool.query(`UPDATE reportes SET estado = 'aprobado'
        WHERE id = $1 AND estado = 'pendiente' RETURNING id, estado`, [id]);
    return result.rows[0];
};

export const eliminarContenidoReportado = async reporte => {
    await pool.query('DELETE FROM valoraciones WHERE id = $1', [reporte.valoracion_id]);
};
