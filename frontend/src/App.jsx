import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api.js';
import { fmtPeriode } from './format.js';
import { useDebounce } from './hooks/useAction.js';
import CardSummary from './components/CardSummary.jsx';
import PeriodePanel from './components/PeriodePanel.jsx';
import FormTambah from './components/FormTambah.jsx';
import ImportForm from './components/ImportForm.jsx';
import TableRekap from './components/TableRekap.jsx';
import Toast from './components/Toast.jsx';
import { Button } from './components/ui.jsx';

export default function App() {
  const [periode, setPeriode] = useState([]);
  const [periodeId, setPeriodeId] = useState(null);
  const [ready, setReady] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const dq = useDebounce(q);
  const [toast, setToast] = useState(null);
  const reqId = useRef(0);
  const toastTimer = useRef();

  const notify = (type, message) => {
    setToast({ type, message });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  const loadPeriode = useCallback(async (selectId) => {
    const { data: list } = await api.listPeriode();
    setPeriode(list);
    setPeriodeId((prev) => selectId ?? (list.some((p) => p.id === prev) ? prev : list[0]?.id ?? null));
  }, []);

  const loadRekap = useCallback(async (silent = false) => {
    if (!periodeId) { setData(null); setLoading(false); return; }
    const mine = ++reqId.current; // abaikan respons usang
    if (!silent) setLoading(true);
    try {
      const d = await api.rekap(periodeId, dq);
      if (mine === reqId.current) { setData(d); setError(''); }
    } catch (e) {
      if (mine === reqId.current) setError(e.message);
    } finally {
      if (mine === reqId.current) setLoading(false);
    }
  }, [periodeId, dq]);

  useEffect(() => {
    loadPeriode().catch((e) => { setError(e.message); setLoading(false); }).finally(() => setReady(true));
  }, [loadPeriode]);
  useEffect(() => { if (ready) loadRekap(); }, [ready, loadRekap]);

  // Menjalankan mutasi, tampilkan toast, lalu segarkan data tanpa kedipan skeleton.
  const mutate = async (fn, ok) => {
    try {
      const r = await fn();
      notify('ok', typeof ok === 'function' ? ok(r) : ok);
      await loadRekap(true);
      return true;
    } catch (e) {
      notify('error', e.message);
      return false;
    }
  };

  const periodeAktif = periode.find((p) => p.id === periodeId);
  const label = fmtPeriode(periodeAktif);

  const buatPeriode = async (tgl) => {
    try {
      const { data: p } = await api.buatPeriode(tgl);
      await loadPeriode(p.id);
      notify('ok', 'Periode berhasil dibuat.');
      return true;
    } catch (e) { notify('error', e.message); return false; }
  };

  const hapusPeriode = async () => {
    if (!window.confirm('Hapus periode ini? Data pembayaran di periode ini ikut terhapus.')) return;
    try {
      await api.hapusPeriode(periodeId);
      await loadPeriode();
      notify('ok', 'Periode dihapus.');
    } catch (e) { notify('error', e.message); }
  };

  const toggle = (it) =>
    mutate(() => api.ubahStatus(periodeId, it.anggota_id, it.status === 'Sudah Bayar' ? 'Belum Bayar' : 'Sudah Bayar'),
      it.status === 'Sudah Bayar' ? 'Pembayaran dibatalkan.' : `${it.nama} ditandai sudah bayar.`);

  const hapusSiswa = async (it) =>
    window.confirm(`Hapus ${it.nama} dari kelas?`)
      ? mutate(() => api.hapusAnggota(it.anggota_id), 'Siswa dihapus.') : false;

  return (
    <main className="mx-auto max-w-6xl space-y-5 p-4 md:p-8">
      <header className="flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-cover bg-center p-8 text-white shadow-lg print:hidden md:px-10"
        style={{ backgroundImage: 'linear-gradient(rgba(15,23,42,.75),rgba(15,23,42,.88)), url(/foto_kelas.jpeg)' }}>
        <div>
          <h1 className="text-2xl font-bold">Rekap uang kas kelas</h1>
          <p className="mt-1 text-sm text-slate-300">Kelola iuran, cek status pembayaran, dan unduh laporan mingguan.</p>
        </div>
      </header>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 print:hidden">
          <span>{error}</span>
          <Button variant="ghost" onClick={() => (ready ? loadRekap() : window.location.reload())}>Coba lagi</Button>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <PeriodePanel periode={periode} periodeId={periodeId} onPilih={setPeriodeId} onBuat={buatPeriode} onHapus={hapusPeriode} />
        <FormTambah onTambah={(nama) => mutate(() => api.tambahAnggota(nama), 'Siswa ditambahkan.')} />
        <ImportForm onImport={(t) => mutate(() => api.importAnggota(t), (r) => `${r.jumlah} siswa berhasil diimpor.`)} />
      </div>

      <CardSummary ringkasan={data?.ringkasan} periodeLabel={label} loading={loading || !ready} />

      {periodeId && (
        <TableRekap items={data?.items ?? []} loading={loading} q={q} onSearch={setQ} periodeLabel={label}
          onToggle={toggle}
          onEdit={(id, nama) => mutate(() => api.ubahAnggota(id, nama), 'Nama diperbarui.')}
          onDelete={hapusSiswa} />
      )}
      {ready && !periodeId && !error && (
        <p className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500 print:hidden">
          Belum ada periode. Buat periode pertama lewat panel “Periode minggu”.
        </p>
      )}
      <Toast toast={toast} />
    </main>
  );
}
