const filtros = document.getElementById('filtros');
const campoQ = document.getElementById('r-q');
const campoUbicacion = document.getElementById('r-ubicacion');
const campoOrden = document.getElementById('r-orden');
const GRUPOS = ['experiencia', 'sector', 'contrato', 'modalidad'];
const marcados = nombre => [...filtros.querySelectorAll(`[name="${nombre}"]:checked`)].map(c => c.value);
const enUrl = new URLSearchParams(location.search);
campoQ.value = enUrl.get('q') ?? '';
campoUbicacion.value = enUrl.get('ubicacion') ?? '';
filtros.salario.value = enUrl.get('salario') ?? '';
campoOrden.value = enUrl.get('orden') ?? 'fecha';
for (const nombre of GRUPOS) {
  const valores = enUrl.getAll(nombre);
  filtros.querySelectorAll(`[name="${nombre}"]`).forEach(c => c.checked = valores.includes(c.value));
}

function guardarEnUrl() {
  const p = new URLSearchParams();
  if (campoQ.value.trim()) p.set('q', campoQ.value.trim());
  if (campoUbicacion.value) p.set('ubicacion', campoUbicacion.value);
  GRUPOS.forEach(nombre => marcados(nombre).forEach(v => p.append(nombre, v)));
  if (filtros.salario.value) p.set('salario', filtros.salario.value);
  if (campoOrden.value !== 'fecha') p.set('orden', campoOrden.value);
  history.replaceState(null, '', `${location.pathname}${p.size ? '?' + p : ''}`);
}

function pintarFiltrosActivos() {
  const activos = [];
  if (campoQ.value.trim()) activos.push([`“${campoQ.value.trim()}”`, () => { campoQ.value = ''; }]);
  if (campoUbicacion.value) activos.push([campoUbicacion.value, () => { campoUbicacion.value = ''; }]);
  for (const nombre of GRUPOS) filtros.querySelectorAll(`[name="${nombre}"]:checked`).forEach(c => activos.push([c.value, () => { c.checked = false; }]));
  if (filtros.salario.value) activos.push([filtros.salario.selectedOptions[0].text, () => { filtros.salario.value = ''; }]);
  const zona = document.getElementById('filtros-activos');
  if (zona) {
    zona.replaceChildren(...activos.map(([texto, quitar]) => {
      const chip = document.createElement('button');
      chip.type = 'button'; chip.className = 'badge-neo badge-neo-ocean';
      chip.setAttribute('aria-label', `Quitar filtro ${texto}`);
      chip.innerHTML = `${esc(texto)} <i class="bi bi-x-lg" aria-hidden="true"></i>`;
      chip.addEventListener('click', () => { quitar(); cargar(); });
      return chip;
    }));
    if (activos.length > 1) zona.insertAdjacentHTML('beforeend', '<button type="button" class="btn btn-link btn-sm p-0 shadow-none border-0" data-limpiar-todo>Quitar todos</button>');
  }
  const contador = document.getElementById('num-filtros');
  if (contador) {
    const total = GRUPOS.reduce((n, g) => n + marcados(g).length, 0) + (filtros.salario.value ? 1 : 0);
    contador.hidden = total === 0; contador.textContent = total;
  }
}

const fechaCorta = valor => valor ? new Date(valor).toLocaleDateString('es-SV') : 'Fecha no disponible';
const dinero = valor => valor == null ? 'A convenir' : `$${Number(valor).toLocaleString('en-US')}`;
const salario = o => o.salarioMin != null && o.salarioMax != null
  ? `${dinero(o.salarioMin)} – ${dinero(o.salarioMax)}` : o.salarioMax != null ? `Hasta ${dinero(o.salarioMax)}` : o.salarioMin != null ? `Desde ${dinero(o.salarioMin)}` : 'Salario a convenir';
let solicitud = 0;
async function cargar() {
  const actual = ++solicitud;
  const params = new URLSearchParams();
  if (campoQ.value.trim()) params.set('q', campoQ.value.trim());
  if (campoUbicacion.value) params.set('ubicacion', campoUbicacion.value);
  GRUPOS.forEach(g => marcados(g).forEach(valor => params.append(g, valor)));
  if (filtros.salario.value) params.set('salario', filtros.salario.value);
  if (campoOrden.value !== 'fecha') params.set('orden', campoOrden.value);
  guardarEnUrl(); pintarFiltrosActivos();
  try {
    const { data } = await apiRequest(`/ofertas?${params}`);
    if (actual !== solicitud) return;
    const ofertas = data.ofertas;
    document.getElementById('conteo').textContent = `${data.total} ${data.total === 1 ? 'empleo encontrado' : 'empleos encontrados'}`;
    document.getElementById('sin-ofertas').hidden = ofertas.length > 0;
    document.getElementById('lista-ofertas').innerHTML = ofertas.map(o => `
      <article class="neo-card p-3 oferta tarjeta-accion">
        <div class="d-flex flex-wrap justify-content-between gap-2">
          <div><h2 class="h5 mb-1"><a class="text-reset stretched-link" href="detalle-oferta.html?id=${o.id}">${esc(o.titulo)}</a></h2>
            <p class="text-secondary mb-2"><i class="bi bi-building me-1" aria-hidden="true"></i>${esc(o.empresa)} · <i class="bi bi-geo-alt me-1" aria-hidden="true"></i>${esc(o.ubicacion || 'Ubicación no especificada')}</p></div>
          <div class="d-flex align-items-start gap-2"><span class="small text-secondary">Publicado: ${fechaCorta(o.publicadaEn)}</span>
            <button type="button" class="btn btn-neo-secondary btn-sm sobre-enlace" data-guardar-oferta="${o.id}" data-solo-icono aria-label="Guardar oferta ${esc(o.titulo)}"></button></div>
        </div>
        <div class="d-flex flex-wrap align-items-center gap-2">
          ${o.modalidad ? `<span class="badge-neo badge-neo-community">${esc(o.modalidad)}</span>` : ''}
          ${o.contrato ? `<span class="badge-neo badge-neo-neutral">${esc(o.contrato)}</span>` : ''}
          ${o.experiencia ? `<span class="badge-neo badge-neo-warning">${esc(o.experiencia)}</span>` : ''}
          ${o.sector ? `<span class="badge-neo badge-neo-ocean">${esc(o.sector)}</span>` : ''}
          <span class="fw-bold text-mar ms-md-auto">${esc(salario(o))}</span>
          <span class="btn btn-neo-primary btn-sm" aria-hidden="true">Ver oferta</span>
        </div></article>`).join('');
    marcarGuardadas();
  } catch (error) {
    if (actual !== solicitud) return;
    document.getElementById('lista-ofertas').replaceChildren();
    document.getElementById('conteo').textContent = 'No se pudieron cargar las ofertas.';
    document.getElementById('sin-ofertas').hidden = false;
    notificar(error.message, 'error');
  }
}

let temporizador;
const programar = () => { clearTimeout(temporizador); temporizador = setTimeout(cargar, 250); };
document.getElementById('form-busqueda').addEventListener('submit', evento => { evento.preventDefault(); cargar(); });
[filtros, campoQ, campoUbicacion, campoOrden].forEach(control => control.addEventListener('input', programar));
filtros.addEventListener('reset', () => setTimeout(cargar));
document.addEventListener('click', evento => {
  if (!evento.target.closest('[data-limpiar-todo]')) return;
  campoQ.value = ''; campoUbicacion.value = ''; filtros.reset();
});
cargar();
