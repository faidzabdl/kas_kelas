# Rekap Kas Kelas (Express + Supabase + React)

```
kas-kelas/
├── database/schema.sql   # jalankan di Supabase SQL Editor
├── backend/              # Express REST API  -> Railway
└── frontend/             # React + Vite + Tailwind -> Vercel
```

## Menjalankan lokal
1. Supabase: buat project, jalankan `database/schema.sql`.
2. Backend: `cd backend && cp .env.example .env` (isi nilainya) lalu `npm i && npm run dev`.
3. Frontend: `cd frontend && cp .env.example .env` lalu `npm i && npm run dev` (http://localhost:5173).
4. Data lama: buka panel "Impor banyak siswa sekaligus" lalu tempel daftar 36 nama dari `db_kas.sql`.

## Environment variables
**Railway** (service = folder `backend`, Root Directory: `backend`)
| Key | Contoh |
|---|---|
| `SUPABASE_URL` | `https://abcd1234.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase > Settings > API > `service_role` (rahasia) |
| `FRONTEND_URL` | `https://kas-kelas.vercel.app` (boleh beberapa, pisahkan koma) |
| `NODE_ENV` | `production` |
| `IURAN_MINGGUAN` | `5000` |
`PORT` diisi otomatis oleh Railway.

**Vercel** (Root Directory: `frontend`, Framework: Vite)
| Key | Contoh |
|---|---|
| `VITE_API_URL` | `https://kas-kelas-api.up.railway.app` |

Urutan deploy: Railway dulu -> salin URL-nya ke `VITE_API_URL` -> deploy Vercel -> salin URL Vercel ke `FRONTEND_URL` di Railway.

## Endpoint
`GET /api/health` · `GET|POST /api/periode` · `DELETE /api/periode/:id` · `GET /api/periode/:id/rekap?q=&page=&limit=`
`PUT /api/periode/:id/rekap/:anggotaId {status}` · `POST /api/anggota` · `POST /api/anggota/import {daftar_nama}`
`PATCH|DELETE /api/anggota/:id`
