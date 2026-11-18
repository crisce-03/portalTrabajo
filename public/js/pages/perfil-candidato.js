const idPostulacion = parametro('postulacion');
const avisarError = error => notificar(error.message, 'error');
const estadoOferta = { activa: 'Activa', cerrada: 'Cerrada', borrador: 'Borrador' };

function pintarEstado(estado) {
  document.getElementById('estado-insignia').innerHTML = insigniaEstado(estado);
  document.getElementById('estado-texto').textContent = ESTADOS[estado]?.[0] || estado;
}

async function cargarDetalle() {
  if (!idPostulacion) throw new Error('Falta el identificador de la postulación.');
  const { data: { postulacion } } = await apiRequest(`/empresa/postulaciones/${encodeURIComponent(idPostulacion)}`);
  document.title = `${postulacion.candidatoNombre} · Revisión de candidatura`;
  document.getElementById('c-nombre').textContent = postulacion.candidatoNombre;
  document.getElementById('c-cargo').textContent = [postulacion.cargo, postulacion.ubicacion].filter(Boolean).join(' · ') || 'Candidato';
  document.getElementById('c-contacto').textContent = [postulacion.correo, postulacion.telefono].filter(Boolean).join(' · ') || 'Sin datos de contacto';
  document.getElementById('c-fecha').textContent = `Postulación: ${formatoFecha(String(postulacion.creadoEn).slice(0, 10))}`;
  document.getElementById('c-codigo').textContent = `Código: POST-${String(postulacion.id).padStart(3, '0')}`;
  document.getElementById('c-resumen').textContent = postulacion.resumen || 'El candidato aún no agregó un resumen profesional.';
  document.getElementById('c-habilidades').innerHTML = postulacion.habilidades.length
    ? postulacion.habilidades.map(h => `<span class="badge-neo badge-neo-ocean">${esc(h)}</span>`).join('')
    : '<span class="small text-secondary">Sin habilidades registradas.</span>';
  document.getElementById('c-experiencia').innerHTML = postulacion.experiencia.length
    ? postulacion.experiencia.map(e => `<p class="small text-secondary mb-2">${esc(e)}</p>`).join('')
    : '<p class="small text-secondary mb-0">Sin experiencia registrada.</p>';
  document.getElementById('c-formacion').textContent = postulacion.formacion || 'Sin formación registrada.';
  document.getElementById('c-mensaje').textContent = postulacion.mensaje || 'El candidato no incluyó un mensaje de presentación.';
  document.getElementById('c-archivo').textContent = postulacion.cvNombre || 'Sin CV adjunto';
  document.getElementById('c-descargar').hidden = !postulacion.tieneCv;
  document.getElementById('c-oferta-titulo').textContent = postulacion.oferta;
  document.getElementById('c-oferta-titulo').href = `detalle-oferta.html?id=${postulacion.ofertaId}`;
  document.getElementById('c-oferta-meta').textContent = `${postulacion.empresa} · #JOB-${postulacion.ofertaId}`;
  const insigniaOferta = document.getElementById('c-oferta-estado');
  insigniaOferta.textContent = estadoOferta[postulacion.estadoOferta] || postulacion.estadoOferta;
  pintarEstado(postulacion.estado);

  document.querySelectorAll('[data-estado]').forEach(boton => {
    boton.disabled = boton.dataset.estado === postulacion.estado;
  });
}

document.querySelectorAll('[data-estado]').forEach(boton => boton.addEventListener('click', async () => {
  boton.disabled = true;
  try {
    const { message } = await apiRequest(`/empresa/postulaciones/${encodeURIComponent(idPostulacion)}/estado`, {
      method: 'PATCH', body: JSON.stringify({ estado: boton.dataset.estado }),
    });
    notificar(message);
    await cargarDetalle();
  } catch (error) { boton.disabled = false; avisarError(error); }
}));

document.getElementById('c-descargar').addEventListener('click', async evento => {
  evento.preventDefault();
  const enlace = evento.currentTarget;
  enlace.classList.add('disabled');
  try {
    const { blob, filename } = await apiDownload(`/empresa/postulaciones/${encodeURIComponent(idPostulacion)}/cv`);
    const url = URL.createObjectURL(blob);
    const descarga = document.createElement('a');
    descarga.href = url; descarga.download = filename || document.getElementById('c-archivo').textContent || 'curriculum';
    descarga.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) { avisarError(error); }
  finally { enlace.classList.remove('disabled'); }
});

cargarDetalle().catch(error => {
  document.getElementById('info-candidato').innerHTML = `<p class="text-danger mb-0">${esc(error.message)}</p>`;
  avisarError(error);
});
