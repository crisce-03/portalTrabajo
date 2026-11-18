import { pool } from '../Data/db.js';

export const findPerfil = async (usuarioId) => {
    const result = await pool.query(`
        SELECT u.nombre, u.apellidos, u.correo, u.telefono, p.ubicacion, p.resumen,
               COALESCE(p.habilidades, '{}') AS habilidades, COALESCE(p.experiencia, '{}') AS experiencia,
               p.formacion, p.cv_nombre AS "cvNombre",
               COALESCE(p.visitas, 0) AS visitas,
               (SELECT COUNT(*) FROM postulaciones WHERE candidato_id = u.id) AS solicitudes
        FROM usuarios u
        LEFT JOIN perfiles_candidato p ON p.usuario_id = u.id
        WHERE u.id = $1`, [usuarioId]);

    return result.rows[0];
}

export const updatePresentacion = async (usuarioId, { ubicacion, resumen, habilidades, experiencia, formacion }) => {
    await pool.query(`
        INSERT INTO perfiles_candidato (usuario_id, ubicacion, resumen, habilidades, experiencia, formacion)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (usuario_id) DO UPDATE SET ubicacion = EXCLUDED.ubicacion, resumen = EXCLUDED.resumen,
            habilidades = EXCLUDED.habilidades, experiencia = EXCLUDED.experiencia, formacion = EXCLUDED.formacion`,
    [usuarioId, ubicacion || null, resumen || null, habilidades, experiencia, formacion || null]);
};

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

export const listarOfertasGuardadas = async usuarioId => {
    const result = await pool.query(`
        SELECT o.id, o.titulo, o.ubicacion, o.modalidad, o.contrato, o.experiencia, o.sector,
               o.salario_min AS "salarioMin", o.salario_max AS "salarioMax", o.publicada_en AS fecha, e.nombre AS empresa
        FROM ofertas_guardadas g
        JOIN ofertas o ON o.id = g.oferta_id
        JOIN empresas e ON e.id = o.empresa_id
        JOIN usuarios dueno ON dueno.id = e.usuario_id AND dueno.activo = TRUE
        WHERE g.usuario_id = $1 AND o.estado = 'activa'
        ORDER BY g.guardada_en DESC`, [usuarioId]);
    return result.rows;
};

export const guardarOferta = async (usuarioId, ofertaId) => {
    const result = await pool.query(`
        INSERT INTO ofertas_guardadas (usuario_id, oferta_id)
        SELECT $1, id FROM ofertas WHERE id = $2 AND estado = 'activa'
        ON CONFLICT (usuario_id, oferta_id) DO NOTHING
        RETURNING oferta_id`, [usuarioId, ofertaId]);
    return result.rowCount > 0;
};

export const quitarOfertaGuardada = async (usuarioId, ofertaId) => {
    await pool.query('DELETE FROM ofertas_guardadas WHERE usuario_id = $1 AND oferta_id = $2', [usuarioId, ofertaId]);
};

export const obtenerCv = async usuarioId => {
    const result = await pool.query('SELECT cv_nombre, cv_ruta FROM perfiles_candidato WHERE usuario_id = $1', [usuarioId]);
    return result.rows[0];
};

export const cvUsadoEnPostulaciones = async ruta => {
    const result = await pool.query('SELECT 1 FROM postulaciones WHERE cv_ruta = $1 LIMIT 1', [ruta]);
    return result.rowCount > 0;
};
