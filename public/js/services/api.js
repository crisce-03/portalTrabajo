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

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || 'No se pudo completar la solicitud.');
  }
  return payload;
}
