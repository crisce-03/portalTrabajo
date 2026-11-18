const POR_PAGINA = 5;
const buscar = document.getElementById('f-buscar');
const estado = document.getElementById('f-estado');
const orden = document.getElementById('f-orden');
const selectorOferta = document.getElementById('seleccionar-oferta');
const elementoModal = document.getElementById('modal-postulacion');
const modalPostulacion = bootstrap.Modal.getOrCreateInstance(elementoModal);
let postulaciones = [];
let ofertas = [];
let pagina = 1;
let postulacionActiva = null;

const avisarError = error => notificar(error.message, 'error');
const fechaLarga = fecha => fecha ? formatoFecha(String(fecha).slice(0, 10)) : '—';

function pintarOfertaSeleccionada() {
  const oferta = ofertas.find(o => String(o.id) === selectorOferta.value);
  const enlace = document.getElementById('ver-oferta-seleccionada');
  const insignia = document.getElementById('estado-oferta-seleccionada');
  enlace.hidden = !oferta;
  insignia.textContent = oferta ? ({ activa: 'Activa', cerrada: 'Cerrada', borrador: 'Borrador' }[oferta.estado]) : 'Todas';
  enlace.href = oferta ? `detalle-oferta.html?id=${oferta.id}` : 'resultados.html';
  if (oferta) selectorOferta.setAttribute('aria-label', `Postulaciones para ${oferta.titulo}`);
}

function actualizarIndicadores() {
  document.getElementById('i-total').textContent = postulaciones.length;
  for (const clave of ['pendiente', 'revision', 'aceptado']) {
    document.getElementById(`i-${clave}`).textContent = postulaciones.filter(p => p.estado === clave).length;
  }
}

function pintar() {
  const consulta = normalizar(buscar.value);
  const signo = orden.value === 'recientes' ? -1 : 1;
  const filtrados = postulaciones.filter(p =>
    normalizar(`${p.nombre} ${p.apellidos} ${p.correo} ${p.oferta}`).includes(consulta)
    && (!estado.value || p.estado === estado.value))
    .sort((a, b) => signo * String(a.fecha).localeCompare(String(b.fecha)) || a.id - b.id);
  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  pagina = Math.min(pagina, paginas);
  const desde = (pagina - 1) * POR_PAGINA;
  const visibles = filtrados.slice(desde, desde + POR_PAGINA);
  document.getElementById('lista-postulantes').innerHTML = visibles.map(p => `
    <li class="applicant-card">
      <div class="applicant-identity">
        <span class="applicant-avatar" aria-hidden="true">${esc(`${p.nombre?.[0] || ''}${p.apellidos?.[0] || ''}`.toUpperCase())}</span>
        <div class="applicant-identity__body">
          <h3 class="applicant-name">${esc(`${p.nombre} ${p.apellidos}`)}</h3>
          <p class="applicant-contact">${esc(p.cargo || 'Candidato')} · <a href="mailto:${esc(p.correo)}">${esc(p.correo)}</a></p>
          <p class="applicant-offer"><i class="bi bi-briefcase" aria-hidden="true"></i> ${esc(p.oferta)} · ${esc(p.ubicacion || 'Ubicación no especificada')}</p>
        </div>
      </div>
      <div class="applicant-summary">
        ${insigniaEstado(p.estado)}
        <time class="applicant-compact" datetime="${esc(String(p.fecha).slice(0, 10))}"><i class="bi bi-calendar3" aria-hidden="true"></i> ${fechaLarga(p.fecha)}</time>
        <span class="applicant-compact"><i class="bi bi-file-earmark-text" aria-hidden="true"></i> ${p.tieneCv ? 'CV adjunto' : 'Sin CV'}</span>
      </div>
      <div class="applicant-actions">
        <button type="button" class="btn btn-neo-primary btn-sm" data-ver-postulacion="${p.id}"><i class="bi bi-eye me-1" aria-hidden="true"></i>Ver</button>
      </div>
    </li>`).join('');
  document.getElementById('sin-postulantes').hidden = filtrados.length > 0;
  document.getElementById('conteo').textContent = filtrados.length
    ? `Mostrando ${desde + 1}–${desde + visibles.length} de ${filtrados.length} postulaciones · Página ${pagina} de ${paginas}`
    : 'Mostrando 0 postulaciones';
  document.getElementById('anterior').disabled = pagina === 1;
  document.getElementById('siguiente').disabled = pagina === paginas;
}

