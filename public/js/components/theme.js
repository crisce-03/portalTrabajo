// Tema visual compartido. Se ejecuta en el head para aplicar la preferencia antes de pintar la página.
const THEME_STORAGE_KEY = 'portalTrabajo.tema';

function leerTema() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function aplicarTema(tema) {
  document.documentElement.dataset.theme = tema;
}

aplicarTema(leerTema());

document.addEventListener('DOMContentLoaded', () => {
  const boton = document.getElementById('theme-toggle');
  if (!boton) return;

  const actualizar = tema => {
    const oscuro = tema === 'dark';
    const texto = oscuro ? 'Modo claro' : 'Modo oscuro';
    const accion = oscuro ? 'Activar modo claro' : 'Activar modo oscuro';
    boton.setAttribute('aria-pressed', String(oscuro));
    boton.setAttribute('aria-label', accion);
    boton.title = accion;
    boton.innerHTML = `<i class="bi bi-${oscuro ? 'sun' : 'moon-stars'}" aria-hidden="true"></i><span class="d-none d-md-inline ms-1">${texto}</span>`;
  };

  actualizar(document.documentElement.dataset.theme || 'light');
  boton.addEventListener('click', () => {
    const tema = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    aplicarTema(tema);
    actualizar(tema);
    try { localStorage.setItem(THEME_STORAGE_KEY, tema); } catch { /* El tema solo dura esta página. */ }
  });
});
