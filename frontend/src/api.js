const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const KEY = 'kas_token';

// localStorage bisa diblokir browser (mode privat), jadi selalu dibungkus try/catch.
export const tokenStore = {
  get: () => { try { return localStorage.getItem(KEY); } catch { return null; } },
  set: (t) => { try { localStorage.setItem(KEY, t); } catch { /* abaikan */ } },
  clear: () => { try { localStorage.removeItem(KEY); } catch { /* abaikan */ } },
};

async function request(path, { method = 'GET', body } = {}) {
  const token = tokenStore.get();
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internetmu.');
  }
  const json = await res.json().catch(() => null);

  if (res.status === 401 && token && path !== '/auth/login') {
    tokenStore.clear(); // token kedaluwarsa atau tidak valid
    window.dispatchEvent(new Event('auth:expired'));
  }
  if (!res.ok) throw new Error(json?.error || 'Permintaan gagal. Coba lagi.');
  if (json === null) {
    throw new Error('Respons server tidak valid. Pastikan VITE_API_URL di frontend/.env benar dan backend sedang berjalan.');
  }
  return json;
}

export const api = {
  login: (password) => request('/auth/login', { method: 'POST', body: { password } }),
  me: () => request('/auth/me'),
  listPeriode: () => request('/periode'),
  buatPeriode: (tanggal_mulai) => request('/periode', { method: 'POST', body: { tanggal_mulai } }),
  hapusPeriode: (id) => request(`/periode/${id}`, { method: 'DELETE' }),
  rekap: (id, q) => request(`/periode/${id}/rekap?${new URLSearchParams(q ? { q } : {})}`),
  ubahStatus: (id, anggotaId, status) =>
    request(`/periode/${id}/rekap/${anggotaId}`, { method: 'PUT', body: { status } }),
  tambahAnggota: (nama) => request('/anggota', { method: 'POST', body: { nama } }),
  importAnggota: (daftar_nama) => request('/anggota/import', { method: 'POST', body: { daftar_nama } }),
  ubahAnggota: (id, nama) => request(`/anggota/${id}`, { method: 'PATCH', body: { nama } }),
  hapusAnggota: (id) => request(`/anggota/${id}`, { method: 'DELETE' }),
};
