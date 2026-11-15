// Recursos destacados desde la API; ?categoria= muestra solo los de esa categoría.
const categoria = parametro('categoria');
if (categoria) document.getElementById('t-destacados').textContent = `Recursos de ${categoria}`;

apiRequest('/recursos' + (categoria ? `?categoria=${encodeURIComponent(categoria)}` : '')).then(({ data }) => {
  const recursos = data.filter(r => r.categoria !== 'Actualidad'); // las noticias tienen su propia página
  document.getElementById('sin-recursos').hidden = recursos.length > 0;
  document.getElementById('lista-recursos').innerHTML = recursos.map(r => {
    const [clase, icono] = ESTILO_RECURSO[r.categoria];
    return `
      <div class="col-md-4">
        <article class="neo-card p-3 h-100 d-flex flex-column">
          <span class="badge-neo badge-neo-${clase} align-self-start mb-2"><i class="bi bi-${icono}" aria-hidden="true"></i> ${esc(r.tipo ?? r.categoria)}</span>
          <h3 class="h6">${esc(r.titulo)}</h3>
          <p class="small text-secondary">${esc(r.resumen ?? '')}</p>
          <div class="d-flex justify-content-between align-items-center mt-auto">
            <span class="small text-secondary">${esc(r.lectura ?? '')}</span>
            <a class="btn btn-neo-secondary btn-sm" href="recurso.html?id=${r.id}">Abrir recurso <i class="bi bi-arrow-right" aria-hidden="true"></i></a>
          </div>
        </article>
      </div>`;
  }).join('');
}).catch(error => notificar(error.message, 'error'));
