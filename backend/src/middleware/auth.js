import 'dotenv/config';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { AppError } from '../lib/http.js';

const { ADMIN_PASSWORD, JWT_SECRET } = process.env;
if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
  throw new Error('ADMIN_PASSWORD wajib diisi di environment (minimal 8 karakter).');
}
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET wajib diisi di environment (string acak minimal 32 karakter).');
}

const EXPIRES = process.env.TOKEN_EXPIRES || '7d';
const sha = (s) => crypto.createHash('sha256').update(String(s)).digest();

// Dibandingkan lewat hash + timingSafeEqual agar tidak bocor lewat selisih waktu.
export const passwordBenar = (input) => crypto.timingSafeEqual(sha(input), sha(ADMIN_PASSWORD));

export const buatToken = () => jwt.sign({ role: 'admin' }, JWT_SECRET, { algorithm: 'HS256', expiresIn: EXPIRES });

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    if (payload.role !== 'admin') throw new Error('bukan admin');
    next();
  } catch {
    next(new AppError(401, 'Sesi login habis atau belum login. Silakan login lagi.'));
  }
}
