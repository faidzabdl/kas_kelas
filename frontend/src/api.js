const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function request(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internetmu.');
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Permintaan gagal. Coba lagi.');
  return json;
}

export const api = {
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
