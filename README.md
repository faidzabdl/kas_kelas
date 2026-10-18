# Rekap Kas Kelas

Website sederhana untuk merekap uang kas kelas. Aku bikin ini supaya urusan "siapa yang sudah bayar minggu ini?" tidak perlu lagi dicatat di kertas atau ditanyakan satu-satu lewat grup chat. Buka website, lihat daftar siswa, tandai yang sudah bayar, dan total kas langsung terhitung.

Awalnya aplikasi ini kubuat memakai PHP dan MySQL (jalan di XAMPP). Lalu kuubah total menjadi **REST API + SPA** supaya bisa di-hosting online dan dibuka dari HP siapa saja.

## Yang bisa dilakukan aplikasi ini

- **Periode mingguan.** Aku tinggal memilih tanggal mulai, lalu periode otomatis berlaku 7 hari (misalnya 18 Okt 2026 sampai 24 Okt 2026).
- **Tandai sudah/belum bayar** per siswa. Tanggal bayar tercatat otomatis (zona waktu WIB), dan bisa dibatalkan kalau salah klik.
- **Ringkasan kas.** Menampilkan jumlah yang sudah dan belum bayar, plus total kas terkumpul (iuran Rp 5.000 per anak, bisa diubah lewat environment variable).
- **Kelola siswa.** Tambah satu per satu, edit nama langsung di tabel, atau hapus.
- **Impor banyak siswa sekaligus.** Tempel daftar nama (satu baris, satu nama), maksimal 200 nama sekali impor.
- **Cari nama siswa** dengan pencarian langsung.
- **Unduh Excel (CSV) dan cetak / simpan PDF** untuk laporan per periode.
- **Responsif.** Di laptop tampil sebagai tabel, di HP berubah jadi kartu per siswa.
- **Tanpa reload halaman.** Semua aksi berjalan lewat API, lengkap dengan indikator loading dan pesan error yang jelas.

## Teknologi yang dipakai

| Bagian | Teknologi | Hosting |
|---|---|---|
| Frontend | React 18, Vite, Tailwind CSS v4 | Vercel |
| Backend | Node.js, Express (REST API, response JSON) | Railway |
| Database | Supabase (PostgreSQL) lewat `@supabase/supabase-js` | Supabase |

## Struktur folder

```
kas-kelas/
├── database/
│   └── schema.sql            # skema tabel, jalankan di Supabase SQL Editor
├── backend/
│   ├── src/
│   │   ├── app.js            # setup Express, CORS, helmet, rate limit
│   │   ├── server.js         # titik masuk, membaca PORT
│   │   ├── schemas.js        # aturan validasi input (zod)
│   │   ├── lib/              # koneksi Supabase dan helper error
│   │   ├── middleware/       # validasi dan error handler
│   │   ├── controllers/      # logika anggota dan periode
│   │   └── routes/           # daftar endpoint
│   ├── Procfile
│   └── .env.example
└── frontend/
    ├── public/foto_kelas.jpeg
    ├── src/
    │   ├── App.jsx           # state utama dan alur data
    │   ├── api.js            # semua pemanggilan ke backend
    │   ├── components/       # CardSummary, TableRekap, FormTambah, dst.
    │   └── hooks/            # useAction (cegah klik ganda), useDebounce
    ├── vercel.json           # supaya refresh halaman tidak 404
    └── .env.example
```

## Cara kerja datanya

Ada tiga tabel di Supabase:

- `anggota`: daftar siswa.
- `periode_minggu`: daftar periode. Tanggal selesai dihitung otomatis oleh database (tanggal mulai + 6 hari).
- `rekap_mingguan`: status bayar per siswa per periode.

Satu hal yang sengaja kubuat beda dari versi PHP: dulu setiap halaman dibuka, aplikasi membuatkan baris rekap untuk semua siswa. Sekarang baris rekap baru dibuat **saat siswa ditandai sudah bayar**. Siswa yang belum punya baris rekap otomatis dianggap "Belum Bayar". Jadi siswa baru langsung masuk ke semua periode tanpa proses sinkronisasi, dan datanya tidak membengkak. Kalau siswa atau periode dihapus, rekap terkait ikut terhapus otomatis.

## Menjalankan di komputer sendiri

Yang dibutuhkan: **Node.js** (disarankan versi 22 ke atas), akun **Supabase**, dan Git.

**1. Ambil kodenya**
```bash
git clone https://github.com/faidzabdl/kas_kelas.git
cd kas_kelas
```

