// Navbar, pie y comportamiento compartido por todas las pantallas.
// Cada página indica en <body> para quién es (data-usuario) y qué menú resaltar (data-activo).

const ENLACES = [
  ['busqueda', 'index.html', 'Búsqueda de trabajo'],
  ['publicar', 'publicar-oferta.html', 'Publicar empleos'],
  ['recursos', 'recursos.html', 'Recursos'],
  ['foros', 'foros.html', 'Foros'],
  ['valoraciones', 'valoraciones.html', 'Valoraciones de empresas'],
  ['perfil', 'perfil-usuario.html', 'Mi perfil'],
];
const INICIO_POR_ROL = { candidato: 'perfil-usuario.html', empresa: 'panel-empresa.html', admin: 'admin.html' };

// shortcut: la sesión se simula en sessionStorage; cuando exista login real, el servidor decide el rol
function leerSesion() { try { return sessionStorage.getItem('usuario'); } catch { return null; } }
function guardarSesion(rol) { try { sessionStorage.setItem('usuario', rol); } catch { /* sin almacenamiento: solo dura esta página */ } }
const usuario = leerSesion() || document.body.dataset.usuario || 'visitante';

const ACCIONES = {
  visitante: `
    <div class="dropdown">
      <button id="boton-login" class="btn btn-neo-secondary btn-sm dropdown-toggle" type="button"
        data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">Iniciar Sesión</button>
      <form id="form-login" class="dropdown-menu dropdown-menu-end p-3 needs-validation" novalidate>
        <p class="fw-bold font-inter mb-2">Iniciar sesión</p>
        <label class="form-label" for="login-correo">Correo electrónico</label>
        <input id="login-correo" name="correo" type="email" class="form-control mb-2" autocomplete="username" required>
        <label class="form-label" for="login-clave">Contraseña</label>
        <input id="login-clave" name="clave" type="password" class="form-control mb-2" autocomplete="current-password" required>
        <label class="form-label" for="login-rol">Ingresar como</label>
        <select id="login-rol" name="rol" class="form-select mb-3">
          <option value="candidato">Candidato</option>
          <option value="empresa">Empresa</option>
          <option value="admin">Administrador</option>
        </select>
        <button type="submit" class="btn btn-neo-primary w-100">Entrar</button>
        <p class="small text-center mt-2 mb-0">¿No tienes cuenta? <a href="registro.html">Regístrate</a></p>
        <span role="status" class="small text-danger d-block text-center"></span>
      </form>
    </div>
    <a class="btn btn-neo-primary btn-sm" href="registro.html">Registrarse</a>`,
  candidato: `
    <a class="badge-neo badge-neo-ocean fs-6" href="perfil-usuario.html"><i class="bi bi-person-circle" aria-hidden="true"></i> Héctor G.</a>
    <a class="btn btn-neo-secondary btn-sm" href="index.html" data-salir>Cerrar Sesión</a>`,
  empresa: `
    <a class="btn btn-neo-secondary btn-sm" href="panel-empresa.html">Mi empresa</a>
    <a class="btn btn-neo-primary btn-sm" href="index.html" data-salir>Cerrar Sesión</a>`,
  admin: `
    <a class="badge-neo badge-neo-community" href="admin.html"><i class="bi bi-shield-shaded" aria-hidden="true"></i> Admin</a>
    <a class="btn btn-neo-primary btn-sm" href="index.html" data-salir>Cerrar Sesión</a>`,
};

const { activo } = document.body.dataset;
const links = ENLACES.map(([clave, href, texto]) => clave === activo
  ? `<li class="nav-item"><a class="nav-link active" aria-current="page" href="${href}">${texto}</a></li>`
  : `<li class="nav-item"><a class="nav-link" href="${href}">${texto}</a></li>`).join('');

document.getElementById('navbar').innerHTML = `
  <nav class="navbar navbar-expand-xl navbar-neo px-3 py-2" aria-label="Principal">
    <a class="navbar-brand d-flex align-items-center gap-2" href="index.html">
      <span class="logo-neo"><i class="bi bi-briefcase-fill" aria-hidden="true"></i></span>PortalTrabajo
    </a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu-principal"
      aria-controls="menu-principal" aria-expanded="false" aria-label="Abrir menú">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="menu-principal">
      <ul class="navbar-nav gap-1 mx-auto my-2 my-xl-0">${links}</ul>
      <div class="d-flex flex-wrap align-items-center gap-2">${ACCIONES[usuario]}</div>
    </div>
  </nav>`;

