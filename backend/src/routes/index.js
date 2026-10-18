import { Router } from 'express';
import { asyncHandler as h } from '../lib/http.js';
import { validate } from '../middleware/error.js';
import { schemas as s } from '../schemas.js';
import * as anggota from '../controllers/anggota.controller.js';
import * as periode from '../controllers/periode.controller.js';

const r = Router();

r.post('/anggota', validate(s.anggotaBaru), h(anggota.tambah));
r.post('/anggota/import', validate(s.anggotaImport), h(anggota.importMassal));
r.patch('/anggota/:id', validate(s.anggotaEdit), h(anggota.ubah));
r.delete('/anggota/:id', validate(s.idParam), h(anggota.hapus));

r.get('/periode', h(periode.daftar));
r.post('/periode', validate(s.periodeBaru), h(periode.buat));
r.delete('/periode/:id', validate(s.idParam), h(periode.hapus));
r.get('/periode/:id/rekap', validate(s.rekapList), h(periode.rekap));
r.put('/periode/:id/rekap/:anggotaId', validate(s.rekapUbah), h(periode.ubahStatus));

export default r;
