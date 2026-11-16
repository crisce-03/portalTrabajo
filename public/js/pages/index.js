const numero = valor => Number(valor || 0).toLocaleString('es-SV');
const fechaOferta = fecha => fecha ? new Date(fecha).toLocaleDateString('es-SV') : 'Reciente';
const dinero = valor => valor == null ? null : `$${Number(valor).toLocaleString('en-US')}`;
const salarioOferta = oferta => oferta.salarioMin != null && oferta.salarioMax != null
  ? `${dinero(oferta.salarioMin)} – ${dinero(oferta.salarioMax)}`
  : oferta.salarioMax != null ? `Hasta ${dinero(oferta.salarioMax)}`
    : oferta.salarioMin != null ? `Desde ${dinero(oferta.salarioMin)}` : 'Salario a convenir';

async function cargarEstadisticas() {
  try {
    const { data } = await apiRequest('/estadisticas');
    document.getElementById('metrica-empresas').textContent = numero(data.empresas);
    document.getElementById('metrica-usuarios').textContent = numero(data.usuarios);
    document.getElementById('metrica-ofertas').textContent = numero(data.ofertas);
    document.getElementById('metrica-postulaciones').textContent = numero(data.postulacionesMes);
  } catch (error) { notificar(`No se pudieron cargar las estadísticas: ${error.message}`, 'error'); }
}

async function cargarOfertasRecientes() {
  const contenedor = document.getElementById('ofertas-recientes');
  try {
    const { data } = await apiRequest('/ofertas?limite=3');
    if (!data.ofertas.length) {
      contenedor.innerHTML = '<div class="col-12"><p class="neo-card p-4 text-secondary mb-0">Aún no hay ofertas activas. Vuelve pronto para ver nuevas oportunidades.</p></div>';
      return;
    }
    contenedor.innerHTML = data.ofertas.map(o => `
      <div class="col-md-4">
        <article class="neo-card p-3 h-100 d-flex flex-column tarjeta-accion">
          <div class="d-flex flex-wrap align-items-start gap-2 mb-2">
            ${o.modalidad ? `<span class="badge-neo badge-neo-neutral">${esc(o.modalidad)}</span>` : ''}
            ${o.sector ? `<span class="badge-neo badge-neo-ocean">${esc(o.sector)}</span>` : ''}
            <button type="button" class="btn btn-neo-secondary btn-sm ms-auto sobre-enlace" data-guardar-oferta="${o.id}" data-solo-icono aria-label="Guardar oferta ${esc(o.titulo)}"></button>
          </div>
          <h3 class="h6 mb-1"><a class="text-reset stretched-link" href="detalle-oferta.html?id=${o.id}">${esc(o.titulo)}</a></h3>
          <p class="small text-secondary mb-1">${esc(o.empresa)} · ${esc(o.ubicacion || 'Ubicación no especificada')}</p>
          <p class="small fw-bold text-mar mb-3">${esc(salarioOferta(o))}</p>
          <div class="d-flex justify-content-between align-items-center mt-auto">
            <span class="small text-secondary">Publicado: ${fechaOferta(o.publicadaEn)}</span>
            <span class="btn btn-neo-primary btn-sm" aria-hidden="true">Ver oferta</span>
          </div>
        </article>
      </div>`).join('');
    marcarGuardadas();
  } catch (error) {
    contenedor.innerHTML = '<div class="col-12"><p class="neo-card p-4 text-secondary mb-0">No se pudieron cargar las ofertas recientes.</p></div>';
    notificar(`No se pudieron cargar las ofertas: ${error.message}`, 'error');
  }
}

async function cargarEmpresasMejorValoradas() {
  const contenedor = document.getElementById('top-empresas');
  try {
    const { data } = await apiRequest('/valoraciones');
    const empresas = data.filter(e => Number(e.opiniones) > 0)
      .sort((a, b) => Number(b.promedio) - Number(a.promedio) || Number(b.opiniones) - Number(a.opiniones))
      .slice(0, 3);
    contenedor.innerHTML = empresas.map(e => `
      <li class="d-flex justify-content-between align-items-center gap-2">
        <div><a class="fw-bold" href="valoraciones.html#empresa-${e.id}">${esc(e.nombre)}</a><span class="subtitulo">${esc(e.sector || 'Empresa')}</span></div>
        <span class="small fw-bold text-nowrap valoracion-color"><i class="bi bi-star-fill" aria-hidden="true"></i> ${Number(e.promedio).toFixed(1)}</span>
      </li>`).join('') || '<li class="small text-secondary">Aún no hay empresas con valoraciones.</li>';
  } catch (error) { notificar(`No se pudieron cargar las empresas valoradas: ${error.message}`, 'error'); }
}

cargarEstadisticas();
cargarOfertasRecientes();
cargarEmpresasMejorValoradas();
