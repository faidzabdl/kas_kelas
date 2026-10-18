import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { asyncHandler as h } from '../lib/http.js';
import { validate } from '../middleware/error.js';
import { requireAdmin } from '../middleware/auth.js';
import { schemas as s } from '../schemas.js';
import * as auth from '../controllers/auth.controller.js';
import * as anggota from '../controllers/anggota.controller.js';
import * as periode from '../controllers/periode.controller.js';

const r = Router();

// Batasi percobaan login (hanya percobaan gagal yang dihitung) agar password tidak bisa ditebak.
const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 8,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.' },
});

// Publik
r.post('/auth/login', loginLimiter, validate(s.login), h(auth.login));
r.get('/periode', h(periode.daftar));
r.get('/periode/:id/rekap', validate(s.rekapList), h(periode.rekap));

// Khusus admin
r.get('/auth/me', requireAdmin, auth.me);
r.post('/anggota', requireAdmin, validate(s.anggotaBaru), h(anggota.tambah));
r.post('/anggota/import', requireAdmin, validate(s.anggotaImport), h(anggota.importMassal));
r.patch('/anggota/:id', requireAdmin, validate(s.anggotaEdit), h(anggota.ubah));
r.delete('/anggota/:id', requireAdmin, validate(s.idParam), h(anggota.hapus));
r.post('/periode', requireAdmin, validate(s.periodeBaru), h(periode.buat));
r.delete('/periode/:id', requireAdmin, validate(s.idParam), h(periode.hapus));
r.put('/periode/:id/rekap/:anggotaId', requireAdmin, validate(s.rekapUbah), h(periode.ubahStatus));

export default r;
