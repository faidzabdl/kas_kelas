import { Button } from './ui.jsx';
import { fmtTanggal } from '../format.js';
import { buatXlsx } from '../xlsx.js';

export default function ExportButtons({ items, periodeLabel, disabled }) {
  const excel = () => {
    const rows = [
      ['Rekapitulasi Pembayaran Uang Kas'],
      [`Periode: ${periodeLabel}`],
      [],
      ['No', 'Nama Siswa', 'Status Pembayaran', 'Tanggal Bayar'],
      ...items.map((r, i) => [i + 1, r.nama, r.status, fmtTanggal(r.tanggal_bayar)]),
    ];
    const blob = buatXlsx(rows, { nama: 'Rekap Kas', lebar: [6, 36, 20, 18], tebal: [0, 3] });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), {
      href: url,
      download: `Rekap_Kas_${periodeLabel.replace(/[^\w]+/g, '_')}.xlsx`,
    });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="ghost" onClick={excel} disabled={disabled}>Unduh Excel (.xlsx)</Button>
      <Button variant="ghost" onClick={() => window.print()} disabled={disabled}>Cetak / PDF</Button>
    </div>
  );
}