**2. Siapkan database**
1. Buat project baru di supabase.com.
2. Buka **SQL Editor**, tempel seluruh isi `database/schema.sql`, lalu klik **Run**.
3. Buka **Project Settings → API**, lalu catat **Project URL** (bentuknya `https://xxxx.supabase.co`) dan key **service_role**.

**3. Jalankan backend** (terminal pertama)
```bash
cd backend
copy .env.example .env      # di Mac/Linux: cp .env.example .env
```
Buka file `.env`, isi `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY`, lalu:
```bash
npm install
npm run dev
```
Kalau berhasil, muncul tulisan `API berjalan di port 3000`. Cek `http://localhost:3000/api/health`, hasilnya harus `{"status":"ok"}`.

**4. Jalankan frontend** (terminal kedua)
```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```
Buka `http://localhost:5173`.

**5. Isi data awal.** Buat periode pertama lewat panel **Periode minggu**, lalu masukkan siswa lewat panel **Impor banyak siswa sekaligus**.

> Setiap kali `.env` diubah, server harus dimatikan (Ctrl+C) dan dijalankan lagi, karena `.env` hanya dibaca saat server start.

## Environment variables

File `.env` tidak ikut ke GitHub (sudah ada di `.gitignore`). Yang ikut hanya `.env.example` sebagai contoh.

**Backend (Railway, atau `backend/.env` saat lokal)**

| Key | Isi | Keterangan |
|---|---|---|
| `SUPABASE_URL` | `https://xxxx.supabase.co` | Harus URL API project, **bukan** alamat dashboard Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | key `service_role` | Rahasia. Jangan dibagikan atau dipakai di frontend |
| `FRONTEND_URL` | `https://nama-app.vercel.app` | Alamat frontend yang boleh mengakses API. Tanpa garis miring di akhir, boleh beberapa dipisah koma |
| `NODE_ENV` | `production` | Di mode production, `localhost:5173` tidak diizinkan oleh CORS |
| `IURAN_MINGGUAN` | `5000` | Nominal iuran per siswa (opsional, default 5000) |
| `PORT` | | Diisi otomatis oleh Railway, tidak perlu dibuat sendiri |

**Frontend (Vercel, atau `frontend/.env` saat lokal)**

| Key | Isi |
|---|---|
| `VITE_API_URL` | Lokal: `http://localhost:3000`. Production: alamat backend Railway, tanpa garis miring di akhir dan **tanpa** `/api` |

Awalan `VITE_` memang membuat nilainya terlihat di browser. Itu aman untuk variabel ini karena isinya hanya alamat backend. Sebaliknya, `SUPABASE_SERVICE_ROLE_KEY` hanya boleh ada di backend.

## Deploy ke internet

Urutannya penting karena backend dan frontend saling membutuhkan alamat satu sama lain.

**1. Upload ke GitHub.** Pastikan tidak ada file `.env` yang ikut terunggah.

**2. Backend ke Railway**
1. **New Project → Deploy from GitHub repo**, pilih repo ini.
2. Di **Settings**, isi **Root Directory** dengan `/backend`. Kalau terlewat, build gagal karena Railway tidak menemukan `package.json`.
3. Di tab **Variables**, isi semua variabel backend di atas. `FRONTEND_URL` boleh diisi sementara dulu.
4. Di **Settings → Networking**, klik **Generate Domain**.
5. Tes `https://domain-railway-kamu/api/health`, harus muncul `{"status":"ok"}`.

**3. Frontend ke Vercel**
1. **Add New → Project**, import repo yang sama.
2. Isi **Root Directory** dengan `frontend`. Framework terdeteksi sebagai Vite.
3. Tambahkan `VITE_API_URL` berisi alamat Railway.
4. Klik **Deploy**, lalu salin domain utamanya.

**4. Sambungkan balik.** Kembali ke Railway, ubah `FRONTEND_URL` menjadi domain Vercel yang persis sama dengan yang ada di address bar. Railway akan redeploy sendiri.

**5. Tes akhir.** Buka domain Vercel, tandai satu siswa sudah bayar, refresh halaman, dan pastikan statusnya tetap tersimpan.

## Daftar endpoint API

Semua endpoint diawali `/api` dan mengembalikan JSON.

