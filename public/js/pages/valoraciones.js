const campoBuscar = document.getElementById('v-buscar');
const campoOrden = document.getElementById('v-orden');
const campoSector = document.getElementById('v-sector');
const campoMinimo = document.getElementById('v-minimo');
const lista = document.getElementById('lista-empresas');
const SECTORES_OFERTA = ['Tecnología', 'Diseño', 'Administración y finanzas', 'Marketing', 'Otro'];
const POR_PAGINA = 6;
let empresasValoradas = [];
let pagina = 1;

function leerUrl() {
  const params = new URLSearchParams(location.search);
  campoBuscar.value = params.get('q') || '';
  campoOrden.value = ['promedio', 'opiniones'].includes(params.get('orden')) ? params.get('orden') : 'promedio';
  campoSector.value = params.get('sector') || '';
  campoMinimo.value = ['1', '2', '3', '4'].includes(params.get('min')) ? params.get('min') : '';
  pagina = Math.max(1, Number.parseInt(params.get('page') || '1', 10) || 1);
}

function guardarUrl({ historial = 'replace' } = {}) {
  const params = new URLSearchParams();
  if (campoBuscar.value.trim()) params.set('q', campoBuscar.value.trim());
  if (campoSector.value) params.set('sector', campoSector.value);
  if (campoMinimo.value) params.set('min', campoMinimo.value);
  if (campoOrden.value !== 'promedio') params.set('orden', campoOrden.value);
  if (pagina > 1) params.set('page', String(pagina));
  const url = `${location.pathname}${params.size ? `?${params}` : ''}${location.hash}`;
  history[historial === 'push' ? 'pushState' : 'replaceState']({}, '', url);
}

function empresasFiltradas() {
  const consulta = normalizar(campoBuscar.value);
  const sector = normalizar(campoSector.value);
  const minimo = Number(campoMinimo.value || 0);
  return empresasValoradas.filter(e =>
    normalizar(`${e.nombre} ${e.sector || ''} ${e.ubicacion || ''}`).includes(consulta)
    && (!sector || normalizar(e.sector || '') === sector)
    && (Number(e.promedio || 0) >= minimo))
    .sort((a, b) => (Number(b[campoOrden.value] || 0) - Number(a[campoOrden.value] || 0))
      || a.nombre.localeCompare(b.nombre, 'es'));
}

function pintar() {
  const empresas = empresasFiltradas();
  const paginas = Math.max(1, Math.ceil(empresas.length / POR_PAGINA));
  const paginaSolicitada = pagina;
  pagina = Math.min(pagina, paginas);
  if (pagina !== paginaSolicitada) guardarUrl();
  const desde = (pagina - 1) * POR_PAGINA;
  const visibles = empresas.slice(desde, desde + POR_PAGINA);
  document.getElementById('sin-empresas').hidden = empresas.length > 0;
  document.getElementById('paginacion').hidden = empresas.length <= POR_PAGINA;
  document.getElementById('pagina-info').textContent = empresas.length
    ? `Página ${pagina} de ${paginas} · ${empresas.length} empresas` : 'Sin resultados';
  document.getElementById('pagina-anterior').disabled = pagina <= 1;
  document.getElementById('pagina-siguiente').disabled = pagina >= paginas;
  lista.innerHTML = visibles.map(e => `
    <article id="empresa-${e.id}" class="neo-card p-4 empresa">
      <div class="row g-4">
        <div class="col-md-4">
          <h2 class="h5 mb-1"><i class="bi bi-building me-1" aria-hidden="true"></i>${esc(e.nombre)}</h2>
          <p class="small text-secondary mb-3">${esc([e.sector, e.ubicacion].filter(Boolean).join(' · '))}</p>
          <div class="neo-subbox p-3 mb-3 text-center">
            <span class="metrica">${e.promedio?.toFixed(1) ?? '—'}</span>
            <span class="d-block valoracion-color" aria-label="${e.promedio ?? 0} de 5 estrellas">${estrellas(e.promedio ?? 0)}</span>
            <span class="small text-secondary">${e.opiniones} opiniones</span>
          </div>
          <div class="d-flex flex-wrap gap-2">
            <button type="button" class="btn btn-neo-primary btn-sm" data-valorar="${e.id}" data-bs-toggle="modal" data-bs-target="#modal-valoracion">Valorar</button>
            <a class="btn btn-neo-secondary btn-sm" href="resultados.html?q=${encodeURIComponent(e.nombre)}">Ver ofertas</a>
          </div>
        </div>
        <div class="col-md-8">
          <h3 class="h6">Opiniones recientes</h3>
          ${e.resenas.length ? '' : '<p class="small text-secondary">Esta empresa todavía no tiene opiniones.</p>'}
          <ul class="list-unstyled d-grid gap-2 mb-0">
            ${e.resenas.slice(0, 3).map(r => `
              <li class="neo-subbox p-3">
                <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-1">
                  <span class="fw-bold small">${esc(r.autor)} <span class="ms-2 valoracion-color" aria-label="${r.calificacion} de 5">${estrellas(r.calificacion)}</span></span>
                  <button type="button" class="btn btn-neo-secondary btn-sm py-0" data-reportar="${r.id}"><i class="bi bi-flag me-1" aria-hidden="true"></i>Reportar</button>
                </div>
                <p class="small text-secondary mb-0">“${esc(r.texto)}”</p>
              </li>`).join('')}
          </ul>
        </div>
      </div>
    </article>`).join('');
}

