import { z } from 'zod';

// Sanitasi dasar: buang tag HTML & spasi berlebih. (SQL injection sudah dicegah
// karena supabase-js memakai query terparameter; React juga meng-escape output.)
const clean = (s) => s.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();

export const nama = z
  .string({ required_error: 'Nama wajib diisi.' })
  .transform(clean)
  .pipe(z.string().min(1, 'Nama wajib diisi.').max(100, 'Nama maksimal 100 karakter.'));

export const id = z.coerce.number({ invalid_type_error: 'ID tidak valid.' }).int().positive('ID tidak valid.');

export const tanggal = z
  .string({ required_error: 'Tanggal wajib diisi.' })
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD.')
  .refine((s) => {
    const d = new Date(`${s}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
  }, 'Tanggal tidak valid.');

const pencarian = z.string().optional().default('')
  .transform((s) => clean(s).replace(/[%_\\,()*]/g, '').slice(0, 50));

export const schemas = {
  idParam: { params: z.object({ id }) },
  anggotaBaru: { body: z.object({ nama }) },
  anggotaEdit: { params: z.object({ id }), body: z.object({ nama }) },
  anggotaImport: {
    body: z.object({
      daftar_nama: z.string().max(20000, 'Daftar terlalu panjang.')
        .transform((s) => [...new Set(s.split(/\r?\n/).map(clean).filter(Boolean).map((n) => n.slice(0, 100)))])
        .pipe(z.array(z.string()).min(1, 'Tidak ada nama yang valid.').max(200, 'Maksimal 200 nama sekali impor.')),
    }),
  },
  periodeBaru: { body: z.object({ tanggal_mulai: tanggal }) },
  rekapList: {
    params: z.object({ id }),
    query: z.object({
      q: pencarian,
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(100),
    }),
  },
  rekapUbah: {
    params: z.object({ id, anggotaId: id }),
    body: z.object({ status: z.enum(['Sudah Bayar', 'Belum Bayar'], { message: 'Status tidak valid.' }) }),
  },
};
