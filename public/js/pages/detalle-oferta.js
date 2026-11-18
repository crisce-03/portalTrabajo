const texto = (id, valor) => document.getElementById(id).textContent = valor ?? '';
const pintarLista = (id, elementos) => document.getElementById(id).innerHTML = (elementos || []).map(e => `<li>${esc(e)}</li>`).join('') || '<li>No especificado.</li>';
const dineroDetalle = valor => valor == null ? null : `$${Number(valor).toLocaleString('en-US')}`;
const formatoSalarioDetalle = o => o.salarioMin != null && o.salarioMax != null
  ? `${dineroDetalle(o.salarioMin)} – ${dineroDetalle(o.salarioMax)}`
  : o.salarioMax != null ? `Hasta ${dineroDetalle(o.salarioMax)}` : o.salarioMin != null ? `Desde ${dineroDetalle(o.salarioMin)}` : 'A convenir';

async function cargarDetalle() {
  const id = parametro('id');
  if (!id) throw new Error('Falta el identificador de la oferta.');
  const { data: { oferta } } = await apiRequest(`/ofertas/${encodeURIComponent(id)}`);
  document.title = `${oferta.titulo} · PortalTrabajo`;
  texto('o-id', `ID: #JOB-${oferta.id}`);
  texto('o-titulo', oferta.titulo);
  texto('o-meta', [oferta.empresa, oferta.ubicacion, `Contacto: ${oferta.correoContacto || oferta.empresaContacto}`].filter(Boolean).join(' · '));
  const verificada = document.getElementById('o-verificada');
  verificada.hidden = !oferta.verificada;
  document.getElementById('o-etiquetas').innerHTML = [
    oferta.modalidad && `<span class="badge-neo badge-neo-neutral">${esc(oferta.modalidad)}</span>`,
    oferta.contrato && `<span class="badge-neo badge-neo-neutral">${esc(oferta.contrato)}</span>`,
    oferta.sector && `<span class="badge-neo badge-neo-ocean">${esc(oferta.sector)}</span>`,
    `<span class="badge-neo badge-neo-salary">${esc(formatoSalarioDetalle(oferta))}</span>`,
  ].filter(Boolean).join('');
  document.getElementById('o-aplicar').href = `postulacion.html?id=${oferta.id}`;
  const guardar = document.getElementById('o-guardar');
  guardar.dataset.guardarOferta = oferta.id;
  texto('o-descripcion', oferta.descripcion || 'La empresa no agregó una descripción.');
  pintarLista('o-responsabilidades', oferta.responsabilidades);
  pintarLista('o-requisitos', oferta.requisitos);
  pintarLista('o-beneficios', oferta.beneficios);

  texto('e-nombre', oferta.empresa);
  texto('e-sector', oferta.empresaSector || oferta.sector);
  texto('e-contacto', oferta.empresaContacto || oferta.correoContacto || 'No disponible');
  texto('e-ubicacion', oferta.empresaUbicacion || oferta.ubicacion || 'No especificada');
  texto('e-acerca', oferta.acerca || 'La empresa aún no agregó una presentación.');
  const web = document.getElementById('e-web');
  web.textContent = oferta.sitioWeb || 'No disponible';
  if (oferta.sitioWeb) {
    try {
      const url = new URL(oferta.sitioWeb);
      if (['http:', 'https:'].includes(url.protocol)) {
        const enlace = document.createElement('a'); enlace.href = url.href; enlace.target = '_blank'; enlace.rel = 'noopener noreferrer';
        enlace.textContent = oferta.sitioWeb; web.replaceChildren(enlace);
      }
    } catch { /* Se muestra la dirección como texto si no es válida. */ }
  }
  document.getElementById('e-perfil').href = `valoraciones.html#${oferta.empresaId}`;
  document.getElementById('e-promedio').innerHTML = `${estrellas(oferta.promedio)} ${Number(oferta.promedio).toFixed(1)} / 5 · ${oferta.opiniones} opiniones`;
  document.getElementById('lista-comentarios').innerHTML = oferta.resenas.length ? oferta.resenas.slice(0, 4).map(r => `
    <div class="col-md-6"><div class="neo-subbox p-3 h-100">
      <p class="fw-bold small mb-1">${esc(r.autor)} · <i class="bi bi-star-fill" aria-hidden="true"></i> ${r.calificacion}/5</p>
      <p class="small text-secondary mb-0">“${esc(r.texto)}”</p>
    </div></div>`).join('') : '<p class="small text-secondary mb-0">Esta empresa aún no tiene valoraciones.</p>';
  document.getElementById('e-comentar').href = `valoraciones.html?empresa=${oferta.empresaId}`;
  marcarGuardadas();
}

cargarDetalle().catch(error => {
  document.getElementById('info-oferta').innerHTML = `<p class="mb-0 text-danger">${esc(error.message)}</p>`;
  notificar(error.message, 'error');
});
