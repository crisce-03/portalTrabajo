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

    // Las solicitudes y ofertas guardadas pertenecen a la cuenta y se cargan desde la API.
    async function cargarPostulaciones() {
      const { data } = await apiRequest('/candidatos/me/postulaciones');
      const solicitudes = data.postulaciones;
      document.getElementById('tabla-solicitudes').innerHTML = solicitudes.map(s => `
        <tr>
          <td><a class="fw-bold" href="detalle-oferta.html?id=${s.ofertaId}">${esc(s.titulo)}</a></td>
          <td>${esc(s.empresa)}</td>
          <td>${formatoFecha(String(s.fecha).slice(0, 10))}</td>
          <td>${insigniaEstado(s.estado)}</td>
          <td><div class="d-flex flex-column align-items-start gap-1">
            <label class="btn btn-neo-secondary btn-sm" for="cv-postulacion-${s.id}">${s.tieneCv ? 'Cambiar CV' : 'Cargar CV'}</label>
            <input id="cv-postulacion-${s.id}" class="visually-hidden" type="file" accept=".pdf,.docx" data-cv-postulacion="${s.id}" aria-label="${s.tieneCv ? 'Cambiar' : 'Cargar'} CV para ${esc(s.titulo)}">
            <span class="small text-secondary">${esc(s.cvNombre || 'Sin CV')}</span>
          </div></td>
        </tr>`).join('') || '<tr><td colspan="5" class="text-secondary">Aún no has enviado postulaciones.</td></tr>';
    }
    cargarPostulaciones().catch(avisarError);

    document.getElementById('tabla-solicitudes').addEventListener('change', async evento => {
      const input = evento.target.closest('[data-cv-postulacion]');
      const archivo = input?.files[0];
      if (!archivo) return;
      const extension = archivo.name.slice(archivo.name.lastIndexOf('.')).toLowerCase();
      if (!['.pdf', '.docx'].includes(extension) || archivo.size > 5 * 1024 * 1024) {
        input.value = '';
        notificar(archivo.size > 5 * 1024 * 1024 ? 'El CV supera 5 MB.' : 'El CV debe ser PDF o DOCX.', 'error');
        return;
      }
      input.disabled = true;
      const datos = new FormData(); datos.set('cv', archivo);
      try {
        const { message } = await apiRequest(`/candidatos/me/postulaciones/${input.dataset.cvPostulacion}/cv`, { method: 'PUT', body: datos });
        notificar(message);
        await cargarPostulaciones();
      } catch (error) {
        input.value = '';
        input.disabled = false;
        avisarError(error);
      }
    });

    apiRequest('/candidatos/me/guardadas').then(({ data }) => {
      const lista = document.getElementById('lista-guardadas');
      lista.innerHTML = data.ofertas.map(o => `
        <article class="neo-subbox p-3 d-flex flex-wrap align-items-center justify-content-between gap-2" data-oferta-guardada="${o.id}">
          <div><a class="fw-bold" href="detalle-oferta.html?id=${o.id}">${esc(o.titulo)}</a><div class="small text-secondary">${esc(o.empresa)} · ${esc(o.ubicacion || 'Ubicación no especificada')}</div></div>
          <div class="d-flex align-items-center gap-2"><span class="small fw-bold text-mar">${esc(o.salarioMin != null && o.salarioMax != null ? `$${o.salarioMin} – $${o.salarioMax}` : 'Salario a convenir')}</span>
            <button type="button" class="btn btn-neo-secondary btn-sm" data-guardar-oferta="${o.id}">Quitar</button></div>
        </article>`).join('');
      document.getElementById('sin-guardadas').hidden = data.ofertas.length > 0;
      marcarGuardadas();
    }).catch(avisarError);

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
