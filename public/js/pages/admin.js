// shortcut: el CRUD trabaja sobre REGISTROS en memoria; con la API, cada acción es un POST/PUT/DELETE a /api/admin/...
    const registros = REGISTROS.map(r => ({ ...r }));
    const TIPOS = { empresa: ['Empresa', 'ocean'], vacante: ['Vacante', 'community'], usuario: ['Usuario', 'neutral'] };
    const ESTADOS_TIPO = { empresa: ['Verificada', 'Pendiente', 'Suspendida'], vacante: ['Activa', 'Cerrada'], usuario: ['Habilitado', 'Deshabilitado'] };
    const COLOR_ESTADO = { Verificada: 'salary', Activa: 'salary', Habilitado: 'salary', Pendiente: 'warning', Cerrada: 'neutral', Suspendida: 'danger', Deshabilitado: 'danger' };
    let filtroTipo = '';

    const boton = (accion, icono, etiqueta, peligro = false) =>
      `<button type="button" class="btn ${peligro ? 'btn-neo-danger' : 'btn-neo-secondary'} btn-sm" data-accion="${accion}" aria-label="${etiqueta}" title="${etiqueta}"><i class="bi bi-${icono}" aria-hidden="true"></i></button>`;
    const acciones = r => ({
      empresa: boton('editar', 'pencil', 'Editar empresa')
        + boton('suspender', 'slash-circle', r.estado === 'Suspendida' ? 'Reactivar empresa' : 'Suspender empresa', true),
      vacante: (r.oferta
        ? `<a class="btn btn-neo-secondary btn-sm" href="detalle-oferta.html?id=${r.oferta}" aria-label="Ver vacante" title="Ver vacante"><i class="bi bi-eye" aria-hidden="true"></i></a>`
        : boton('editar', 'pencil', 'Editar vacante'))
        + boton('eliminar', 'trash', 'Eliminar vacante', true),
      usuario: boton('clave', 'key', 'Restablecer contraseña')
        + boton('deshabilitar', 'person-x', r.estado === 'Deshabilitado' ? 'Habilitar usuario' : 'Deshabilitar usuario', true),
    })[r.tipo];

    function pintarTabla() {
      document.querySelector('#tabla-control tbody').innerHTML = registros
        .filter(r => !filtroTipo || r.tipo === filtroTipo)
        .map(r => `
          <tr data-id="${r.id}" data-tipo="${r.tipo}">
            <td><span class="badge-neo badge-neo-${TIPOS[r.tipo][1]}">${TIPOS[r.tipo][0]}</span></td>
            <td><strong>${esc(r.nombre)}</strong> · <span class="text-secondary">${esc(r.detalle)}</span></td>
            <td><span class="badge-neo badge-neo-${COLOR_ESTADO[r.estado]}">${esc(r.estado)}</span></td>
            <td class="text-end text-nowrap"><div class="d-inline-flex gap-1">${acciones(r)}</div></td>
          </tr>`).join('');
    }

    // Menú: gestión de usuarios / empresas / vacantes filtra la tabla ("" = todos)
    document.querySelectorAll('[data-filtro]').forEach(link => link.addEventListener('click', () => {
      filtroTipo = link.dataset.filtro;
      const indicador = document.getElementById('filtro-activo');
      indicador.hidden = !filtroTipo;
      indicador.querySelector('span').textContent = filtroTipo ? `Mostrando solo: ${TIPOS[filtroTipo][0]}s` : '';
      pintarTabla();
    }));

    document.querySelector('[data-ver-todos]').addEventListener('click', () => document.querySelector('[data-filtro=""]').click());

    // Confirmación con ventana modal (nunca alert/confirm del navegador)
    function confirmar(texto) {
      document.getElementById('confirmar-texto').textContent = texto;
      const modal = bootstrap.Modal.getOrCreateInstance('#modal-confirmar');
      return new Promise(resolver => {
        const si = document.getElementById('confirmar-si');
        si.onclick = () => { si.onclick = null; resolver(true); modal.hide(); };
        document.getElementById('modal-confirmar').addEventListener('hidden.bs.modal', () => resolver(false), { once: true });
        modal.show();
      });
    }

    // Crear y editar con la misma ventana
    const formRegistro = document.getElementById('form-registro-admin');
    const modalRegistro = bootstrap.Modal.getOrCreateInstance('#modal-registro');
    const opcionesEstado = tipo => formRegistro.estado.innerHTML = ESTADOS_TIPO[tipo].map(e => `<option>${e}</option>`).join('');
    formRegistro.tipo.addEventListener('change', () => opcionesEstado(formRegistro.tipo.value));
    function abrirRegistro(registro) {
      formRegistro.reset();
      document.getElementById('t-modal-registro').textContent = registro ? 'Editar registro' : 'Nuevo registro';
      formRegistro.registro.value = registro?.id ?? '';
      formRegistro.tipo.value = registro?.tipo ?? (filtroTipo || 'empresa');
      formRegistro.tipo.disabled = Boolean(registro);
      opcionesEstado(formRegistro.tipo.value);
      formRegistro.nombre.value = registro?.nombre ?? '';
      formRegistro.detalle.value = registro?.detalle ?? '';
      if (registro) formRegistro.estado.value = registro.estado;
      modalRegistro.show();
    }
    document.getElementById('nuevo-registro').addEventListener('click', () => abrirRegistro());
    formRegistro.addEventListener('enviado', () => {
      const datos = { nombre: formRegistro.nombre.value.trim(), detalle: formRegistro.detalle.value.trim(), estado: formRegistro.estado.value };
      const existente = registros.find(r => r.id === Number(formRegistro.registro.value));
      if (existente) Object.assign(existente, datos);
      else registros.unshift({ id: Date.now(), tipo: formRegistro.tipo.value, ...datos });
      modalRegistro.hide();
      pintarTabla();
      notificar(existente ? `Se actualizó «${datos.nombre}».` : `Se creó «${datos.nombre}».`);
    });

    // Acciones de cada fila
    document.querySelector('#tabla-control tbody').addEventListener('click', async evento => {
      const accion = evento.target.closest('[data-accion]');
      if (!accion) return;
      const registro = registros.find(r => r.id === Number(accion.closest('tr').dataset.id));
      switch (accion.dataset.accion) {
        case 'editar':
          abrirRegistro(registro);
          return;
        case 'suspender':
          registro.estado = registro.estado === 'Suspendida' ? 'Verificada' : 'Suspendida';
          notificar(`«${registro.nombre}» ahora está ${registro.estado.toLowerCase()}.`);
          break;
        case 'deshabilitar':
          registro.estado = registro.estado === 'Deshabilitado' ? 'Habilitado' : 'Deshabilitado';
          notificar(`«${registro.nombre}» ahora está ${registro.estado.toLowerCase()}.`);
          break;
        case 'clave':
          notificar(`Se envió un enlace para restablecer la contraseña a ${registro.correo ?? 'su correo registrado'}.`);
          return;
        case 'eliminar':
          if (!await confirmar(`¿Eliminar «${registro.nombre}»? Esta acción no se puede deshacer.`)) return;
          registros.splice(registros.indexOf(registro), 1);
          notificar(`Se eliminó «${registro.nombre}».`);
          break;
      }
      pintarTabla();
    });

    // Exportar la tabla visible a CSV (se abre en Excel)
    document.getElementById('exportar').addEventListener('click', () => {
      // Un valor que empieza con = + - @ se volvería fórmula en Excel: se le antepone '
      const celda = valor => `"${String(valor).replace(/^[=+\-@]/, "'$&").replace(/"/g, '""')}"`;
      const filas = registros.filter(r => !filtroTipo || r.tipo === filtroTipo)
        .map(r => [TIPOS[r.tipo][0], r.nombre, r.detalle, r.estado]);
      const csv = [['Tipo', 'Nombre', 'Detalle', 'Estado'], ...filas].map(f => f.map(celda).join(',')).join('\r\n');
      const enlace = document.createElement('a');
      enlace.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
      enlace.download = 'registros-portal-trabajo.csv';
      enlace.click();
      URL.revokeObjectURL(enlace.href);
      notificar(`Se exportaron ${filas.length} registros.`);
    });

    // Moderación: aprobar o eliminar quita el reporte de la bandeja y actualiza los contadores.
    // shortcut: no guarda la decisión; con la API, enviarla al servidor antes de quitar el reporte
    document.getElementById('bandeja').addEventListener('click', async evento => {
      const decision = evento.target.closest('[data-decision]');
      if (!decision) return;
      if (decision.dataset.decision === 'eliminar' && !await confirmar('¿Eliminar este contenido del portal?')) return;
      decision.closest('.reporte').remove();
      const restantes = document.querySelectorAll('#bandeja .reporte').length;
      document.getElementById('pendientes').textContent =
        `${restantes} ${restantes === 1 ? 'Pendiente' : 'Pendientes'} de Revisión`;
      const total = document.getElementById('total-reportes');
      total.textContent = Number(total.textContent) - 1;
      document.getElementById('bandeja-vacia').hidden = restantes > 0;
    });

    pintarTabla();
