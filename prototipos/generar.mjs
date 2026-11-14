// Genera las láminas de entrega a partir de las pantallas reales de public/:
//   salida/Prototipos-PortalTrabajo.pdf → PDF para la plataforma (portada, nomenclatura, justificación, mapa, flujo y una lámina por pantalla)
//   salida/laminas/*.png               → una imagen por lámina para arrastrar a FigJam
//   salida/laminas.html                → todas las láminas para importar a Figma (html.to.design) con capas editables
// Uso: npm run laminas  (necesita Google Chrome e internet para las fuentes y Mermaid; no necesita el servidor)
// Los textos de cada lámina están en contenido.json; los diagramas en mapa-del-sitio.mmd y flujo-de-navegacion.mmd.
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = dirname(fileURLToPath(import.meta.url));
const SALIDA = join(RAIZ, 'salida');
const PUBLICO = pathToFileURL(join(RAIZ, '..', 'public')).href + '/';
const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PUERTO = 9335;
const ANCHO_PANTALLA = 1280;
const contenido = JSON.parse(readFileSync(join(RAIZ, 'contenido.json'), 'utf8'));
const { pantallas } = contenido;

rmSync(SALIDA, { recursive: true, force: true });
mkdirSync(join(SALIDA, 'capturas'), { recursive: true });
mkdirSync(join(SALIDA, 'laminas'), { recursive: true });

// ---------- Chrome sin ventana, controlado por DevTools ----------
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars',
  `--remote-debugging-port=${PUERTO}`, `--user-data-dir=${join(tmpdir(), 'portal-laminas-chrome')}`, 'about:blank'], { stdio: 'ignore' });
const espera = ms => new Promise(r => setTimeout(r, ms));
let ws;
for (let i = 0; i < 240 && !ws; i++) {
  try {
    const pagina = (await (await fetch(`http://127.0.0.1:${PUERTO}/json/list`)).json()).find(t => t.type === 'page');
    ws = new WebSocket(pagina.webSocketDebuggerUrl);
  } catch { await espera(250); }
}
if (!ws) throw new Error(`No se pudo abrir Chrome en ${CHROME}. Indica otra ruta con la variable CHROME.`);
await new Promise(r => ws.addEventListener('open', r));

let id = 0;
const pendientes = new Map();
const oyentes = [];
ws.addEventListener('message', ({ data }) => {
  const m = JSON.parse(data);
  if (m.id && pendientes.has(m.id)) { pendientes.get(m.id)(m); pendientes.delete(m.id); } else oyentes.forEach(f => f(m));
});
const cdp = (method, params = {}) => new Promise((resolver, rechazar) => {
  const n = ++id;
  pendientes.set(n, m => m.error ? rechazar(new Error(`${method}: ${m.error.message}`)) : resolver(m.result));
  ws.send(JSON.stringify({ id: n, method, params }));
});
const evento = nombre => new Promise(r => {
  const f = m => { if (m.method === nombre) { oyentes.splice(oyentes.indexOf(f), 1); r(m); } };
  oyentes.push(f);
});
const ev = async expresion => {
  const r = await cdp('Runtime.evaluate', { expression: expresion, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
  return r.result.value;
};
const metricas = (width, height, deviceScaleFactor = 1) =>
  cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor, mobile: false });
async function ir(url) {
  const carga = evento('Page.loadEventFired');
  await cdp('Page.navigate', { url });
  await carga;
  await ev('document.fonts.ready.then(() => true)');
}
await cdp('Page.enable');
await cdp('Runtime.enable');