// "Saltar al contenido" para quien navega con teclado o lector de pantalla
const principal = document.querySelector('main');
principal.id ||= 'contenido';
principal.tabIndex = -1;
document.body.insertAdjacentHTML('afterbegin',
  `<a class="visually-hidden-focusable saltar btn btn-neo-primary" href="#${principal.id}">Saltar al contenido</a>`);

const pie = document.getElementById('pie');
pie.className = 'pie-neo mt-5';
pie.innerHTML = `
  <div class="container-xl py-4">
    <div class="row g-4">
      <div class="col-md-4">
        <p class="fw-bold font-inter d-flex align-items-center gap-2 mb-2"><span class="logo-neo"><i class="bi bi-briefcase-fill" aria-hidden="true"></i></span>PortalTrabajo</p>
        <p class="mb-0">Conectamos talento y empresas en El Salvador.</p>
      </div>
      <nav class="col-6 col-md-2" aria-label="Candidatos">
        <p class="fw-bold mb-2">Candidatos</p>
        <ul class="list-unstyled d-grid gap-1 mb-0"><li><a href="resultados.html">Buscar empleo</a></li><li><a href="registro.html">Crear cuenta</a></li><li><a href="perfil-usuario.html">Mi perfil</a></li></ul>
      </nav>
      <nav class="col-6 col-md-2" aria-label="Empresas">
        <p class="fw-bold mb-2">Empresas</p>
        <ul class="list-unstyled d-grid gap-1 mb-0"><li><a href="publicar-oferta.html">Publicar empleos</a></li><li><a href="panel-empresa.html">Panel empresarial</a></li><li><a href="registro.html?tipo=empresa">Registrar empresa</a></li></ul>
      </nav>
      <nav class="col-6 col-md-2" aria-label="Comunidad">
        <p class="fw-bold mb-2">Comunidad</p>
        <ul class="list-unstyled d-grid gap-1 mb-0"><li><a href="recursos.html">Recursos</a></li><li><a href="noticias.html">Noticias</a></li><li><a href="foros.html">Foros</a></li><li><a href="valoraciones.html">Valoraciones</a></li></ul>
      </nav>
      <div class="col-6 col-md-2">
        <p class="fw-bold mb-2">Ayuda</p>
        <a href="mailto:soporte@portaltrabajo.com">soporte@portaltrabajo.com</a>
      </div>
    </div>
    <p class="small mt-4 mb-0">PortalTrabajo © 2026 · Proyecto DPWA — UNICAES</p>
  </div>`;

// ---------- Utilidades ----------

// Para buscar sin importar mayúsculas ni tildes
const normalizar = texto => texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
// Todo texto que venga del usuario o de la API pasa por aquí antes de ir a innerHTML
const esc = texto => String(texto).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const parametro = nombre => new URLSearchParams(location.search).get(nombre);

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const formatoFecha = iso => { const [a, m, d] = iso.split('-'); return `${Number(d)}/${MESES[m - 1]}/${a}`; };
const formatoSalario = o => `$${o.salarioMin.toLocaleString('en-US')} – $${o.salarioMax.toLocaleString('en-US')}`;
const estrellas = valor => [1, 2, 3, 4, 5].map(n =>
  `<i class="bi bi-star${n <= Math.round(valor) ? '-fill' : ''}" aria-hidden="true"></i>`).join('');

const ESTADOS = {
  pendiente: ['Pendiente', 'warning'], revision: ['En revisión', 'ocean'],
  contactado: ['Contactado', 'salary'], descartado: ['Descartado', 'danger'],
};
const insigniaEstado = estado => `<span class="badge-neo badge-neo-${ESTADOS[estado][1]}">${ESTADOS[estado][0]}</span>`;

// shortcut: lo que el usuario crea (temas, respuestas, alertas) se guarda en sessionStorage; con la API, en el servidor
function guardados(clave) { try { return JSON.parse(sessionStorage.getItem(clave)) ?? []; } catch { return []; } }
function guardarEn(clave, elemento) {
  try { sessionStorage.setItem(clave, JSON.stringify([...guardados(clave), elemento])); } catch { /* solo dura esta página */ }
}

// Muestra un mensaje en el [role=status] del formulario (errores)
function avisar(form, texto) {
  const estado = form?.querySelector('[role="status"]');
  if (estado) estado.textContent = texto;
}

