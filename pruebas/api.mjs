// Pruebas de la API de perfil de candidato, valoraciones y recursos.
// Necesita PostgreSQL con schema.sql cargado. Crea sus propios datos y los borra al terminar.
// Uso: node pruebas/api.mjs
import 'dotenv/config';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import app from '../backend/app.js';
import { pool } from '../backend/Data/db.js';
import { signToken } from '../backend/Utils/Token.js';

const sello = Date.now();
const crearUsuario = async (rol) => (await pool.query(
    `INSERT INTO usuarios (nombre, apellidos, correo, clave_hash, cargo, rol) VALUES ('Prueba', 'Api', $1, 'x', 'Tester', $2) RETURNING id`,
    [`${rol}-${sello}@prueba.test`, rol])).rows[0].id;

const candidato = await crearUsuario('candidato');
const duenio = await crearUsuario('empresa');
const empresa = (await pool.query(
    `INSERT INTO empresas (usuario_id, nombre, sector, correo_contacto) VALUES ($1, $2, 'Tecnología', 'rrhh@prueba.test') RETURNING id`,
    [duenio, `Empresa ${sello}`])).rows[0].id;
const recurso = (await pool.query(
    `INSERT INTO recursos (categoria, titulo) VALUES ('Habilidades', $1) RETURNING id`, [`Recurso ${sello}`])).rows[0].id;

