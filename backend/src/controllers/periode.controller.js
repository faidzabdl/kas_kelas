import { supabase } from '../lib/supabase.js';
import { AppError, unwrap } from '../lib/http.js';

const IURAN = Number(process.env.IURAN_MINGGUAN) || 5000;
const hariIniWIB = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

export async function daftar(req, res) {
  const { data } = unwrap(
    await supabase.from('periode_minggu').select('id, tanggal_mulai, tanggal_selesai')
      .order('tanggal_mulai', { ascending: false }).limit(200)
  );
  res.json({ data });
}

export async function buat(req, res) {
  const { data } = unwrap(
    await supabase.from('periode_minggu').insert({ tanggal_mulai: req.valid.body.tanggal_mulai })
      .select('id, tanggal_mulai, tanggal_selesai').single()
  );
  res.status(201).json({ data });
}

export async function hapus(req, res) {
  const { data } = unwrap(
    await supabase.from('periode_minggu').delete().eq('id', req.valid.params.id).select('id')
  );
  if (!data.length) throw new AppError(404, 'Periode tidak ditemukan.');
  res.json({ ok: true });
}

export async function rekap(req, res) {
  const { id } = req.valid.params;
  const { q, page, limit } = req.valid.query;
  const from = (page - 1) * limit;

  const { data: periode } = unwrap(
    await supabase.from('periode_minggu').select('id').eq('id', id).maybeSingle()
  );
  if (!periode) throw new AppError(404, 'Periode tidak ditemukan.');

  let siswaQuery = supabase.from('anggota').select('id, nama', { count: 'exact' })
    .order('nama', { ascending: true }).range(from, from + limit - 1);
  if (q) siswaQuery = siswaQuery.ilike('nama', `%${q}%`);

  // Query kecil berjalan paralel; hanya kolom yang dibutuhkan.
  const [siswa, totalAnggota, sudah] = await Promise.all([
    siswaQuery,
    supabase.from('anggota').select('id', { count: 'exact', head: true }),
    supabase.from('rekap_mingguan').select('id', { count: 'exact', head: true })
      .eq('periode_id', id).eq('status', 'Sudah Bayar'),
  ]);
  const { data: daftarSiswa, count: totalHasil } = unwrap(siswa);
  const total = unwrap(totalAnggota).count ?? 0;
  const sudahBayar = unwrap(sudah).count ?? 0;

  let rekapMap = new Map();
  if (daftarSiswa.length) {
    const { data } = unwrap(
      await supabase.from('rekap_mingguan').select('anggota_id, status, tanggal_bayar')
        .eq('periode_id', id).in('anggota_id', daftarSiswa.map((s) => s.id))
    );
    rekapMap = new Map(data.map((r) => [r.anggota_id, r]));
  }

  res.json({
    items: daftarSiswa.map((s) => ({
      anggota_id: s.id,
      nama: s.nama,
      status: rekapMap.get(s.id)?.status ?? 'Belum Bayar',
      tanggal_bayar: rekapMap.get(s.id)?.tanggal_bayar ?? null,
    })),
    paging: { page, limit, total: totalHasil ?? 0 },
    ringkasan: {
      iuran: IURAN,
      total_anggota: total,
      sudah_bayar: sudahBayar,
      belum_bayar: Math.max(total - sudahBayar, 0),
      total_kas: sudahBayar * IURAN,
    },
  });
}

export async function ubahStatus(req, res) {
  const { id, anggotaId } = req.valid.params;
  const { status } = req.valid.body;
  const { data } = unwrap(
    await supabase.from('rekap_mingguan').upsert(
      {
        anggota_id: anggotaId,
        periode_id: id,
        status,
        tanggal_bayar: status === 'Sudah Bayar' ? hariIniWIB() : null,
      },
      { onConflict: 'anggota_id,periode_id' }
    ).select('status, tanggal_bayar').single()
  );
  res.json({ data });
}
