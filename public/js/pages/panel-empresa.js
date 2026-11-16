const avisarError = error => notificar(error.message, 'error');

apiRequest('/empresa/perfil').then(({ data: { empresa } }) => {
  document.querySelectorAll('[data-empresa]').forEach(destino => destino.textContent = empresa[destino.dataset.empresa] ?? '');
  document.getElementById('verificada').hidden = !empresa.verificada;
}).catch(avisarError);

// Ofertas: estado y las acciones que la API permite en cada uno
const ESTADO_OFERTA = { borrador: ['Borrador', 'text-secondary'], activa: ['Activa', 'text-mar'], cerrada: ['Cerrada', 'text-secondary'] };
const ACCIONES_OFERTA = { borrador: [['publicar', 'Publicar'], ['eliminar', 'Eliminar']], activa: [['cerrar', 'Cerrar']], cerrada: [['publicar', 'Volver a publicar']] };
const filaOferta = o => {
  const [texto, clase] = ESTADO_OFERTA[o.estado];
  const titulo = o.estado === 'cerrada' ? `<span class="fw-bold">${esc(o.titulo)}</span>`
    : `<a class="fw-bold" href="publicar-oferta.html?id=${o.id}">${esc(o.titulo)}</a>`;
  return `<tr>
    <td>${titulo}</td>
    <td><a class="fw-bold" href="postulaciones.html?oferta=${o.id}">${o.postulaciones} candidato${o.postulaciones === 1 ? '' : 's'}</a></td>
    <td class="${clase}">${texto}</td>
    <td class="text-nowrap">${ACCIONES_OFERTA[o.estado].map(([accion, etiqueta]) =>
      `<button type="button" class="btn btn-neo-secondary btn-sm" data-accion="${accion}" data-oferta="${o.id}" aria-label="${etiqueta}: ${esc(o.titulo)}">${etiqueta}</button>`).join(' ')}</td>
  </tr>`;
};

const tablaOfertas = document.getElementById('tabla-ofertas');
function cargar() {
  apiRequest('/empresa/resumen').then(({ data }) => {
    document.querySelectorAll('[data-indicador]').forEach(destino => destino.textContent = data.indicadores[destino.dataset.indicador]);
    document.getElementById('candidatos-recientes').innerHTML = data.candidatosRecientes
      .map(c => `<li>${esc(`${c.nombre} ${c.apellidos}`)} · ${esc(c.oferta)}</li>`).join('') || '<li class="text-secondary">Aún no hay postulaciones.</li>';
  }).catch(avisarError);
  apiRequest('/empresa/ofertas').then(({ data }) => {
    tablaOfertas.innerHTML = data.ofertas.map(filaOferta).join('')
      || '<tr><td colspan="4" class="text-secondary">Todavía no tienes ofertas. Crea la primera con «Nueva oferta».</td></tr>';
  }).catch(avisarError);
}
cargar();

tablaOfertas.addEventListener('click', async evento => {
  const boton = evento.target.closest('[data-accion]');
  if (!boton) return;
  const { accion, oferta } = boton.dataset;
  if (accion === 'eliminar' && !confirm('¿Eliminar este borrador? No se puede deshacer.')) return;
  boton.disabled = true;
  try {
    const { message } = accion === 'eliminar'
      ? await apiRequest(`/empresa/ofertas/${oferta}`, { method: 'DELETE' })
      : await apiRequest(`/empresa/ofertas/${oferta}/${accion}`, { method: 'PATCH' });
    notificar(message);
    cargar();
  } catch (error) {
    boton.disabled = false;
    avisarError(error);
  }
});
