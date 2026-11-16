const TIPOS = {
  usuario: ['Usuario', 'neutral'], empresa: ['Empresa', 'ocean'], vacante: ['Vacante', 'community'],
  valoracion: ['Valoración', 'warning'],
};
const COLOR_ESTADO = {
  Verificada: 'salary', Activa: 'salary', Habilitado: 'salary', Pendiente: 'warning',
  Cerrada: 'neutral', Borrador: 'neutral', Suspendida: 'danger', Deshabilitado: 'danger',
};
let registros = [];
let reportes = [];
let filtroTipo = '';

const nombreEntidad = tipo => TIPOS[tipo]?.[0] || tipo;
const iconoBoton = (accion, icono, etiqueta, peligro = false, datos = '') =>
  `<button type="button" class="btn ${peligro ? 'btn-neo-danger' : 'btn-neo-secondary'} btn-sm" data-accion="${accion}" ${datos} aria-label="${esc(etiqueta)}" title="${esc(etiqueta)}"><i class="bi bi-${icono}" aria-hidden="true"></i></button>`;

function acciones(r) {
  if (r.tipo === 'usuario') return iconoBoton('activo', r.activo ? 'person-x' : 'person-check', r.activo ? 'Deshabilitar cuenta' : 'Habilitar cuenta', !r.activo, `data-valor="${!r.activo}"`)
    + iconoBoton('eliminar', 'trash', 'Eliminar usuario', true);
  if (r.tipo === 'empresa') return iconoBoton('verificar', 'patch-check', r.verificada ? 'Quitar verificación' : 'Verificar empresa', false, `data-valor="${!r.verificada}"`)
    + iconoBoton('activo', r.activo ? 'slash-circle' : 'check-circle', r.activo ? 'Suspender empresa' : 'Reactivar empresa', r.activo, `data-valor="${!r.activo}"`)
    + iconoBoton('eliminar', 'trash', 'Eliminar empresa', true);
  const nuevoEstado = r.estado === 'Activa' ? 'cerrada' : 'activa';
  return iconoBoton('estado-oferta', r.estado === 'Activa' ? 'pause-circle' : 'play-circle', r.estado === 'Activa' ? 'Cerrar vacante' : 'Publicar vacante', r.estado === 'Activa', `data-valor="${nuevoEstado}"`)
    + iconoBoton('eliminar', 'trash', 'Eliminar vacante', true);
}

function pintarTabla() {
  const cuerpo = document.querySelector('#tabla-control tbody');
  const visibles = registros.filter(r => !filtroTipo || r.tipo === filtroTipo);
  cuerpo.innerHTML = visibles.map(r => `
    <tr data-id="${r.id}" data-tipo="${r.tipo}">
      <td><span class="badge-neo badge-neo-${TIPOS[r.tipo][1]}">${TIPOS[r.tipo][0]}</span></td>
      <td><strong>${esc(r.nombre)}</strong><span class="d-block small text-secondary">${esc(r.detalle || '')}</span></td>
      <td><span class="badge-neo badge-neo-${COLOR_ESTADO[r.estado] || 'neutral'}">${esc(r.estado)}</span></td>
      <td class="text-end text-nowrap"><div class="d-inline-flex gap-1">${acciones(r)}</div></td>
    </tr>`).join('') || '<tr><td colspan="4" class="text-secondary p-3">No hay registros para mostrar.</td></tr>';
}

