const formPostulacion = document.getElementById('form-postulacion');
const idOferta = parametro('id');
const enlaceOferta = `detalle-oferta.html?id=${encodeURIComponent(idOferta || '')}`;
const cvPerfil = document.getElementById('c-cv-perfil');
const cvNuevo = document.getElementById('c-cv-nuevo');
const archivoCv = document.getElementById('c-cv');
document.getElementById('miga-oferta').href = enlaceOferta;
document.getElementById('volver-oferta').href = enlaceOferta;
const avisarError = error => avisar(formPostulacion, error.message);

async function cargarFormulario() {
  if (!idOferta) throw new Error('Falta seleccionar una oferta.');
  const [{ data: { oferta } }, perfilRespuesta] = await Promise.all([
    apiRequest(`/ofertas/${encodeURIComponent(idOferta)}`),
    usuario === 'candidato' ? apiRequest('/candidatos/me') : Promise.resolve(null),
  ]);
  document.querySelectorAll('.nombre-empresa').forEach(e => e.textContent = oferta.empresa);
  document.getElementById('r-titulo').textContent = oferta.titulo;
  const rango = oferta.salarioMin != null || oferta.salarioMax != null
    ? `$${oferta.salarioMin ?? '—'} – $${oferta.salarioMax ?? '—'}` : 'A convenir';
  document.getElementById('r-detalles').innerHTML = [oferta.ubicacion, `Modalidad: ${oferta.modalidad || 'No especificada'}`,
    `Jornada: ${oferta.contrato || 'No especificada'}`, `Salario: ${rango}`, `ID de vacante: #JOB-${oferta.id}`]
    .map(d => `<li>${esc(d)}</li>`).join('');
  formPostulacion.mensaje.value = `Estimado equipo de ${oferta.empresa}:\nMe interesa la vacante de ${oferta.titulo}.`;
  if (perfilRespuesta) {
    const perfil = perfilRespuesta.data;
    formPostulacion.nombre.value = perfil.nombre || '';
    formPostulacion.apellido.value = perfil.apellidos || '';
    formPostulacion.correo.value = perfil.correo || '';
    formPostulacion.telefono.value = perfil.telefono || '';
    formPostulacion.ubicacion.value = perfil.ubicacion || '';
    formPostulacion.resumen.value = perfil.resumen || '';
    formPostulacion.habilidades.value = (perfil.habilidades || []).join('\n');
    formPostulacion.experiencia.value = (perfil.experiencia || []).join('\n');
    formPostulacion.formacion.value = perfil.formacion || '';
    const tieneCvPerfil = Boolean(perfil.cvNombre);
    document.getElementById('c-cv-nombre').textContent = perfil.cvNombre || 'Aún no hay un CV en tu perfil';
    cvPerfil.disabled = !tieneCvPerfil;
    cvPerfil.checked = tieneCvPerfil;
    cvNuevo.checked = !tieneCvPerfil;
    actualizarOpcionCv();
  }
}

function actualizarOpcionCv() {
  const subirNuevo = cvNuevo.checked;
  archivoCv.disabled = !subirNuevo;
  archivoCv.required = subirNuevo;
  if (!subirNuevo) {
    archivoCv.value = '';
    archivoCv.setCustomValidity('');
    document.getElementById('c-cv-seleccionado').textContent = 'Se enviará el CV guardado en tu perfil.';
  } else if (!archivoCv.files.length) {
    document.getElementById('c-cv-seleccionado').textContent = 'Selecciona el archivo que enviarás.';
  }
}

[cvPerfil, cvNuevo].forEach(opcion => opcion.addEventListener('change', actualizarOpcionCv));
archivoCv.addEventListener('change', () => {
  if (archivoCv.files[0]) {
    cvNuevo.checked = true;
    actualizarOpcionCv();
    document.getElementById('c-cv-seleccionado').textContent = `CV para esta postulación: ${archivoCv.files[0].name}`;
  }
});
actualizarOpcionCv();

const candidato = usuario === 'candidato';
document.getElementById('aviso-sesion').hidden = candidato;
if (!candidato) {
  formPostulacion.querySelectorAll('input, textarea, button[type="submit"]').forEach(campo => campo.disabled = true);
  const aviso = document.querySelector('#aviso-sesion span');
  if (usuario !== 'visitante') aviso.textContent = 'Inicia sesión con una cuenta de candidato para postularte.';
}

formPostulacion.addEventListener('enviado', async () => {
  if (!candidato) {
    document.querySelector('#aviso-sesion [data-abrir-login]')?.click();
    return;
  }
  const boton = formPostulacion.querySelector('[type="submit"]');
  boton.disabled = true;
  try {
    const datos = new FormData();
    datos.set('ofertaId', idOferta);
    datos.set('mensaje', formPostulacion.mensaje.value.trim());
    datos.set('cvMode', formPostulacion.cvMode.value);
    for (const campo of ['ubicacion', 'resumen', 'habilidades', 'experiencia', 'formacion']) {
      datos.set(campo, formPostulacion.elements[campo].value.trim());
    }
    if (archivoCv.files[0]) datos.set('cv', archivoCv.files[0]);
    const { data } = await apiRequest('/candidatos/me/postulaciones', { method: 'POST', body: datos });
    location.href = `postulacion-enviada.html?id=${encodeURIComponent(idOferta)}&postulacion=${data.postulacion.id}`;
  } catch (error) {
    avisarError(error);
    boton.disabled = false;
  }
});

cargarFormulario().catch(error => { avisarError(error); notificar(error.message, 'error'); });
