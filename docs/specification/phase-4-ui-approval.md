# Phase 4 UI Fixes

**Status:** Perbaikan UI selesai. Approval Phase 4 ditunda sampai audit penuh selesai.

**Baseline commit:** `642d832`

**Tanggal mulai:** 16 November 2026

## Scope

Perbaikan ini menutup delapan temuan UI. Setelah selesai, audit penuh Phase 4 dilanjutkan pada baseline baru.

Di luar scope: fitur baru, backend, database, API, auth nyata, dan SSE.

## Keputusan

| Topik | Keputusan |
|---|---|
| Filter Pesanan | Draft di modal, aktif setelah Terapkan, reset di dalam modal |
| Login mobile | Panel kiri hidden, brand compact di atas form, tanpa footer global |
| Stepper | Token teal baru, warna berbeda per status |
| Antrean dashboard | Empat tiket tertua, warna status, empty state |
| Urutan | Fix temuan, lalu audit penuh |

## Issue register

| ID | Prioritas | Area | Masalah | Perbaikan | Status | Commit |
|---|---|---|---|---|---|---|
| P4-001 | P1 | Pesanan | Search dan lima filter membungkus menjadi tiga baris | Search nomor pesanan dan modal filter draft | FIXED | `1f414c7` |
| P4-002 | P1 | POS | Daftar item memakai nested scroll dan area scroll terlalu kecil | Satu area scroll per mode, catatan masuk area scroll, CTA fixed | FIXED | `1f414c7` |
| P4-003 | P2 | Global | Drop shadow dipakai di card, input, overlay, dan login | Hapus semua drop shadow, pertahankan focus ring | FIXED | `1f414c7` |
| P4-004 | P2 | Login | Split layout dibungkus card, header, dan footer | Split penuh tanpa card, header, dan footer | FIXED | `1f414c7` |
| P4-005 | P2 | Status | Status badge memakai dot dekoratif | Hapus dot, pertahankan label dan warna | FIXED | `1f414c7` |
| P4-006 | P2 | Stepper | Hanya status pertama yang berwarna | Warna per status, state tetap terbaca | FIXED | `1f414c7` |
| P4-007 | P1 | Dashboard | Card Antrean persiapan hanya count, state terbalik, tanpa tiket | Card Antrean pesanan dengan warna status, empat tiket tertua, empty state | FIXED | `bedb681` |
| P4-008 | P2 | Drawer | Bottom sheet terpotong `max-width` bawaan browser | Tambah `max-w-none` pada side `bottom` | FIXED | `2077f14` |

## Verifikasi yang harus lulus

- `pnpm check`
- `pnpm build`
- Tidak ada `shadow` di `src`
- Tidak ada overflow horizontal pada 320, 390, 768, 1024, dan 1440
- Console error 0 pada route yang diubah
- Light dan dark theme terbaca
- Keyboard, Escape, dan focus ring tetap bekerja

## Hasil verifikasi

| Pemeriksaan | Hasil |
|---|---|
| `pnpm check` | PASS |
| `pnpm build` | PASS, 23 route |
| `grep shadow src` | Tidak ada hasil |
| Em dash dan middle dot di `src` | Tidak ada hasil |
| Overflow 320 | 18 route, tidak ada overflow |
| Overflow 768, 1024, 1440, light dan dark | 108 pemeriksaan, tidak ada overflow |
| Console error | 0 pada seluruh pemeriksaan route |
| Filter Pesanan | Draft, Terapkan, Reset, Escape, dan pagination bekerja |
| Cart POS | 12 item di 390 dan 1440, satu scroll container, CTA fixed |
| Login | 320, 390, 768, 1024, 1440, light dan dark, tanpa header, card, dan shadow |
| Stepper | Lima status berwarna di KDS, label tetap ada |
| Status badge | Tidak ada dot dekoratif |
| Antrean dashboard | Count dan empat tiket tertua konsisten, filter outlet bekerja |
| Antrean dashboard mobile | Stepper grid 2x2 pada 320 dan 390, tanpa clipping |
| Antrean dashboard empty | Diuji dengan menyelesaikan semua tiket Senopati, empty state tampil |
| Antrean dashboard viewport | 320, 390, 768, 1024, 1440, light dan dark, tanpa overflow |
| Bottom sheet | Full width pada 320 dan 390 di POS, QR menu, dan filter produk |
| Bottom sheet keyboard | Escape menutup sheet, tanpa console error |
| Impeccable detector | Tidak ada temuan pada file UI yang berubah |

## Catatan

Issue baru dari audit penuh ditambahkan ke tabel ini. Approval hanya dicatat setelah semua issue P0, P1, dan P2 selesai.
