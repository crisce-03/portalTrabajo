const recurso = RECURSOS.find(r => r.id === parametro('id')) ?? RECURSOS[0];
    document.title = `${recurso.titulo} · PortalTrabajo`;
    document.getElementById('miga-categoria').textContent = recurso.categoria;
    const tipo = document.getElementById('r-tipo');
    tipo.className = `badge-neo badge-neo-${recurso.clase} mb-2`;
    tipo.innerHTML = `<i class="bi bi-${recurso.icono}" aria-hidden="true"></i> ${esc(recurso.tipo)}`;
    document.getElementById('r-titulo').textContent = recurso.titulo;
    document.getElementById('r-lectura').textContent = recurso.lectura;
    document.getElementById('r-icono').className = `bi bi-${recurso.icono} fs-1 text-ocean`;
    document.getElementById('r-resumen').textContent = recurso.resumen;
    document.getElementById('r-secciones').innerHTML = recurso.secciones.map(s => `
      <section class="mb-4">
        <h2 class="h5">${esc(s.titulo)}</h2>
        <p class="text-secondary">${esc(s.texto)}</p>
        ${s.puntos.length ? `<ul class="text-secondary">${s.puntos.map(p => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
      </section>`).join('');
    document.getElementById('lista-otros').innerHTML = RECURSOS.filter(r => r.id !== recurso.id).map(r => `
      <li class="neo-subbox p-3">
        <span class="badge-neo badge-neo-${r.clase} mb-2">${esc(r.categoria)}</span>
        <a class="d-block fw-bold" href="recurso.html?id=${r.id}">${esc(r.titulo)}</a>
        <span class="small text-secondary">${esc(r.lectura)}</span>
      </li>`).join('');
