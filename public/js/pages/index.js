// Tres ofertas más recientes
    document.getElementById('ofertas-recientes').innerHTML = [...OFERTAS]
      .sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 3)
      .map(o => `
        <div class="col-md-4">
          <article class="neo-card p-3 h-100 d-flex flex-column tarjeta-accion">
            <div class="d-flex flex-wrap align-items-start gap-2 mb-2">
              <span class="badge-neo badge-neo-neutral">${esc(o.modalidad)}</span>
              <span class="badge-neo badge-neo-ocean">${esc(o.sector)}</span>
              <button type="button" class="btn btn-neo-secondary btn-sm ms-auto sobre-enlace" data-guardar-oferta="${o.id}" data-solo-icono aria-label="Guardar oferta ${esc(o.titulo)}"></button>
            </div>
            <h3 class="h6 mb-1"><a class="text-reset stretched-link" href="detalle-oferta.html?id=${o.id}">${esc(o.titulo)}</a></h3>
            <p class="small text-secondary mb-1">${esc(o.empresa)} · ${esc(o.ubicacion)}</p>
            <p class="small fw-bold text-mar mb-3">${formatoSalario(o)}</p>
            <div class="d-flex justify-content-between align-items-center mt-auto">
              <span class="small text-secondary">Publicado: ${formatoFecha(o.fecha)}</span>
              <span class="btn btn-neo-primary btn-sm" aria-hidden="true">Ver oferta</span>
            </div>
          </article>
        </div>`).join('');

    // Tres empresas con mejor promedio
    document.getElementById('top-empresas').innerHTML = [...EMPRESAS]
      .sort((a, b) => b.promedio - a.promedio).slice(0, 3)
      .map(e => `
        <li class="d-flex justify-content-between align-items-center gap-2">
          <div><a class="fw-bold" href="valoraciones.html#${e.id}">${esc(e.nombre)}</a><span class="subtitulo">${esc(e.sector)}</span></div>
          <span class="small fw-bold text-nowrap valoracion-color"><i class="bi bi-star-fill" aria-hidden="true"></i> ${e.promedio}</span>
        </li>`).join('');
