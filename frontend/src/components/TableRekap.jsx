import { useState } from 'react';
import { Button, inputCls, Skeleton } from './ui.jsx';
import ExportButtons from './ExportButtons.jsx';
import { fmtTanggal } from '../format.js';

function Row({ item, no, busy, disabled, onToggle, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [nama, setNama] = useState(item.nama);
  const sudah = item.status === 'Sudah Bayar';

  const simpan = async (e) => {
    e.preventDefault();
    if (await onEdit(item.anggota_id, nama)) setEditing(false);
  };

  return (
    <tr className="border-t border-slate-100 hover:bg-slate-50">
      <td className="px-4 py-3 text-center text-slate-500">{no}</td>
      <td className="px-4 py-3 font-medium">
        {editing ? (
          <form onSubmit={simpan} className="flex gap-2 print:hidden">
            <input autoFocus required maxLength={100} className={inputCls} value={nama} onChange={(e) => setNama(e.target.value)} disabled={busy} />
            <Button type="submit" loading={busy}>Simpan</Button>
            <Button type="button" variant="ghost" disabled={busy} onClick={() => { setEditing(false); setNama(item.nama); }}>Batal</Button>
          </form>
        ) : item.nama}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${sudah ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{item.status}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">{fmtTanggal(item.tanggal_bayar)}</td>
      <td className="px-4 py-3 print:hidden">
        <div className="flex gap-1.5">
          <Button loading={busy && !editing} disabled={disabled} className={`!px-3 !py-1.5 !text-xs ${sudah ? '!bg-amber-500 hover:!bg-amber-600' : ''}`} onClick={() => onToggle(item)}>
            {sudah ? 'Batalkan' : 'Tandai sudah'}
          </Button>
          <Button variant="ghost" disabled={disabled} className="!px-3 !py-1.5 !text-xs" onClick={() => setEditing(true)}>Edit</Button>
          <Button variant="danger" disabled={disabled} className="!px-3 !py-1.5 !text-xs" onClick={() => onDelete(item)}>Hapus</Button>
        </div>
      </td>
    </tr>
  );
}

export default function TableRekap({ items, loading, q, onSearch, periodeLabel, onToggle, onEdit, onDelete }) {
  const [busyId, setBusyId] = useState(null);
  // Satu aksi baris pada satu waktu agar tidak terjadi request ganda.
  const guard = (id, fn) => async (...a) => {
    if (busyId) return false;
    setBusyId(id);
    try { return await fn(...a); } finally { setBusyId(null); }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="hidden px-5 pt-5 print:block">
        <h2 className="text-center text-xl font-bold">LAPORAN KAS KELAS</h2>
        <p className="text-center text-sm">Periode: {periodeLabel}</p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 print:hidden">
        <input type="search" aria-label="Cari nama siswa" className={`${inputCls} max-w-sm`} placeholder="Cari nama siswa…" value={q} onChange={(e) => onSearch(e.target.value)} maxLength={50} />
        <ExportButtons items={items} periodeLabel={periodeLabel} disabled={loading || !items.length} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
            <tr>
              <th className="w-14 px-4 py-3 text-center">No</th>
              <th className="px-4 py-3">Nama siswa</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tanggal bayar</th>
              <th className="px-4 py-3 print:hidden">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && !items.length
              ? Array.from({ length: 6 }, (_, i) => (
                  <tr key={i} className="border-t border-slate-100"><td colSpan={5} className="px-4 py-3"><Skeleton className="h-6 w-full" /></td></tr>
                ))
              : items.map((it, i) => (
                  <Row key={it.anggota_id} item={it} no={i + 1} busy={busyId === it.anggota_id} disabled={!!busyId}
                    onToggle={guard(it.anggota_id, onToggle)} onEdit={guard(it.anggota_id, onEdit)} onDelete={guard(it.anggota_id, onDelete)} />
                ))}
            {!loading && !items.length && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                {q ? `Tidak ada siswa dengan nama “${q}”.` : 'Belum ada siswa. Tambahkan lewat formulir di atas.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
