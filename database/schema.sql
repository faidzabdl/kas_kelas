-- Jalankan di Supabase: SQL Editor > New query > Run
create table if not exists public.anggota (
  id         bigint generated always as identity primary key,
  nama       varchar(100) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.periode_minggu (
  id              bigint generated always as identity primary key,
  tanggal_mulai   date not null unique,
  tanggal_selesai date generated always as (tanggal_mulai + 6) stored,
  created_at      timestamptz not null default now()
);

-- Baris rekap dibuat saat siswa ditandai "Sudah Bayar".
-- Siswa tanpa baris rekap otomatis dianggap "Belum Bayar" (tidak perlu sinkronisasi seperti di PHP).
create table if not exists public.rekap_mingguan (
  id            bigint generated always as identity primary key,
  anggota_id    bigint not null references public.anggota(id) on delete cascade,
  periode_id    bigint not null references public.periode_minggu(id) on delete cascade,
  status        text not null default 'Belum Bayar' check (status in ('Sudah Bayar','Belum Bayar')),
  tanggal_bayar date,
  unique (anggota_id, periode_id)
);

create index if not exists idx_rekap_periode on public.rekap_mingguan (periode_id, status);
create index if not exists idx_anggota_nama  on public.anggota (nama);

-- Keamanan: aktifkan RLS tanpa policy => anon key tidak bisa akses apa pun.
-- Backend memakai service_role key (melewati RLS), jadi hanya API yang bisa baca/tulis.
alter table public.anggota        enable row level security;
alter table public.periode_minggu enable row level security;
alter table public.rekap_mingguan enable row level security;
