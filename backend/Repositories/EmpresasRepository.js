import { pool } from '../Data/db.js';
import { aCamelCase } from '../Utils/CamelCase.js';

const COLUMNAS = `id, nombre, sector, tamano, correo_contacto, telefono, ubicacion, sitio_web, acerca, verificada, actualizado_en`;

const buscarTodos = async () => {
    const query = `SELECT * FROM empresas`;
    const result = await pool.query(query);

    return result.rows;
}

const buscarPorCorreo = async correo => {
    const query = `
        SELECT e.id, CONCAT(u.nombre, ' ', u.apellidos) AS Dueño, e.nombre, e.sector, e.correo_contacto, e.telefono, e.ubicacion, e.sitio_web, e.acerca 
        FROM empresas e
        INNER JOIN usuarios u 
        ON e.usuario_id = u.id
        WHERE LOWER(e.correo) = LOWER($1)`;

    const result = await pool.query(query, [correo]);

    return result.rows[0];
};

const buscarPorId = async id => {
    const query = `
        SELECT e.id, CONCAT(u.nombre, ' ', u.apellidos) AS Dueño, e.nombre, e.sector, e.correo_contacto, e.telefono, e.ubicacion, e.sitio_web, e.acerca 
        FROM empresas e
        INNER JOIN usuarios u 
        ON e.usuario_id = u.id
        WHERE e.id = $1`;

    const result = await pool.query(query, [id]);

    return result.rows[0];
};

const buscarPorUsuario = async usuarioId => {
    const query = `SELECT ${COLUMNAS} FROM empresas WHERE usuario_id = $1`;
    const result = await pool.query(query, [usuarioId]);

    return aCamelCase(result.rows[0]);
};

const buscarPorNombre = async nombre => {
    const query = `SELECT id FROM empresas WHERE LOWER(nombre) = LOWER($1)`;
    const resultado = await pool.query(query, [nombre]);

    return resultado.rows[0];
};

const obtenerIndicadores = async (empresaId) => {
    const query = 
        `SELECT
            (SELECT COUNT(*) FROM ofertas WHERE empresa_id = $1)::int AS ofertas_total,
            (SELECT COUNT(*) FROM ofertas WHERE empresa_id = $1 AND estado = 'activa')::int AS ofertas_activas,
            COUNT(p.id)::int AS postulaciones_recibidas,
            COUNT(p.id) FILTER (WHERE p.creado_en > NOW() - INTERVAL '7 days')::int AS postulaciones_esta_semana,
            COUNT(p.id) FILTER (WHERE p.estado = 'revision')::int AS en_revision,
            COUNT(p.id) FILTER (WHERE p.estado = 'contactado')::int AS contactados
        FROM postulaciones p
        JOIN ofertas o ON o.id = p.oferta_id
        WHERE o.empresa_id = $1`

    const resultado = await pool.query(query, [empresaId]);

    return aCamelCase(resultado.rows[0]);
};

const obtenerCandidatosRecientes = async (empresaId) => {
    const query = 
            `SELECT p.id, u.nombre, u.apellidos, o.titulo AS oferta, p.estado, p.creado_en
            FROM postulaciones p
            JOIN ofertas o ON o.id = p.oferta_id
            JOIN usuarios u ON u.id = p.candidato_id
            WHERE o.empresa_id = $1
            ORDER BY p.creado_en DESC
            LIMIT 5`

    const resultado = await pool.query(query, [empresaId]);

    return aCamelCase(resultado.rows);
};

const crear = async ({ usuarioId, nombre, sector, correoContacto }) => {
    const query = 
        `INSERT INTO empresas (usuario_id, nombre, sector, correo_contacto)
        VALUES ($1, $2, $3, $4)
        RETURNING id, nombre, sector`;

    const resultado = await pool.query(query, [usuarioId, nombre, sector, correoContacto]);

    return resultado.rows[0];
};

const actualizar = async (id, datos) => {
    const query = 
        `UPDATE empresas SET nombre = $1, sector = $2, tamano = $3, correo_contacto = $4, telefono = $5, ubicacion = $6, sitio_web = $7, acerca = $8 WHERE id = $9 RETURNING ${COLUMNAS}`;

    const result = await pool.query(query, [datos.nombre, datos.sector, datos.tamano, datos.correoContacto, datos.telefono || null, datos.ubicacion || null, datos.sitioWeb || null, datos.acerca || null, id]);

    return aCamelCase(result.rows[0]);
};

const eliminar = async id => {
    const query = `DELETE FROM empresas WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);

    return result.rows[0];
};

export { buscarTodos, buscarPorCorreo, buscarPorId, buscarPorUsuario, buscarPorNombre, obtenerIndicadores, obtenerCandidatosRecientes, crear, actualizar, eliminar };