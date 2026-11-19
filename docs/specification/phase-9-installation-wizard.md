# RAVIKA POS - Spesifikasi Fase 9: Installation Wizard

**Status:** Implemented dan terverifikasi
**Milestone:** M9 - Installation Ready
**Fase:** 9, Installation Wizard
**Tanggal:** 18 November 2026
**Baseline fitur:** `phase-8-release-candidate`
**Referensi utama:** `docs/PRD.md`, `docs/ROADMAP.md`, `docs/specification/phase-5-backend-foundation.md`, `docs/specification/phase-6-backend-api-modules.md`, `docs/specification/phase-7-frontend-backend-integration.md`, `docs/specification/phase-8-qa-release-readiness.md`

## Daftar isi

- [RAVIKA POS - Spesifikasi Fase 9: Installation Wizard](#ravika-pos---spesifikasi-fase-9-installation-wizard)
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
  - [5. Arsitektur](#5-arsitektur)
    - [5.1 Alur first-run](#51-alur-first-run)
    - [5.2 Alur env fallback](#52-alur-env-fallback)
    - [5.3 Lapisan](#53-lapisan)
    - [5.4 Aturan](#54-aturan)
  - [6. Kontrak API](#6-kontrak-api)
    - [6.1 `GET /api/setup/status`](#61-get-apisetupstatus)
    - [6.2 `POST /api/setup`](#62-post-apisetup)
  - [7. Backend](#7-backend)
    - [7.1 Seed production](#71-seed-production)
    - [7.2 Setup service](#72-setup-service)
    - [7.3 `.env` writer](#73-env-writer)
    - [7.4 Lisensi](#74-lisensi)
    - [7.5 Business update](#75-business-update)
    - [7.6 Owner creation](#76-owner-creation)
    - [7.7 Route](#77-route)
  - [8. Frontend](#8-frontend)
    - [8.1 Route](#81-route)
    - [8.2 Form](#82-form)
    - [8.3 Restart](#83-restart)
    - [8.4 UI copy](#84-ui-copy)
  - [9. Keamanan](#9-keamanan)
  - [10. Testing](#10-testing)
    - [Unit](#unit)
    - [Integration](#integration)
    - [RTL](#rtl)
    - [Manual](#manual)
  - [11. Dokumentasi](#11-dokumentasi)
  - [12. Urutan implementasi](#12-urutan-implementasi)
  - [13. Verifikasi manual](#13-verifikasi-manual)
  - [14. Acceptance criteria](#14-acceptance-criteria)
  - [15. Risiko dan mitigasi](#15-risiko-dan-mitigasi)
  - [16. Definition of Done](#16-definition-of-done)
  - [17. Handoff](#17-handoff)
  - [Appendix A: File map](#appendix-a-file-map)
  - [Appendix B: Contoh request dan response](#appendix-b-contoh-request-dan-response)
    - [Status](#status)
    - [Setup](#setup)
  - [Appendix C: Checklist implementasi](#appendix-c-checklist-implementasi)

## 0. Agent quick start

Baca dokumen ini sebelum menulis kode Fase 9.

Aturan wajib:

1. Fase 9 menambah first-run installation wizard. Jangan redesign UI yang sudah approved.
2. Wizard hanya berjalan bila belum ada owner aktif.
3. Setelah setup selesai, wizard terkunci.
4. Wizard wajib meminta restart sebelum table QR dibuat.
5. QR key ditulis ke `.env`, bukan disimpan di database.
6. Lisensi invalid/missing tidak memblokir setup.
7. Production seed tidak lagi wajib membuat owner dari env.
8. Env bootstrap owner tetap fallback.
9. Tidak ada migration database baru.
10. Tidak ada endpoint setup yang dapat dijalankan ulang setelah owner ada.
11. Jangan mencetak QR key, password, token, atau signature ke log.
12. Jalankan `pnpm check`, `pnpm test`, dan `pnpm build` sebelum selesai.
13. Jika ada konflik dengan PRD, berhenti dan minta keputusan product owner.

## 1. Ringkasan

Fase 9 menambahkan installation wizard berbasis web untuk instalasi pertama.

Hasil akhir:

- Operator dapat membuka aplikasi tanpa menyetel env owner terlebih dahulu.
- Wizard membuat owner pertama.
- Wizard memperbarui profil bisnis.
- Wizard membuat QR key 32 byte dan menulisnya ke `.env`.
- Wizard memvalidasi lisensi bila file tersedia.
- Wizard menampilkan layar restart.
- Setelah restart, owner login dan membuat table QR.
- Env bootstrap owner tetap tersedia sebagai fallback.

Fase 9 tidak menambah fitur bisnis baru. Wizard hanya menyelesaikan instalasi pertama.

## 2. Goals, non-goals, dan anti-goals

### Goals

- Instalasi pertama dapat dilakukan lewat browser.
- Owner pertama dibuat aman dengan password hash.
- Profil bisnis dapat diisi saat instalasi.
- QR key dibuat dan disimpan di `.env`.
- Lisensi divalidasi bila tersedia.
- Setup terkunci setelah owner ada.
- Restart wajib sebelum QR table dibuat.
- Production seed tetap berjalan tanpa env owner.
- Env bootstrap tetap fallback.
- Test unit, integration, dan RTL tersedia.

### Non-goals

- Tidak ada installer OS.
- Tidak ada Docker.
- Tidak ada PWA.
- Tidak ada HTTPS.
- Tidak ada upload license.
- Tidak ada konfigurasi backup directory.
- Tidak ada konfigurasi QR key manual.
- Tidak ada multi-business.
- Tidak ada reset instalasi dari UI.
- Tidak ada perubahan schema.
- Tidak ada pilot.

### Anti-goals

- Jangan menyimpan QR key di database.
- Jangan menyimpan QR key di UI.
- Jangan membiarkan setup dijalankan ulang.
- Jangan menganggap env bootstrap sebagai kegagalan bila env ada.
- Jangan memakai optimistic update untuk setup.
- Jangan menampilkan password atau secret di toast/log.
- Jangan mengubah business rule order/payment.
- Jangan menambah dependency baru.

## 3. Keputusan yang dikunci

| ID    | Keputusan                         | Alasan                                                  |
| ----- | --------------------------------- | ------------------------------------------------------- |
| P9-01 | Wizard menggantikan env bootstrap | Instalasi lebih mudah tanpa edit env owner              |
| P9-02 | Env bootstrap tetap fallback      | Operator yang memakai provisioning env tidak rusak      |
| P9-03 | Wizard hanya owner + bisnis       | Cakupan instalasi inti, tanpa fitur bisnis baru         |
| P9-04 | QR key ditulis ke `.env`          | Model secret tetap file-based dan konsisten             |
| P9-05 | QR key dibuat 32 byte base64      | Sesuai format `RAVIKA_QR_TOKEN_KEY`                     |
| P9-06 | Restart wajib setelah setup       | Kunci `.env` baru hanya terbaca setelah process restart |
| P9-07 | Lisensi divalidasi bila ada       | Instalasi tidak gagal bila lisensi belum siap           |
| P9-08 | Lisensi tidak wajib               | Operator dapat menambah license nanti                   |
| P9-09 | Setup terkunci setelah owner ada  | Mencegah instalasi ulang dan pembuatan owner kedua      |
| P9-10 | `.env` ditulis atomik             | Mengurangi risiko file rusak saat crash                 |
| P9-11 | Tidak ada migration baru          | Semua data instalasi memakai schema yang ada            |
| P9-12 | Client-only query                 | Konsisten dengan Phase 7                                |
| P9-13 | Tanpa Zustand                     | Tidak menambah state library                            |

## 4. Scope dan deliverable

### Deliverable

1. Production seed tanpa owner bila env owner tidak ada.
2. `GET /api/setup/status`.
3. `POST /api/setup`.
4. Service setup dan penulisan `.env`.
5. Halaman `/setup`.
6. Redirect login ke `/setup` bila diperlukan.
7. Reuse layar restart.
8. Test unit, integration, dan RTL.
9. Dokumentasi instalasi dan env.
10. Verifikasi manual first-run.

### Dependency

- Phase 8 selesai.
- SQLite, Drizzle, auth, RBAC, users, business, license tersedia.
- Node `node:fs` dan `node:crypto`.
- Akses tulis ke `.env` oleh process aplikasi.
- Akses admin untuk restart service.

### Tidak termasuk

- Pilot.
- HTTPS.
- Installer.
- Docker.
- PWA.
- Upload license.
- Konfigurasi backup directory.
- Reset instalasi dari UI.
- Perubahan schema.

## 5. Arsitektur

### 5.1 Alur first-run

```text
App start
  -> runMigrations
  -> bootstrap production seed
  -> permissions, roles, business dibuat
  -> owner dibuat hanya bila env owner ada
  -> health 200
  -> /login
  -> GET /api/setup/status
  -> jika setupRequired: redirect /setup
  -> wizard form
  -> POST /api/setup
  -> generate QR key
  -> write .env
  -> transaction owner + business + license
  -> restartRequired
  -> RestartRequiredProvider
  -> restart server
  -> health 200
  -> reload
  -> login owner
```

### 5.2 Alur env fallback

```text
RAVIKA_BOOTSTRAP_OWNER_EMAIL dan RAVIKA_BOOTSTRAP_OWNER_PASSWORD ada
  -> seed production membuat owner
  -> /api/setup/status returns false
  -> /setup redirect /login
  -> login memakai env owner
```

### 5.3 Lapisan

| Lapisan    | Lokasi                          | Tanggung jawab                  |
| ---------- | ------------------------------- | ------------------------------- |
| API client | `src/lib/api`                   | Fetch, error, query key         |
| Setup hook | `src/features/setup/api.ts`     | Query status dan mutation setup |
| Setup page | `src/app/setup/page.tsx`        | Form first-run                  |
| API route  | `src/app/api/setup`             | Validasi, rate limit, setup     |
| Service    | `src/modules/setup`             | Business rule instalasi         |
| Repository | `src/modules/users`, `business` | Insert owner dan business       |
| Env writer | `src/shared/env-file.ts`        | Upsert `.env` atomik            |
| Restart    | `src/features/system`           | Layar restart dan health poll   |

### 5.4 Aturan

- Setup endpoint hanya aktif bila belum ada owner.
- Setup endpoint publik, tetapi rate limited.
- Setup endpoint menerapkan `assertSameOrigin`.
- Setup tidak mengubah schema.
- Setup tidak menghapus data existing.
- Setup tidak memakai optimistic update.
- Setup tidak menampilkan secret.
- Setup tidak membuat session. Owner login setelah restart.
- Setup tidak mengubah permission.
- Setup tidak mengubah lisensi yang valid menjadi invalid.

## 6. Kontrak API

### 6.1 `GET /api/setup/status`

Akses: publik, rate limited.

Response:

```json
{ "setupRequired": true }
```

Aturan:

- `setupRequired` true jika active owner count = 0.
- Tidak membuat data.
- Tidak memvalidasi lisensi.
- Tidak mengembalikan secret.
- Tidak mengembalikan email atau nama owner.

### 6.2 `POST /api/setup`

Akses: publik, rate limited.

Body:

```json
{
  "businessName": "RAVIKA",
  "businessCode": "RVK",
  "address": "Jakarta Selatan",
  "phone": "021-000000",
  "ownerName": "Rina Pemilik",
  "ownerEmail": "owner@ravika.id",
  "ownerUsername": "owner",
  "ownerPassword": "demo12345",
  "confirmPassword": "demo12345"
}
```

Response:

```json
{ "setupComplete": true, "restartRequired": true }
```

Status:

- 201 jika setup berhasil.
- 400 jika validasi gagal.
- 409 jika setup sudah selesai.
- 429 jika rate limit.
- 500 jika penulisan `.env` atau database gagal.

Aturan:

- `businessCode` 2-10 alfanumerik, uppercase.
- `ownerPassword` minimum 8.
- `confirmPassword` harus sama.
- `ownerUsername` opsional; default dari local-part email.
- Email dan username lowercase.
- Tidak menerima `businessId`, `roleId`, `licenseFile`, atau `qrTokenKey`.
- Jika owner sudah ada, kembalikan `SETUP_ALREADY_DONE`.
- Setup tidak membuat demo user.
- Setup tidak membuat catalog, table, order, atau payment.

## 7. Backend

### 7.1 Seed production

Ubah `seedDatabase`:

```ts
if (mode === "production") {
  const email = process.env.RAVIKA_BOOTSTRAP_OWNER_EMAIL?.trim();
  const password = process.env.RAVIKA_BOOTSTRAP_OWNER_PASSWORD;

  if (email && password) {
    await ensureUser(...);
  }
}
```

Aturan:

- Jika env owner ada, buat owner seperti sebelumnya.
- Jika env owner tidak ada, seed tetap membuat permissions, roles, dan business.
- Jangan throw.
- Seed hanya membuat data master dan owner bootstrap; tidak ada demo data.
- Seed tetap idempotent.

### 7.2 Setup service

File: `src/modules/setup/setup.service.ts`.

Fungsi:

```ts
export async function getSetupStatus(db: AppDatabase): Promise<{ setupRequired: boolean }>;
export async function runSetup(db: AppDatabase, envPath: string, input: SetupInput): Promise<{ setupComplete: true; restartRequired: true }>;
```

`runSetup`:

1. Hitung active owner.
2. Jika > 0, throw `SETUP_ALREADY_DONE`.
3. Generate QR key: `randomBytes(32).toString("base64")`.
4. Upsert `.env`.
5. Dalam transaksi:
   - update business profile.
   - create owner.
   - validasi lisensi jika file ada.
6. Return restart required.

Urutan ini memastikan jika database gagal, setup dapat diulang dan `.env` akan ditimpa dengan key baru.

### 7.3 `.env` writer

File: `src/shared/env-file.ts`.

```ts
export function upsertEnvValue(filePath: string, key: string, value: string): void;
```

Aturan:

- Baca file jika ada.
- Hapus semua baris yang dimulai `KEY=`.
- Append `KEY=value`.
- Tulis ke `${filePath}.tmp`.
- Rename ke `filePath`.
- Jika file tidak ada, buat file.
- Jangan log value.
- Jangan menulis password atau token ke log.

### 7.4 Lisensi

- Setup memanggil `getLicenseStatus` setelah business update.
- Jika file tidak ada, status `INVALID`.
- Jika signature invalid, status `INVALID`.
- Jika valid, status `VALID` atau `EXPIRING`.
- Setup tetap sukses.
- UI menampilkan status setelah submit atau di halaman license.

### 7.5 Business update

- Business ID tetap `business-ravika`.
- Update `name`, `code`, `address`, `phone`.
- `code` uppercase.
- Tidak membuat business baru.

### 7.6 Owner creation

- Role `OWNER`.
- Email lowercase.
- Username default dari local-part email.
- Password hash scrypt.
- `isActive: true`.
- Tidak membuat demo user.

### 7.7 Route

`GET /api/setup/status`:

- Public.
- Rate limit 30/menit/IP.
- Tidak membuat data.
- Tidak memvalidasi lisensi.

`POST /api/setup`:

- Public.
- Rate limit 5/menit/IP.
- `assertSameOrigin`.
- Validasi body.
- Jika owner ada, 409.
- Response 201.
- Tidak mengembalikan password, token, atau QR key.

## 8. Frontend

### 8.1 Route

- `/setup` adalah halaman publik.
- Jika `setupRequired === false`, redirect `/login`.
- Jika `setupRequired === true`, tampilkan form.
- `/login` memeriksa setup status saat mount dan redirect ke `/setup` bila diperlukan.

### 8.2 Form

Field:

- Nama bisnis
- Kode bisnis
- Alamat
- Telepon
- Nama owner
- Email owner
- Username opsional
- Password
- Konfirmasi password

Validasi:

- Nama bisnis wajib.
- Kode bisnis 2-10 alfanumerik.
- Email valid.
- Password minimum 8.
- Confirm sama.
- Username opsional min 2.

### 8.3 Restart

- Setelah POST sukses, panggil `requireRestart()`.
- Layar blocking muncul.
- Query dibatalkan dan dibersihkan.
- Poll `/api/health` setiap 3 detik.
- Setelah health 200, clear flag dan reload.
- Setup page tidak menampilkan toast sukses biasa.

### 8.4 UI copy

- Judul: `Instalasi awal RAVIKA POS`.
- Deskripsi singkat: `Buat akun pemilik dan profil bisnis untuk memulai.`
- Lisensi: `Status lisensi akan diperiksa setelah instalasi.`
- QR key: `Kunci QR dibuat otomatis dan disimpan di .env. Restart aplikasi setelah instalasi selesai.`
- Jangan tampilkan key.

## 9. Keamanan

- Setup endpoint hanya aktif bila belum ada owner.
- Rate limit IP.
- Origin check.
- Tidak menerima `businessId`, `roleId`, `licenseFile`, atau `qrTokenKey`.
- Password tidak dicatat.
- QR key tidak dicetak ke log atau response.
- `.env` ditulis atomik.
- Jika setup gagal setelah `.env` ditulis, rerun aman karena key baru menimpa key lama.
- Jika setup gagal setelah owner dibuat, setup terkunci; operator menyetel env manual dan restart. Ini risiko yang dicatat.
- Setup tidak boleh membuat session.
- Setup tidak boleh memberikan permission tambahan.
- Setup tidak boleh menampilkan data internal.

## 10. Testing

### Unit

- `.env` writer create/replace/preserve.
- Landing path tidak berubah.
- Password validation.
- Setup status logic.

### Integration

- Production seed tanpa env owner.
- Production seed dengan env owner fallback.
- Setup status true/false.
- Setup creates owner and business.
- Setup writes QR key.
- Setup rerun 409.
- Setup invalid input 400.
- License validation called.
- Table QR dapat dibuat setelah restart dengan key env.

### RTL

- Setup form valid.
- Setup invalid password confirm.
- Setup success shows restart screen.
- Login redirects to setup when required.
- License status invalid still succeeds.

### Manual

- Start tanpa env owner.
- Buka app, redirect `/setup`.
- Isi form.
- Setup selesai, restart screen.
- Restart server.
- Health 200.
- Login owner baru.
- Buat table QR.
- Cek `.env`.
- Cek license status.

## 11. Dokumentasi

Update:

- `AGENTS.md`: production bootstrap env optional, wizard first-run.
- `README.md`: instalasi via wizard.
- `docs/operations/installation.md`: langkah wizard dan restart.
- `docs/PRD.md`: FR-AUTH first-run setup dan AC.
- `docs/ROADMAP.md`: fase 9 atau task baru.
- `.env.example`: catatan QR key dapat dibuat wizard.

## 12. Urutan implementasi

1. Seed production optional owner.
2. `.env` writer.
3. Setup service.
4. Setup routes.
5. Setup UI.
6. Login redirect.
7. Restart screen reuse.
8. Tests.
9. Docs.
10. Manual verification.
11. Tag.

## 13. Verifikasi manual

1. Hapus env owner dan license.
2. Jalankan app production.
3. Health 200.
4. Buka `/`, redirect `/setup`.
5. Isi form.
6. Submit.
7. Layar restart.
8. Restart app.
9. Health 200.
10. Login owner.
11. Buat table.
12. Cek QR dapat dibuat.
13. Cek `.env`.
14. Cek lisensi invalid aman.

## 14. Acceptance criteria

- Production seed berhasil tanpa env owner.
- `/api/setup/status` mengembalikan status yang benar.
- Setup membuat owner dan business.
- Setup menulis QR key ke `.env`.
- Setup tidak mengembalikan secret.
- Setup rerun ditolak.
- Setup invalid input ditolak.
- Lisensi invalid tidak memblokir setup.
- Restart screen muncul.
- Table QR berfungsi setelah restart.
- Login owner berfungsi.
- `pnpm check`, `pnpm test`, `pnpm build` PASS.
- Dokumentasi diperbarui.

## 15. Risiko dan mitigasi

| Risiko                           | Dampak                            | Mitigasi                                        |
| -------------------------------- | --------------------------------- | ----------------------------------------------- |
| Setup race                       | Owner ganda                       | Active owner count + transaction + unique email |
| `.env` write gagal               | Instalasi gagal                   | Error 500 dan operator menyetel env manual      |
| Setup DB gagal setelah `.env`    | `.env` ada tetapi owner tidak ada | Rerun akan menimpa `.env` dan membuat owner     |
| Setup DB gagal setelah owner ada | Setup terkunci                    | Dokumentasi recovery manual dan env bootstrap   |
| Operator lupa restart            | Table QR gagal                    | Layar restart blocking                          |
| Lisensi invalid                  | Instalasi dianggap gagal          | Status invalid tidak memblokir                  |
| Secret di log                    | Kebocoran                         | Jangan log value                                |
| Rate limit terlalu ketat         | Setup sulit diulang               | 5/menit cukup untuk instalasi                   |
| `.env` permission                | Setup gagal                       | Jalankan service user dengan write permission   |

## 16. Definition of Done

- Semua acceptance criteria terpenuhi.
- Setup endpoint publik dan aman.
- Production seed tanpa env owner berfungsi.
- `.env` writer atomik.
- Wizard UI berfungsi.
- Restart screen berfungsi.
- Table QR berfungsi setelah restart.
- Test unit, integration, RTL lulus.
- `pnpm check`, `pnpm test`, `pnpm build` lulus.
- Dokumentasi diperbarui.
- Commit dan tag.

## 17. Handoff

Setelah fase ini:

- Operator dapat instalasi lewat browser.
- Env bootstrap tetap tersedia.
- Pilot dapat memakai wizard.
- HTTPS dan installer tetap Fase 8/9 lanjutan bila diperlukan.
- Backup/restore tetap mencakup database.

## Appendix A: File map

```text
src/shared/env-file.ts
src/modules/setup/setup.service.ts
src/modules/setup/setup.schemas.ts
src/app/api/setup/status/route.ts
src/app/api/setup/route.ts
src/features/setup/api.ts
src/app/setup/page.tsx
src/infrastructure/database/seed.ts
src/features/auth/login-form.tsx
src/features/system/restart-required.tsx
tests/unit/env-file.test.ts
tests/integration/setup.test.ts
tests/rtl/setup.test.tsx
docs/operations/installation.md
```

## Appendix B: Contoh request dan response

### Status

```http
GET /api/setup/status
```

```json
{ "setupRequired": true }
```

### Setup

```http
POST /api/setup
Content-Type: application/json
```

```json
{
  "businessName": "RAVIKA",
  "businessCode": "RVK",
  "address": "Jakarta Selatan",
  "phone": "021-000000",
  "ownerName": "Rina Pemilik",
  "ownerEmail": "owner@ravika.id",
  "ownerUsername": "owner",
  "ownerPassword": "demo12345",
  "confirmPassword": "demo12345"
}
```

Response:

```json
{ "setupComplete": true, "restartRequired": true }
```

## Appendix C: Checklist implementasi

- [ ] Seed production optional owner.
- [ ] `.env` writer.
- [ ] Setup service.
- [ ] Setup routes.
- [ ] Setup UI.
- [ ] Login redirect.
- [ ] Restart screen.
- [ ] Unit/integration/RTL tests.
- [ ] Docs.
- [ ] Manual verification.
- [ ] `pnpm check`, `pnpm test`, `pnpm build`.
- [ ] Commit dan tag.