const fechaHora = iso => new Date(iso).toLocaleString('es-SV', { dateStyle: 'medium', timeStyle: 'short' });
function pintarReportes() {
  const bandeja = document.getElementById('bandeja');
  bandeja.innerHTML = reportes.map(r => `
    <article class="neo-subbox p-3 reporte" data-reporte="${r.id}">
      <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
        <span class="badge-neo badge-neo-danger">Reporte #${r.id}</span>
        <span class="badge-neo badge-neo-${TIPOS[r.tipo]?.[1] || 'neutral'}">${nombreEntidad(r.tipo)}</span>
        <span class="small text-secondary">${fechaHora(r.creadoEn)}</span>
      </div>
      <p class="mb-1"><strong>${esc(r.contexto || 'Contenido reportado')}</strong> · ${esc(r.autorContenido || 'Autor no disponible')}</p>
      <blockquote class="small mb-2">${esc(r.contenido || 'El contenido ya no está disponible.')}</blockquote>
      <p class="small text-secondary mb-3">Reportado por ${esc(r.reportadoPor)}: ${esc(r.motivo)}</p>
      <div class="d-flex flex-wrap gap-2">
        <button type="button" class="btn btn-neo-primary btn-sm" data-decision="aprobar"><i class="bi bi-check-lg me-1" aria-hidden="true"></i>Conservar contenido</button>
        <button type="button" class="btn btn-neo-danger btn-sm" data-decision="eliminar"><i class="bi bi-trash3-fill me-1" aria-hidden="true"></i>Eliminar contenido</button>
      </div>
    </article>`).join('');
  document.getElementById('pendientes').textContent = `${reportes.length} ${reportes.length === 1 ? 'pendiente' : 'pendientes'} de revisión`;
  document.getElementById('bandeja-vacia').hidden = reportes.length > 0;
}

function pintarEstadisticas(data) {
  const i = data.indicadores;
  document.getElementById('kpi-usuarios').textContent = Number(i.usuarios).toLocaleString('es-SV');
  document.getElementById('kpi-empresas').textContent = Number(i.empresas).toLocaleString('es-SV');
  document.getElementById('kpi-ofertas').textContent = Number(i.ofertasActivas).toLocaleString('es-SV');
  document.getElementById('total-reportes').textContent = Number(i.reportesPendientes).toLocaleString('es-SV');
  document.getElementById('stat-candidatos').textContent = Number(i.candidatos).toLocaleString('es-SV');
  document.getElementById('stat-verificadas').textContent = `${Number(i.empresasVerificadas)} / ${Number(i.empresas)}`;
  document.getElementById('stat-deshabilitadas').textContent = Number(i.cuentasDeshabilitadas).toLocaleString('es-SV');
  document.getElementById('stat-pendientes').textContent = Number(i.reportesPendientes).toLocaleString('es-SV');
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const totales = new Map(data.postulacionesMensuales.map(x => [Number(x.mes), Number(x.total)]));
  const actual = new Date();
  const ultimosSeisMeses = Array.from({ length: 6 }, (_, indice) => {
    const fecha = new Date(actual.getFullYear(), actual.getMonth() - 5 + indice, 1);
    const mes = fecha.getMonth() + 1;
    return { mes, total: totales.get(mes) || 0 };
  });
  const maximo = Math.max(1, ...ultimosSeisMeses.map(x => x.total));
  document.querySelector('.grafico')?.replaceChildren(...ultimosSeisMeses.map(x => {
    const grupo = document.createElement('div');
    grupo.innerHTML = `<span>${x.total.toLocaleString('es-SV')}</span><span class="barra" style="height:${Math.max(4, x.total / maximo * 100)}%"></span><span>${meses[x.mes - 1]}</span>`;
    return grupo;
  }));
}

async function cargar() {
  const recargar = document.getElementById('recargar-admin');
  recargar.disabled = true;
  try {
    const { data } = await apiRequest('/admin');
    registros = data.registros;
    reportes = data.reportes;
    pintarEstadisticas(data); pintarTabla(); pintarReportes();
    document.getElementById('estado-control').textContent = `${registros.length} registros cargados.`;
  } catch (error) {
    document.getElementById('estado-control').textContent = error.message;
    notificar(error.message, 'error');
  } finally { recargar.disabled = false; }
}

document.querySelectorAll('[data-filtro]').forEach(link => link.addEventListener('click', () => {
  filtroTipo = link.dataset.filtro;
  const indicador = document.getElementById('filtro-activo');
  indicador.hidden = !filtroTipo;
  indicador.querySelector('span').textContent = filtroTipo ? `Mostrando solo: ${nombreEntidad(filtroTipo)}` : '';
  pintarTabla();
}));
document.querySelector('[data-ver-todos]').addEventListener('click', () => document.querySelector('[data-filtro=""]').click());
document.getElementById('recargar-admin').addEventListener('click', cargar);

