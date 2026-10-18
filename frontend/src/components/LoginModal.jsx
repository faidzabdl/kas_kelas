import { useEffect, useState } from 'react';
import { Button, inputCls } from './ui.jsx';
import { useAction } from '../hooks/useAction.js';

export default function LoginModal({ onClose, onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submit, loading] = useAction(async () => {
    setError('');
    try {
      await onLogin(password);
      onClose();
    } catch (e) {
      setError(e.message);
      setPassword('');
    }
  });

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 p-4 print:hidden"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form role="dialog" aria-modal="true" aria-labelledby="login-title"
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2 id="login-title" className="text-lg font-semibold">Login admin</h2>
        <p className="mt-1 text-sm text-slate-500">Masukkan password untuk mengubah data kas.</p>

        <label htmlFor="pw" className="mb-1.5 mt-4 block text-sm font-medium">Password</label>
        <input id="pw" type="password" autoFocus required autoComplete="current-password" maxLength={200}
          className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
        {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Batal</Button>
          <Button type="submit" loading={loading}>Masuk</Button>
        </div>
      </form>
    </div>
  );
}
