const oferta = OFERTAS.find(o => o.id === Number(parametro('id'))) ?? OFERTAS[0];
    const formPostulacion = document.getElementById('form-postulacion');
    const enlaceOferta = `detalle-oferta.html?id=${oferta.id}`;

    document.getElementById('miga-oferta').href = enlaceOferta;
    document.getElementById('volver-oferta').href = enlaceOferta;
    document.querySelectorAll('.nombre-empresa').forEach(e => e.textContent = oferta.empresa);
    document.getElementById('r-titulo').textContent = oferta.titulo;
    document.getElementById('r-detalles').innerHTML = [oferta.ubicacion, `Modalidad: ${oferta.modalidad}`,
      `Jornada: ${oferta.contrato}`, `Salario: ${formatoSalario(oferta)}`, `ID de vacante: #JOB-${oferta.id}`]
      .map(d => `<li>${esc(d)}</li>`).join('');
    formPostulacion.mensaje.value = `Estimado equipo de ${oferta.empresa}:\nMe interesa la vacante de ${oferta.titulo}. Cuento con experiencia relacionada y me gustaría contribuir a sus proyectos.`;

    // Flujo de navegación: para aplicar hay que tener sesión de candidato
    const esCandidato = usuario === 'candidato';
    document.getElementById('aviso-sesion').hidden = esCandidato;
    if (esCandidato) formPostulacion.dataset.destino = `postulacion-enviada.html?id=${oferta.id}`;

    // shortcut: guarda la postulación en sessionStorage; con la API, POST /api/postulaciones (con el CV)
    formPostulacion.addEventListener('enviado', () => {
      if (!esCandidato) {
        avisar(formPostulacion, 'Inicia sesión como candidato para enviar tu postulación.');
        document.querySelector('#aviso-sesion [data-abrir-login]').click();
        return;
      }
      guardarEn('postulaciones', {
        oferta: oferta.id, fecha: new Date().toISOString().slice(0, 10),
        candidato: `${formPostulacion.nombre.value.trim()} ${formPostulacion.apellido.value.trim()}`,
        cv: document.getElementById('c-cv-nombre').textContent,
      });
    });
