import { pool } from '../Data/db.js';

export const findPerfil = async (usuarioId) => {
    const result = await pool.query(`
        SELECT u.nombre, u.apellidos, u.correo, u.telefono, p.cv_nombre AS "cvNombre",
               COALESCE(p.visitas, 0) AS visitas,
               (SELECT COUNT(*)::int FROM postulaciones WHERE candidato_id = u.id) AS solicitudes
        FROM usuarios u
        LEFT JOIN perfiles_candidato p ON p.usuario_id = u.id
        WHERE u.id = $1`, [usuarioId]);

    return result.rows[0];
}

export const updateDatos = async (usuarioId, { nombre, apellidos, correo, telefono }) => {
    await pool.query('UPDATE usuarios SET nombre = $2, apellidos = $3, correo = $4, telefono = $5 WHERE id = $1',
        [usuarioId, nombre, apellidos, correo, telefono]);
}

// Guarda el CV nuevo y devuelve la ruta del anterior (o null) para poder borrar ese archivo.
export const saveCv = async (usuarioId, nombre, ruta) => {
    const result = await pool.query(`
        WITH anterior AS (SELECT cv_ruta FROM perfiles_candidato WHERE usuario_id = $1)
        INSERT INTO perfiles_candidato (usuario_id, cv_nombre, cv_ruta) VALUES ($1, $2, $3)
        ON CONFLICT (usuario_id) DO UPDATE SET cv_nombre = EXCLUDED.cv_nombre, cv_ruta = EXCLUDED.cv_ruta
        RETURNING (SELECT cv_ruta FROM anterior) AS anterior`, [usuarioId, nombre, ruta]);

    return result.rows[0].anterior;
}

export const findAlertas = async (usuarioId) => {
    const result = await pool.query('SELECT id, termino, activa FROM alertas WHERE usuario_id = $1 ORDER BY id', [usuarioId]);

    return result.rows;
}

export const createAlerta = async (usuarioId, termino) => {
    const result = await pool.query('INSERT INTO alertas (usuario_id, termino) VALUES ($1, $2) RETURNING id, termino, activa',
        [usuarioId, termino]);

    return result.rows[0];
}

// El filtro por usuario_id impide tocar alertas de otra persona.
export const updateAlerta = async (usuarioId, id, activa) => {
    const result = await pool.query('UPDATE alertas SET activa = $3 WHERE id = $2 AND usuario_id = $1 RETURNING id, termino, activa',
        [usuarioId, id, activa]);

    return result.rows[0];
}