function pintarDetalle(postulacion) {
  document.getElementById('modal-postulacion-titulo').textContent = postulacion.candidatoNombre;
  document.getElementById('detalle-contacto').textContent = [postulacion.cargo, postulacion.correo, postulacion.telefono].filter(Boolean).join(' · ') || 'Sin datos de contacto';
  document.getElementById('detalle-oferta').textContent = `${postulacion.oferta} · ${postulacion.empresa} · ${postulacion.ubicacion || 'Ubicación no especificada'}`;
  document.getElementById('detalle-fecha').textContent = `Postulación enviada el ${fechaLarga(postulacion.creadoEn)}`;
  document.getElementById('detalle-estado').innerHTML = insigniaEstado(postulacion.estado);
  document.getElementById('detalle-resumen').textContent = postulacion.resumen || 'Sin resumen profesional.';
  document.getElementById('detalle-experiencia').textContent = postulacion.experiencia?.length ? postulacion.experiencia.join('\n\n') : 'Sin experiencia registrada.';
  document.getElementById('detalle-formacion').textContent = postulacion.formacion || 'Sin formación registrada.';
  document.getElementById('detalle-habilidades').innerHTML = postulacion.habilidades?.length
    ? postulacion.habilidades.map(habilidad => `<span class="badge-neo badge-neo-ocean">${esc(habilidad)}</span>`).join('')
    : '<span class="small text-secondary">Sin habilidades registradas.</span>';
  document.getElementById('detalle-mensaje').textContent = postulacion.mensaje || 'Sin mensaje de presentación.';
  document.getElementById('detalle-cv-nombre').textContent = postulacion.cvNombre || 'Sin CV adjunto';
  const descargar = document.getElementById('descargar-cv-modal');
  descargar.hidden = !postulacion.tieneCv;
  descargar.dataset.descargarCv = postulacion.id;
  const selectorEstado = document.getElementById('estado-postulacion-modal');
  selectorEstado.value = postulacion.estado;
  selectorEstado.disabled = false;
  document.getElementById('guardar-estado-modal').disabled = selectorEstado.value === postulacion.estado;
  document.getElementById('estado-modal-mensaje').textContent = '';
  document.getElementById('modal-postulacion-cargando').hidden = true;
  document.getElementById('modal-postulacion-contenido').hidden = false;
}

async function abrirDetallePostulacion(id) {
  postulacionActiva = null;
  document.getElementById('modal-postulacion-titulo').textContent = 'Candidatura';
  document.getElementById('modal-postulacion-contenido').hidden = true;
  document.getElementById('modal-postulacion-cargando').hidden = false;
  document.getElementById('modal-postulacion-cargando').textContent = 'Cargando candidatura…';
  modalPostulacion.show();
  try {
    const { data } = await apiRequest(`/empresa/postulaciones/${encodeURIComponent(id)}`);
    postulacionActiva = data.postulacion;
    pintarDetalle(postulacionActiva);
  } catch (error) {
    document.getElementById('modal-postulacion-cargando').textContent = error.message;
  }
}

async function descargarCv(id, boton) {
  boton.disabled = true;
  try {
    const { blob, filename } = await apiDownload(`/empresa/postulaciones/${encodeURIComponent(id)}/cv`);
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = filename || postulacionActiva?.cvNombre || 'curriculum';
    enlace.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) { avisarError(error); }
  finally { boton.disabled = false; }
}

