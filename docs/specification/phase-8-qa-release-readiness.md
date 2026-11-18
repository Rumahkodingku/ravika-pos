# RAVIKA POS - Spesifikasi Fase 8: QA and Release Readiness

**Status:** Approved untuk implementasi
**Milestone:** M8 - Release Candidate
**Fase:** 8, Quality Assurance and Release Readiness
**Tanggal:** 18 November 2026
**Baseline fitur:** `phase-7-integration`
**Target server:** Ubuntu LTS, satu komputer lokal, akses LAN
**Referensi utama:** `docs/PRD.md`, `docs/ROADMAP.md`, `docs/specification/phase-5-backend-foundation.md`, `docs/specification/phase-6-backend-api-modules.md`, `docs/specification/phase-7-frontend-backend-integration.md`, `docs/design/ui-ux-guidelines.md`

## Daftar isi

- [RAVIKA POS - Spesifikasi Fase 8: QA and Release Readiness](#ravika-pos---spesifikasi-fase-8-qa-and-release-readiness)
  - [Daftar isi](#daftar-isi)
  - [0. Agent quick start](#0-agent-quick-start)
  - [1. Ringkasan](#1-ringkasan)
  - [2. Goals, non-goals, dan anti-goals](#2-goals-non-goals-dan-anti-goals)
    - [Goals](#goals)
    - [Non-goals](#non-goals)
    - [Anti-goals](#anti-goals)
  - [3. Keputusan yang dikunci](#3-keputusan-yang-dikunci)
  - [4. Scope dan deliverable](#4-scope-dan-deliverable)
    - [Deliverable](#deliverable)
    - [Dependency](#dependency)
    - [Tidak termasuk](#tidak-termasuk)
  - [5. Arsitektur QA](#5-arsitektur-qa)
    - [Lapisan test](#lapisan-test)
    - [Aturan test](#aturan-test)
  - [6. Playwright E2E](#6-playwright-e2e)
    - [Dependency](#dependency-1)
    - [Alur wajib](#alur-wajib)
      - [Owner](#owner)
      - [Cashier](#cashier)
      - [Barista](#barista)
      - [Customer](#customer)
    - [Responsive dan theme](#responsive-dan-theme)
    - [Selector](#selector)
  - [7. Isolasi data dan server E2E](#7-isolasi-data-dan-server-e2e)
    - [Database](#database)
    - [Server](#server)
    - [Akun](#akun)
    - [Data](#data)
  - [8. CI](#8-ci)
  - [9. Security QA](#9-security-qa)
    - [Automated](#automated)
    - [Manual checklist](#manual-checklist)
    - [Batas](#batas)
  - [10. Backup, restore, dan lisensi](#10-backup-restore-dan-lisensi)
    - [Backup/restore](#backuprestore)
    - [Lisensi](#lisensi)
  - [11. Performance baseline](#11-performance-baseline)
    - [Tujuan](#tujuan)
    - [Metrik](#metrik)
    - [Metode](#metode)
    - [Batas](#batas-1)
  - [12. Dokumentasi operasional](#12-dokumentasi-operasional)
  - [13. Release artifact](#13-release-artifact)
    - [Version](#version)
    - [Tag](#tag)
    - [Artifact](#artifact)
    - [Release notes](#release-notes)
  - [14. File map](#14-file-map)
  - [15. Test case wajib](#15-test-case-wajib)
  - [16. Manual QA checklist](#16-manual-qa-checklist)
  - [17. Urutan implementasi](#17-urutan-implementasi)
    - [Task 1: Playwright harness](#task-1-playwright-harness)
    - [Task 2: Owner catalog E2E](#task-2-owner-catalog-e2e)
    - [Task 3: Cashier E2E](#task-3-cashier-e2e)
    - [Task 4: Barista E2E](#task-4-barista-e2e)
    - [Task 5: Customer E2E](#task-5-customer-e2e)
    - [Task 6: Security dan drills](#task-6-security-dan-drills)
    - [Task 7: CI dan performance](#task-7-ci-dan-performance)
    - [Task 8: Docs dan release](#task-8-docs-dan-release)
  - [18. Acceptance criteria](#18-acceptance-criteria)
    - [Functional](#functional)
    - [Operational](#operational)
    - [Quality](#quality)
  - [19. Risiko dan mitigasi](#19-risiko-dan-mitigasi)
  - [20. Definition of Done](#20-definition-of-done)
  - [21. Handoff pilot](#21-handoff-pilot)
  - [Appendix A: Playwright config](#appendix-a-playwright-config)
  - [Appendix B: systemd unit](#appendix-b-systemd-unit)
  - [Appendix C: release commands](#appendix-c-release-commands)

## 0. Agent quick start

Baca dokumen ini sebelum menulis kode atau dokumen Fase 8.

Aturan wajib:

1. Fase 8 adalah QA dan release readiness. Jangan menambah fitur bisnis baru.
2. Jangan mengubah schema database atau business rule.
3. Playwright dijalankan lokal terhadap production build. Playwright tidak masuk CI.
4. CI hanya menjalankan `pnpm check`, `pnpm test`, dan `pnpm build`.
5. E2E wajib memakai database sementara di `.e2e/`, bukan `data/ravika.sqlite`.
6. E2E memakai seed development melalui `RAVIKA_SEED_MODE=development`.
7. Jangan memakai data production atau database developer.
8. Jangan membuat Docker, installer script, atau PWA di fase ini.
9. Jangan mengklaim performa pilot tanpa hardware target.
10. Jangan mengklaim HTTPS siap. HTTP LAN tetap risiko pilot.
11. Node tetap 26.9.0. Catat risiko non-LTS di release notes.
12. Semua dokumen operasional harus dapat dijalankan operator tanpa membaca source code.
13. Jangan menyimpan password, token, signature, atau secret di dokumen.
14. Jalankan gate sebelum tag: `pnpm check`, `pnpm test`, `pnpm test:e2e`, `pnpm build`, `pnpm release:package`.
15. Jika ada konflik dengan PRD atau roadmap, berhenti dan minta keputusan product owner.

## 1. Ringkasan

Fase 8 menyiapkan RAVIKA POS sebagai release candidate untuk satu server Ubuntu LTS di jaringan lokal.

Fase ini menghasilkan:

- Suite Playwright untuk alur Owner, Cashier, Barista/KDS, dan Customer QR.
- Cakupan katalog tambahan: kategori, produk, gambar produk, add-on, dan meja.
- Smoke responsive mobile/tablet/desktop dan light/dark theme.
- CI GitHub Actions untuk check, test, dan build.
- Security QA untuk session, RBAC, public token isolation, idempotency, rate limit, QR invalid, backup/restore, dan lisensi.
- Drill backup/restore dan lisensi offline.
- Baseline performa indikatif.
- Dokumentasi instalasi, LAN, backup/restore, upgrade, troubleshooting, dan release notes.
- Contoh systemd unit.
- Versi `1.0.0-rc.1`, tarball rilis, dan tag `phase-8-release-candidate`.

Fase 8 tidak menjalankan pilot cafe nyata. Pilot dan performa hardware target dipisahkan ke sesi berikutnya.

## 2. Goals, non-goals, dan anti-goals

### Goals

- Alur operasional utama terbukti berjalan di production build.
- Regression otomatis tersedia untuk empat persona utama.
- Data E2E terisolasi dan tidak menyentuh data developer.
- CI menjaga check, test, dan build pada setiap perubahan.
- Security boundary internal dan publik diuji.
- Backup/restore dan lisensi offline terbukti.
- Operator memiliki runbook yang lengkap.
- Release candidate dapat diarsipkan dan dipasang di Ubuntu LTS.
- Risiko teknis yang belum selesai tercatat jujur.

### Non-goals

- Pilot cafe nyata.
- Performance pada hardware target pilot.
- Docker atau Docker Compose.
- Installer script otomatis.
- HTTPS LAN.
- PWA atau service worker.
- Visual screenshot regression.
- Penetration test formal.
- Load testing kapasitas produksi.
- Perubahan fitur bisnis, schema, atau permission.
- Upload logo bisnis atau galeri produk.

### Anti-goals

- Jangan memakai database production untuk E2E.
- Jangan menganggap Playwright lokal sama dengan CI.
- Jangan mengecilkan risiko Node 26 non-LTS.
- Jangan mengklaim aman untuk internet publik.
- Jangan menambahkan dependency tanpa kebutuhan QA yang jelas.
- Jangan menaruh secret di release notes atau runbook.
- Jangan menandai pilot selesai tanpa pilot.

## 3. Keputusan yang dikunci

| ID    | Keputusan                            | Alasan                                                    |
| ----- | ------------------------------------ | --------------------------------------------------------- |
| P8-01 | Scope QA dan release readiness       | Pilot nyata butuh akses cafe, hardware, dan operator      |
| P8-02 | Ubuntu LTS + systemd                 | Target server MVP tunggal dan lokal                       |
| P8-03 | Node tetap 26.9.0                    | Menghindari perubahan runtime di akhir fase               |
| P8-04 | Playwright lokal, bukan CI           | CI dipilih ringan; E2E dijalankan sebelum tag             |
| P8-05 | CI check/test/build saja             | Gate cepat dan stabil di GitHub Actions                   |
| P8-06 | E2E production build                 | Menguji build yang benar-benar akan dipasang              |
| P8-07 | Temp DB + development seed           | Isolasi data dan determinisme                             |
| P8-08 | Empat alur inti + katalog            | Menutup flow operasional dan fitur katalog baru           |
| P8-09 | Responsive smoke, tanpa screenshot   | Stabil dan cukup untuk regresi layout                     |
| P8-10 | Security checklist + automated       | Auth/RBAC dan public isolation diuji tanpa pentest formal |
| P8-11 | Backup/license drill otomatis+manual | Menguji integrasi dan prosedur operator                   |
| P8-12 | Performance baseline indikatif       | Hardware target belum ditentukan                          |
| P8-13 | Docs operasional terpisah            | Runbook mudah dirujuk saat insiden                        |
| P8-14 | Version 1.0.0-rc.1                   | Menandai release candidate pertama                        |
| P8-15 | Tarball dari `git archive`           | Tidak membawa file lokal, secret, atau database           |
| P8-16 | Pilot di luar fase ini               | Tidak ada akses cafe dan target hardware pada sesi ini    |

## 4. Scope dan deliverable

### Deliverable

1. Dependency Playwright dan browser Chromium.
2. E2E server production-build dengan database sementara.
3. Auth helper dan fixture E2E.
4. E2E Owner catalog.
5. E2E Cashier POS dan split payment.
6. E2E Barista KDS dan reconnect.
7. E2E Customer QR dan public status.
8. Smoke responsive dan theme.
9. Security test dan QA checklist.
10. Backup/restore/license drill.
11. Performance baseline script dan catatan hasil.
12. CI quality workflow.
13. Dokumentasi operasional.
14. Systemd unit contoh.
15. Release packaging script.
16. Version bump dan tag.
17. Update PRD/ROADMAP/README/AGENTS.

### Dependency

- Phase 7 selesai dan tag `phase-7-integration`.
- Semua test Vitest/RTL lulus.
- Production build lulus.
- Akses ke Chromium Playwright.
- Repository GitHub untuk CI.

### Tidak termasuk

- Pilot cafe.
- Hardware pilot.
- HTTPS.
- Docker.
- Installer.
- PWA.
- Cetak struk.
- Fitur bisnis baru.

## 5. Arsitektur QA

```text
pnpm check ──────────────┐
pnpm test (Vitest) ──────┼─ CI quality gate
pnpm build ──────────────┘

Playwright (lokal)
  -> production build
  -> temp SQLite
  -> development seed
  -> four personas + catalog
  -> responsive/theme smoke

Manual drills
  -> backup/restore
  -> license offline
  -> LAN access
  -> systemd service
```

### Lapisan test

| Lapisan     | Tool            | Fokus                                          |
| ----------- | --------------- | ---------------------------------------------- |
| Unit        | Vitest          | Validasi, client, helper, format, auth landing |
| Integration | Vitest + SQLite | Service, repository, backup/license, RBAC      |
| RTL         | Testing Library | Halaman dan komponen kritis                    |
| E2E         | Playwright      | Persona flow pada production build             |
| Manual      | Checklist       | LAN, systemd, backup drill, restore, license   |
| Performance | Node script     | Baseline indikatif endpoint dan page load      |

### Aturan test

- Test tidak memakai `sleep` sebagai sinkronisasi utama.
- Playwright memakai web-first assertions.
- E2E workers = 1 untuk satu database.
- Test data memakai nama unik berbasis timestamp bila membuat record baru.
- Test tidak bergantung pada urutan file.
- Test tidak memakai database developer.
- Test tidak memakai production secret.

## 6. Playwright E2E

### Dependency

- `@playwright/test@1.65.1`
- Chromium hanya untuk lokal.

### Alur wajib

#### Owner

- Login melalui UI.
- Buat kategori.
- Buat add-on.
- Buat produk dengan varian, add-on, dan gambar.
- Verifikasi detail produk dan gambar.
- Buat meja dan buka QR.

#### Cashier

- Login sebagai cashier.
- Buat order POS.
- Pilih meja.
- Split payment cash + QRIS.
- Verifikasi status pembayaran di halaman Orders/Payments.

#### Barista

- Login sebagai barista.
- Buka KDS.
- Transisi `Terima -> Mulai siapkan -> Tandai siap -> Selesai`.
- Putuskan koneksi browser, lalu sambungkan kembali.
- Verifikasi indicator kembali `Terhubung` dan queue refetch.

#### Customer

- Buka public menu dengan token meja.
- Tambah produk.
- Submit order.
- Buka status publik.
- Verifikasi status dan total.
- Token invalid menampilkan empty state.

### Responsive dan theme

- Viewport minimum: 390x844, 820x1180, 1440x900.
- Halaman: login, public menu, KDS.
- Tidak ada horizontal overflow.
- Heading utama terlihat.
- Theme toggle mengubah label aksesibel.
- Tidak memakai screenshot diff.

### Selector

- Utamakan `getByRole`, `getByLabel`, dan teks yang terlihat.
- Jangan menambah `data-testid` kecuali tidak ada selector aksesibel.
- Jangan memakai CSS class Tailwind sebagai selector.

## 7. Isolasi data dan server E2E

### Database

- Path: `.e2e/ravika.sqlite`.
- `.e2e/` masuk `.gitignore`.
- Server E2E menghapus database lama sebelum start.
- `RAVIKA_SEED_MODE=development` memaksa seed demo meskipun berjalan dengan `next start`.
- Tidak boleh menyentuh `data/ravika.sqlite`.

### Server

- Production build: `pnpm build`.
- Start: `pnpm exec next start -p 3200`.
- Health URL: `http://127.0.0.1:3200/api/health`.
- Playwright `webServer` menunggu health 200 sebelum test.
- Script server meneruskan SIGTERM/SIGINT.

### Akun

- `owner@ravika.id`
- `cashier@ravika.id`
- `barista@ravika.id`
- Password `demo123`

### Data

- Gunakan seed untuk produk/meja dasar.
- Data baru memakai suffix timestamp.
- Test tidak menghapus data seed.
- Test tidak bergantung pada nomor order tertentu.

## 8. CI

Workflow: `.github/workflows/quality.yml`.

Trigger:

- push ke `main`.
- pull request ke `main`.

Steps:

1. Checkout.
2. Setup pnpm 10.34.5.
3. Setup Node dari `.nvmrc` (26.9.0).
4. `pnpm install --frozen-lockfile`.
5. `pnpm check`.
6. `pnpm test`.
7. `pnpm build`.

Tidak ada Playwright, deploy, Docker, atau publish artifact di CI.

Catatan: ketersediaan Node 26.9.0 di GitHub Actions harus diverifikasi saat implementasi. Jika tidak tersedia, workflow gagal dan keputusan runtime harus ditinjau.

## 9. Security QA

### Automated

- Login salah tidak membocorkan identity/password.
- Session tidak valid ditolak.
- Cashier tidak dapat membuka users/roles.
- Barista tidak dapat mengubah katalog atau mencatat pembayaran.
- Public menu tidak memuat user internal atau order lain.
- Public order status tidak memuat `businessId`, `createdBy`, atau data internal.
- Invalid QR token ditolak.
- Idempotency key dengan hash berbeda menghasilkan konflik.
- Rate limit publik menolak request berlebih.
- Add-on nonaktif tidak muncul pada public menu relations.
- Backup/restore tidak membocorkan file path ke client publik.

### Manual checklist

- Login gagal dengan pesan generik.
- Logout mencabut session.
- Session expired kembali ke login.
- Permission matrix sesuai role.
- Public token hanya menampilkan order yang cocok.
- Restore memblokir UI dan meminta restart.
- License invalid/expired ditampilkan aman.
- `pnpm audit --prod` dijalankan dan hasilnya dicatat.
- Tidak ada secret di log atau dokumen.

### Batas

- Tidak ada penetration test formal.
- Tidak ada HTTPS.
- Aplikasi tidak boleh diekspos ke internet publik.
- HTTP LAN tetap risiko sesuai PRD OPEN-012.

## 10. Backup, restore, dan lisensi

### Backup/restore

- Gunakan endpoint backup yang ada.
- Backup SQLite mencakup gambar produk BLOB.
- Simpan salinan backup di media terpisah.
- Drill:
  1. Buat backup.
  2. Ubah atau hapus gambar produk.
  3. Restore backup.
  4. Restart server.
  5. Health 200.
  6. Gambar produk kembali.
- Dokumentasikan waktu, ukuran, checksum, dan hasil.
- Restore tanpa restart tidak dianggap selesai.

### Lisensi

- Uji file lisensi valid.
- Uji file tidak ada.
- Uji signature invalid.
- Uji business mismatch.
- Uji expired.
- Uji tanpa internet.
- Status dan `validationMessage` harus tampil.

## 11. Performance baseline

### Tujuan

Mendapatkan angka indikatif, bukan klaim kapasitas pilot.

### Metrik

- `/api/health`
- `/api/products?pageSize=50`
- `/api/orders?pageSize=50`
- `/api/reports/summary?range=7d`
- `/api/kds/orders`
- HTML load `/app` setelah login

### Metode

- 10 iterasi per endpoint.
- Catat min, median, p95.
- Catat CPU, RAM, OS, Node, pnpm, dan tanggal.
- Jalankan pada mesin development yang tersedia.
- Simpan hasil di `docs/operations/performance-baseline.md`.

### Batas

- Bukan load test.
- Bukan hasil hardware pilot.
- Jangan menetapkan SLA berdasarkan baseline ini.

## 12. Dokumentasi operasional

Folder: `docs/operations/`.

Dokumen wajib:

1. `installation.md`
   - Ubuntu LTS.
   - Node 26.9.0 dan risiko non-LTS.
   - pnpm 10.34.5.
   - clone, env, build, data directory.
   - systemd unit.
   - firewall.
   - health check.
2. `lan.md`
   - IP server.
   - port 3000.
   - akses perangkat lain.
   - tidak butuh internet untuk transaksi.
   - risiko HTTP.
3. `backup-restore.md`
   - jadwal backup.
   - cara membuat backup.
   - menyalin ke media terpisah.
   - restore dan restart.
   - verifikasi health.
4. `upgrade.md`
   - backup sebelum update.
   - pull, install, build, restart.
   - migration otomatis.
   - rollback.
5. `troubleshooting.md`
   - service tidak jalan.
   - 503 database.
   - port bentrok.
   - DB locked.
   - SSE putus.
   - lisensi invalid.
   - restore restart screen.
6. `qa-checklist.md`
   - hasil automated dan manual.
7. `performance-baseline.md`
   - metrik dan environment.
8. `release-notes.md`
   - versi, scope, known limitations.

## 13. Release artifact

### Version

- `package.json` version: `1.0.0-rc.1`.

### Tag

- `phase-8-release-candidate`.

### Artifact

- `release/ravika-pos-1.0.0-rc.1.tar.gz`.
- Dibuat dengan `git archive` dari commit HEAD.
- Tidak menyertakan `data/`, `.e2e/`, `node_modules`, `.next`, `.env`, atau file untracked.
- Isi: source, lockfile, docs, deploy, `.env.example`, README, drizzle.

### Release notes

- Ringkasan fitur.
- Perintah instalasi.
- Known limitations:
  - Node 26.9.0 non-LTS.
  - HTTP LAN.
  - Single-process SSE.
  - Pilot belum dijalankan.
  - Performance hardware target belum diuji.
  - Tidak ada Docker/installer.

## 14. File map

```text
playwright.config.ts
scripts/e2e-server.mjs
scripts/perf-baseline.mjs
scripts/package-release.sh
.github/workflows/quality.yml
deploy/ravika-pos.service
docs/operations/installation.md
docs/operations/lan.md
docs/operations/backup-restore.md
docs/operations/upgrade.md
docs/operations/troubleshooting.md
docs/operations/qa-checklist.md
docs/operations/performance-baseline.md
docs/operations/release-notes.md
tests/e2e/helpers/auth.ts
tests/e2e/smoke.spec.ts
tests/e2e/owner-catalog.spec.ts
tests/e2e/cashier-pos.spec.ts
tests/e2e/barista-kds.spec.ts
tests/e2e/customer-qr.spec.ts
tests/e2e/responsive-theme.spec.ts
tests/e2e/fixtures/product.jpg
tests/integration/phase8-security.test.ts
```

## 15. Test case wajib

| Area       | Test                                            |
| ---------- | ----------------------------------------------- |
| Harness    | Health 200, login page tampil                   |
| Owner      | Kategori, add-on, produk + image, table + QR    |
| Cashier    | POS order, split payment, status PAID           |
| Barista    | KDS transitions, SSE reconnect                  |
| Customer   | QR menu, order, status, invalid token           |
| Responsive | No overflow at 3 viewports                      |
| Theme      | Toggle label berubah                            |
| Security   | RBAC, public isolation, idempotency, rate limit |
| Backup     | Create, restore, image survives, health restart |
| License    | Missing, invalid, expired, valid                |
| Build      | Production build                                |
| CI         | check/test/build                                |
| Release    | Tarball dan tag                                 |

## 16. Manual QA checklist

- [ ] Install dari tarball di Ubuntu LTS.
- [ ] Service systemd start dan auto-restart.
- [ ] Health 200 dari server dan client LAN.
- [ ] Login owner, cashier, barista.
- [ ] Permission matrix.
- [ ] POS split payment.
- [ ] KDS transitions.
- [ ] QR customer order.
- [ ] Product image upload dan tampil.
- [ ] Add-on management.
- [ ] Reports.
- [ ] License valid/invalid.
- [ ] Backup dan restore.
- [ ] Restart server.
- [ ] SSE reconnect.
- [ ] Theme dan responsive.
- [ ] Tidak ada secret di log.
- [ ] `pnpm audit --prod` dicatat.

## 17. Urutan implementasi

### Task 1: Playwright harness

- Dependency, config, E2E server, seed override, health test, auth helper.

### Task 2: Owner catalog E2E

- Category, add-on, product image, table QR.

### Task 3: Cashier E2E

- POS order, split payment, status.

### Task 4: Barista E2E

- KDS transitions, SSE reconnect.

### Task 5: Customer E2E

- Public menu, order, status, responsive/theme.

### Task 6: Security dan drills

- RBAC/public/idempotency/rate-limit tests.
- Backup/restore and license manual drill.
- QA checklist.

### Task 7: CI dan performance

- Quality workflow.
- Perf baseline script.
- Baseline record.

### Task 8: Docs dan release

- Ops docs.
- Systemd unit.
- Version bump.
- Packaging.
- Final gate and tag.

## 18. Acceptance criteria

### Functional

- Empat persona flow lulus Playwright.
- Katalog termasuk gambar dan add-on lulus.
- Responsive/theme smoke lulus.
- Public token isolation lulus.
- SSE reconnect lulus.

### Operational

- Instalasi Ubuntu LTS mengikuti docs.
- systemd service berjalan.
- LAN access berhasil.
- Backup/restore drill berhasil.
- License offline berhasil.
- Release notes jujur.

### Quality

- `pnpm check` PASS.
- `pnpm test` PASS.
- `pnpm test:e2e` PASS.
- `pnpm build` PASS.
- `pnpm release:package` menghasilkan tarball.
- CI quality workflow PASS.
- Tidak ada perubahan schema atau business rule.
- Tidak ada secret di repo/artifact.
- Tag `phase-8-release-candidate` dibuat.

## 19. Risiko dan mitigasi

| Risiko                         | Dampak                                            | Mitigasi                                          |
| ------------------------------ | ------------------------------------------------- | ------------------------------------------------- |
| Node 26 non-LTS                | Dukungan jangka panjang tidak pasti               | Catat di release notes; tinjau sebelum pilot      |
| Playwright flaky               | Gate rilis tidak stabil                           | Workers 1, web-first assertions, data unik        |
| E2E DB salah target            | Data developer hilang                             | Path `.e2e/`, hapus hanya path itu                |
| SSE disconnect test flaky      | False negative                                    | Assert indicator dan refetch, retry terbatas      |
| Restore drill lupa restart     | Data dianggap pulih padahal DB tertutup           | Wajib health 200 setelah restart                  |
| Release tarball membawa secret | Kebocoran                                         | `git archive` dari HEAD, review isi tarball       |
| HTTP LAN                       | Session/cookie rentan di jaringan tidak tepercaya | Dokumentasikan batas; HTTPS pilot                 |
| Hardware target belum diuji    | Klaim performa tidak valid                        | Baseline indikatif dan batas jelas                |
| CI Node 26 tidak tersedia      | Workflow gagal                                    | Verifikasi setup-node; eskalasi keputusan runtime |

## 20. Definition of Done

- Semua acceptance criteria terpenuhi.
- Playwright suite lulus.
- CI quality workflow lulus.
- Security QA selesai.
- Backup/restore dan license drill selesai.
- Performance baseline dicatat.
- Docs operasional lengkap.
- Release artifact dibuat.
- Version `1.0.0-rc.1`.
- Tag `phase-8-release-candidate`.
- PRD/ROADMAP/README/AGENTS diperbarui.
- Known limitations tercatat.
- Pilot ditandai belum dilakukan.

## 21. Handoff pilot

Pilot berikutnya harus:

- Menyediakan server Ubuntu target.
- Menyediakan jaringan LAN cafe.
- Menjalankan instalasi dari artifact.
- Melakukan backup/restore drill di perangkat nyata.
- Menguji performa dengan perangkat target.
- Menguji operator owner, cashier, barista.
- Menguji QR dari beberapa ponsel.
- Menguji Wi-Fi tidak stabil dan restart server.
- Mengumpulkan feedback dan bug.
- Meninjau Node LTS dan HTTPS sebelum produksi.

## Appendix A: Playwright config

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:3200",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "node scripts/e2e-server.mjs",
    url: "http://127.0.0.1:3200/api/health",
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      RAVIKA_DB_PATH: ".e2e/ravika.sqlite",
      RAVIKA_SEED_MODE: "development",
    },
  },
});
```

## Appendix B: systemd unit

```ini
[Unit]
Description=RAVIKA POS
After=network.target

[Service]
Type=simple
User=ravika
WorkingDirectory=/opt/ravika-pos
EnvironmentFile=/opt/ravika-pos/.env
ExecStart=/usr/bin/pnpm start -- -p 3000
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## Appendix C: release commands

```bash
pnpm check
pnpm test
pnpm test:e2e
pnpm build
pnpm release:package
git tag phase-8-release-candidate
```