// ---------- 1. Captura de cada pantalla y posición de las zonas que explica cada cuadrito ----------
const capturas = [];
for (const p of pantallas) {
  await metricas(ANCHO_PANTALLA, 900, 1.5);
  await ir(PUBLICO + p.archivo);
  await ev(`sessionStorage.clear(); ${p.sesion ? `sessionStorage.setItem('usuario', '${p.sesion}');` : ''} true`);
  await ir(PUBLICO + p.archivo); // de nuevo, ya con la sesión que corresponde a la pantalla
  if (p.preparar) { await ev(p.preparar); await espera(400); }
  const alto = await ev('document.documentElement.scrollHeight');
  await metricas(ANCHO_PANTALLA, alto, 1.5);
  await espera(300);
  const anclas = await ev(`${JSON.stringify(p.callouts.map(c => c.ancla))}.map(selector => {
    const e = document.querySelector(selector);
    if (!e) return null;
    const r = e.getBoundingClientRect();
    return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height };
  })`);
  const faltan = p.callouts.filter((c, i) => !anclas[i]).map(c => c.ancla);
  if (faltan.length) throw new Error(`${p.id}: no encontré en la pantalla ${faltan.join(', ')}`);
  const { data } = await cdp('Page.captureScreenshot', { format: 'jpeg', quality: 92 });
  writeFileSync(join(SALIDA, 'capturas', `${p.id}.jpg`), Buffer.from(data, 'base64'));
  capturas.push({ ancho: ANCHO_PANTALLA, alto, anclas });
  console.log(`Capturada ${p.id}`);
}

// ---------- 2. Láminas en HTML ----------
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const total = 5 + pantallas.length;
const cabeza = (codigo, titulo, derecha = '') => `
  <header class="cabeza">
    <div class="cabeza-izq">${codigo ? `<span class="codigo">${esc(codigo)}</span>` : ''}<h2>${esc(titulo)}</h2></div>
    <div class="cabeza-der">${derecha}</div>
  </header>`;
const pie = (n, texto) => `<footer class="pie">${texto}<span class="pagina">Página ${n} de ${total}</span></footer>`;
const { portada } = contenido;

const laminas = [];
laminas.push(`
  <section class="lamina portada" data-nombre="portada">
    <div class="portada-caja">
      <p class="marca"><span class="logo">▣</span> PortalTrabajo</p>
      <h1>${esc(portada.titulo)}</h1>
      <p class="sub">${esc(portada.subtitulo)}</p>
      <p>${esc(portada.materia)}<br>${esc(portada.facultad)}<br>Docente: ${esc(portada.docente)}</p>
      <p><b>Integrantes:</b> ${portada.integrantes.map(esc).join(' · ')}</p>
      <p class="fecha">${esc(portada.fecha)}</p>
    </div>
    <div class="miniaturas">
      ${['MOD-01-HOME', 'MOD-02-FORUM', 'MOD-04-ADMIN-DASH'].map(c => `<img src="capturas/${c}.jpg" alt="Pantalla ${c}">`).join('')}
    </div>
    <span class="pagina pagina-portada">Página 1 de ${total}</span>
  </section>`);

laminas.push(`
  <section class="lamina" data-nombre="nomenclatura">
    ${cabeza('', 'Nomenclatura uniforme de pantallas', '<span>Formato <b>MOD-&lt;módulo&gt;-&lt;NOMBRE&gt;</b> · ordenadas por módulo</span>')}
    <div class="cuerpo texto">
      <table class="tabla">
        <thead><tr><th>Nomenclatura</th><th>Pantalla</th><th>Tipo de usuario</th><th>Módulo</th><th>Archivo</th><th>Página</th></tr></thead>
        <tbody>${pantallas.map((p, i) => `<tr><td class="mono">${p.id}</td><td>${esc(p.titulo)}</td><td>${esc(p.tipoUsuario)}</td><td>${esc(contenido.modulos[p.modulo])}</td><td class="mono">${esc(p.archivo.split('?')[0])}</td><td>${6 + i}</td></tr>`).join('')}</tbody>
      </table>
    </div>
    ${pie(2, '<p>Cada pantalla se identifica con su módulo y un nombre corto en inglés; el mismo código aparece en el encabezado de su lámina, en el mapa del sitio y en el flujo de navegación.</p>')}
  </section>`);

