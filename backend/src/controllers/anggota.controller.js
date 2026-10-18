import { supabase } from '../lib/supabase.js';
import { AppError, unwrap } from '../lib/http.js';

export async function tambah(req, res) {
  const { data } = unwrap(
    await supabase.from('anggota').insert({ nama: req.valid.body.nama }).select('id, nama').single()
  );
  res.status(201).json({ data });
}

export async function importMassal(req, res) {
  const rows = req.valid.body.daftar_nama.map((nama) => ({ nama }));
  const { data } = unwrap(await supabase.from('anggota').insert(rows).select('id'));
  res.status(201).json({ jumlah: data.length });
}

export async function ubah(req, res) {
  const { data } = unwrap(
    await supabase.from('anggota').update({ nama: req.valid.body.nama })
      .eq('id', req.valid.params.id).select('id, nama').maybeSingle()
  );
  if (!data) throw new AppError(404, 'Siswa tidak ditemukan.');
  res.json({ data });
}

export async function hapus(req, res) {
  const { data } = unwrap(
    await supabase.from('anggota').delete().eq('id', req.valid.params.id).select('id')
  );
  if (!data.length) throw new AppError(404, 'Siswa tidak ditemukan.');
  res.json({ ok: true }); // rekap ikut terhapus via ON DELETE CASCADE
}
