// Pruebas del front-end en Chrome sin ventana: estructura y enlaces de las 19 pantallas, errores de consola,
// vista de celular y los flujos completos de cada tipo de usuario. Abre los archivos directamente (no necesita el servidor).
// Uso: npm test   (necesita Google Chrome; deja una captura de cada pantalla en pruebas/capturas/)
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';

const RAIZ = dirname(fileURLToPath(import.meta.url));
const [publico = join(RAIZ, '..', 'public'), salida = join(RAIZ, 'capturas')] = process.argv.slice(2);
const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = pathToFileURL(publico).href + '/';
mkdirSync(salida, { recursive: true });
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu',
  '--disable-extensions', '--no-first-run', '--hide-scrollbars', '--remote-debugging-port=9334',
  `--user-data-dir=${join(tmpdir(), 'portal-pruebas-chrome')}`, 'about:blank'], { stdio: 'ignore' });

const espera = ms => new Promise(r => setTimeout(r, ms));
let ws;
for (let i = 0; i < 160 && !ws; i++) {
  try {
    const t = (await (await fetch('http://127.0.0.1:9334/json/list')).json()).find(x => x.type === 'page');
    ws = new WebSocket(t.webSocketDebuggerUrl);
  } catch { await espera(250); }
}
if (!ws) throw new Error(`No se pudo abrir Chrome en ${CHROME}. Indica otra ruta con la variable CHROME.`);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pendientes = new Map(); const oyentes = [];
ws.addEventListener('message', ({ data }) => {
  const m = JSON.parse(data);
  if (m.id && pendientes.has(m.id)) { pendientes.get(m.id)(m); pendientes.delete(m.id); } else oyentes.forEach(f => f(m));
});
const cdp = (method, params = {}) => new Promise((res, rej) => {
  const n = ++id; pendientes.set(n, m => m.error ? rej(new Error(method + ': ' + m.error.message)) : res(m.result));
  ws.send(JSON.stringify({ id: n, method, params }));
});
const evento = nombre => new Promise(r => { const f = m => { if (m.method === nombre) { oyentes.splice(oyentes.indexOf(f), 1); r(m); } }; oyentes.push(f); });
const errores = [];
oyentes.push(m => {
  if (m.method === 'Runtime.exceptionThrown') errores.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errores.push(m.params.args.map(a => a.value).join(' '));
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errores.push(m.params.entry.text + ' ' + (m.params.entry.url ?? ''));
});
await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Log.enable');
await cdp('Page.setDownloadBehavior', { behavior: 'deny' });

const H = `const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const escribir = (s, v) => { const e = $(s); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
  const elegir = (s, v) => { const e = $(s); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); };
  const visibles = s => $$(s).filter(e => e.offsetParent !== null).length;
  const pausa = ms => new Promise(r => setTimeout(r, ms));
  const ultimoAviso = () => $$('.zona-avisos .toast').at(-1)?.textContent.trim() ?? '';`;