const COLORES = [['#0369A1', 'Azul mar', 'Acciones principales'], ['#1E3A8A', 'Marino', 'Comunidad y foros'], ['#0F766E', 'Verde mar', 'Estados activos y salarios'],
  ['#D97706', 'Ámbar', 'Calificaciones'], ['#B91C1C', 'Rojo', 'Moderación y acciones destructivas'], ['#1E293B', 'Tinta', 'Texto, bordes y sombras'], ['#FAF8F5', 'Papel', 'Fondo general']];
laminas.push(`
  <section class="lamina" data-nombre="justificacion">
    ${cabeza('', 'Justificación del diseño y tipos de usuario')}
    <div class="cuerpo texto columnas">
      <div>
        <h3>Justificación breve del diseño</h3>
        <p class="grande">${esc(contenido.justificacion)}</p>
        <h3>Paleta «Azul Mar»</h3>
        <div class="muestras">${COLORES.map(([c, n, u]) => `<div><span style="background:${c}"></span><b>${n}</b> ${c}<br><small>${u}</small></div>`).join('')}</div>
        <h3>Tipografía</h3>
        <p><span style="font:700 26px Inter">Inter — títulos</span> &nbsp; <span style="font:400 22px Roboto">Roboto — textos y formularios</span></p>
      </div>
      <div>
        <h3>Tipos de usuario</h3>
        <div class="usuario"><b>Visitante</b> Busca empleo, consulta ofertas, recursos y valoraciones; puede registrarse o iniciar sesión.</div>
        <div class="usuario"><b>Candidato registrado</b> Se postula a ofertas, gestiona su perfil, CV y alertas, participa en los foros y valora empresas.</div>
        <div class="usuario"><b>Empresa / Empleador</b> Publica ofertas, mantiene los datos de la empresa y revisa postulaciones y perfiles.</div>
        <div class="usuario"><b>Administrador</b> Acceso exclusivo a la consola: gestiona usuarios, empresas y vacantes, modera contenido y configura el sistema.</div>
      </div>
    </div>
    ${pie(3, '<p>El sitio se construyó con HTML, CSS y JavaScript sobre Bootstrap 5.3, con un solo archivo de estilos y una barra de navegación compartida por todas las pantallas.</p>')}
  </section>`);

const diagrama = (n, nombre, titulo, archivo, nota) => `
  <section class="lamina" data-nombre="${nombre}">
    ${cabeza('', titulo, '<span><i class="leyenda" style="background:#FEF3C7;border-color:#D97706"></i> Pantallas de Héctor</span>')}
    <div class="cuerpo"><pre class="mermaid diagrama">${esc(readFileSync(join(RAIZ, archivo), 'utf8'))}</pre></div>
    ${pie(n, `<p>${nota}</p>`)}
  </section>`;
laminas.push(diagrama(4, 'mapa-del-sitio', 'Mapa del sitio', 'mapa-del-sitio.mmd',
  'Las pantallas se agrupan en cuatro módulos. Desde el Inicio se llega a todas las secciones de la barra de navegación; el panel administrativo solo es accesible para administradores.'));
laminas.push(diagrama(5, 'flujo-de-navegacion', 'Flujo de navegación', 'flujo-de-navegacion.mmd',
  'Recorrido por tipo de usuario. Para postularse se exige sesión de candidato; al iniciar sesión, cada rol llega a su propio panel.'));

