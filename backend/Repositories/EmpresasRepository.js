import { pool } from '../Data/db.js';

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

const crear = async ({ usuarioId, nombre, sector, correoContacto }) => {
    const query = 
        `INSERT INTO empresas (usuario_id, nombre, sector, correo_contacto)
        VALUES ($1, $2, $3, $4)
        RETURNING id, nombre, sector`;

    const resultado = await pool.query(query, [usuarioId, nombre, sector, correoContacto]);

    return resultado.rows[0];
};

const actualizar = async ({ id, nombre, sector, tamano, correo, telefono, ubicacion, sitio_web, acerca }) => {
    const query = 
        `UPDATE empresas SET nombre = $1, sector = $2, tamano = $3, correo = $4, telefono = $5, ubicacion = $6, sitio_web = $7, acerca = $8 WHERE id = $9 RETURNING *`;

    const result = await pool.query(query, [nombre, sector, tamano, correo, telefono || null, ubicacion || null, sitio_web || null, acerca || null, id]);

    return result.rows[0];
};

const eliminar = async id => {
    const query = `DELETE FROM empresas WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);

    return result.rows[0];
};

export { buscarTodos, buscarPorCorreo, buscarPorId, crear, actualizar, eliminar };