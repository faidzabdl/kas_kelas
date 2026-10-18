import { useCallback, useEffect, useState } from 'react';
import { api, tokenStore } from '../api.js';

export function useAuth() {
  const [isAdmin, setIsAdmin] = useState(() => !!tokenStore.get());

  useEffect(() => {
    const onExpired = () => setIsAdmin(false);
    window.addEventListener('auth:expired', onExpired);
    // Verifikasi token tersimpan; jika ditolak server, api.js memicu 'auth:expired'.
    if (tokenStore.get()) api.me().catch(() => {});
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const login = useCallback(async (password) => {
    const { token } = await api.login(password);
    tokenStore.set(token);
    setIsAdmin(true);
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setIsAdmin(false);
  }, []);

  return { isAdmin, login, logout };
}
