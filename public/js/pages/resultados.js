// shortcut: filtra las ofertas de ejemplo en el navegador; con la API, enviar estos filtros como query (GET /api/ofertas?...)
    const filtros = document.getElementById('filtros');
    const campoQ = document.getElementById('r-q');
    const campoUbicacion = document.getElementById('r-ubicacion');
    const campoOrden = document.getElementById('r-orden');
    const GRUPOS = ['experiencia', 'sector', 'contrato', 'modalidad'];
    const marcados = nombre => [...filtros.querySelectorAll(`[name="${nombre}"]:checked`)].map(c => c.value);

    // La búsqueda vive en la URL: se puede compartir, guardar en favoritos y sobrevive al recargar
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

    // Etiquetas con los filtros aplicados; cada una se quita con un clic
    function pintarFiltrosActivos() {
      const activos = [];
      if (campoQ.value.trim()) activos.push([`“${campoQ.value.trim()}”`, () => { campoQ.value = ''; }]);
      if (campoUbicacion.value) activos.push([campoUbicacion.value, () => { campoUbicacion.value = ''; }]);
      for (const nombre of GRUPOS) {
        filtros.querySelectorAll(`[name="${nombre}"]:checked`).forEach(c => activos.push([c.value, () => { c.checked = false; }]));
      }
      if (filtros.salario.value) activos.push([filtros.salario.selectedOptions[0].text, () => { filtros.salario.value = ''; }]);
      const zona = document.getElementById('filtros-activos');
      zona.replaceChildren(...activos.map(([texto, quitar]) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'badge-neo badge-neo-ocean';
        chip.setAttribute('aria-label', `Quitar filtro ${texto}`);
        chip.innerHTML = `${esc(texto)} <i class="bi bi-x-lg" aria-hidden="true"></i>`;
        chip.addEventListener('click', () => { quitar(); pintar(); });
        return chip;
      }));
      if (activos.length > 1) {
        zona.insertAdjacentHTML('beforeend', '<button type="button" class="btn btn-link btn-sm p-0 shadow-none border-0" data-limpiar-todo>Quitar todos</button>');
      }
      const contador = document.getElementById('num-filtros');
      const enPanel = GRUPOS.reduce((n, g) => n + marcados(g).length, 0) + (filtros.salario.value ? 1 : 0);
      contador.hidden = enPanel === 0;
      contador.textContent = enPanel;
    }

    function pintar() {
      const consulta = normalizar(campoQ.value);
      const [experiencia, sector, contrato, modalidad] = GRUPOS.map(marcados);
      const minimo = Number(filtros.salario.value) || 0;
      const enGrupo = (lista, valor) => !lista.length || lista.includes(valor);
      const ofertas = OFERTAS.filter(o =>
        normalizar(`${o.titulo} ${o.empresa} ${o.sector}`).includes(consulta)
        && o.ubicacion.startsWith(campoUbicacion.value)
        && enGrupo(experiencia, o.experiencia) && enGrupo(sector, o.sector)
        && enGrupo(contrato, o.contrato) && enGrupo(modalidad, o.modalidad)
        && o.salarioMax >= minimo)
        .sort(campoOrden.value === 'salario'
          ? (a, b) => b.salarioMax - a.salarioMax
          : (a, b) => b.fecha.localeCompare(a.fecha));

      document.getElementById('conteo').textContent = `${ofertas.length} ${ofertas.length === 1 ? 'empleo encontrado' : 'empleos encontrados'}`;
      document.getElementById('sin-ofertas').hidden = ofertas.length > 0;
      document.getElementById('lista-ofertas').innerHTML = ofertas.map(o => `
        <article class="neo-card p-3 oferta tarjeta-accion">
          <div class="d-flex flex-wrap justify-content-between gap-2">
            <div>
              <h2 class="h5 mb-1"><a class="text-reset stretched-link" href="detalle-oferta.html?id=${o.id}">${esc(o.titulo)}</a></h2>
              <p class="text-secondary mb-2"><i class="bi bi-building me-1" aria-hidden="true"></i>${esc(o.empresa)} · <i class="bi bi-geo-alt me-1" aria-hidden="true"></i>${esc(o.ubicacion)}</p>
            </div>
            <div class="d-flex align-items-start gap-2">
              <span class="small text-secondary">Publicado: ${formatoFecha(o.fecha)}</span>
              <button type="button" class="btn btn-neo-secondary btn-sm sobre-enlace" data-guardar-oferta="${o.id}" data-solo-icono aria-label="Guardar oferta ${esc(o.titulo)}"></button>
            </div>
          </div>
          <div class="d-flex flex-wrap align-items-center gap-2">
            <span class="badge-neo badge-neo-community">${esc(o.modalidad)}</span>
            <span class="badge-neo badge-neo-neutral">${esc(o.contrato)}</span>
            <span class="badge-neo badge-neo-warning">${esc(o.experiencia)}</span>
            <span class="badge-neo badge-neo-ocean">${esc(o.sector)}</span>
            <span class="fw-bold text-mar ms-md-auto">${formatoSalario(o)}</span>
            <span class="btn btn-neo-primary btn-sm" aria-hidden="true">Ver oferta</span>
          </div>
        </article>`).join('');
      marcarGuardadas();
      pintarFiltrosActivos();
      guardarEnUrl();
    }

    document.getElementById('form-busqueda').addEventListener('submit', evento => { evento.preventDefault(); pintar(); });
    [filtros, campoQ, campoUbicacion, campoOrden].forEach(control => control.addEventListener('input', pintar));
    filtros.addEventListener('reset', () => setTimeout(pintar));
    document.addEventListener('click', evento => {
      if (!evento.target.closest('[data-limpiar-todo]')) return;
      campoQ.value = '';
      campoUbicacion.value = '';
      filtros.reset();
    });
    pintar();
