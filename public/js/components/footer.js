const pie = document.getElementById('pie');
pie.className = 'pie-neo mt-5';
const ENLACES_PIE = {
  visitante: [
    ['Explorar empleos', [['Buscar empleo', 'resultados.html'], ['Crear cuenta', 'registro.html']]],
    ['Para empresas', [['Registrar empresa', 'registro.html?tipo=empresa']]],
    ['Comunidad', [['Recursos', 'recursos.html'], ['Noticias', 'noticias.html'], ['Foros', 'foros.html'], ['Valoraciones', 'valoraciones.html']]],
  ],
  candidato: [
    ['Mi espacio', [['Mi perfil', 'perfil-usuario.html'], ['Mis solicitudes', 'perfil-usuario.html#solicitudes'], ['Alertas', 'perfil-usuario.html#alertas']]],
    ['Empleo', [['Buscar empleo', 'resultados.html'], ['Ofertas guardadas', 'perfil-usuario.html#guardadas']]],
    ['Comunidad', [['Recursos', 'recursos.html'], ['Foros', 'foros.html'], ['Valoraciones', 'valoraciones.html']]],
  ],
  empresa: [
    ['Mi empresa', [['Panel empresarial', 'panel-empresa.html'], ['Publicar oferta', 'publicar-oferta.html'], ['Postulaciones', 'postulaciones.html'], ['Datos de empresa', 'datos-empresa.html']]],
    ['Portal público', [['Ver empleos', 'resultados.html'], ['Recursos', 'recursos.html']]],
  ],
  admin: [
    ['Administración', [['Consola administrativa', 'admin.html']]],
    ['Portal público', [['Inicio', 'index.html'], ['Buscar empleo', 'resultados.html']]],
  ],
};
const gruposPie = ENLACES_PIE[usuario].map(([titulo, elementos]) => `
  <nav class="col-6 col-md-${usuario === 'empresa' || usuario === 'admin' ? '3' : '2'}" aria-label="${titulo}">
    <p class="fw-bold mb-2">${titulo}</p>
    <ul class="list-unstyled d-grid gap-1 mb-0">${elementos.map(([texto, href]) => `<li><a href="${href}">${texto}</a></li>`).join('')}</ul>
  </nav>`).join('');
pie.innerHTML = `
  <div class="container-xl py-4">
    <div class="row g-4">
      <div class="col-md-4">
        <p class="fw-bold font-inter d-flex align-items-center gap-2 mb-2"><span class="logo-neo"><i class="bi bi-briefcase-fill" aria-hidden="true"></i></span>PortalTrabajo</p>
        <p class="mb-0">Conectamos talento y empresas en El Salvador.</p>
      </div>
      ${gruposPie}
      <div class="col-6 col-md-2">
        <p class="fw-bold mb-2">Ayuda</p>
        <a href="mailto:soporte@portaltrabajo.com">soporte@portaltrabajo.com</a>
      </div>
    </div>
    <p class="small mt-4 mb-0">PortalTrabajo © 2026 · Proyecto DPWA — UNICAES</p>
  </div>`;