// Avisos flotantes para confirmar acciones, visibles aunque el usuario esté en otra parte de la página
const zonaAvisos = document.createElement('div');
zonaAvisos.className = 'toast-container position-fixed end-0 p-3 zona-avisos';
document.body.append(zonaAvisos);
function notificar(texto, tipo = 'exito') {
  const iconos = { exito: 'check-circle-fill', info: 'info-circle-fill', error: 'exclamation-triangle-fill' };
  const aviso = document.createElement('div');
  aviso.className = `toast toast-neo toast-${tipo}`;
  aviso.setAttribute('role', tipo === 'error' ? 'alert' : 'status');
  aviso.innerHTML = `
    <div class="d-flex align-items-center gap-2 p-3">
      <i class="bi bi-${iconos[tipo]} fs-5" aria-hidden="true"></i>
      <span class="me-auto"></span>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Cerrar aviso"></button>
    </div>`;
  aviso.querySelector('span').textContent = texto;
  zonaAvisos.append(aviso);
  aviso.addEventListener('hidden.bs.toast', () => aviso.remove());
  bootstrap.Toast.getOrCreateInstance(aviso, { delay: 4500 }).show();
}

// Ofertas guardadas: preferencia de cada visitante en su navegador
// shortcut: localStorage; con la API, POST/DELETE /api/candidatos/me/guardadas
function ofertasGuardadas() { try { return JSON.parse(localStorage.getItem('ofertasGuardadas')) ?? []; } catch { return []; } }
function guardarOfertas(lista) { try { localStorage.setItem('ofertasGuardadas', JSON.stringify(lista)); } catch { /* sin almacenamiento */ } }
function pintarBotonGuardar(boton, guardada) {
  boton.setAttribute('aria-pressed', String(guardada));
  boton.innerHTML = `<i class="bi bi-bookmark${guardada ? '-fill' : ''}" aria-hidden="true"></i>`
    + ('soloIcono' in boton.dataset ? '' : ` ${guardada ? 'Guardada' : 'Guardar oferta'}`);
}
// Las páginas que pintan ofertas llaman a esto después de pintar
function marcarGuardadas() {
  const lista = ofertasGuardadas();
  document.querySelectorAll('[data-guardar-oferta]').forEach(b => pintarBotonGuardar(b, lista.includes(Number(b.dataset.guardarOferta))));
}
document.addEventListener('click', evento => {
  const boton = evento.target.closest('[data-guardar-oferta]');
  if (!boton) return;
  const id = Number(boton.dataset.guardarOferta);
  const lista = ofertasGuardadas();
  const guardada = !lista.includes(id);
  guardarOfertas(guardada ? [...lista, id] : lista.filter(x => x !== id));
  marcarGuardadas();
  notificar(guardada ? 'Oferta guardada. La encontrarás en Mi perfil.' : 'Quitaste la oferta de tus guardadas.', 'info');
});

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

// ---------- Sesión ----------

document.getElementById('form-login')?.addEventListener('enviado', evento => {
  const rol = evento.target.rol.value;
  guardarSesion(rol);
  // Páginas con data-tras-login="aqui" (p. ej. la postulación) se recargan para seguir donde iba el usuario
  evento.target.dataset.destino = document.body.dataset.trasLogin === 'aqui'
    ? location.pathname + location.search
    : INICIO_POR_ROL[rol];
});
document.querySelectorAll('[data-salir]').forEach(link => link.addEventListener('click', () => guardarSesion('visitante')));

// Enlaces "Inicia sesión" fuera de la navbar abren el formulario del encabezado
document.querySelectorAll('[data-abrir-login]').forEach(link => link.addEventListener('click', evento => {
  const boton = document.getElementById('boton-login');
  if (!boton) return;
  evento.preventDefault();
  evento.stopPropagation(); // si el clic llega al documento, Bootstrap cierra el menú recién abierto
  if (getComputedStyle(document.querySelector('.navbar-toggler')).display !== 'none') {
    bootstrap.Collapse.getOrCreateInstance('#menu-principal', { toggle: false }).show(); // en celular el menú está plegado
  }
  window.scrollTo({ top: 0 });
  bootstrap.Dropdown.getOrCreateInstance(boton).show();
  document.getElementById('login-correo').focus();
}));

// Menús laterales: resalta la sección elegida
document.querySelectorAll('.nav-pills-neo').forEach(menu => {
  menu.addEventListener('click', evento => {
    const link = evento.target.closest('.nav-link:not(.disabled)');
    if (!link) return;
    const anterior = menu.querySelector('.nav-link.active');
    anterior?.classList.remove('active');
    anterior?.removeAttribute('aria-current');
    link.classList.add('active');
    link.setAttribute('aria-current', 'true');
  });
});
