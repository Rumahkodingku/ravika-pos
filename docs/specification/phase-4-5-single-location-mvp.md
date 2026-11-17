# RAVIKA POS - Spesifikasi Fase 4.5: Single-Location MVP

**Status:** Implemented dan terverifikasi
**Fase:** 4.5, penyederhanaan model operasional sebelum Fase 5
**Tanggal:** 17 November 2026
**Baseline kode:** `c33e473`
**Baseline M4 sebelumnya:** `d6c07b5`
**Tag M4 sebelumnya:** `phase-4-ui-approved`

## 1. Keputusan

MVP RAVIKA POS hanya melayani satu bisnis dengan satu lokasi operasional.
Modul lokasi tambahan dihapus dari UI, permission, data model, service, dan
seed. Fitur lokasi tambahan tidak termasuk ruang lingkup MVP.

Keputusan ini menjadi dasar model operasional MVP.

## 2. Dampak produk

- Identitas operasional memakai profil bisnis: nama, kode, alamat, dan telepon.
- Tidak ada halaman pengelolaan lokasi tambahan.
- Tidak ada pemilihan lokasi aktif di management, POS, KDS, atau halaman pelanggan.
- Pengguna tidak memiliki penugasan lokasi.
- Meja bersifat global untuk satu bisnis.
- Pesanan memakai prefix kode bisnis, contoh `RVK-2025`.
- Laporan dan dashboard memakai filter tanggal saja.
- Permission lokasi tambahan dihapus dari role dan matriks izin.

## 3. Perubahan route dan permission

- Route user-facing berkurang dari 18 menjadi 17.
- Satu route pengelolaan lokasi dihapus dan tidak dialihkan.
- Permission pengelolaan lokasi dihapus.
- Grup permission lokasi dihapus dari halaman peran.

## 4. Perubahan data

- Entitas lokasi tambahan dihapus.
- Field lokasi dihapus dari pesanan dan meja.
- Penugasan lokasi dihapus dari session user dan management user.
- Seed hanya memuat satu bisnis, empat meja, dan data transaksi contoh.
- Token publik contoh memakai prefix `pub-rvk-`.

## 5. Verifikasi

| Pemeriksaan | Hasil |
|---|---|
| `pnpm check` | PASS |
| `pnpm build` | PASS, 22 route |
| Pencarian istilah lokasi pada `src` | 0 hasil |
| Route matrix 17 route x 320, 390, 768, 1024, 1440 x light/dark | Tanpa overflow, console error 0 |
| POS mobile | Buat pesanan, pilih meja, bayar lunas |
| KDS | Order baru terlihat lewat sinkronisasi tab |
| Customer QR | Menu tampil, pesanan dibuat, status publik tampil |
| Management | Meja dan pengguna dapat dibuat tanpa field lokasi |
| Order number | `RVK-####` |
| Copy UI | Tidak ada istilah lokasi tambahan |

## 6. Known limitation

- Model satu lokasi adalah keputusan MVP. Perluasan lokasi di masa depan
  memerlukan entitas, migrasi data, permission, dan UI baru.
- Tidak ada backend atau migrasi database pada fase ini.

## 7. Approval pasca-M4

Perubahan ini dicatat sebagai addendum pada
`docs/specification/phase-4-ui-approval.md`. Baseline M4 lama tetap historis.
Baseline baru dan tag baru dicatat setelah commit dokumen ini.
