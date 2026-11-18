import { pool } from '../Data/db.js';

// Empresas con su promedio, total de opiniones y reseñas (las más recientes primero).
// El autor se muestra por su cargo, nunca por su nombre.
export const findEmpresasConValoraciones = async () => {
    const result = await pool.query(`
        SELECT e.id, e.nombre, e.sector, e.ubicacion,
               ROUND(AVG(v.calificacion), 1)::float AS promedio,
               COUNT(v.id) AS opiniones,
               CASE WHEN COUNT(v.id) = 0 THEN '[]'::json ELSE json_agg(json_build_object(
                   'id', v.id, 'autor', COALESCE(u.cargo, 'Candidato'),
                   'calificacion', v.calificacion, 'texto', v.comentario
               ) ORDER BY v.creado_en DESC) END AS resenas
        FROM empresas e
        LEFT JOIN valoraciones v ON v.empresa_id = e.id
        LEFT JOIN usuarios u ON u.id = v.usuario_id
        GROUP BY e.id
        ORDER BY e.nombre`);

    return result.rows;
}

// Una valoración por usuario y empresa: si ya existe, se actualiza.
export const save = async (usuarioId, { empresaId, calificacion, comentario }) => {
    const result = await pool.query(`
        INSERT INTO valoraciones (empresa_id, usuario_id, calificacion, comentario) VALUES ($1, $2, $3, $4)
        ON CONFLICT (empresa_id, usuario_id) DO UPDATE SET calificacion = EXCLUDED.calificacion, comentario = EXCLUDED.comentario
        RETURNING id, empresa_id AS "empresaId", calificacion, comentario`, [empresaId, usuarioId, calificacion, comentario]);

    return result.rows[0];
}

export const report = async (usuarioId, valoracionId, motivo) => {
    await pool.query('INSERT INTO reportes (reportado_por, valoracion_id, motivo) VALUES ($1, $2, $3)',
        [usuarioId, valoracionId, motivo]);
}
