// shortcut: busca la oferta en los datos de ejemplo; con la API, GET /api/ofertas/:id
    const oferta = OFERTAS.find(o => o.id === Number(parametro('id'))) ?? OFERTAS[0];
    const empresa = EMPRESAS.find(e => e.nombre === oferta.empresa);
    const texto = (id, valor) => document.getElementById(id).textContent = valor;
    const lista = (id, elementos) => document.getElementById(id).innerHTML = elementos.map(e => `<li>${esc(e)}</li>`).join('');

    document.title = `${oferta.titulo} · PortalTrabajo`;
    texto('o-id', `ID: #JOB-${oferta.id}`);
    texto('o-titulo', oferta.titulo);
    texto('o-meta', `${oferta.empresa} · ${oferta.ubicacion} · Contacto: ${oferta.contacto}`);
    document.getElementById('o-etiquetas').innerHTML = `
      <span class="badge-neo badge-neo-neutral">${esc(oferta.modalidad)}</span>
      <span class="badge-neo badge-neo-neutral">${esc(oferta.contrato)}</span>
      <span class="badge-neo badge-neo-ocean">${esc(oferta.sector)}</span>
      <span class="badge-neo badge-neo-salary">${formatoSalario(oferta)}</span>`;
    document.getElementById('o-aplicar').href = `postulacion.html?id=${oferta.id}`;
    document.getElementById('o-guardar').dataset.guardarOferta = oferta.id;
    texto('o-descripcion', oferta.descripcion);
    lista('o-responsabilidades', oferta.responsabilidades);
    lista('o-requisitos', oferta.requisitos);
    lista('o-beneficios', oferta.beneficios);

    texto('e-nombre', empresa.nombre);
    texto('e-sector', empresa.sector);
    texto('e-contacto', empresa.contacto);
    texto('e-ubicacion', empresa.ubicacion);
    texto('e-web', empresa.web);
    document.getElementById('e-perfil').href = `valoraciones.html#${empresa.id}`;
    document.getElementById('e-promedio').innerHTML = `${estrellas(empresa.promedio)} ${empresa.promedio} / 5 · ${empresa.opiniones} opiniones`;
    document.getElementById('lista-comentarios').innerHTML = empresa.resenas.slice(0, 2).map(r => `
      <div class="col-md-6">
        <div class="neo-subbox p-3 h-100">
          <p class="fw-bold small mb-1">${esc(r.autor)} <span class="ms-2"><i class="bi bi-star-fill" aria-hidden="true"></i> ${r.calificacion}/5</span></p>
          <p class="small text-secondary mb-0">“${esc(r.texto)}”</p>
        </div>
      </div>`).join('');
    document.getElementById('e-comentar').href = `perfil-usuario.html?empresa=${encodeURIComponent(empresa.nombre)}#valoraciones`;
