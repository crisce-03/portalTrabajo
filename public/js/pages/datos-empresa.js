const avisarError = error => notificar(error.message, 'error');

// Los datos quedan como valores por defecto del formulario para que «Cancelar cambios» vuelva a ellos
const formEmpresa = document.getElementById('form-empresa');
function pintarEmpresa(empresa) {
  for (const campo of formEmpresa.elements) {
    if (!campo.name) continue;
    if (campo.tagName === 'SELECT') [...campo.options].forEach(opcion => opcion.defaultSelected = opcion.value === (empresa[campo.name] ?? ''));
    else campo.defaultValue = empresa[campo.name] ?? '';
  }
  formEmpresa.reset();
  document.getElementById('verificada').hidden = !empresa.verificada;
  document.getElementById('perfil-publico').href = `valoraciones.html#empresa-${empresa.id}`;
  document.getElementById('actualizado').textContent = new Date(empresa.actualizadoEn).toLocaleDateString('es-SV', { day: 'numeric', month: 'long', year: 'numeric' });
}
apiRequest('/empresa/perfil').then(({ data }) => pintarEmpresa(data.empresa)).catch(avisarError);
formEmpresa.addEventListener('enviado', async () => {
  try {
    const { data, message } = await apiRequest('/empresa/perfil', { method: 'PUT', body: JSON.stringify(datosFormulario(formEmpresa)) });
    pintarEmpresa(data.empresa);
    notificar(message);
  } catch (error) { avisarError(error); }
});
