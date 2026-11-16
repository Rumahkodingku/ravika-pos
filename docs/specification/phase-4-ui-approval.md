# Phase 4 UI Fixes

**Status:** Perbaikan UI berlangsung. Approval Phase 4 ditunda sampai semua issue di bawah selesai dan diverifikasi.

**Baseline commit:** `642d832`

**Tanggal mulai:** 16 November 2026

## Scope

Perbaikan ini menutup enam temuan UI awal. Setelah selesai, audit penuh Phase 4 dilanjutkan pada baseline baru.

Di luar scope: fitur baru, backend, database, API, auth nyata, dan SSE.

## Keputusan

| Topik | Keputusan |
|---|---|
| Filter Pesanan | Draft di modal, aktif setelah Terapkan, reset di dalam modal |
| Login mobile | Panel kiri hidden, brand compact di atas form, tanpa footer global |
| Stepper | Token teal baru, warna berbeda per status |
| Urutan | Fix enam temuan, lalu audit penuh |

## Issue register

| ID | Prioritas | Area | Masalah | Perbaikan | Status |
|---|---|---|---|---|---|
| P4-001 | P1 | Pesanan | Search dan lima filter membungkus menjadi tiga baris | Search nomor pesanan dan modal filter | OPEN |
| P4-002 | P1 | POS | Daftar item memakai nested scroll dan area scroll terlalu kecil | Satu area scroll per mode, catatan masuk area scroll, CTA fixed | OPEN |
| P4-003 | P2 | Global | Drop shadow dipakai di card, input, overlay, dan login | Hapus semua drop shadow, pertahankan focus ring | OPEN |
| P4-004 | P2 | Login | Split layout dibungkus card, header, dan footer | Split penuh tanpa card, header, dan footer | OPEN |
| P4-005 | P2 | Status | Status badge memakai dot dekoratif | Hapus dot, pertahankan label dan warna | OPEN |
| P4-006 | P2 | Stepper | Hanya status pertama yang berwarna | Warna per status, state tetap terbaca | OPEN |

## Verifikasi yang harus lulus

- `pnpm check`
- `pnpm build`
- Tidak ada `shadow` di `src`
- Tidak ada overflow horizontal pada 320, 390, 768, 1024, dan 1440
- Console error 0 pada route yang diubah
- Light dan dark theme terbaca
- Keyboard, Escape, dan focus ring tetap bekerja

## Catatan

Issue baru dari audit penuh ditambahkan ke tabel ini. Approval hanya dicatat setelah semua issue P0, P1, dan P2 selesai.
