import { useCallback, useEffect, useRef, useState } from 'react';

// Menjalankan aksi async sekali pada satu waktu: klik ganda diabaikan (ref sinkron),
// dan `loading` dipakai untuk menonaktifkan tombol.
export function useAction(fn) {
  const [loading, setLoading] = useState(false);
  const busy = useRef(false);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const run = useCallback(async (...args) => {
    if (busy.current) return undefined;
    busy.current = true;
    setLoading(true);
    try {
      return await fnRef.current(...args);
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }, []);

  return [run, loading];
}

export function useDebounce(value, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