| Method | Path | Fungsi |
|---|---|---|
| GET | `/api/health` | Cek server hidup |
| GET | `/api/periode` | Daftar periode (terbaru dulu) |
| POST | `/api/periode` | Buat periode. Body: `{ "tanggal_mulai": "2026-10-18" }` |
| DELETE | `/api/periode/:id` | Hapus periode beserta rekapnya |
| GET | `/api/periode/:id/rekap` | Daftar siswa + status bayar + ringkasan kas. Query: `q` (cari nama), `page`, `limit` (maksimal 100) |
| PUT | `/api/periode/:id/rekap/:anggotaId` | Ubah status. Body: `{ "status": "Sudah Bayar" }` atau `"Belum Bayar"` |
| POST | `/api/anggota` | Tambah siswa. Body: `{ "nama": "..." }` |
| POST | `/api/anggota/import` | Impor banyak. Body: `{ "daftar_nama": "nama1\nnama2" }` |
| PATCH | `/api/anggota/:id` | Ubah nama siswa |
| DELETE | `/api/anggota/:id` | Hapus siswa beserta rekapnya |

## Keamanan yang sudah kupasang

- **Validasi semua input** di backend memakai zod: nama 1 sampai 100 karakter, tanggal harus valid, ID harus angka positif, status hanya dua nilai yang diizinkan.
- **Sanitasi**: tanda `<` dan `>` dibuang dari nama, spasi berlebih dirapikan. Query ke database memakai parameter dari `supabase-js`, jadi tidak rentan SQL injection, dan React otomatis meng-escape teks di tampilan.
- **CORS** hanya mengizinkan alamat di `FRONTEND_URL` (plus `localhost:5173` saat bukan production).
- **Helmet** dan **rate limit** (120 permintaan per menit per IP).
- **Error aman.** Detail error database hanya masuk log server. Pengguna hanya melihat pesan ramah seperti "Terjadi kesalahan pada server".
- **RLS aktif** di semua tabel tanpa policy, sehingga key publik Supabase tidak bisa membaca atau menulis apa pun. Hanya backend (dengan `service_role`) yang bisa.
- **Export CSV** dilindungi dari CSV injection (sel berawalan `=`, `+`, `-`, `@` diberi tanda petik).
- **Anti klik ganda.** Tombol kirim dinonaktifkan selama request berjalan, sehingga data tidak masuk dua kali.

## Keterbatasan yang perlu kuketahui

- **Belum ada login.** Siapa pun yang tahu alamat websitenya bisa menandai, mengedit, dan menghapus data. Jadi untuk sekarang jangan menyebarkan link ke sembarang orang. Menambah login admin adalah hal pertama yang akan kukerjakan.
- **Belum ada pencatatan kas keluar.** Aplikasi baru mencatat iuran yang masuk.
- **Tampilan belum ada halaman per halaman.** Backend sudah mendukung `page` dan `limit`, tapi layar memuat sampai 100 siswa sekaligus, cukup untuk satu kelas.
- **"Excel" berupa file CSV**, yang bisa dibuka di Excel. Belum berupa `.xlsx` asli.
- **Kode belum punya tes otomatis.**

## Kalau ada masalah

| Gejala | Kemungkinan penyebab dan solusi |
|---|---|
| Halaman putih kosong | Buka F12 → Console. Biasanya `VITE_API_URL` kosong atau salah |
| Banner "Respons server tidak valid" | `VITE_API_URL` salah. Di Vercel, perbaiki lalu **Redeploy**, karena variabel `VITE_` ditanam saat build |
| Banner "Tidak dapat terhubung ke server" | `FRONTEND_URL` di Railway belum sama persis dengan alamat Vercel, atau backend sedang mati |
| "Terjadi kesalahan pada server" | Lihat log backend, cari baris `[supabase] ...`. Biasanya tabel belum dibuat, key salah, atau `SUPABASE_URL` salah |
| Log backend berisi HTML panjang | `SUPABASE_URL` diisi alamat dashboard Supabase, padahal harus `https://xxxx.supabase.co` |
| Railway: "could not determine how to build" | Root Directory belum diisi `/backend` |
| Railway crash saat start | Variabel `SUPABASE_URL` atau `SUPABASE_SERVICE_ROLE_KEY` belum diisi di tab Variables |
| Website minta login Vercel | Itu Deployment Protection. Pakai domain utama, atau matikan di Settings → Deployment Protection |
| Nama siswa dobel setelah impor | Impor dijalankan dua kali. Kosongkan dulu dengan perintah di bawah, lalu impor ulang |

Mengosongkan seluruh data siswa dan rekap (jalankan di Supabase SQL Editor, **tidak bisa dibatalkan**):
```sql
truncate table public.anggota restart identity cascade;
```

## Rencana ke depan

- Login admin: orang lain hanya bisa melihat rekap, aksi ubah dan hapus butuh password
- Pencatatan kas keluar dan saldo akhir
- Export `.xlsx` asli
- Riwayat pembayaran per siswa lintas periode
- Halaman per halaman di tabel kalau jumlah siswa bertambah
