import { Button } from './ui.jsx';
import { fmtTanggal } from '../format.js';

// Cegah CSV injection: sel yang diawali = + - @ dianggap rumus oleh Excel.
const cell = (v) => {
  let s = String(v ?? '');
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export default function ExportButtons({ items, periodeLabel, disabled }) {
  const excel = () => {
    const rows = [['No', 'Nama Siswa', 'Status Pembayaran', 'Tanggal Bayar'],
      ...items.map((r, i) => [i + 1, r.nama, r.status, fmtTanggal(r.tanggal_bayar)])];
    const csv = '\uFEFF' + rows.map((r) => r.map(cell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `Rekap_Kas_${periodeLabel.replace(/[^\w]+/g, '_')}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-2">
      <Button variant="ghost" onClick={excel} disabled={disabled}>Unduh Excel (CSV)</Button>
      <Button variant="ghost" onClick={() => window.print()} disabled={disabled}>Cetak / PDF</Button>
    </div>
  );
}
