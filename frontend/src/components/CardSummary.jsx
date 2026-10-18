import { Card, Skeleton } from './ui.jsx';
import { rupiah } from '../format.js';

export default function CardSummary({ ringkasan, periodeLabel, loading }) {
  if (loading && !ringkasan) {
    return (
      <Card title="Ringkasan keuangan">
        <Skeleton className="mb-3 h-4 w-2/3" />
        <Skeleton className="mb-4 h-4 w-1/2" />
        <Skeleton className="h-16 w-full" />
      </Card>
    );
  }
  if (!ringkasan) return <Card title="Ringkasan keuangan"><p className="text-sm text-slate-500">Belum ada periode dipilih.</p></Card>;

  const { sudah_bayar, belum_bayar, total_anggota, total_kas, iuran } = ringkasan;
  const persen = total_anggota ? Math.round((sudah_bayar / total_anggota) * 100) : 0;

  return (
    <Card title="Ringkasan keuangan">
      <p className="text-sm text-slate-600">
        Periode <b>{periodeLabel}</b> · iuran {rupiah(iuran)} per anak
      </p>
      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-xs text-slate-500">Total kas terkumpul</p>
        <p className="text-3xl font-bold text-indigo-600">{rupiah(total_kas)}</p>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={persen} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${persen}%` }} />
      </div>
      <p className="mt-2 text-sm">
        <b className="text-emerald-600">{sudah_bayar} sudah bayar</b>
        <span className="text-slate-400"> dari {total_anggota} siswa, </span>
        <b className="text-red-500">{belum_bayar} belum</b>
      </p>
    </Card>
  );
}
