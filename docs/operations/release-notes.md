# Release Notes - 1.0.0-rc.1

**Tag:** `phase-8-release-candidate`
**Tanggal:** 18 November 2026

## Cakupan

- POS, KDS, QR menu, pesanan, pembayaran, refund penuh, laporan, lisensi, backup/restore.
- Gambar produk BLOB SQLite dan add-on management.
- Cookie session, RBAC, dynamic roles, dependency TanStack Query.
- Playwright E2E lokal untuk Owner, Cashier, Barista, Customer.
- CI check/test/build.

## Instalasi

Lihat `docs/operations/installation.md`.

## Known Limitations

- Node 26.9.0 bukan LTS.
- HTTP LAN, belum HTTPS.
- SSE dan rate limit berjalan in-process.
- Pilot cafe nyata belum dijalankan.
- Performance hardware target belum diuji.
- Tidak ada Docker atau installer otomatis.
- Tidak ada cetak struk.
- Takeaway QR belum tersedia.

## Verifikasi

- `pnpm check`
- `pnpm test`
- `pnpm test:e2e`
- `pnpm build`
- `pnpm release:package`
