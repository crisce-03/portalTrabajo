const campoBuscar = document.getElementById('v-buscar');
const campoOrden = document.getElementById('v-orden');
const lista = document.getElementById('lista-empresas');
let empresasValoradas = [];

function pintar() {
  const consulta = normalizar(campoBuscar.value);
  const empresas = empresasValoradas
    .filter(e => normalizar(`${e.nombre} ${e.sector} ${e.ubicacion ?? ''}`).includes(consulta))
    .sort((a, b) => (b[campoOrden.value] ?? 0) - (a[campoOrden.value] ?? 0));
  document.getElementById('sin-empresas').hidden = empresas.length > 0;
  lista.innerHTML = empresas.map(e => `
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
            <a class="btn btn-neo-primary btn-sm" href="perfil-usuario.html?empresa=${e.id}#valoraciones">Valorar</a>
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

// Reportar envía la reseña a la bandeja de moderación del administrador.
lista.addEventListener('click', async evento => {
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

[campoBuscar, campoOrden].forEach(control => control.addEventListener('input', pintar));
apiRequest('/valoraciones').then(({ data }) => {
  empresasValoradas = data;
  pintar();
  document.getElementById(location.hash.slice(1))?.scrollIntoView(); // la tarjeta se pinta después de cargar
}).catch(error => notificar(error.message, 'error'));
