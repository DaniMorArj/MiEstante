const BASE = '/api';

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `Error ${res.status}`);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  login: (username, password) => request('/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  logout: () => request('/logout', { method: 'POST' }),
  me: () => request('/me'),

  getGames: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v));
    return request(`/games${qs.toString() ? `?${qs}` : ''}`);
  },
  createGame: (data) => request('/games', { method: 'POST', body: JSON.stringify(data) }),
  updateGame: (id, data) => request(`/games/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteGame: (id) => request(`/games/${id}`, { method: 'DELETE' }),

  getHardware: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v));
    return request(`/hardware${qs.toString() ? `?${qs}` : ''}`);
  },
  createHardware: (data) => request('/hardware', { method: 'POST', body: JSON.stringify(data) }),
  updateHardware: (id, data) => request(`/hardware/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteHardware: (id) => request(`/hardware/${id}`, { method: 'DELETE' }),

  getConsolas: () => request('/consolas'),
  getMarcas: () => request('/marcas'),
  getStats: () => request('/stats'),
};

// Las imágenes se guardan como base64 dentro del propio registro (games.imagen /
// hardware.imagen) en vez de subirse a disco, para que sobrevivan a los
// redeploys en hostings sin almacenamiento persistente (ver README).
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.readAsDataURL(file);
  });
}