pantallas.forEach((p, i) => laminas.push(`
  <section class="lamina" data-nombre="${p.id}" data-pantalla="${i}">
    ${cabeza(p.id, p.titulo, `<span><b>Tipo de usuario:</b> ${esc(p.tipoUsuario)}</span><span><b>Módulo:</b> ${esc(contenido.modulos[p.modulo])}</span>`)}
    <div class="cuerpo">
      <div class="pantalla"><img src="capturas/${p.id}.jpg" alt="Pantalla ${p.id}"></div>
      ${p.callouts.map((c, j) => `<div class="cuadrito ${c.lado}" data-i="${j}"><b>${esc(c.titulo)}</b>${esc(c.texto)}</div>`).join('')}
      <svg class="conectores" aria-hidden="true"></svg>
      <script type="application/json" class="anclas">${JSON.stringify(capturas[i])}</script>
    </div>
    ${pie(6 + i, `<p><b>Objetivo de la pantalla:</b> ${esc(p.objetivo)}</p><p><b>Justificación del diseño:</b> ${esc(p.justificacion)}</p>`)}
  </section>`));

writeFileSync(join(SALIDA, 'laminas.html'), `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Prototipos · Portal de Trabajo</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@600;700&family=Roboto:wght@400;500;700&family=JetBrains+Mono:wght@600&display=swap" rel="stylesheet">
<style>
  @page { size: 1800px 1200px; margin: 0; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #94A3B8; font-family: Roboto, sans-serif; color: #1E293B; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .lamina { width: 1800px; height: 1200px; margin: 30px auto; position: relative; display: flex; flex-direction: column; background: #EEF2F6; overflow: hidden; break-after: page; }
  @media print { body { background: none; } .lamina { margin: 0; } }
  .cabeza { height: 88px; flex: none; background: #1E293B; color: #fff; display: flex; align-items: center; justify-content: space-between; padding: 0 40px; gap: 30px; }
  .cabeza-izq { display: flex; align-items: center; gap: 18px; }
  .cabeza h2 { font: 700 30px Inter, sans-serif; margin: 0; letter-spacing: -.015em; }
  .cabeza-der { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; font-size: 17px; text-align: right; }
  .codigo, .mono, .pagina { font-family: 'JetBrains Mono', monospace; font-weight: 600; }
  .codigo { background: #0DCAF0; color: #1E293B; font-size: 17px; padding: 6px 12px; border-radius: 6px; white-space: nowrap; }
  .cuerpo { position: relative; flex: 1; margin: 26px 0; min-height: 0; }
  .pantalla { position: absolute; left: 430px; right: 430px; top: 0; bottom: 0; display: flex; align-items: center; justify-content: center; }
  .pantalla img { max-width: 100%; max-height: 100%; border: 2px solid #1E293B; border-radius: 10px; box-shadow: 6px 6px 0 #1E293B; background: #FAF8F5; }
  .cuadrito { position: absolute; width: 370px; background: #F0F9FF; border: 2px solid #1E293B; border-radius: 8px; box-shadow: 4px 4px 0 #1E293B; padding: 14px 16px; font-size: 16px; line-height: 1.4; z-index: 2; }
  .cuadrito.izq { left: 36px; } .cuadrito.der { right: 36px; }
  .cuadrito b { display: block; font: 700 18px Inter, sans-serif; color: #0369A1; margin-bottom: 4px; }
  .conectores { position: absolute; left: 0; top: 0; overflow: visible; z-index: 1; }
  .pie { flex: none; min-height: 120px; background: #fff; border-top: 2px solid #1E293B; padding: 18px 40px; display: grid; grid-template-columns: 1fr 1fr auto; gap: 30px; font-size: 16px; line-height: 1.45; }
  .pie p { margin: 0; }
  .pie p:only-of-type { grid-column: span 2; }
  .pagina { align-self: end; background: #1E293B; color: #fff; font-size: 14px; padding: 4px 10px; border-radius: 6px; white-space: nowrap; }
  .texto { margin: 30px 60px; font-size: 18px; }
  .columnas { display: grid; grid-template-columns: 1.3fr 1fr; gap: 60px; }
  h3 { font: 700 24px Inter, sans-serif; margin: 0 0 12px; }
  .grande { font-size: 19px; line-height: 1.55; margin: 0 0 26px; }
  .muestras { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 26px; font-size: 15px; }
  .muestras span { display: block; height: 48px; border: 2px solid #1E293B; border-radius: 8px; box-shadow: 3px 3px 0 #1E293B; margin-bottom: 6px; }
  .usuario { background: #fff; border: 2px solid #1E293B; border-radius: 8px; box-shadow: 4px 4px 0 #1E293B; padding: 16px 18px; margin-bottom: 18px; line-height: 1.45; }
  .usuario b { display: block; font: 700 20px Inter, sans-serif; color: #0369A1; margin-bottom: 4px; }
  .tabla { width: 100%; border-collapse: collapse; background: #fff; border: 2px solid #1E293B; font-size: 15.5px; }
  .tabla th { background: #1E293B; color: #fff; text-align: left; padding: 9px 12px; font: 700 15px Inter, sans-serif; }
  .tabla td { padding: 7px 12px; border-bottom: 1px solid #CBD5E1; }
  .tabla tr:nth-child(even) td { background: #F8FAFC; }
  .diagrama { margin: 0 40px; height: 100%; display: flex; align-items: center; justify-content: center; background: #fff; border: 2px solid #1E293B; border-radius: 10px; box-shadow: 6px 6px 0 #1E293B; }
  .leyenda { display: inline-block; width: 22px; height: 16px; border: 2px solid; border-radius: 4px; vertical-align: middle; }
  .portada { background: #F0F9FF; align-items: center; justify-content: center; gap: 40px; }
  .portada-caja { background: #fff; border: 3px solid #1E293B; border-radius: 14px; box-shadow: 10px 10px 0 #1E293B; padding: 50px 70px; text-align: center; font-size: 22px; line-height: 1.5; max-width: 1300px; }
  .portada h1 { font: 700 72px Inter, sans-serif; margin: 10px 0; letter-spacing: -.02em; }
  .portada .sub { font: 600 30px Inter, sans-serif; color: #0369A1; margin: 0 0 20px; }
  .marca { font: 700 28px Inter, sans-serif; margin: 0; }
  .marca .logo { background: #0369A1; color: #fff; border: 2px solid #1E293B; border-radius: 8px; padding: 0 8px; }
  .fecha { color: #64748B; margin-bottom: 0; }
  .miniaturas { display: flex; gap: 30px; }
  .miniaturas img { width: 380px; height: 220px; object-fit: cover; object-position: top; border: 2px solid #1E293B; border-radius: 10px; box-shadow: 6px 6px 0 #1E293B; }
  .pagina-portada { position: absolute; right: 40px; bottom: 30px; }
</style>
</head>
<body>
${laminas.join('\n')}
<script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"></script>
<script>
  // Coloca los cuadritos a la altura de la zona que explican y dibuja la línea con el punto.
  function maquetar() {
    for (const lamina of document.querySelectorAll('.lamina[data-pantalla]')) {
      const cuerpo = lamina.querySelector('.cuerpo');
      const datos = JSON.parse(lamina.querySelector('.anclas').textContent);
      const rc = cuerpo.getBoundingClientRect();
      const ri = lamina.querySelector('.pantalla img').getBoundingClientRect();
      const escala = ri.width / datos.ancho;
      const svg = lamina.querySelector('.conectores');
      svg.setAttribute('width', rc.width);
      svg.setAttribute('height', rc.height);
      let trazos = '';
      for (const lado of ['izq', 'der']) {
        const items = [...lamina.querySelectorAll('.cuadrito.' + lado)].map(caja => {
          const a = datos.anclas[caja.dataset.i];
          return {
            caja, alto: caja.offsetHeight,
            x: ri.left - rc.left + (lado === 'izq' ? a.x + 8 : a.x + a.w - 8) * escala,
            y: ri.top - rc.top + (a.y + a.h / 2) * escala,
          };
        }).sort((p, q) => p.y - q.y);
        let minimo = 0;
        for (const it of items) { it.top = Math.max(it.y - it.alto / 2, minimo); minimo = it.top + it.alto + 16; }
        let maximo = rc.height;
        for (const it of [...items].reverse()) { it.top = Math.min(it.top, maximo - it.alto); maximo = it.top - 16; }
        for (const it of items) {
          it.caja.style.top = it.top + 'px';
          const borde = lado === 'izq' ? it.caja.offsetLeft + it.caja.offsetWidth : it.caja.offsetLeft;
          const salida = Math.min(Math.max(it.y, it.top + 18), it.top + it.alto - 18);
          const codo = lado === 'izq' ? borde + 12 : borde - 12;
          const puntos = salida === it.y ? [[borde, it.y], [it.x, it.y]] : [[borde, salida], [codo, salida], [codo, it.y], [it.x, it.y]];
          trazos += '<polyline points="' + puntos.map(p => p.join(',')).join(' ') + '" fill="none" stroke="#1E293B" stroke-width="2.5"/>'
            + '<circle cx="' + it.x + '" cy="' + it.y + '" r="7" fill="#0369A1" stroke="#1E293B" stroke-width="2"/>';
        }
      }
      svg.innerHTML = trazos;
    }
  }

  // Ajusta cada diagrama al espacio de su lámina
  function ajustarDiagramas() {
    for (const svg of document.querySelectorAll('.diagrama svg')) {
      const caja = svg.parentElement.getBoundingClientRect();
      const vb = svg.viewBox.baseVal;
      const k = Math.min((caja.width - 40) / vb.width, (caja.height - 40) / vb.height);
      svg.removeAttribute('style');
      svg.setAttribute('width', vb.width * k);
      svg.setAttribute('height', vb.height * k);
    }
  }

  (async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
    mermaid.initialize({
      startOnLoad: false, theme: "base",
      flowchart: { htmlLabels: false, curve: "basis", nodeSpacing: 28, rankSpacing: 60, padding: 12 },
      themeVariables: { fontFamily: "Inter, Roboto, sans-serif", fontSize: "18px", primaryColor: "#FFFFFF",
        primaryBorderColor: "#1E293B", primaryTextColor: "#1E293B", lineColor: "#1E293B" },
    });
    await mermaid.run({ querySelector: '.mermaid' });
    ajustarDiagramas();
    maquetar();
    window.laminasListas = true;
  })();
</script>
</body>
</html>
`);

