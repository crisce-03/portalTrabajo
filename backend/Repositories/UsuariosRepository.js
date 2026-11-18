import { pool } from '../Data/db.js';

const buscarTodos = async () => {
    const query = `SELECT * FROM usuarios`;
    const result = await pool.query(query);

    return result.rows;
}

const buscarPorCorreo = async correo => {
    const query = `SELECT id, nombre, apellidos, correo, telefono, cargo, rol, activo, clave_hash FROM usuarios WHERE LOWER(correo) = LOWER($1)`;
    const result = await pool.query(query, [correo]);

    return result.rows[0];
};

const buscarPorId = async id => {
    const query = `SELECT id, nombre, apellidos, correo, telefono, cargo, rol, activo FROM usuarios WHERE id = $1`;
    const result = await pool.query(query, [id]);

    return result.rows[0];
};

const crear = async ({ nombre, apellidos, correo, claveHash, telefono, rol }) => {
    const query = 
        `INSERT INTO usuarios (nombre, apellidos, correo, clave_hash, telefono, rol)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, nombre, apellidos, correo, telefono, cargo, rol, activo`;

    const result = await pool.query(query, [nombre, apellidos, correo, claveHash, telefono || null, rol]);

    return result.rows[0];
};

const actualizar = async ({ id, nombre, apellidos, correo, telefono }) => {
    const query = 
        `UPDATE usuarios SET nombre = $1, apellidos = $2, correo = $3, telefono = $4 WHERE id = $5 RETURNING id, nombre, apellidos, correo, telefono`;

    const result = await pool.query(query, [nombre, apellidos, correo, telefono || null, id]);

    return result.rows[0];
};

const eliminar = async id => {
    const query = `DELETE FROM usuarios WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);

    return result.rows[0];
};

export { buscarTodos, buscarPorCorreo, buscarPorId, crear, actualizar, eliminar };