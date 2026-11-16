// Crear, editar y publicar ofertas; con ?id= se edita una existente
const avisarError = error => notificar(error.message, 'error');
const formOferta = document.getElementById('form-oferta');
const botonBorrador = document.getElementById('guardar-borrador');
let id = parametro('id');

const pintarSalario = () => document.querySelectorAll('[data-salario]').forEach(destino => destino.textContent =
  [formOferta.salarioMin.value, formOferta.salarioMax.value].filter(Boolean).map(v => `$${Number(v).toLocaleString('en-US')}`).join(' – ') || 'Salario a convenir');
formOferta.addEventListener('input', pintarSalario);

apiRequest('/empresa/perfil')
  .then(({ data }) => document.querySelectorAll('[data-nombre-empresa]').forEach(e => e.textContent = data.empresa.nombre))
  .catch(avisarError);

// Ya guardada, la página pasa a editarla: así otro «Guardar borrador» no crea una oferta repetida
function modoEdicion(oferta) {
  id = oferta.id;
  history.replaceState(null, '', `?id=${id}`);
  document.querySelector('.titulo-pagina').textContent = 'Editar oferta';
  botonBorrador.hidden = oferta.estado !== 'borrador';
  formOferta.querySelector('[type="submit"]').textContent = oferta.estado === 'borrador' ? 'Publicar oferta' : 'Guardar cambios';
}

if (id) apiRequest(`/empresa/ofertas/${id}`).then(({ data: { oferta } }) => {
  for (const campo of formOferta.elements) {
    const valor = oferta[campo.name];
    if (valor != null) campo.value = Array.isArray(valor) ? valor.join('\n') : valor;
  }
  modoEdicion(oferta);
  actualizarEspejos();
  pintarSalario();
}).catch(avisarError);

async function guardar(publicar) {
  const datos = datosFormulario(formOferta);
  for (const campo of ['salarioMin', 'salarioMax']) if (campo in datos) datos[campo] = Number(datos[campo]);
  try {
    let respuesta = id
      ? await apiRequest(`/empresa/ofertas/${id}`, { method: 'PUT', body: JSON.stringify(datos) })
      : await apiRequest('/empresa/ofertas', { method: 'POST', body: JSON.stringify({ ...datos, estado: publicar ? 'activa' : 'borrador' }) });
    if (publicar && respuesta.data.oferta.estado === 'borrador') {
      respuesta = await apiRequest(`/empresa/ofertas/${id}/publicar`, { method: 'PATCH' });
    }
    modoEdicion(respuesta.data.oferta);
    notificar(respuesta.message);
  } catch (error) { avisarError(error); }
}
botonBorrador.addEventListener('click', () => guardar(false));
formOferta.addEventListener('enviado', () => guardar(true));
