import { useState } from 'react';
import { Button, Card, inputCls } from './ui.jsx';
import { useAction } from '../hooks/useAction.js';

export default function FormTambah({ onTambah }) {
  const [nama, setNama] = useState('');
  const [submit, loading] = useAction(async () => {
    if (await onTambah(nama)) setNama('');
  });

  return (
    <Card title="Anggota kelas">
      <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <label htmlFor="nama" className="mb-1.5 block text-sm font-medium">Tambah siswa baru</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input id="nama" required maxLength={100} className={inputCls} placeholder="Nama lengkap siswa" value={nama} onChange={(e) => setNama(e.target.value)} disabled={loading} />
          <Button type="submit" variant="success" loading={loading}>Simpan</Button>
        </div>
      </form>
      <p className="mt-2 text-xs text-slate-500">Siswa baru otomatis masuk ke semua periode dengan status belum bayar.</p>
    </Card>
  );
}
