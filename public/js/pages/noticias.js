// Las noticias son los recursos de la categoría «Actualidad».
apiRequest('/recursos?categoria=Actualidad').then(({ data }) => {
  document.getElementById('sin-noticias').hidden = data.length > 0;
  document.getElementById('lista-noticias').insertAdjacentHTML('afterbegin', data.map(n => `
    <article class="neo-card p-4">
      <div class="d-flex flex-wrap justify-content-between gap-2 mb-2">
        <span class="badge-neo badge-neo-warning"><i class="bi bi-newspaper" aria-hidden="true"></i> ${esc(n.tipo ?? n.categoria)}</span>
        <span class="small text-secondary">${formatoFecha(n.fecha.slice(0, 10))}</span>
      </div>
      <h2 class="h5">${esc(n.titulo)}</h2>
      <p class="text-secondary">${esc(n.resumen ?? '')}</p>
      ${n.secciones.length ? `
      <details>
        <summary class="fw-bold text-ocean">Leer más</summary>
        ${n.secciones.map(s => `<p class="text-secondary mt-2 mb-0">${esc(s.texto)}</p>`).join('')}
      </details>` : ''}
    </article>`).join(''));
}).catch(error => notificar(error.message, 'error'));