// ---------- 3. PDF y una imagen por lámina ----------
await metricas(1860, 1200);
await ir(pathToFileURL(join(SALIDA, 'laminas.html')).href);
let listas = false;
for (let i = 0; i < 120 && !listas; i++) { listas = await ev('window.laminasListas === true'); if (!listas) await espera(500); }
if (!listas) throw new Error('Las láminas no terminaron de dibujarse: revisa la conexión a internet (fuentes y Mermaid).');

const posiciones = await ev(`[...document.querySelectorAll('.lamina')].map(l => {
  const r = l.getBoundingClientRect();
  return { nombre: l.dataset.nombre, x: r.left + scrollX, y: r.top + scrollY };
})`);
for (const [i, p] of posiciones.entries()) {
  const { data } = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true,
    clip: { x: p.x, y: p.y, width: 1800, height: 1200, scale: 1 } });
  writeFileSync(join(SALIDA, 'laminas', `${String(i + 1).padStart(2, '0')}-${p.nombre}.png`), Buffer.from(data, 'base64'));
}
const { data: pdf } = await cdp('Page.printToPDF', { preferCSSPageSize: true, printBackground: true });
writeFileSync(join(SALIDA, 'Prototipos-PortalTrabajo.pdf'), Buffer.from(pdf, 'base64'));

console.log(`\nListo: ${posiciones.length} láminas en ${SALIDA}`);
try { await cdp('Browser.close'); } catch { chrome.kill(); }
ws.close();
process.exit(0);
