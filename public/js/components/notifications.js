// Avisos flotantes para confirmar acciones, visibles aunque el usuario esté en otra parte de la página
const zonaAvisos = document.createElement('div');
zonaAvisos.className = 'toast-container position-fixed end-0 p-3 zona-avisos';
document.body.append(zonaAvisos);
function notificar(texto, tipo = 'exito') {
  const iconos = { exito: 'check-circle-fill', info: 'info-circle-fill', error: 'exclamation-triangle-fill' };
  const aviso = document.createElement('div');
  aviso.className = `toast toast-neo toast-${tipo}`;
  aviso.setAttribute('role', tipo === 'error' ? 'alert' : 'status');
  aviso.innerHTML = `
    <div class="d-flex align-items-center gap-2 p-3">
      <i class="bi bi-${iconos[tipo]} fs-5" aria-hidden="true"></i>
      <span class="me-auto"></span>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Cerrar aviso"></button>
    </div>`;
  aviso.querySelector('span').textContent = texto;
  zonaAvisos.append(aviso);
  aviso.addEventListener('hidden.bs.toast', () => aviso.remove());
  bootstrap.Toast.getOrCreateInstance(aviso, { delay: 4500 }).show();
}
