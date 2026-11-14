document.addEventListener('click', evento => {
  const boton = evento.target.closest('[data-guardar-oferta]');
  if (!boton) return;
  const id = Number(boton.dataset.guardarOferta);
  const lista = ofertasGuardadas();
  const guardada = !lista.includes(id);
  guardarOfertas(guardada ? [...lista, id] : lista.filter(x => x !== id));
  marcarGuardadas();
  notificar(guardada ? 'Oferta guardada. La encontrarás en Mi perfil.' : 'Quitaste la oferta de tus guardadas.', 'info');
});
