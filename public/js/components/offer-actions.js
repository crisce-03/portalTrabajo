let guardadasRemotas = null;
let cargaGuardadas = null;

function marcarGuardadas() {
  if (usuario === 'candidato') {
    if (!cargaGuardadas) cargaGuardadas = apiRequest('/candidatos/me/guardadas')
      .then(({ data }) => { guardadasRemotas = data.ofertas.map(o => Number(o.id)); })
      .catch(() => { guardadasRemotas = []; });
    return cargaGuardadas.then(() => document.querySelectorAll('[data-guardar-oferta]').forEach(b =>
      pintarBotonGuardar(b, guardadasRemotas.includes(Number(b.dataset.guardarOferta)))));
  }
  const local = ofertasGuardadas();
  document.querySelectorAll('[data-guardar-oferta]').forEach(b => pintarBotonGuardar(b, local.includes(Number(b.dataset.guardarOferta))));
}

document.addEventListener('click', async evento => {
  const boton = evento.target.closest('[data-guardar-oferta]');
  if (!boton) return;
  evento.preventDefault();
  const id = Number(boton.dataset.guardarOferta);
  const guardada = boton.getAttribute('aria-pressed') !== 'true';
  boton.disabled = true;
  try {
    if (usuario === 'candidato') {
      await (guardada
        ? apiRequest(`/candidatos/me/guardadas/${id}`, { method: 'PUT' })
        : apiRequest(`/candidatos/me/guardadas/${id}`, { method: 'DELETE' }));
      guardadasRemotas = guardada
        ? [...new Set([...(guardadasRemotas || []), id])]
        : (guardadasRemotas || []).filter(x => x !== id);
    } else if (usuario === 'visitante') {
      const local = ofertasGuardadas();
      guardarOfertas(guardada ? [...new Set([...local, id])] : local.filter(x => x !== id));
    } else {
      throw new Error('Las ofertas guardadas están disponibles para cuentas de candidato.');
    }
    pintarBotonGuardar(boton, guardada);
    if (!guardada) document.querySelector(`[data-oferta-guardada="${id}"]`)?.remove();
    const listaGuardadas = document.getElementById('lista-guardadas');
    const sinGuardadas = document.getElementById('sin-guardadas');
    if (listaGuardadas && sinGuardadas) sinGuardadas.hidden = listaGuardadas.children.length > 0;
    notificar(guardada ? 'Oferta guardada.' : 'Quitaste la oferta de tus guardadas.', 'info');
  } catch (error) { notificar(error.message, 'error'); }
  finally { boton.disabled = false; }
});
