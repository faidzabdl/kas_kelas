import { useState } from 'react';
import { Button, inputCls, Skeleton } from './ui.jsx';
import ExportButtons from './ExportButtons.jsx';
import { fmtTanggal } from '../format.js';

// Di HP tiap sel jadi baris "label ... nilai"; di md ke atas kembali jadi sel tabel.
const td =
  'flex items-center justify-between gap-3 px-4 py-2.5 before:text-xs before:font-semibold before:text-slate-500 before:content-[attr(data-label)] md:table-cell md:py-3 md:before:hidden';

function Row({ item, no, busy, disabled, readOnly, onToggle, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [nama, setNama] = useState(item.nama);
  const sudah = item.status === 'Sudah Bayar';

  const simpan = async (e) => {
    e.preventDefault();
    if (await onEdit(item.anggota_id, nama)) setEditing(false);
  };

  return (
    <tr className="mb-3 block divide-y divide-slate-100 rounded-lg border border-slate-200 md:mb-0 md:table-row md:divide-y-0 md:rounded-none md:border-0 md:border-t md:hover:bg-slate-50">
      <td data-label="No" className={`${td} md:w-14 md:text-center`}>
        <span className="text-slate-500">{no}</span>
      </td>
      <td data-label="Nama" className={`${td} font-medium`}>
        {editing ? (
          <form onSubmit={simpan} className="flex w-full flex-col gap-2 sm:flex-row print:hidden">
            <input autoFocus required maxLength={100} className={inputCls} value={nama} onChange={(e) => setNama(e.target.value)} disabled={busy} />
            <div className="flex gap-2">
              <Button type="submit" loading={busy}>Simpan</Button>
              <Button type="button" variant="ghost" disabled={busy} onClick={() => { setEditing(false); setNama(item.nama); }}>Batal</Button>
            </div>
          </form>
        ) : (
          <span className="text-right md:text-left">{item.nama}</span>
        )}
      </td>
      <td data-label="Status" className={td}>
        <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${sudah ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{item.status}</span>
      </td>
      <td data-label="Tanggal bayar" className={`${td} whitespace-nowrap`}>{fmtTanggal(item.tanggal_bayar)}</td>
      {!readOnly && (
        <td data-label="Aksi" className={`${td} print:hidden`}>
          <div className="flex flex-wrap justify-end gap-1.5 md:justify-start">
            <Button loading={busy && !editing} disabled={disabled} className={`!px-3 !py-1.5 !text-xs ${sudah ? '!bg-amber-500 hover:!bg-amber-600' : ''}`} onClick={() => onToggle(item)}>
              {sudah ? 'Batalkan' : 'Tandai sudah'}
            </Button>
            <Button variant="ghost" disabled={disabled} className="!px-3 !py-1.5 !text-xs" onClick={() => setEditing(true)}>Edit</Button>
            <Button variant="danger" disabled={disabled} className="!px-3 !py-1.5 !text-xs" onClick={() => onDelete(item)}>Hapus</Button>
          </div>
        </td>
      )}
    </tr>
  );
}

export default function TableRekap({ items, loading, q, onSearch, periodeLabel, readOnly, onToggle, onEdit, onDelete }) {
  const [busyId, setBusyId] = useState(null);
  // Satu aksi baris pada satu waktu agar tidak terjadi request ganda.
  const guard = (id, fn) => async (...a) => {
    if (busyId) return false;
    setBusyId(id);
    try { return await fn(...a); } finally { setBusyId(null); }
  };
  const kolom = readOnly ? 4 : 5;

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="hidden px-5 pt-5 print:block">
        <h2 className="text-center text-xl font-bold">LAPORAN KAS KELAS</h2>
        <p className="text-center text-sm">Periode: {periodeLabel}</p>
      </div>
      <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between md:p-5 print:hidden">
        <input type="search" aria-label="Cari nama siswa" className={`${inputCls} md:max-w-sm`} placeholder="Cari nama siswa…" value={q} onChange={(e) => onSearch(e.target.value)} maxLength={50} />
        <ExportButtons items={items} periodeLabel={periodeLabel} disabled={loading || !items.length} />
      </div>

      <div className="px-3 pb-3 md:overflow-x-auto md:p-0">
        <table className="block w-full text-left text-sm md:table">
          <thead className="hidden bg-slate-50 text-xs font-semibold text-slate-500 md:table-header-group">
            <tr>
              <th className="w-14 px-4 py-3 text-center">No</th>
              <th className="px-4 py-3">Nama siswa</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tanggal bayar</th>
              {!readOnly && <th className="px-4 py-3 print:hidden">Aksi</th>}
            </tr>
          </thead>
          <tbody className="block md:table-row-group">
            {loading && !items.length
              ? Array.from({ length: 6 }, (_, i) => (
                  <tr key={i} className="mb-3 block md:mb-0 md:table-row md:border-t md:border-slate-100">
                    <td colSpan={kolom} className="block px-1 py-1 md:table-cell md:px-4 md:py-3"><Skeleton className="h-16 w-full md:h-6" /></td>
                  </tr>
                ))
              : items.map((it, i) => (
                  <Row key={it.anggota_id} item={it} no={i + 1} readOnly={readOnly} busy={busyId === it.anggota_id} disabled={!!busyId}
                    onToggle={guard(it.anggota_id, onToggle)} onEdit={guard(it.anggota_id, onEdit)} onDelete={guard(it.anggota_id, onDelete)} />
                ))}
            {!loading && !items.length && (
              <tr className="block md:table-row"><td colSpan={kolom} className="block px-4 py-10 text-center text-slate-500 md:table-cell">
                {q ? `Tidak ada siswa dengan nama “${q}”.` : readOnly ? 'Belum ada siswa.' : 'Belum ada siswa. Tambahkan lewat formulir di atas.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