const servidor = app.listen(0);
const base = `http://localhost:${servidor.address().port}/api`;
let token; // sesión con la que se hacen las peticiones
const pedir = async (ruta, metodo = 'GET', cuerpo) => {
    const esFormulario = cuerpo instanceof FormData;
    const res = await fetch(base + ruta, {
        method: metodo,
        headers: {
            ...(cuerpo && !esFormulario && { 'Content-Type': 'application/json' }),
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: esFormulario ? cuerpo : cuerpo && JSON.stringify(cuerpo),
    });
    return { status: res.status, ...(await res.json()) };
};
const formulario = (campos, archivo) => {
    const datos = new FormData();
    Object.entries(campos).forEach(([clave, valor]) => datos.set(clave, valor));
    if (archivo) datos.set('cv', new Blob(['%PDF-1.4 prueba'], { type: archivo.tipo }), archivo.nombre);
    return datos;
};
const perfil = { nombre: 'Ana', apellidos: 'López', correo: `ana-${sello}@prueba.test`, telefono: '' };
let rutaCv;

try {
    // ---------- Sin sesión ----------
    assert.equal((await pedir('/candidatos/me')).status, 401);
    assert.equal((await pedir('/valoraciones', 'POST', {})).status, 401);

    // ---------- Recursos (público) ----------
    let r = await pedir('/recursos?categoria=Habilidades');
    assert.ok(r.data.some(x => x.id === recurso) && r.data.every(x => x.categoria === 'Habilidades'));
    assert.equal((await pedir('/recursos?categoria=Otra')).status, 400);

    // ---------- Perfil del candidato ----------
    token = 'no-es-un-token';
    assert.equal((await pedir('/candidatos/me')).status, 401);
    token = signToken({ id: candidato, rol: 'candidato' });
    r = await pedir('/candidatos/me');
    assert.deepEqual([r.status, r.data.nombre, r.data.visitas, r.data.solicitudes, r.data.cvNombre], [200, 'Prueba', 0, 0, null]);

    r = await pedir('/candidatos/me', 'PUT', formulario(perfil, { nombre: 'Currículum Ana.pdf', tipo: 'application/pdf' }));
    assert.deepEqual([r.status, r.data.nombre, r.data.telefono, r.data.cvNombre], [200, 'Ana', null, 'Currículum Ana.pdf']);
    rutaCv = (await pool.query('SELECT cv_ruta FROM perfiles_candidato WHERE usuario_id = $1', [candidato])).rows[0].cv_ruta;
    assert.ok(existsSync(rutaCv));

    // Sin archivo se conserva el CV; un CV nuevo reemplaza y borra el anterior
    r = await pedir('/candidatos/me', 'PUT', formulario(perfil));
    assert.equal(r.data.cvNombre, 'Currículum Ana.pdf');
    const anterior = rutaCv;
    await new Promise(listo => setTimeout(listo, 5)); // el nombre del archivo lleva la hora
    r = await pedir('/candidatos/me', 'PUT', formulario(perfil, { nombre: 'nuevo.pdf', tipo: 'application/pdf' }));
    rutaCv = (await pool.query('SELECT cv_ruta FROM perfiles_candidato WHERE usuario_id = $1', [candidato])).rows[0].cv_ruta;
    assert.ok(r.data.cvNombre === 'nuevo.pdf' && existsSync(rutaCv) && !existsSync(anterior));

    // Datos o archivos inválidos no cambian nada
    assert.equal((await pedir('/candidatos/me', 'PUT', formulario({ ...perfil, correo: 'malo' }))).status, 400);
    assert.equal((await pedir('/candidatos/me', 'PUT', formulario(perfil, { nombre: 'virus.exe', tipo: 'application/pdf' }))).status, 400);
    assert.equal((await pedir('/candidatos/me', 'PUT', formulario({ ...perfil, correo: `empresa-${sello}@PRUEBA.test` }))).status, 409);
    assert.equal((await pedir('/candidatos/me')).data.cvNombre, 'nuevo.pdf');

    // ---------- Alertas ----------
    r = await pedir('/candidatos/me/alertas', 'POST', { termino: '  QA Tester  ' });
    assert.deepEqual([r.status, r.data.termino, r.data.activa], [201, 'QA Tester', true]);
    const alerta = r.data.id;
    assert.equal((await pedir('/candidatos/me/alertas', 'POST', { termino: '' })).status, 400);
    assert.equal((await pedir(`/candidatos/me/alertas/${alerta}`, 'PATCH', { activa: false })).data.activa, false);
    assert.deepEqual((await pedir('/candidatos/me/alertas')).data, [{ id: alerta, termino: 'QA Tester', activa: false }]);

    // ---------- Valoraciones ----------
    const laEmpresa = async () => (await pedir('/valoraciones')).data.find(e => e.id === empresa);
    assert.deepEqual([(await laEmpresa()).promedio, (await laEmpresa()).opiniones], [null, 0]);
    assert.equal((await pedir('/valoraciones', 'POST', { empresaId: empresa, calificacion: 6, comentario: 'Muy buen lugar.' })).status, 400);
    assert.equal((await pedir('/valoraciones', 'POST', { empresaId: empresa, calificacion: 5, comentario: 'Muy buen lugar.' })).status, 201);
    await pedir('/valoraciones', 'POST', { empresaId: empresa, calificacion: 3, comentario: 'Cambié de opinión.' });
    const e = await laEmpresa();
    assert.deepEqual([e.promedio, e.opiniones, e.resenas[0].autor, e.resenas[0].texto], [3, 1, 'Tester', 'Cambié de opinión.']);

    assert.equal((await pedir(`/valoraciones/${e.resenas[0].id}/reportes`, 'POST')).status, 201);
    assert.equal((await pool.query('SELECT COUNT(*)::int AS n FROM reportes WHERE valoracion_id = $1', [e.resenas[0].id])).rows[0].n, 1);

    // ---------- Otros roles ----------
    token = signToken({ id: duenio, rol: 'empresa' });
    assert.equal((await pedir('/candidatos/me')).status, 403);
    assert.equal((await pedir('/valoraciones', 'POST', { empresaId: empresa, calificacion: 5, comentario: 'Somos los mejores.' })).status, 403);
    // La alerta de otra persona no existe para este usuario
    await pool.query(`UPDATE usuarios SET rol = 'candidato' WHERE id = $1`, [duenio]);
    assert.equal((await pedir(`/candidatos/me/alertas/${alerta}`, 'PATCH', { activa: true })).status, 404);

    console.log('API: todas las pruebas OK');
} finally {
    await pool.query('DELETE FROM usuarios WHERE id = ANY($1)', [[candidato, duenio]]); // borra en cascada todo lo demás
    await pool.query('DELETE FROM recursos WHERE id = $1', [recurso]);
    if (rutaCv) (await import('node:fs/promises')).rm(rutaCv, { force: true });
    servidor.close();
    await pool.end();
}
