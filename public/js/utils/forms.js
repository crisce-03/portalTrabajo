// Muestra un mensaje en el [role=status] del formulario (errores)
function avisar(form, texto) {
  const estado = form?.querySelector('[role="status"]');
  if (estado) estado.textContent = texto;
}

// ---------- Formularios ----------

// Ver u ocultar contraseñas
document.querySelectorAll('input[type="password"]').forEach(campo => {
  const margenes = [...campo.classList].filter(c => /^m[btxyse]?-/.test(c));
  const grupo = document.createElement('div');
  grupo.className = ['input-group', 'has-validation', ...margenes].join(' ');
  campo.classList.remove(...margenes);
  campo.before(grupo);
  grupo.append(campo);
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'btn btn-neo-secondary';
  boton.setAttribute('aria-label', 'Mostrar contraseña');
  boton.setAttribute('aria-pressed', 'false');
  boton.innerHTML = '<i class="bi bi-eye" aria-hidden="true"></i>';
  boton.addEventListener('click', () => {
    const mostrar = campo.type === 'password';
    campo.type = mostrar ? 'text' : 'password';
    boton.setAttribute('aria-pressed', String(mostrar));
    boton.firstElementChild.className = mostrar ? 'bi bi-eye-slash' : 'bi bi-eye';
  });
  grupo.append(boton);
  // el mensaje de error propio del campo debe quedar dentro del grupo para que Bootstrap lo muestre
  if (grupo.nextElementSibling?.classList.contains('invalid-feedback')) grupo.append(grupo.nextElementSibling);
});

// Mensaje de error en español debajo de cada campo inválido (si el campo no trae uno propio)
function mensajeDe(campo) {
  const v = campo.validity;
  if (v.valueMissing) {
    if (campo.type === 'checkbox') return 'Debes marcar esta casilla para continuar.';
    return campo.tagName === 'SELECT' ? 'Elige una opción.' : 'Este campo es obligatorio.';
  }
  if (v.typeMismatch) return campo.type === 'email' ? 'Escribe un correo válido, por ejemplo nombre@correo.com.' : 'Escribe la dirección completa, por ejemplo https://empresa.com.';
  if (v.tooShort) return `Escribe al menos ${campo.minLength} caracteres (llevas ${campo.value.length}).`;
  return campo.validationMessage;
}
function describir(campo, id, agregar) {
  const ids = new Set((campo.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean));
  if (agregar) ids.add(id); else ids.delete(id);
  if (ids.size) campo.setAttribute('aria-describedby', [...ids].join(' ')); else campo.removeAttribute('aria-describedby');
}
function marcarCampo(campo) {
  if (!campo.willValidate || !campo.id || campo.type === 'radio') return;
  const valido = campo.validity.valid;
  campo.setAttribute('aria-invalid', String(!valido));
  const propio = [...(campo.closest('.input-group') ?? campo).parentElement.children]
    .some(e => e.matches('.invalid-feedback:not([data-auto])')) || campo.closest('.input-group')?.querySelector('.invalid-feedback');
  if (propio) return;
  const idAviso = `${campo.id}-error`;
  let aviso = document.getElementById(idAviso);
  if (valido) { aviso?.remove(); describir(campo, idAviso, false); return; }
  if (!aviso) {
    aviso = document.createElement('div');
    aviso.id = idAviso;
    aviso.className = 'invalid-feedback d-block';
    aviso.dataset.auto = '';
    const ancla = campo.parentElement.matches('.input-group, .d-flex') ? campo.parentElement
      : campo.type === 'checkbox' ? campo.nextElementSibling ?? campo : campo;
    ancla.after(aviso);
    describir(campo, idAviso, true);
  }
  aviso.textContent = mensajeDe(campo);
}

