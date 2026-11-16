const avisarError = error => notificar(error.message, 'error');

    // Datos del candidato, CV y estadísticas
    const formPerfil = document.getElementById('form-perfil');
    function pintarPerfil(perfil) {
      ['nombre', 'apellidos', 'correo', 'telefono'].forEach(campo => formPerfil[campo].value = perfil[campo] ?? '');
      document.getElementById('p-nombre-completo').textContent = `${perfil.nombre} ${perfil.apellidos}`;
      document.getElementById('p-iniciales').textContent = (perfil.nombre[0] + perfil.apellidos[0]).toUpperCase();
      document.getElementById('cv-activo').hidden = !perfil.cvNombre;
      document.getElementById('p-cv-nombre').textContent = perfil.cvNombre ?? 'Cargar Currículum (PDF, DOCX)';
      document.getElementById('e-visitas').textContent = perfil.visitas.toLocaleString('en-US');
      document.getElementById('e-solicitudes').textContent = perfil.solicitudes.toLocaleString('en-US');
    }
    apiRequest('/candidatos/me').then(({ data }) => pintarPerfil(data)).catch(avisarError);
    formPerfil.addEventListener('enviado', async () => {
      try {
        const { data } = await apiRequest('/candidatos/me', { method: 'PUT', body: new FormData(formPerfil) });
        formPerfil.cv.value = '';
        pintarPerfil(data);
        notificar('Datos guardados.');
      } catch (error) { avisarError(error); }
    });

    // Solicitudes: las de ejemplo más las enviadas desde la postulación
    // shortcut: con la API, GET /api/candidatos/me/postulaciones
    const ESTADO_SOLICITUD = { recibida: ['Recibida', 'neutral'], ...ESTADOS };
    const solicitudes = [
      ...guardados('postulaciones').reverse().map(p => ({ oferta: p.oferta, fecha: p.fecha, estado: 'recibida' })),
      { oferta: 302, fecha: '2026-10-20', estado: 'revision' },
      { oferta: 318, fecha: '2026-10-15', estado: 'pendiente' },
      { oferta: 320, fecha: '2026-10-02', estado: 'contactado' },
    ];
    document.getElementById('tabla-solicitudes').innerHTML = solicitudes.map(s => {
      const o = OFERTAS.find(x => x.id === s.oferta);
      const [texto, color] = ESTADO_SOLICITUD[s.estado];
      return `<tr>
        <td><a class="fw-bold" href="detalle-oferta.html?id=${o.id}">${esc(o.titulo)}</a></td>
        <td>${esc(o.empresa)}</td>
        <td>${formatoFecha(s.fecha)}</td>
        <td><span class="badge-neo badge-neo-${color}">${texto}</span></td>
      </tr>`;
    }).join('');

    // Alertas: la apagada se ve en gris; las nuevas se agregan a la lista
    const listaAlertas = document.getElementById('lista-alertas');
    const filaAlerta = (id, texto) => `
      <div class="neo-subbox py-2 px-3 d-flex align-items-center justify-content-between alerta">
        <label class="form-check-label fw-medium" for="${id}"><i class="bi bi-bell-fill text-ocean me-1" aria-hidden="true"></i> ${esc(texto)}</label>
        <div class="form-check form-switch mb-0"><input class="form-check-input" type="checkbox" role="switch" id="${id}" checked></div>
      </div>`;
    const pintarEstado = (fila, activa) => {
      fila.classList.toggle('text-secondary', !activa);
      fila.querySelector('.bi').className = activa ? 'bi bi-bell-fill text-ocean me-1' : 'bi bi-bell me-1';
    };
    const agregarAlerta = alerta => {
      listaAlertas.insertAdjacentHTML('beforeend', filaAlerta(`a-${alerta.id}`, alerta.termino));
      const interruptor = document.getElementById(`a-${alerta.id}`);
      interruptor.dataset.alerta = alerta.id;
      interruptor.checked = alerta.activa;
      pintarEstado(interruptor.closest('.alerta'), alerta.activa);
    };
    apiRequest('/candidatos/me/alertas').then(({ data }) => data.forEach(agregarAlerta)).catch(avisarError);
    listaAlertas.addEventListener('change', async evento => {
      const interruptor = evento.target;
      try {
        await apiRequest(`/candidatos/me/alertas/${interruptor.dataset.alerta}`, { method: 'PATCH', body: JSON.stringify({ activa: interruptor.checked }) });
      } catch (error) {
        interruptor.checked = !interruptor.checked; // no se guardó: el interruptor vuelve a como estaba
        avisarError(error);
      }
      pintarEstado(interruptor.closest('.alerta'), interruptor.checked);
    });
    const formAlerta = document.getElementById('form-alerta');
    formAlerta.addEventListener('enviado', async () => {
      try {
        const { data } = await apiRequest('/candidatos/me/alertas', { method: 'POST', body: JSON.stringify({ termino: formAlerta.alerta.value }) });
        agregarAlerta(data);
        formAlerta.reset();
        notificar(`Alerta «${data.termino}» creada.`);
      } catch (error) { avisarError(error); }
    });

    // Valoraciones: empresas disponibles y la que venga en ?empresa=
    const selectEmpresa = document.getElementById('v-empresa');
    apiRequest('/valoraciones').then(({ data }) => {
      selectEmpresa.insertAdjacentHTML('beforeend', data.map(e => `<option value="${e.id}">${esc(e.nombre)}</option>`).join(''));
      selectEmpresa.value = parametro('empresa') ?? '';
      if (selectEmpresa.selectedIndex < 0) selectEmpresa.value = '';
    }).catch(avisarError);
    const formValoracion = document.getElementById('form-valoracion');
    formValoracion.addEventListener('enviado', async () => {
      try {
        await apiRequest('/valoraciones', { method: 'POST', body: JSON.stringify({
          empresaId: selectEmpresa.value, calificacion: formValoracion.calificacion.value, comentario: formValoracion.comentario.value,
        }) });
        formValoracion.reset();
        notificar('¡Gracias! Tu valoración fue enviada.');
      } catch (error) { avisarError(error); }
    });

    // Estrellas: se llenan hasta la elegida y muestran una vista previa al pasar el mouse
    const iconosEstrella = [...document.querySelectorAll('.estrellas label i')];
    const llenar = n => iconosEstrella.forEach((icono, i) => icono.className = i < n ? 'bi bi-star-fill' : 'bi bi-star');
    const elegida = () => Number(document.querySelector('input[name="calificacion"]:checked')?.value ?? 0);
    document.querySelectorAll('input[name="calificacion"]').forEach(radio => radio.addEventListener('change', () => llenar(elegida())));
    document.querySelectorAll('.estrellas label').forEach((label, i) => {
      label.addEventListener('mouseenter', () => llenar(i + 1));
      label.addEventListener('mouseleave', () => llenar(elegida()));
    });
    document.getElementById('form-valoracion').addEventListener('reset', () => setTimeout(() => llenar(0)));