function cambioFiltro() {
  pagina = 1;
  guardarUrl();
  pintar();
}

let temporizadorBusqueda;
campoBuscar.addEventListener('input', () => {
  clearTimeout(temporizadorBusqueda);
  temporizadorBusqueda = setTimeout(cambioFiltro, 250);
});
[campoSector, campoMinimo, campoOrden].forEach(control => control.addEventListener('change', cambioFiltro));
document.getElementById('pagina-anterior').addEventListener('click', () => {
  if (pagina <= 1) return;
  pagina -= 1; guardarUrl({ historial: 'push' }); pintar();
});
document.getElementById('pagina-siguiente').addEventListener('click', () => {
  if (pagina >= Math.ceil(empresasFiltradas().length / POR_PAGINA)) return;
  pagina += 1; guardarUrl({ historial: 'push' }); pintar();
});
addEventListener('popstate', () => { clearTimeout(temporizadorBusqueda); leerUrl(); pintar(); });

lista.addEventListener('click', async evento => {
  const valorar = evento.target.closest('[data-valorar]');
  if (valorar) document.getElementById('vm-empresa').value = valorar.dataset.valorar;
  const boton = evento.target.closest('[data-reportar]');
  if (!boton) return;
  boton.disabled = true;
  try {
    await apiRequest(`/valoraciones/${boton.dataset.reportar}/reportes`, { method: 'POST' });
    boton.innerHTML = '<i class="bi bi-flag-fill me-1" aria-hidden="true"></i>Reportada para moderación';
    notificar('Gracias. El equipo de moderación revisará la reseña.', 'info');
  } catch (error) {
    boton.disabled = false;
    notificar(error.message === 'No autenticado' ? 'Inicia sesión para reportar una reseña.' : error.message, 'error');
  }
});

const formValoracion = document.getElementById('form-valoracion-modal');
const iconosEstrella = [...formValoracion.querySelectorAll('.estrellas label i')];
const elegida = () => Number(formValoracion.querySelector('input[name="calificacion"]:checked')?.value || 0);
const llenarEstrellas = numero => iconosEstrella.forEach((icono, indice) => { icono.className = indice < numero ? 'bi bi-star-fill' : 'bi bi-star'; });
formValoracion.querySelectorAll('input[name="calificacion"]').forEach(radio => radio.addEventListener('change', () => llenarEstrellas(elegida())));
formValoracion.querySelectorAll('.estrellas label').forEach((label, indice) => {
  label.addEventListener('mouseenter', () => llenarEstrellas(indice + 1));
  label.addEventListener('mouseleave', () => llenarEstrellas(elegida()));
});
formValoracion.addEventListener('reset', () => setTimeout(() => llenarEstrellas(0)));
formValoracion.addEventListener('enviado', async () => {
  const boton = formValoracion.querySelector('[type="submit"]');
  boton.disabled = true;
  try {
    await apiRequest('/valoraciones', { method: 'POST', body: JSON.stringify({
      empresaId: formValoracion.elements.empresaId.value,
      calificacion: elegida(),
      comentario: formValoracion.elements.comentario.value.trim(),
    }) });
    formValoracion.reset();
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modal-valoracion')).hide();
    const { data } = await apiRequest('/valoraciones');
    empresasValoradas = data;
    llenarSectores();
    pintar();
    notificar('¡Gracias! Tu valoración fue enviada.');
  } catch (error) {
    const estado = formValoracion.querySelector('[role="status"]');
    estado.textContent = error.message === 'No autenticado' ? 'Inicia sesión con una cuenta de candidato para valorar.' : error.message;
  } finally { boton.disabled = false; }
});

function llenarSectores() {
  const seleccionado = campoSector.value;
  const sectores = [...new Set([...SECTORES_OFERTA, ...empresasValoradas.map(e => e.sector).filter(Boolean)])]
    .sort((a, b) => a.localeCompare(b, 'es'));
  campoSector.innerHTML = '<option value="">Todos</option>' + sectores.map(sector => `<option value="${esc(sector)}">${esc(sector)}</option>`).join('');
  campoSector.value = sectores.includes(seleccionado) ? seleccionado : '';
  document.getElementById('vm-empresa').innerHTML = '<option value="">Selecciona una empresa</option>'
    + empresasValoradas.map(e => `<option value="${e.id}">${esc(e.nombre)}</option>`).join('');
}

leerUrl();
apiRequest('/valoraciones').then(({ data }) => {
  empresasValoradas = data;
  llenarSectores();
  // Reaplica la opción de sector leída antes de cargar la lista de filtros.
  const sectorUrl = new URLSearchParams(location.search).get('sector');
  campoSector.value = sectorUrl && [...campoSector.options].some(o => o.value === sectorUrl) ? sectorUrl : '';
  if (location.hash.startsWith('#empresa-')) {
    const empresaId = location.hash.slice('#empresa-'.length);
    const posicion = empresasFiltradas().findIndex(e => String(e.id) === empresaId);
    if (posicion >= 0) { pagina = Math.floor(posicion / POR_PAGINA) + 1; guardarUrl(); }
  }
  pintar();
  if (location.hash.startsWith('#empresa-')) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  const empresaPreseleccionada = new URLSearchParams(location.search).get('empresa');
  if (empresaPreseleccionada && empresasValoradas.some(e => String(e.id) === empresaPreseleccionada)) {
    document.getElementById('vm-empresa').value = empresaPreseleccionada;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modal-valoracion')).show();
  }
}).catch(error => notificar(error.message, 'error'));