async function cargar() {
  try {
    const [rOfertas, rApps] = await Promise.all([
      apiRequest('/empresa/ofertas'),
      apiRequest(`/empresa/postulaciones${selectorOferta.value ? `?ofertaId=${encodeURIComponent(selectorOferta.value)}` : ''}`),
    ]);
    ofertas = rOfertas.data.ofertas;
    const seleccionPrevia = selectorOferta.value || parametro('oferta') || '';
    selectorOferta.innerHTML = '<option value="">Todas mis ofertas</option>' + ofertas.map(o => `<option value="${o.id}">${esc(o.titulo)} · ${o.estado}</option>`).join('');
    selectorOferta.value = ofertas.some(o => String(o.id) === seleccionPrevia) ? seleccionPrevia : '';
    if (selectorOferta.value !== (parametro('oferta') || '')) {
      const { data } = await apiRequest(`/empresa/postulaciones${selectorOferta.value ? `?ofertaId=${encodeURIComponent(selectorOferta.value)}` : ''}`);
      postulaciones = data.postulaciones;
    } else postulaciones = rApps.data.postulaciones;
    pintarOfertaSeleccionada(); actualizarIndicadores(); pintar();
  } catch (error) { avisarError(error); }
}

[buscar, estado, orden].forEach(control => control.addEventListener('input', () => { pagina = 1; pintar(); }));
selectorOferta.addEventListener('change', async () => {
  const params = new URLSearchParams(); if (selectorOferta.value) params.set('oferta', selectorOferta.value);
  history.replaceState(null, '', `${location.pathname}${params.size ? '?' + params : ''}`);
  try {
    const { data } = await apiRequest(`/empresa/postulaciones${selectorOferta.value ? `?ofertaId=${encodeURIComponent(selectorOferta.value)}` : ''}`);
    postulaciones = data.postulaciones; pagina = 1; pintarOfertaSeleccionada(); actualizarIndicadores(); pintar();
  } catch (error) { avisarError(error); }
});
document.getElementById('anterior').addEventListener('click', () => { pagina--; pintar(); });
document.getElementById('siguiente').addEventListener('click', () => { pagina++; pintar(); });
document.getElementById('filtros-postulantes').addEventListener('submit', evento => evento.preventDefault());

document.getElementById('lista-postulantes').addEventListener('click', evento => {
  const boton = evento.target.closest('[data-ver-postulacion]');
  if (boton) abrirDetallePostulacion(boton.dataset.verPostulacion);
});

document.getElementById('estado-postulacion-modal').addEventListener('change', evento => {
  document.getElementById('guardar-estado-modal').disabled = evento.target.value === postulacionActiva?.estado;
  document.getElementById('estado-modal-mensaje').textContent = '';
});
document.getElementById('guardar-estado-modal').addEventListener('click', async evento => {
  if (!postulacionActiva) return;
  const boton = evento.currentTarget;
  const nuevoEstado = document.getElementById('estado-postulacion-modal').value;
  boton.disabled = true;
  try {
    const { message } = await apiRequest(`/empresa/postulaciones/${postulacionActiva.id}/estado`, {
      method: 'PATCH', body: JSON.stringify({ estado: nuevoEstado }),
    });
    postulacionActiva.estado = nuevoEstado;
    const enLista = postulaciones.find(p => p.id === postulacionActiva.id);
    if (enLista) enLista.estado = nuevoEstado;
    pintarDetalle(postulacionActiva);
    actualizarIndicadores(); pintar();
    document.getElementById('estado-modal-mensaje').textContent = message || 'Estado actualizado.';
    notificar('Estado de la postulación actualizado.');
  } catch (error) {
    document.getElementById('estado-modal-mensaje').textContent = error.message;
    boton.disabled = false;
  }
});
document.getElementById('descargar-cv-modal').addEventListener('click', evento => {
  if (postulacionActiva) descargarCv(postulacionActiva.id, evento.currentTarget);
});

cargar();
