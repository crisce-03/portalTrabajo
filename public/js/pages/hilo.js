const hilos = [...guardados('hilos').reverse(), ...HILOS];
    const hilo = hilos.find(h => h.id === Number(parametro('id'))) ?? hilos.find(h => h.id === 1);
    const claveRespuestas = `respuestas-${hilo.id}`;
    const respuestas = [...hilo.comentarios, ...guardados(claveRespuestas)];

    document.title = `${hilo.titulo} · PortalTrabajo`;
    document.getElementById('h-etiquetas').innerHTML = hilo.etiquetas
      .map(([color, icono, texto]) => `<span class="badge-neo badge-neo-${color}"><i class="bi bi-${icono}" aria-hidden="true"></i> ${esc(texto)}</span>`).join('');
    document.getElementById('h-titulo').textContent = hilo.titulo;
    document.getElementById('h-autor').textContent = `Publicado por ${hilo.autor} (${hilo.cargo}) · ${hilo.fecha}`;
    document.getElementById('h-contenido').textContent = hilo.contenido;
    document.getElementById('otros-hilos').innerHTML = hilos.filter(h => h.id !== hilo.id).slice(0, 3)
      .map(h => `<li><a href="hilo.html?id=${h.id}">${esc(h.titulo)}</a></li>`).join('');

    function pintarRespuestas() {
      // el contador del foro incluye respuestas que no se cargan aquí; se suman las nuevas
      const total = hilo.respuestas + guardados(claveRespuestas).length;
      document.getElementById('t-respuestas').textContent = `${total} respuestas · mostrando ${respuestas.length}`;
      document.getElementById('lista-respuestas').innerHTML = respuestas.map(r => `
        <li class="neo-card-sm p-3">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-1">
            <span class="small"><strong>${esc(r.autor)}</strong> · ${esc(r.cargo)} · <span class="text-secondary">${esc(r.fecha)}</span></span>
            <button type="button" class="btn btn-neo-secondary btn-sm py-0" data-reportar><i class="bi bi-flag me-1" aria-hidden="true"></i>Reportar</button>
          </div>
          <p class="mb-0">${esc(r.texto)}</p>
        </li>`).join('') || '<li class="text-secondary">Todavía no hay respuestas. ¡Sé el primero en responder!</li>';
    }

    // shortcut: el reporte solo cambia el botón; con la API, hacer POST a la bandeja de moderación
    document.getElementById('lista-respuestas').addEventListener('click', evento => {
      const boton = evento.target.closest('[data-reportar]');
      if (!boton) return;
      boton.disabled = true;
      boton.innerHTML = '<i class="bi bi-flag-fill me-1" aria-hidden="true"></i>Reportada';
    });

    const formRespuesta = document.getElementById('form-respuesta');
    formRespuesta.addEventListener('enviado', () => {
      const nueva = { autor: 'Héctor García', cargo: 'Candidato', fecha: 'Ahora', texto: formRespuesta.texto.value.trim() };
      guardarEn(claveRespuestas, nueva);
      respuestas.push(nueva);
      formRespuesta.reset();
      pintarRespuestas();
      notificar('Respuesta publicada.');
      document.querySelector('#lista-respuestas li:last-child').scrollIntoView({ block: 'center' });
    });

    pintarRespuestas();
