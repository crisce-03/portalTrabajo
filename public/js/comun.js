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

const pie = document.getElementById('pie');
pie.className = 'pie-neo mt-4';
pie.innerHTML = '<div class="container-xl py-3">PortalTrabajo © 2026 · Proyecto DPWA — UNICAES</div>';

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

// Muestra un mensaje en el [role=status] del formulario
function avisar(form, texto) {
  const estado = form?.querySelector('[role="status"]');
  if (estado) estado.textContent = texto;
}

// ---------- Formularios ----------

// Formularios con class="needs-validation": validan con HTML5; si todo está bien disparan el evento
// "enviado" (para la lógica de cada página) y luego van a data-destino o muestran data-exito.
// shortcut: todavía no envían nada al servidor; cuando exista la API, hacer el fetch en "enviado"
document.querySelectorAll('form.needs-validation').forEach(form => {
  form.addEventListener('submit', evento => {
    evento.preventDefault();
    form.classList.add('was-validated');
    if (!form.checkValidity()) {
      avisar(form, 'Revisa los campos marcados en rojo.');
      form.querySelector(':invalid')?.focus();
      return;
    }
    form.dispatchEvent(new Event('enviado'));
    if (form.dataset.destino) location.href = form.dataset.destino;
    else if (form.dataset.exito) avisar(form, form.dataset.exito);
  });
  form.addEventListener('reset', () => {
    form.classList.remove('was-validated');
    avisar(form, '');
    setTimeout(actualizarEspejos); // el reset cambia los valores después del evento
  });
});

// Botones que solo confirman una acción (p. ej. "Guardar borrador")
document.querySelectorAll('[data-aviso]').forEach(boton =>
  boton.addEventListener('click', () => avisar(boton.closest('form'), boton.dataset.aviso)));

// Vista previa en vivo: un elemento con data-espejo="campo" copia el valor de name="campo"
function actualizarEspejos() {
  document.querySelectorAll('[data-espejo]').forEach(destino => {
    const campo = document.querySelector(`[name="${destino.dataset.espejo}"]`);
    if (campo) destino.textContent = campo.value.trim() || destino.dataset.vacio || '';
  });
}
document.addEventListener('input', actualizarEspejos);

// Archivos (CV): muestra el nombre elegido y rechaza más de 5 MB
const MAX_ARCHIVO = 5 * 1024 * 1024;
document.querySelectorAll('input[type="file"][data-muestra]').forEach(input => {
  input.addEventListener('change', () => {
    const archivo = input.files[0];
    if (!archivo) return;
    input.setCustomValidity(archivo.size > MAX_ARCHIVO ? 'El archivo supera 5 MB.' : '');
    document.getElementById(input.dataset.muestra).textContent =
      input.validity.valid ? archivo.name : `${archivo.name} (supera 5 MB)`;
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
