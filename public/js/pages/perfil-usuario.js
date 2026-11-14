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
    guardados('alertas').forEach((texto, i) => listaAlertas.insertAdjacentHTML('beforeend', filaAlerta(`a-g${i}`, texto)));
    listaAlertas.addEventListener('change', evento => {
      const fila = evento.target.closest('.alerta');
      fila.classList.toggle('text-secondary', !evento.target.checked);
      fila.querySelector('.bi').className = evento.target.checked ? 'bi bi-bell-fill text-ocean me-1' : 'bi bi-bell me-1';
    });
    const formAlerta = document.getElementById('form-alerta');
    formAlerta.addEventListener('enviado', () => {
      const texto = formAlerta.alerta.value.trim();
      listaAlertas.insertAdjacentHTML('beforeend', filaAlerta(`a-g${guardados('alertas').length}`, texto));
      guardarEn('alertas', texto);
      formAlerta.reset();
      notificar(`Alerta «${texto}» creada. Te avisaremos por correo o SMS.`);
    });

    // Valoraciones: empresas disponibles y la que venga en ?empresa=
    const selectEmpresa = document.getElementById('v-empresa');
    selectEmpresa.insertAdjacentHTML('beforeend', EMPRESAS.map(e => `<option>${esc(e.nombre)}</option>`).join(''));
    selectEmpresa.value = parametro('empresa') ?? '';
    if (selectEmpresa.selectedIndex < 0) selectEmpresa.value = '';

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

    // Ofertas guardadas desde Resultados o la Descripción del trabajo
    function pintarGuardadas() {
      const guardadas = ofertasGuardadas().map(id => OFERTAS.find(o => o.id === id)).filter(Boolean);
      document.getElementById('sin-guardadas').hidden = guardadas.length > 0;
      document.getElementById('lista-guardadas').innerHTML = guardadas.map(o => `
        <li class="neo-subbox p-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div><a class="fw-bold" href="detalle-oferta.html?id=${o.id}">${esc(o.titulo)}</a><span class="subtitulo">${esc(o.empresa)} · ${esc(o.modalidad)} · ${formatoSalario(o)}</span></div>
          <div class="d-flex gap-2">
            <a class="btn btn-neo-primary btn-sm" href="postulacion.html?id=${o.id}">Postularme</a>
            <button type="button" class="btn btn-neo-secondary btn-sm" data-guardar-oferta="${o.id}" aria-label="Quitar ${esc(o.titulo)} de guardadas"></button>
          </div>
        </li>`).join('');
      marcarGuardadas();
    }
    document.addEventListener('click', evento => { if (evento.target.closest('[data-guardar-oferta]')) pintarGuardadas(); });
    pintarGuardadas();
