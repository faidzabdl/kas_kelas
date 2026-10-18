const tgl = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
export const fmtTanggal = (s) => (s ? tgl.format(new Date(`${s}T00:00:00Z`)) : '-');
export const fmtPeriode = (p) => (p ? `${fmtTanggal(p.tanggal_mulai)} s.d ${fmtTanggal(p.tanggal_selesai)}` : '');
export const rupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);
