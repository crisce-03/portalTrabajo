const hilos = [...guardados('hilos').reverse(), ...HILOS];
    const buscador = document.getElementById('buscar-hilo');
    const formFiltros = document.getElementById('filtros-foro');
    const marcados = nombre => [...formFiltros.querySelectorAll(`[name="${nombre}"]:checked`)].map(c => c.value);

    const tarjetaHilo = h => `
      <article class="neo-card p-3 hilo tarjeta-accion" id="hilo-${h.id}">
        <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
          <div class="d-flex flex-wrap gap-2">
            ${h.etiquetas.map(([color, icono, texto]) => `<span class="badge-neo badge-neo-${color}"><i class="bi bi-${icono}" aria-hidden="true"></i> ${esc(texto)}</span>`).join('')}
          </div>
          <span class="small text-secondary">${esc(h.fecha)}</span>
        </div>
        <h2 class="h5 mb-1"><a class="text-reset stretched-link" href="hilo.html?id=${h.id}">${esc(h.titulo)}</a></h2>
        <p class="text-secondary mb-3">${esc(h.resumen)}</p>
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 pt-2 border-top">
          <span><i class="bi bi-person-badge text-ocean me-1" aria-hidden="true"></i>Publicado por: <strong>${esc(h.autor)} (${esc(h.cargo)})</strong></span>
          <div class="d-flex align-items-center gap-2">
            <span class="badge-neo badge-neo-neutral"><i class="bi bi-chat-left-text" aria-hidden="true"></i> ${h.respuestas} Respuestas</span>
            <a class="btn btn-neo-accent btn-sm sobre-enlace" data-visible-rol="candidato" href="hilo.html?id=${h.id}#responder">Responder Hilo</a>
            <a class="btn btn-neo-secondary btn-sm sobre-enlace" data-visible-rol="visitante" href="registro.html">Crea una cuenta para responder</a>
          </div>
        </div>
      </article>`;

    // shortcut: filtra los hilos cargados; con la API, pedir al servidor los hilos filtrados (GET /api/hilos?...)
    function pintar() {
      const consulta = normalizar(buscador.value);
      const sectores = marcados('sector');
      const tipos = marcados('tipo');
      const nivel = formFiltros.nivel.value;
      const soloSalarios = formFiltros.tema.checked;
      const visibles = hilos.filter(h =>
        normalizar(`${h.titulo} ${h.resumen} ${h.autor} ${h.cargo}`).includes(consulta)
        && (!sectores.length || sectores.includes(h.sector))
        && (!tipos.length || tipos.includes(h.tipo))
        && (!nivel || h.nivel === nivel)
        && (!soloSalarios || h.salarios));
      if (document.getElementById('orden-hilos').value === 'respuestas') visibles.sort((a, b) => b.respuestas - a.respuestas);
      document.getElementById('lista-hilos').innerHTML = visibles.map(tarjetaHilo).join('');
      document.getElementById('sin-hilos').hidden = visibles.length > 0;
      document.getElementById('conteo-hilos').textContent = `${visibles.length} ${visibles.length === 1 ? 'tema' : 'temas'}`;
    }

    // Publicar un tema nuevo: aparece primero en la lista
    const NOMBRES = {
      sector: { software: ['code-slash', 'Sector: Tecnología'], diseno: ['palette', 'Sector: Diseño'], finanzas: ['cash-stack', 'Sector: Administración'] },
      tipo: { remoto: ['wifi', 'Modalidad: Remoto'], completo: ['briefcase', 'Tiempo Completo'] },
      nivel: { junior: 'Nivel: Junior', senior: 'Nivel: Senior' },
    };
    const formTema = document.getElementById('form-tema');
    formTema.addEventListener('enviado', () => {
      const datos = Object.fromEntries(new FormData(formTema));
      const nuevo = {
        id: Date.now(), titulo: datos.titulo.trim(), contenido: datos.contenido.trim(),
        resumen: datos.contenido.trim().slice(0, 180), autor: 'Héctor García', cargo: 'Candidato', fecha: 'Ahora',
        respuestas: 0, sector: datos.sector, nivel: datos.nivel, tipo: datos.tipo, salarios: 'salarios' in datos,
        etiquetas: [['ocean', ...NOMBRES.sector[datos.sector]], ['community', ...NOMBRES.tipo[datos.tipo]], ['salary', 'mortarboard', NOMBRES.nivel[datos.nivel]]],
        comentarios: [],
      };
      guardarEn('hilos', nuevo);
      hilos.unshift(nuevo);
      formTema.reset();
      bootstrap.Modal.getInstance('#modal-tema').hide();
      formFiltros.reset();
      buscador.value = '';
      setTimeout(() => {
        pintar();
        notificar('Tema publicado. Ya aparece primero en la lista.');
        document.querySelector(`#hilo-${nuevo.id} a`)?.focus();
      });
    });

    buscador.addEventListener('input', pintar);
    document.getElementById('orden-hilos').addEventListener('input', pintar);
    formFiltros.addEventListener('input', pintar);
    formFiltros.addEventListener('reset', () => setTimeout(pintar));
    pintar();
