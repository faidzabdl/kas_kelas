import { useState } from 'react';
import { Button, Card, inputCls } from './ui.jsx';
import { useAction } from '../hooks/useAction.js';
import { fmtPeriode } from '../format.js';

export default function PeriodePanel({ periode, periodeId, onPilih, onBuat, onHapus }) {
  const [tanggal, setTanggal] = useState('');
  const [buat, membuat] = useAction(async () => {
    if (await onBuat(tanggal)) setTanggal('');
  });
  const [hapus, menghapus] = useAction(onHapus);

  return (
    <Card title="Periode minggu">
      <label htmlFor="periode" className="mb-1.5 block text-sm font-medium">Pilih periode</label>
      <div className="flex gap-2">
        <select id="periode" className={inputCls} value={periodeId ?? ''} onChange={(e) => onPilih(Number(e.target.value))} disabled={!periode.length}>
          {!periode.length && <option value="">Belum ada periode</option>}
          {periode.map((p) => <option key={p.id} value={p.id}>{fmtPeriode(p)}</option>)}
        </select>
        {periodeId && <Button variant="danger" loading={menghapus} onClick={hapus}>Hapus</Button>}
      </div>

      <form className="mt-4" onSubmit={(e) => { e.preventDefault(); buat(); }}>
        <label htmlFor="tgl" className="mb-1.5 block text-sm font-medium">Buat periode dari tanggal mulai</label>
        <div className="flex gap-2">
          <input id="tgl" type="date" required className={inputCls} value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
          <Button type="submit" loading={membuat}>Buat periode</Button>
        </div>
        <p className="mt-1.5 text-xs text-slate-500">Periode otomatis berlaku 7 hari dari tanggal mulai.</p>
      </form>
    </Card>
  );
}