// Formularios con class="needs-validation": validan con HTML5; si todo está bien disparan el evento
// "enviado" (para la lógica de cada página) y luego van a data-destino o muestran data-exito.
// shortcut: todavía no envían nada al servidor; cuando exista la API, hacer el fetch en "enviado"
document.querySelectorAll('form.needs-validation').forEach(form => {
  form.addEventListener('submit', evento => {
    evento.preventDefault();
    form.classList.add('was-validated');
    [...form.elements].forEach(marcarCampo);
    if (!form.checkValidity()) {
      avisar(form, 'Revisa los campos marcados en rojo.');
      form.querySelector(':invalid')?.focus();
      return;
    }
    avisar(form, '');
    form.dispatchEvent(new Event('enviado'));
    if (form.dataset.destino) location.href = form.dataset.destino;
    else if (form.dataset.exito) notificar(form.dataset.exito);
  });
  const revisar = evento => { if (form.classList.contains('was-validated')) marcarCampo(evento.target); };
  form.addEventListener('input', revisar);
  form.addEventListener('change', revisar);
  form.addEventListener('reset', () => {
    form.classList.remove('was-validated');
    avisar(form, '');
    form.querySelectorAll('[data-auto]').forEach(aviso => aviso.remove());
    form.querySelectorAll('[aria-invalid]').forEach(campo => campo.removeAttribute('aria-invalid'));
    setTimeout(actualizarEspejos); // el reset cambia los valores después del evento
  });
});

// Vista previa en vivo: un elemento con data-espejo="campo" copia el valor de name="campo"
function actualizarEspejos() {
  document.querySelectorAll('[data-espejo]').forEach(destino => {
    const campo = document.querySelector(`[name="${destino.dataset.espejo}"]`);
    if (campo) destino.textContent = campo.value.trim() || destino.dataset.vacio || '';
  });
}
document.addEventListener('input', actualizarEspejos);

// Archivos (CV): muestra el nombre elegido y valida tipo y tamaño (el servidor debe validarlo de nuevo)
const MAX_ARCHIVO = 5 * 1024 * 1024;
document.querySelectorAll('input[type="file"][data-muestra]').forEach(input => {
  input.addEventListener('change', () => {
    const archivo = input.files[0];
    if (!archivo) return;
    const permitidos = input.accept.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
    const extension = archivo.name.slice(archivo.name.lastIndexOf('.')).toLowerCase();
    const error = permitidos.length && !permitidos.includes(extension) ? `Solo se aceptan archivos ${permitidos.join(', ').toUpperCase()}.`
      : archivo.size > MAX_ARCHIVO ? 'El archivo supera 5 MB.' : '';
    input.setCustomValidity(error);
    document.getElementById(input.dataset.muestra).textContent = error ? `${archivo.name} — ${error}` : archivo.name;
    if (error) notificar(error, 'error'); else notificar(`Archivo listo: ${archivo.name}`, 'info');
  });
});

// Zonas para arrastrar y soltar archivos
document.querySelectorAll('.dropzone-neo').forEach(zona => {
  const input = zona.querySelector('input[type="file"]');
  ['dragenter', 'dragover'].forEach(tipo => zona.addEventListener(tipo, evento => { evento.preventDefault(); zona.classList.add('arrastrando'); }));
  ['dragleave', 'drop'].forEach(tipo => zona.addEventListener(tipo, () => zona.classList.remove('arrastrando')));
  zona.addEventListener('drop', evento => {
    evento.preventDefault();
    input.files = evento.dataTransfer.files;
    input.dispatchEvent(new Event('change'));
  });
});

// Botón «Volver arriba» en páginas largas
const botonSubir = document.createElement('button');
botonSubir.type = 'button';
botonSubir.className = 'btn btn-neo-primary boton-subir';
botonSubir.setAttribute('aria-label', 'Volver arriba');
botonSubir.innerHTML = '<i class="bi bi-arrow-up" aria-hidden="true"></i>';
botonSubir.hidden = true;
botonSubir.addEventListener('click', () => { window.scrollTo({ top: 0 }); principal.focus({ preventScroll: true }); });
document.body.append(botonSubir);
addEventListener('scroll', () => { botonSubir.hidden = scrollY < 600; }, { passive: true });

// Lo que depende de valores que ponen los scripts de cada página se prepara cuando ya corrieron todos
document.addEventListener('DOMContentLoaded', () => {
  actualizarEspejos();
  marcarGuardadas();
  // Contador de caracteres en los textos largos
  document.querySelectorAll('textarea[maxlength]').forEach(area => {
    const contador = document.createElement('div');
    contador.className = 'form-text text-end contador';
    const actualizar = () => { contador.textContent = `${area.value.length} / ${area.maxLength} caracteres`; };
    area.after(contador);
    area.addEventListener('input', actualizar);
    area.form?.addEventListener('reset', () => setTimeout(actualizar));
    actualizar();
  });
});
