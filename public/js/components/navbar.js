// Navbar, pie y comportamiento compartido por todas las pantallas.
// El rol viene de la sesión; cada página privada declara data-requiere y cada vista declara data-activo.

const ENLACES_POR_ROL = {
  visitante: [
    ['busqueda', 'index.html', 'Buscar empleo'],
    ['valoraciones', 'valoraciones.html', 'Valoraciones'],
    ['empresa', 'registro.html?tipo=empresa', 'Soy empresa'],
  ],
  candidato: [
    ['busqueda', 'index.html', 'Buscar empleo'],
    ['valoraciones', 'valoraciones.html', 'Valoraciones'],
    ['perfil', 'perfil-usuario.html', 'Mi perfil'],
  ],
  empresa: [
    ['panel', 'panel-empresa.html', 'Panel empresarial'],
    ['publicar', 'publicar-oferta.html', 'Publicar oferta'],
    ['postulaciones', 'postulaciones.html', 'Candidatos'],
    ['datos-empresa', 'datos-empresa.html', 'Datos de empresa'],
    ['busqueda', 'resultados.html', 'Ver empleos'],
  ],
  admin: [
    ['admin', 'admin.html', 'Administración'],
  ],
};
const INICIO_POR_ROL = { candidato: 'perfil-usuario.html', empresa: 'panel-empresa.html', admin: 'admin.html' };

// La sesión vive en sessionStorage: el rol arma la navbar y api.js envía el token en cada petición
function leerSesion(clave = 'usuario') { try { return sessionStorage.getItem(clave); } catch { return null; } }
function iniciarSesion(datos) { // datos = { token, usuario } tal como responden /api/login y /api/registro
  try {
    sessionStorage.setItem('token', datos.token);
    sessionStorage.setItem('usuario', datos.usuario.rol);
    sessionStorage.setItem('nombre', `${datos.usuario.nombre} ${datos.usuario.apellidos[0]}.`);
  } catch { /* sin almacenamiento: no queda sesión */ }
}
function cerrarSesion() { try { ['token', 'usuario', 'nombre'].forEach(clave => sessionStorage.removeItem(clave)); } catch { /* sin almacenamiento */ } }
const ROLES = ['visitante', 'candidato', 'empresa', 'admin'];
const rolGuardado = leerSesion();
const usuario = ROLES.includes(rolGuardado) && leerSesion('token') ? rolGuardado : 'visitante';

const rolRequerido = document.body.dataset.requiere;
if (rolRequerido && usuario !== rolRequerido) {
  if (usuario === 'visitante') {
    const destino = `${location.pathname.split('/').pop()}${location.search}`;
    const parametros = new URLSearchParams({ requiere: rolRequerido, destino });
    location.replace(`index.html?${parametros}`);
  } else {
    location.replace(INICIO_POR_ROL[usuario] || 'index.html');
  }
}

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
        <input id="login-clave" name="clave" type="password" class="form-control mb-3" autocomplete="current-password" required>
        <button type="submit" class="btn btn-neo-primary w-100">Entrar</button>
        <p class="small text-center mt-2 mb-0">¿No tienes cuenta? <a href="registro.html">Regístrate</a></p>
        <span role="status" class="small text-danger d-block text-center"></span>
      </form>
    </div>
    <a class="btn btn-neo-primary btn-sm" href="registro.html">Registrarse</a>`,
  candidato: `
    <a class="badge-neo badge-neo-ocean fs-6" href="perfil-usuario.html"><i class="bi bi-person-circle" aria-hidden="true"></i> ${esc(leerSesion('nombre') || 'Mi perfil')}</a>
    <a class="btn btn-neo-secondary btn-sm" href="index.html" data-salir>Cerrar Sesión</a>`,
  empresa: `
    <a class="btn btn-neo-secondary btn-sm" href="panel-empresa.html">Mi empresa</a>
    <a class="btn btn-neo-primary btn-sm" href="index.html" data-salir>Cerrar Sesión</a>`,
  admin: `
    <a class="badge-neo badge-neo-community" href="admin.html"><i class="bi bi-shield-shaded" aria-hidden="true"></i> Admin</a>
    <a class="btn btn-neo-primary btn-sm" href="index.html" data-salir>Cerrar Sesión</a>`,
};

const { activo } = document.body.dataset;
const links = ENLACES_POR_ROL[usuario].map(([clave, href, texto]) => clave === activo
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
      <div class="d-flex flex-wrap align-items-center gap-2">
        ${ACCIONES[usuario]}
        <button id="theme-toggle" type="button" class="btn btn-neo-secondary btn-sm btn-tema" aria-label="Activar modo oscuro" aria-pressed="false" title="Activar modo oscuro">
          <i class="bi bi-moon-stars" aria-hidden="true"></i><span class="d-none d-md-inline ms-1">Modo oscuro</span>
        </button>
      </div>
    </div>
  </nav>`;

// Un visitante puede leer, pero las acciones de participación muestran el acceso adecuado.
function aplicarVisibilidadRol(raiz = document) {
  raiz.querySelectorAll('[data-visible-rol]').forEach(elemento => {
    const visible = elemento.dataset.visibleRol.split(/\s+/).includes(usuario);
    elemento.hidden = !visible;
    elemento.classList.toggle('d-none', !visible);
  });
}
document.addEventListener('DOMContentLoaded', () => aplicarVisibilidadRol());

// "Saltar al contenido" para quien navega con teclado o lector de pantalla
const principal = document.querySelector('main');
principal.id ||= 'contenido';
principal.tabIndex = -1;
document.body.insertAdjacentHTML('afterbegin',
  `<a class="visually-hidden-focusable saltar btn btn-neo-primary" href="#${principal.id}">Saltar al contenido</a>`);

// ---------- Sesión ----------

document.getElementById('form-login')?.addEventListener('enviado', async evento => {
  const form = evento.target;
  try {
    const { data } = await apiRequest('/login', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(form))) });
    iniciarSesion(data);
    const { rol } = data.usuario;
    // Páginas con data-tras-login="aqui" (p. ej. la postulación) se recargan para seguir donde iba el usuario
    const destinoSolicitado = parametro('destino');
    const rolSolicitado = parametro('requiere');
    const destinoLocal = destinoSolicitado && !destinoSolicitado.includes('://') && !destinoSolicitado.startsWith('/')
      ? destinoSolicitado
      : null;
    location.href = destinoLocal && rol === rolSolicitado
      ? destinoLocal
      : document.body.dataset.trasLogin === 'aqui'
        ? location.pathname + location.search
        : INICIO_POR_ROL[rol];
  } catch (error) {
    avisar(form, error.message);
  }
});
if (parametro('requiere') && usuario === 'visitante') {
  const nombreRol = { candidato: 'candidato', empresa: 'empresa', admin: 'administrador' }[parametro('requiere')];
  if (nombreRol) notificar(`Esta sección es para ${nombreRol}. Inicia sesión para continuar o crea una cuenta.`, 'info');
}
document.querySelectorAll('[data-salir]').forEach(link => link.addEventListener('click', cerrarSesion));

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