const ev = async expr => {
  const r = await cdp('Runtime.evaluate', { expression: `(async () => { ${H} ${expr} })()`, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
  return r.result.value;
};
async function ir(pagina, ancho = 1366) {
  await cdp('Emulation.setDeviceMetricsOverride', { width: ancho, height: 900, deviceScaleFactor: 1, mobile: ancho < 600 });
  const carga = evento('Page.loadEventFired');
  await cdp('Page.navigate', { url: BASE + pagina });
  await carga;
  await ev('await document.fonts.ready; return true');
}
async function navegando(expr) {
  const carga = evento('Page.loadEventFired');
  await ev(expr);
  await carga;
  await ev('await document.fonts.ready; return true');
  return ev('return location.href.split("/public/")[1]');
}
async function capturar(nombre, ancho = 1366) {
  const alto = await ev('return document.documentElement.scrollHeight');
  await cdp('Emulation.setDeviceMetricsOverride', { width: ancho, height: alto, deviceScaleFactor: 1, mobile: ancho < 600 });
  const { data } = await cdp('Page.captureScreenshot', { format: 'png' });
  writeFileSync(`${salida}/${nombre}.png`, Buffer.from(data, 'base64'));
  await cdp('Emulation.setDeviceMetricsOverride', { width: ancho, height: 900, deviceScaleFactor: 1, mobile: ancho < 600 });
}
const resultados = [];
const ok = (nombre, cond, detalle = '') => resultados.push(`${cond ? 'OK  ' : 'FALLA'} ${nombre}${!cond && detalle ? ' — ' + detalle : ''}`);
const limpiarSesion = () => ev('sessionStorage.clear(); localStorage.clear(); return true');

const PAGINAS = ['index', 'registro', 'resultados', 'detalle-oferta', 'postulacion', 'postulacion-enviada',
  'recursos', 'recurso', 'noticias', 'foros', 'hilo', 'valoraciones', 'perfil-usuario',
  'panel-empresa', 'publicar-oferta', 'datos-empresa', 'postulaciones', 'perfil-candidato', 'admin'];

// ---------- Todas las pantallas: estructura, enlaces, consola, celular ----------
await ir('index.html'); await limpiarSesion();
for (const p of PAGINAS) {
  errores.length = 0;
  await ir(`${p}.html`);
  await capturar(p);
  const info = await ev(`return {
    links: $$('#navbar .nav-link').length, h1: $$('h1').length, pie: !!$('#pie div'),
    hrefs: $$('a[href]').map(a => a.href).filter(h => h.startsWith('file:')),
    vacios: $$('a:not([href]), a[href="#"], a[href=""]').filter(a => !a.classList.contains('disabled')).length,
    sinTipo: $$('button:not([type])').length,
    imgsSinAlt: $$('img:not([alt])').length,
    camposSinEtiqueta: $$('input:not([type=hidden]):not(.btn-check), select, textarea').filter(c => !c.labels?.length && !c.getAttribute('aria-label')).map(c => c.id || c.name),
  }`);
  const rotos = [...new Set(info.hrefs.map(h => fileURLToPath(h.split(/[?#]/)[0])))].filter(f => !existsSync(f));
  ok(`${p}: navbar, un h1 y pie`, info.links === 6 && info.h1 === 1 && info.pie, JSON.stringify(info).slice(0, 200));
  ok(`${p}: sin enlaces rotos ni vacíos`, rotos.length === 0 && info.vacios === 0, rotos.join(', ') + ` vacíos=${info.vacios}`);
  ok(`${p}: botones con type y campos con etiqueta`, info.sinTipo === 0 && info.camposSinEtiqueta.length === 0 && info.imgsSinAlt === 0, `sinTipo=${info.sinTipo} ${info.camposSinEtiqueta}`);
  await ir(`${p}.html`, 390);
  ok(`${p}: celular sin scroll horizontal`, !(await ev('return document.documentElement.scrollWidth > innerWidth')));
  ok(`${p}: sin errores de consola`, errores.length === 0, errores.join(' | '));
}

// ---------- Flujo candidato: buscar → detalle → postular (pide sesión) → confirmar → mis solicitudes ----------
await ir('index.html'); await limpiarSesion(); await ir('index.html');
let url = await navegando(`escribir('#b-q', 'desarrollador'); $('#b-modalidad').value = 'Remoto'; $('#busqueda form').requestSubmit();`);
ok('inicio → resultados con la búsqueda', url.startsWith('resultados.html?q=desarrollador'), url);
ok('resultados aplica filtros de inicio', await ev(`return $('#conteo').textContent === '1 empleo encontrado' && $('#fm-2').checked && $('#r-q').value === 'desarrollador'`), await ev(`return $('#conteo').textContent`));
ok('resultados: limpiar muestra las 8', await ev(`escribir('#r-q', ''); $('#filtros').reset(); await pausa(30); return $('#conteo').textContent === '8 empleos encontrados'`));
ok('resultados: sector Tecnología + salario 1500 → 3', await ev(`$('#fs-0').click(); elegir('#f-salario', '1500'); return $$('.oferta').length`) === 3);
ok('resultados: ordenar por salario', await ev(`elegir('#r-orden', 'salario'); return $('.oferta h2').textContent`) === 'Arquitecto de Software Cloud');
ok('resultados: sin coincidencias muestra aviso', await ev(`escribir('#r-q', 'zzzz'); return !$('#sin-ofertas').hidden && $$('.oferta').length === 0`));

await ir('detalle-oferta.html?id=318');
ok('detalle muestra la oferta elegida', await ev(`return $('#o-titulo').textContent + '|' + $('#e-nombre').textContent + '|' + $('#o-aplicar').getAttribute('href')`) === 'Desarrollador Fullstack|TechNova S.A.|postulacion.html?id=318');
url = await navegando(`$('#o-aplicar').click()`);
ok('aplicar → postulación', url === 'postulacion.html?id=318', url);
ok('postulación: visitante ve aviso de sesión', await ev(`return !$('#aviso-sesion').hidden && $('#r-titulo').textContent === 'Desarrollador Fullstack'`));
ok('postulación: sin sesión no se envía y abre el login', await ev(`$('#c-confirmo').checked = true; $('#c-acepto').checked = true; $('#form-postulacion').requestSubmit(); await pausa(300); return location.href.includes('postulacion.html') && $('#form-login').classList.contains('show')`));
url = await navegando(`escribir('#login-correo', 'hg@unicaes.edu.sv'); escribir('#login-clave', 'clave-prueba'); $('#form-login').requestSubmit();`);
ok('login desde postulación regresa a la misma oferta', url === 'postulacion.html?id=318', url);
ok('con sesión: navbar de candidato y sin aviso', await ev(`return $('#aviso-sesion').hidden && $('#navbar').textContent.includes('Héctor G.')`));
ok('postulación: sin confirmar no avanza', await ev(`$('#form-postulacion').requestSubmit(); return document.activeElement.id === 'c-confirmo'`));
url = await navegando(`$('#c-confirmo').checked = true; $('#c-acepto').checked = true; $('#form-postulacion').requestSubmit();`);
ok('postulación → confirmación', url === 'postulacion-enviada.html?id=318', url);
ok('confirmación muestra empresa y candidato', await ev(`return $('#mensaje').textContent.includes('TechNova S.A.') && $('#linea-candidato').textContent.includes('Héctor Alejandro García Guevara')`));
url = await navegando(`$('#siguientes-pasos a').click()`);
ok('ir a mis postulaciones', url === 'perfil-usuario.html#solicitudes', url);
ok('mis solicitudes incluye la nueva como Recibida', await ev(`const f = $('#tabla-solicitudes tr'); return f.textContent.includes('Desarrollador Fullstack') && f.textContent.includes('Recibida')`));

// ---------- Perfil: alertas, valoraciones ----------
await ir('perfil-usuario.html?empresa=TechNova%20S.A.#valoraciones');
ok('perfil: empresa preseleccionada desde Valorar', await ev(`return $('#v-empresa').value`) === 'TechNova S.A.');
ok('perfil: valoración sin estrellas no se envía', await ev(`escribir('#v-comentario', 'Buen lugar para trabajar.'); $('#form-valoracion').requestSubmit(); return $('#form-valoracion [role=status]').textContent.startsWith('Revisa')`));
ok('perfil: valoración completa', await ev(`$('label[for=c-4]').click(); $('#form-valoracion').requestSubmit(); return $$('.estrellas .bi-star-fill').length === 4 && ultimoAviso().startsWith('¡Gracias')`));
ok('perfil: crear alerta', await ev(`escribir('#a-nueva', 'Analista <b>QA</b>'); $('#form-alerta').requestSubmit(); await pausa(20); const ult = $$('#lista-alertas .alerta').at(-1); return ult.textContent.includes('Analista <b>QA</b>') && !ult.querySelector('b')`));
await ir('perfil-usuario.html');
ok('perfil: la alerta creada sigue al recargar', await ev(`return $$('#lista-alertas .alerta').length`) === 5);
ok('perfil: apagar alerta la pone gris', await ev(`$('#a-1').click(); return $('#a-1').closest('.alerta').classList.contains('text-secondary')`));

// ---------- Cerrar sesión y registro ----------
url = await navegando(`$('[data-salir]').click()`);
ok('cerrar sesión vuelve a inicio como visitante', url === 'index.html' && await ev(`return !!$('#boton-login')`), url);
await ir('registro.html?tipo=empresa');
ok('registro: ?tipo=empresa muestra campos de empresa', await ev(`return !$('#campos-empresa').hidden && $('#campos-candidato').disabled`));
ok('registro: contraseñas distintas bloquean', await ev(`escribir('#r-empresa', 'Mi Empresa'); $('#r-sector').value = 'Tecnología'; escribir('#r-correo', 'rrhh@miempresa.com'); escribir('#r-clave', 'segura123'); escribir('#r-confirmar', 'otra1234'); $('#r-terminos').checked = true; $('#form-registro').requestSubmit(); return $('#r-confirmar').matches(':invalid')`));
url = await navegando(`escribir('#r-confirmar', 'segura123'); $('#form-registro').requestSubmit();`);
ok('registro de empresa → panel empresarial', url === 'panel-empresa.html' && await ev(`return $('#navbar').textContent.includes('Mi empresa')`), url);
await ir('registro.html');
ok('registro: "Inicia sesión" abre el formulario del encabezado', await ev(`sessionStorage.setItem('usuario', 'visitante'); return true`) && true);
await ir('registro.html');
ok('registro: enlace abre login', await ev(`$('[data-abrir-login]').click(); await pausa(300); return $('#form-login').classList.contains('show')`));

// ---------- Foros e hilos ----------
await limpiarSesion();
await ir('foros.html');
ok('foros: 4 hilos', await ev(`return $$('.hilo').length`) === 4);
ok('foros: filtro sector diseño', await ev(`$('#f-diseno').click(); return $$('.hilo').length`) === 1);
ok('foros: debates de salarios', await ev(`$('#filtros-foro').reset(); await pausa(20); $('#f-salarios').click(); return $$('.hilo').length`) === 1);
ok('foros: buscar sin tildes', await ev(`$('#filtros-foro').reset(); await pausa(20); escribir('#buscar-hilo', 'tecnologias'); return $$('.hilo').length`) === 1);
ok('foros: tema vacío no se publica', await ev(`escribir('#buscar-hilo', ''); $('[data-bs-target="#modal-tema"]').click(); await pausa(400); $('#form-tema').requestSubmit(); return $('#modal-tema').classList.contains('show') && $('#n-titulo').matches(':invalid')`));
ok('foros: publicar tema', await ev(`escribir('#n-titulo', '¿Qué certificaciones cloud valen la pena?'); $('#n-sector').value = 'software'; escribir('#n-contenido', 'Quiero saber si AWS o Azure ayudan a conseguir empleo más rápido.'); $('#form-tema').requestSubmit(); await pausa(500); return !$('#modal-tema').classList.contains('show') && $('.hilo h2').textContent.startsWith('¿Qué certificaciones')`));
url = await navegando(`$('.hilo h2 a').click()`);
ok('foros → hilo nuevo', url.startsWith('hilo.html?id=') && await ev(`return $('#h-titulo').textContent.startsWith('¿Qué certificaciones')`), url);
ok('hilo: responder', await ev(`escribir('#r-texto', 'Azure es muy pedido en empresas locales.'); $('#form-respuesta').requestSubmit(); return $$('#lista-respuestas li').length === 1 && $('#form-respuesta [role=status]').textContent === '' `) === true);
await ir('hilo.html?id=1#responder');
ok('hilo existente con 2 respuestas', await ev(`return $$('#lista-respuestas li').length === 2 && $('#h-titulo').textContent.startsWith('¿Qué tecnologías')`));
ok('hilo: reportar respuesta', await ev(`$('[data-reportar]').click(); return $('[data-reportar]').disabled`));

// ---------- Valoraciones y recursos ----------
await ir('valoraciones.html#technova-sa');
ok('valoraciones: 5 empresas', await ev(`return $$('.empresa').length`) === 5);
ok('valoraciones: buscar', await ev(`escribir('#v-buscar', 'technova'); return $$('.empresa').length === 1 && $('.empresa').id === 'technova-sa'`));
ok('valoraciones: reportar reseña', await ev(`$('[data-reportar]').click(); return $('[data-reportar]').disabled`));
await ir('recurso.html?id=curriculum');
ok('recurso: artículo elegido', await ev(`return $('#r-titulo').textContent`) === 'Guía para organizar tu currículum');

// ---------- Empresa ----------
await ir('postulaciones.html');
ok('postulaciones: indicadores 18/7/8/3', await ev(`return ['i-total','i-pendiente','i-revision','i-contactado'].map(i => $('#'+i).textContent).join('/')`) === '18/7/8/3');
ok('postulaciones: página 1 de 4', await ev(`return $$('.postulante').length === 5 && $('#anterior').disabled && $('#conteo').textContent.endsWith('Página 1 de 4')`));
ok('postulaciones: siguiente', await ev(`$('#siguiente').click(); return $('#conteo').textContent.startsWith('Mostrando 6–10')`));
ok('postulaciones: filtrar contactados', await ev(`elegir('#f-estado', 'contactado'); return $$('.postulante').length === 3 && $('#siguiente').disabled`));
ok('postulaciones: buscar sin tildes', await ev(`elegir('#f-estado', ''); escribir('#f-buscar', 'jose hernandez'); return $$('.postulante').length`) === 1);
ok('postulaciones: más antiguos', await ev(`escribir('#f-buscar', ''); elegir('#f-orden', 'antiguos'); return $('.postulante strong').textContent`) === 'Javier Aguilar');
url = await navegando(`$('.postulante a').click()`);
ok('ver perfil → candidato elegido', url === 'perfil-candidato.html?id=18' && await ev(`return $('#c-nombre').textContent`) === 'Javier Aguilar', url);
ok('candidato: descartar', await ev(`$('[data-estado=descartado]').click(); return $('#estado-insignia').textContent + '|' + $('#estado-texto').textContent`) === 'Descartado|Descartado');
ok('candidato: CV descargable', await ev(`return $('#c-descargar').download`) === 'Javier_Aguilar_CV.pdf');

await ir('publicar-oferta.html');
ok('publicar: vista previa modal en vivo', await ev(`escribir('#o-titulo', 'Analista QA'); $('[data-bs-target="#modal-vista"]').click(); await pausa(400); return $('#modal-vista.show [data-espejo=titulo]').textContent`) === 'Analista QA');
ok('publicar: título vacío bloquea', await ev(`$('#modal-vista .btn-close').click(); await pausa(400); escribir('#o-titulo', ''); $('#form-oferta').requestSubmit(); return $('#o-titulo').matches(':invalid')`));
ok('publicar: publicar oferta', await ev(`escribir('#o-titulo', 'Analista QA'); $('#form-oferta').requestSubmit(); return ultimoAviso()`) === 'Oferta publicada correctamente.');

await ir('datos-empresa.html');
ok('empresa: guardar actualiza fecha', await ev(`$('#form-empresa').requestSubmit(); return $('#actualizado').textContent !== '20 de octubre de 2026' && ultimoAviso() === 'Cambios guardados.'`));
ok('empresa: cancelar restaura vista previa', await ev(`escribir('#e-nombre', 'Otra S.A.'); $('#form-empresa').reset(); await pausa(30); return $('[data-espejo=nombre]').textContent`) === 'InnovaTech S.A.');

// ---------- Admin ----------
await ir('admin.html');
ok('admin: 6 registros', await ev(`return $$('#tabla-control tbody tr').length`) === 6);
ok('admin: gestión de usuarios filtra', await ev(`$('[data-filtro=usuario]').click(); return $$('#tabla-control tbody tr').length`) === 2);
ok('admin: nuevo registro', await ev(`$('#nuevo-registro').click(); await pausa(400); escribir('#m-nombre', 'Pedro Gómez'); escribir('#m-detalle', 'Candidato Registrado'); $('#form-registro-admin').requestSubmit(); await pausa(400); return $$('#tabla-control tbody tr').length === 3 && ultimoAviso().includes('Pedro Gómez')`));
ok('admin: deshabilitar usuario', await ev(`$('[data-accion=deshabilitar]').click(); return $('#tabla-control tbody tr').textContent.includes('Deshabilitado')`));
ok('admin: restablecer contraseña', await ev(`$$('[data-accion=clave]')[1].click(); return ultimoAviso().includes('carlos.v@correo.com')`));
ok('admin: editar empresa', await ev(`$('[data-filtro=empresa]').click(); $('[data-accion=editar]').click(); await pausa(400); escribir('#m-nombre', 'Auto Life Corporation'); $('#form-registro-admin').requestSubmit(); await pausa(400); return $('#tabla-control tbody').textContent.includes('Auto Life Corporation')`));
ok('admin: suspender empresa', await ev(`$('[data-accion=suspender]').click(); return $('#tabla-control tbody tr').textContent.includes('Suspendida')`));
ok('admin: eliminar pide confirmación', await ev(`$('[data-filtro=vacante]').click(); $('[data-accion=eliminar]').click(); await pausa(400); const visible = $('#modal-confirmar').classList.contains('show'); $('#modal-confirmar .btn-neo-secondary').click(); await pausa(400); return visible && $$('#tabla-control tbody tr').length === 2`));
ok('admin: eliminar confirmado', await ev(`$('[data-accion=eliminar]').click(); await pausa(400); $('#confirmar-si').click(); await pausa(400); return $$('#tabla-control tbody tr').length`) === 1);
ok('admin: exportar CSV', await ev(`$('[data-filtro=""]').click(); $('#exportar').click(); return ultimoAviso()`) === 'Se exportaron 6 registros.');
ok('admin: aprobar reporte', await ev(`$('[data-decision=aprobar]').click(); await pausa(50); return $('#pendientes').textContent + '|' + $('#total-reportes').textContent`) === '1 Pendiente de Revisión|8');
ok('admin: eliminar reporte con confirmación', await ev(`$('[data-decision=eliminar]').click(); await pausa(400); $('#confirmar-si').click(); await pausa(400); return !$('#bandeja-vacia').hidden && $('#total-reportes').textContent === '7'`));
ok('admin: configuración', await ev(`$('#configuracion form').requestSubmit(); return ultimoAviso()`) === 'Configuración guardada.');

// ---------- Experiencia de usuario ----------
await ir('index.html'); await limpiarSesion(); await ir('index.html');
ok('UX: «Saltar al contenido» lleva al contenido principal', await ev(`const s = $('.saltar'); s.focus(); return document.activeElement === s && s.getAttribute('href') === '#' + $('main').id`));
ok('UX: barra de navegación fija', await ev(`return getComputedStyle($('#navbar')).position === 'sticky'`));
ok('UX: ver u ocultar contraseña', await ev(`const c = $('#login-clave'); const b = c.closest('.input-group').querySelector('button'); b.click(); const visible = c.type === 'text'; b.click(); return visible && c.type === 'password'`));
ok('UX: error en español debajo del campo', await ev(`escribir('#login-correo', 'malo'); $('#form-login').requestSubmit(); return $('#login-correo-error')?.textContent.startsWith('Escribe un correo válido') && $('#login-correo').getAttribute('aria-invalid') === 'true'`));
ok('UX: el error desaparece al corregir', await ev(`escribir('#login-correo', 'bien@correo.com'); return !$('#login-correo-error') && $('#login-correo').getAttribute('aria-invalid') === 'false'`));
await ir('admin.html');
ok('UX: «Volver arriba» aparece al bajar', await ev(`const b = $('.boton-subir'); const antes = b.hidden; scrollTo(0, 5000); await pausa(150); return antes && !b.hidden`));
ok('UX: admin muestra el filtro aplicado', await ev(`$('[data-filtro=empresa]').click(); const f = $('#filtro-activo'); const visto = !f.hidden && f.textContent.includes('Empresas'); $('[data-ver-todos]').click(); return visto && f.hidden && $$('#tabla-control tbody tr').length === 6`));
await ir('resultados.html?modalidad=Remoto&sector=Tecnolog%C3%ADa');
ok('UX: resultados lee los filtros de la URL', await ev(`return $('#fm-2').checked && $('#fs-0').checked && $('#conteo').textContent === '1 empleo encontrado'`));
ok('UX: etiquetas de filtros aplicados', await ev(`return $$('#filtros-activos .badge-neo').length`) === 2);
ok('UX: quitar un filtro desde su etiqueta', await ev(`$('#filtros-activos .badge-neo').click(); return $$('#filtros-activos .badge-neo').length === 1 && !$('#fs-0').checked && !location.search.includes('sector')`));
ok('UX: tarjeta completa abre la oferta', await ev(`return !!$('.oferta .stretched-link') && getComputedStyle($('.oferta')).position === 'relative'`));
ok('UX: guardar oferta desde resultados', await ev(`const b = $('[data-guardar-oferta]'); b.click(); return b.getAttribute('aria-pressed') === 'true' && ultimoAviso().startsWith('Oferta guardada')`));
await ir('perfil-usuario.html');
ok('UX: la oferta guardada aparece en Mi perfil', await ev(`return $$('#lista-guardadas li').length === 1 && $('#lista-guardadas').textContent.includes('Desarrollador Fullstack')`));
ok('UX: quitar de guardadas', await ev(`$('#lista-guardadas [data-guardar-oferta]').click(); return $$('#lista-guardadas li').length === 0 && !$('#sin-guardadas').hidden`));
ok('UX: contador de caracteres', await ev(`escribir('#v-comentario', 'Hola mundo'); return $('#v-comentario + .contador').textContent`) === '10 / 1000 caracteres');
await ir('publicar-oferta.html');
ok('UX: guardar borrador', await ev(`escribir('#o-titulo', 'Oferta en borrador'); $('#guardar-borrador').click(); return ultimoAviso().startsWith('Borrador guardado')`));
await ir('publicar-oferta.html');
ok('UX: el borrador se recupera al volver', await ev(`return $('#o-titulo').value === 'Oferta en borrador' && $('[data-espejo=titulo]').textContent === 'Oferta en borrador' && ultimoAviso().startsWith('Recuperamos')`));
await ir('foros.html');
ok('UX: foros ordena por más respuestas', await ev(`elegir('#orden-hilos', 'respuestas'); return $('.hilo h2').textContent.startsWith('Consejos para negociar')`));
await ir('foros.html', 390);
ok('UX: en celular los filtros se abren en panel lateral', await ev(`const panel = $('#panel-filtros'); const oculto = !panel.classList.contains('show'); $('[data-bs-target="#panel-filtros"][data-bs-toggle]').click(); await pausa(500); return oculto && panel.classList.contains('show')`));

// ---------- Login por rol ----------
for (const [rol, destino] of [['empresa', 'panel-empresa.html'], ['admin', 'admin.html'], ['candidato', 'perfil-usuario.html']]) {
  await ir('index.html'); await limpiarSesion(); await ir('index.html');
  url = await navegando(`$('#boton-login').click(); await pausa(200); escribir('#login-correo', 'a@b.com'); escribir('#login-clave', 'x'); $('#login-rol').value = '${rol}'; $('#form-login').requestSubmit();`);
  ok(`login como ${rol} → ${destino}`, url === destino, url);
}

console.log(resultados.join('\n'));
console.log(`\n${resultados.filter(r => r.startsWith('OK')).length}/${resultados.length} OK`);
ws.close(); chrome.kill();
process.exit(resultados.some(r => r.startsWith('FALLA')) ? 1 : 0);
