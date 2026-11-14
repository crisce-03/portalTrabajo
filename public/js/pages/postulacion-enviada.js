const oferta = OFERTAS.find(o => o.id === Number(parametro('id'))) ?? OFERTAS[0];
    const enviadas = guardados('postulaciones');
    const enviada = enviadas.findLast(p => p.oferta === oferta.id)
      ?? { candidato: 'Héctor Alejandro García Guevara', cv: 'Hector_Garcia_CV.pdf' };
    const seguimiento = `POST-${String(enviadas.length || 1).padStart(3, '0')}`;

    document.getElementById('miga-oferta').href = `detalle-oferta.html?id=${oferta.id}`;
    document.getElementById('miga-postulacion').href = `postulacion.html?id=${oferta.id}`;
    document.getElementById('mensaje').textContent = `${oferta.empresa} ha recibido tu solicitud para la vacante ${oferta.titulo}. Ahora podrás consultar el estado desde tu perfil de candidato.`;
    document.getElementById('linea-vacante').textContent = `Vacante: ${oferta.titulo} · Empresa: ${oferta.empresa}`;
    document.getElementById('linea-candidato').textContent = `Candidato: ${enviada.candidato} · CV: ${enviada.cv}`;
    document.getElementById('linea-estado').textContent = `Estado inicial: Recibida · Número de seguimiento: ${seguimiento}`;
