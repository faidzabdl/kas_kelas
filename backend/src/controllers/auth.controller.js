import { AppError } from '../lib/http.js';
import { buatToken, passwordBenar } from '../middleware/auth.js';

export function login(req, res) {
  if (!passwordBenar(req.valid.body.password)) throw new AppError(401, 'Password salah.');
  res.json({ token: buatToken() });
}

export const me = (req, res) => res.json({ admin: true });
