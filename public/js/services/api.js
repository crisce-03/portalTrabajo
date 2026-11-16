// Cliente base para las rutas HTTP del backend.
const API_BASE_URL = '/api';

async function apiRequest(route, options = {}) {
  const url = API_BASE_URL + (route.startsWith('/') ? route : '/' + route);
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  let token = null;
  try { token = sessionStorage.getItem('token'); } catch { /* sin almacenamiento: va sin sesión */ }
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401 && token) cerrarSesion(); // token vencido: la próxima página pide iniciar sesión

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || 'No se pudo completar la solicitud.');
  }
  return payload;
}

async function apiDownload(route) {
  const url = API_BASE_URL + (route.startsWith('/') ? route : '/' + route);
  const headers = new Headers();
  let token = null;
  try { token = sessionStorage.getItem('token'); } catch { /* descarga sin sesiÃ³n */ }
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(url, { headers });
  if (response.status === 401 && token) cerrarSesion();
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message || payload?.error || 'No se pudo completar la descarga.');
  }
  const disposition = response.headers.get('Content-Disposition') || '';
  const filename = disposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
  return {
    blob: await response.blob(),
    filename: filename ? decodeURIComponent(filename[1] || filename[2]) : null,
  };
}