function confirmar(texto) {
  document.getElementById('confirmar-texto').textContent = texto;
  const modalElemento = document.getElementById('modal-confirmar');
  const modal = bootstrap.Modal.getOrCreateInstance(modalElemento);
  return new Promise(resolve => {
    const botonSi = document.getElementById('confirmar-si');
    const cancelar = () => resolve(false);
    modalElemento.addEventListener('hidden.bs.modal', cancelar, { once: true });
    botonSi.onclick = () => { botonSi.onclick = null; modalElemento.removeEventListener('hidden.bs.modal', cancelar); modal.hide(); resolve(true); };
    modal.show();
  });
}

document.querySelector('#tabla-control tbody').addEventListener('click', async evento => {
  const boton = evento.target.closest('[data-accion]');
  if (!boton) return;
  const fila = boton.closest('tr');
  const { id, tipo } = fila.dataset;
  const registro = registros.find(r => String(r.id) === id && r.tipo === tipo);
  const accion = boton.dataset.accion;
  let ruta; let opciones = { method: 'PATCH' }; let mensaje;
  if (accion === 'eliminar') {
    if (!await confirmar(`¿Eliminar ${nombreEntidad(tipo).toLowerCase()} «${registro.nombre}»? Esta acción también elimina sus datos relacionados.`)) return;
    ruta = `/admin/${tipo}/${id}`; opciones = { method: 'DELETE' };
  } else if (accion === 'activo' && tipo === 'usuario') {
    ruta = `/admin/usuarios/${id}`; opciones.body = JSON.stringify({ activo: boton.dataset.valor === 'true' });
  } else if (accion === 'activo' && tipo === 'empresa') {
    const activo = boton.dataset.valor === 'true';
    if (!activo && !await confirmar(`¿Suspender «${registro.nombre}»? Sus ofertas dejarán de aparecer públicamente.`)) return;
    ruta = `/admin/empresas/${id}`; opciones.body = JSON.stringify({ activo });
  } else if (accion === 'verificar') {
    ruta = `/admin/empresas/${id}`; opciones.body = JSON.stringify({ verificada: boton.dataset.valor === 'true' });
  } else if (accion === 'estado-oferta') {
    const estado = boton.dataset.valor;
    if (estado === 'cerrada' && !await confirmar(`¿Cerrar la vacante «${registro.nombre}»?`)) return;
    ruta = `/admin/ofertas/${id}`; opciones.body = JSON.stringify({ estado });
  } else return;
  boton.disabled = true;
  try {
    const { message } = await apiRequest(ruta, opciones);
    mensaje = message; notificar(mensaje); await cargar();
  } catch (error) { boton.disabled = false; notificar(error.message, 'error'); }
});

document.getElementById('bandeja').addEventListener('click', async evento => {
  const boton = evento.target.closest('[data-decision]');
  if (!boton) return;
  const reporte = boton.closest('[data-reporte]');
  const decision = boton.dataset.decision;
  if (decision === 'eliminar' && !await confirmar('¿Eliminar el contenido reportado? Esta acción no se puede deshacer.')) return;
  boton.disabled = true;
  try {
    const { message } = await apiRequest(`/admin/reportes/${reporte.dataset.reporte}`, {
      method: 'PATCH', body: JSON.stringify({ decision }),
    });
    notificar(message); await cargar();
  } catch (error) { boton.disabled = false; notificar(error.message, 'error'); }
});

document.getElementById('exportar').addEventListener('click', () => {
  const filas = registros.filter(r => !filtroTipo || r.tipo === filtroTipo)
    .map(r => [nombreEntidad(r.tipo), r.nombre, r.detalle, r.estado]);
  const celda = valor => `"${String(valor).replace(/^[=+\-@]/, "'$&").replace(/"/g, '""')}"`;
  const csv = [['Tipo', 'Nombre', 'Detalle', 'Estado'], ...filas].map(f => f.map(celda).join(',')).join('\r\n');
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }));
  enlace.download = 'registros-portal-trabajo.csv'; enlace.click(); URL.revokeObjectURL(enlace.href);
});

cargar();
