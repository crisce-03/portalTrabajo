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
// Color e ícono de cada categoría de recursos
const ESTILO_RECURSO = {
  Entrevistas: ['ocean', 'play-btn-fill'], 'Currículum': ['community', 'file-earmark-text'],
  Habilidades: ['salary', 'graph-up-arrow'], Actualidad: ['warning', 'newspaper'],
};
const insigniaEstado = estado => `<span class="badge-neo badge-neo-${ESTADOS[estado][1]}">${ESTADOS[estado][0]}</span>`;

// shortcut: lo que el usuario crea (temas, respuestas, alertas) se guarda en sessionStorage; con la API, en el servidor
function guardados(clave) { try { return JSON.parse(sessionStorage.getItem(clave)) ?? []; } catch { return []; } }
function guardarEn(clave, elemento) {
  try { sessionStorage.setItem(clave, JSON.stringify([...guardados(clave), elemento])); } catch { /* solo dura esta página */ }
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
