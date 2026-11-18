async function cargarConfirmacion() {
  const ofertaId = parametro('id');
  const postulacionId = parametro('postulacion');
  const { data } = await apiRequest('/candidatos/me/postulaciones');
  const postulacion = data.postulaciones.find(p => String(p.id) === postulacionId && String(p.ofertaId) === String(ofertaId));
  if (!postulacion) throw new Error('No encontramos la postulación enviada.');
  document.getElementById('miga-oferta').href = `detalle-oferta.html?id=${postulacion.ofertaId}`;
  document.getElementById('miga-postulacion').href = `postulacion.html?id=${postulacion.ofertaId}`;
  document.getElementById('mensaje').textContent = `${postulacion.empresa} recibió tu solicitud para ${postulacion.titulo}. Puedes consultar el estado desde tu perfil.`;
  document.getElementById('linea-vacante').textContent = `Vacante: ${postulacion.titulo} · Empresa: ${postulacion.empresa}`;
  document.getElementById('linea-candidato').textContent = `Postulación #${postulacion.id}`;
  document.getElementById('linea-estado').textContent = `Estado inicial: ${postulacion.estado} · Seguimiento: POST-${String(postulacion.id).padStart(3, '0')}`;
}

cargarConfirmacion().catch(error => {
  document.getElementById('mensaje').textContent = error.message;
  notificar(error.message, 'error');
});
