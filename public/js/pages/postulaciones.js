// Filtros de consulta: buscar por nombre o correo, filtrar por estado, ordenar por fecha y paginar.
    // shortcut: trabaja en el navegador; con la API, GET /api/ofertas/302/postulaciones?buscar=&estado=&orden=&pagina=
    const POR_PAGINA = 5;
    const buscar = document.getElementById('f-buscar');
    const estado = document.getElementById('f-estado');
    const orden = document.getElementById('f-orden');
    let pagina = 1;

    for (const clave of ['pendiente', 'revision', 'contactado']) {
      document.getElementById(`i-${clave}`).textContent = POSTULANTES.filter(p => p.estado === clave).length;
    }
    document.getElementById('i-total').textContent = POSTULANTES.length;

    function pintar() {
      const consulta = normalizar(buscar.value);
      const signo = orden.value === 'recientes' ? -1 : 1;
      const filtrados = POSTULANTES
        .filter(p => normalizar(`${p.nombre} ${p.correo}`).includes(consulta) && (!estado.value || p.estado === estado.value))
        .sort((a, b) => signo * a.fecha.localeCompare(b.fecha) || a.id - b.id);
      const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
      pagina = Math.min(pagina, paginas);
      const desde = (pagina - 1) * POR_PAGINA;
      const visibles = filtrados.slice(desde, desde + POR_PAGINA);

      document.getElementById('lista-postulantes').innerHTML = visibles.map(p => `
        <li class="neo-card-sm p-3 row g-2 align-items-center mx-0 postulante tarjeta-accion">
          <div class="col-md-4"><strong>${esc(p.nombre)}</strong><span class="subtitulo">${esc(p.cargo)} · ${esc(p.correo)}</span></div>
          <div class="col-6 col-md-2 small text-secondary">CV adjunto · PDF</div>
          <div class="col-6 col-md-2">${insigniaEstado(p.estado)}</div>
          <div class="col-6 col-md-2 small text-secondary">${formatoFecha(p.fecha)}</div>
          <div class="col-6 col-md-2 text-md-end"><a class="btn btn-neo-secondary btn-sm px-3 stretched-link" href="perfil-candidato.html?id=${p.id}" aria-label="Ver perfil de ${esc(p.nombre)}">Ver perfil</a></div>
        </li>`).join('');
      document.getElementById('sin-postulantes').hidden = filtrados.length > 0;
      document.getElementById('conteo').textContent = filtrados.length
        ? `Mostrando ${desde + 1}–${desde + visibles.length} de ${filtrados.length} postulaciones · Página ${pagina} de ${paginas}`
        : 'Mostrando 0 postulaciones';
      document.getElementById('anterior').disabled = pagina === 1;
      document.getElementById('siguiente').disabled = pagina === paginas;
    }

    [buscar, estado, orden].forEach(control => control.addEventListener('input', () => { pagina = 1; pintar(); }));
    document.getElementById('anterior').addEventListener('click', () => { pagina--; pintar(); });
    document.getElementById('siguiente').addEventListener('click', () => { pagina++; pintar(); });
    document.getElementById('filtros-postulantes').addEventListener('submit', evento => evento.preventDefault());
    pintar();
