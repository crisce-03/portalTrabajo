// shortcut: datos de ejemplo; con la API, GET /api/postulaciones/:id
    const candidato = POSTULANTES.find(p => p.id === Number(parametro('id'))) ?? POSTULANTES[0];
    const texto = (id, valor) => document.getElementById(id).textContent = valor;
    const archivo = `${candidato.nombre.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/ /g, '_')}_CV.pdf`;

    document.title = `${candidato.nombre} · Revisión de candidatura`;
    texto('c-nombre', candidato.nombre);
    texto('c-cargo', `${candidato.cargo} · ${candidato.ubicacion}, El Salvador`);
    texto('c-contacto', `${candidato.correo} · ${candidato.telefono}`);
    texto('c-fecha', `Postulación: ${formatoFecha(candidato.fecha)}`);
    texto('c-codigo', `Código: POST-${String(candidato.id).padStart(3, '0')}`);
    texto('c-resumen', candidato.resumen);
    document.getElementById('c-habilidades').innerHTML = candidato.habilidades.map(h => `<span class="badge-neo badge-neo-ocean">${esc(h)}</span>`).join('');
    document.getElementById('c-experiencia').innerHTML = candidato.experiencia.map(e => `<p class="small text-secondary mb-2">${esc(e)}</p>`).join('');
    texto('c-formacion', candidato.formacion);
    texto('c-mensaje', `Me entusiasma la oportunidad de integrarme al equipo de InnovaTech como Arquitecto de Software Cloud y aportar mi experiencia como ${candidato.cargo.toLowerCase()}.`);
    texto('c-archivo', archivo);
    document.getElementById('c-descargar').download = archivo;

    // Evaluar postulación: cambia el estado mostrado.
    // shortcut: no guarda; con la API, PUT /api/postulaciones/:id { estado } antes de pintarlo
    function pintarEstado() {
      const insignia = document.getElementById('estado-insignia');
      insignia.outerHTML = insigniaEstado(candidato.estado).replace('<span class="', '<span id="estado-insignia" class="mb-2 ');
      texto('estado-texto', ESTADOS[candidato.estado][0]);
    }
    document.querySelectorAll('[data-estado]').forEach(boton => boton.addEventListener('click', () => {
      candidato.estado = boton.dataset.estado;
      pintarEstado();
      notificar(`Postulación de ${candidato.nombre}: ${ESTADOS[candidato.estado][0].toLowerCase()}.`);
    }));
    pintarEstado();
