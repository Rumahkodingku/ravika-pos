# QA Checklist Phase 8

**Tanggal:** 18 November 2026

## Automated

- [x] `pnpm check`
- [x] `pnpm test`
- [x] `pnpm test:e2e` - 7 tests
- [x] `pnpm build`
- [x] Security: public menu isolation, invalid QR, inactive add-on, idempotency conflict, rate limit
- [x] Playwright: Owner catalog + image, Cashier split payment, Barista KDS + reconnect, Customer QR, responsive/theme

## Manual

- [x] Health 200 pada server E2E
- [x] Login owner, cashier, barista
- [x] Login via `127.0.0.1` setelah perbaikan origin check
- [x] Product image upload dan serving
- [x] Backup/restore dan restart health
- [ ] Download backup
- [ ] Upload backup valid dan invalid
- [ ] Backup harian dan retensi
- [x] License missing/invalid ditampilkan aman
- [x] `pnpm audit --prod` - no known vulnerabilities
- [x] Backup contains image BLOB; restore + restart; image returned 200
- [ ] Instalasi systemd di Ubuntu fisik
- [ ] LAN access dari ponsel fisik
- [ ] Installer Windows 11 x64
- [ ] Windows service start setelah reboot
- [ ] Windows firewall rule TCP 3000 dan UDP 5353
- [ ] Network Settings menampilkan IP, URL, dan QR
- [ ] mDNS `ravika-pos.local` di Windows 11
- [ ] mDNS fallback IP saat multicast diblokir
- [ ] Windows upgrade/rollback
- [ ] Windows uninstall preserve `ProgramData`
- [ ] `pnpm audit --prod`
- [ ] Performance hardware pilot

## Catatan

- Origin check diperbaiki dari `request.url.origin` ke header `Host`; login via IP LAN sebelumnya gagal 403.
- Node 26.9.0 non-LTS dicatat di release notes.
- Pilot nyata belum dijalankan.
