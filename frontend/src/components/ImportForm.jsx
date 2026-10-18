import { useState } from 'react';
import { Button, Card, inputCls } from './ui.jsx';
import { useAction } from '../hooks/useAction.js';

export default function ImportForm({ onImport }) {
  const [teks, setTeks] = useState('');
  const [submit, loading] = useAction(async () => {
    if (await onImport(teks)) setTeks('');
  });

  return (
    <Card className="md:col-span-2">
      <details>
        <summary className="cursor-pointer text-base font-semibold">Impor banyak siswa sekaligus</summary>
        <form className="mt-3" onSubmit={(e) => { e.preventDefault(); submit(); }}>
          <label htmlFor="impor" className="mb-1.5 block text-sm font-medium">Satu baris, satu nama (maksimal 200)</label>
          <textarea id="impor" required rows={6} className={`${inputCls} font-mono`} placeholder={'Aisyah Suci\nBudi Santoso\nSiti Aminah'} value={teks} onChange={(e) => setTeks(e.target.value)} disabled={loading} />
          <Button type="submit" className="mt-3" loading={loading}>Impor semua nama</Button>
        </form>
      </details>
    </Card>
  );
}
