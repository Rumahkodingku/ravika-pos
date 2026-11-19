# RAVIKA POS - Spesifikasi Backup Module

**Status:** Implemented dan terverifikasi
**Milestone:** Backup Module
**Fase:** Backup dan Restore
**Tanggal:** 19 November 2026
**Baseline fitur:** `phase-9-installation-wizard`
**Referensi utama:** `docs/PRD.md`, `docs/design/design-system.md`, `docs/design/ui-ux-guidelines.md`, `docs/specification/phase-5-backend-foundation.md`, `docs/specification/phase-6-backend-api-modules.md`, `docs/specification/phase-7-frontend-backend-integration.md`, `docs/specification/phase-8-qa-release-readiness.md`, `docs/specification/phase-9-installation-wizard.md`

## Daftar isi

- [RAVIKA POS - Spesifikasi Backup Module](#ravika-pos---spesifikasi-backup-module)
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
    - [5.1 Lapisan](#51-lapisan)
    - [5.2 Alur create backup](#52-alur-create-backup)
    - [5.3 Alur download](#53-alur-download)
    - [5.4 Alur upload](#54-alur-upload)
    - [5.5 Alur restore](#55-alur-restore)
    - [5.6 Alur scheduler](#56-alur-scheduler)
  - [6. Data model](#6-data-model)
    - [6.1 Tabel `backup_records`](#61-tabel-backup_records)
    - [6.2 Status](#62-status)
    - [6.3 Migration](#63-migration)
  - [7. Kontrak API](#7-kontrak-api)
    - [7.1 `GET /api/backup`](#71-get-apibackup)
    - [7.2 `POST /api/backup`](#72-post-apibackup)
    - [7.3 `GET /api/backup/:id/download`](#73-get-apibackupiddownload)
    - [7.4 `POST /api/backup/upload`](#74-post-apibackupupload)
    - [7.5 `POST /api/backup/restore`](#75-post-apibackuprestore)
  - [8. Backend](#8-backend)
    - [8.1 Service](#81-service)
    - [8.2 Validasi file](#82-validasi-file)
    - [8.3 File storage](#83-file-storage)
    - [8.4 Retention](#84-retention)
    - [8.5 Scheduler](#85-scheduler)
    - [8.6 Audit](#86-audit)
  - [9. Frontend](#9-frontend)
    - [9.1 Route](#91-route)
    - [9.2 Daftar backup](#92-daftar-backup)
    - [9.3 Aksi create dan download](#93-aksi-create-dan-download)
    - [9.4 Upload backup](#94-upload-backup)
    - [9.5 Restore](#95-restore)
    - [9.6 Peringatan backup](#96-peringatan-backup)
    - [9.7 UI copy](#97-ui-copy)
  - [10. Keamanan](#10-keamanan)
  - [11. Error handling](#11-error-handling)
  - [12. Testing](#12-testing)
    - [Unit dan service](#unit-dan-service)
    - [Integration](#integration)
    - [RTL](#rtl)
    - [E2E](#e2e)
    - [Manual](#manual)
  - [13. Dokumentasi](#13-dokumentasi)
  - [14. Urutan implementasi](#14-urutan-implementasi)
  - [15. Verifikasi manual](#15-verifikasi-manual)
  - [16. Acceptance criteria](#16-acceptance-criteria)
  - [17. Risiko dan mitigasi](#17-risiko-dan-mitigasi)
  - [18. Definition of Done](#18-definition-of-done)
  - [19. Handoff](#19-handoff)
  - [Appendix A: File map](#appendix-a-file-map)
  - [Appendix B: Contoh request dan response](#appendix-b-contoh-request-dan-response)
    - [Create backup](#create-backup)
    - [Upload backup](#upload-backup)
    - [Restore backup](#restore-backup)
  - [Appendix C: Checklist implementasi](#appendix-c-checklist-implementasi)

## 0. Agent quick start

Baca dokumen ini sebelum mengubah modul backup.

Aturan wajib:

1. Modul backup tetap berada di modular monolith. Jangan menambah worker, Redis, cloud storage, atau library state baru.
2. Backup adalah snapshot SQLite yang konsisten. Jangan menyalin file database secara langsung saat aplikasi aktif.
3. Semua file backup disimpan di `data/backups/`.
4. Nama file dari client tidak boleh dipakai sebagai path. Selalu buat nama file baru di server.
5. Upload hanya menerima file `.sqlite` dengan ukuran maksimum 250 MB.
6. Upload dan restore wajib melewati validasi checksum, integritas SQLite, dan kompatibilitas schema.
7. Restore wajib memakai konfirmasi eksplisit dan menghasilkan restart screen.
8. Permission yang dipakai tetap `backup.create` dan `backup.restore`. Jangan menambah permission baru tanpa keputusan produk.
9. Jangan menampilkan path absolut server di response API.
10. Jangan mencetak isi backup, password, token, atau data pelanggan ke log.
11. Scheduler berjalan in-process. Jika proses server mati, jadwal tidak berjalan.
12. Jalankan `pnpm check`, `pnpm test`, dan `pnpm build` sebelum menyatakan selesai.
13. Jika ada konflik dengan PRD atau keputusan di dokumen ini, berhenti dan minta keputusan product owner.

## 1. Ringkasan

Modul backup melindungi data operasional RAVIKA POS dari:

- kerusakan perangkat server,
- kesalahan operator,
- kebutuhan audit dan compliance,
- migrasi ke perangkat lain.

Implementasi saat ini sudah memiliki:

- pembuatan backup SQLite,
- metadata backup di tabel `backup_records`,
- daftar backup di UI management,
- restore dari backup yang sudah terdaftar.

Implementasi yang disetujui menambahkan:

- download file backup,
- upload file backup,
- validasi penuh sebelum upload diterima,
- restore dari backup hasil upload,
- backup otomatis harian,
- retensi N backup terakhir,
- peringatan jika backup belum tersedia atau sudah lama,
- audit untuk create, download, upload, restore, dan cleanup.

## 2. Goals, non-goals, dan anti-goals

### Goals

- Membuat backup SQLite yang konsisten dari aplikasi yang sedang berjalan.
- Menyimpan metadata backup di database.
- Menampilkan backup di UI management.
- Mengunduh file backup.
- Mengunggah file backup dari perangkat lain.
- Memulihkan data dari backup terdaftar atau hasil upload.
- Menjalankan backup otomatis harian.
- Menyimpan hanya N backup terakhir.
- Memvalidasi setiap restore sebelum database diganti.
- Mencatat audit event untuk operasi backup.
- Menampilkan peringatan jika backup belum ada atau sudah lama.
- Menjaga kompatibilitas dengan single-business, single-location MVP.

### Non-goals

- Cloud storage integration.
- Multi-device replication.
- Incremental atau differential backup.
- Point-in-time recovery.
- Enkripsi file backup pada MVP.
- Distributed locking atau koordinasi antar-proses.
- Backup file di luar SQLite. Product image sudah disimpan sebagai BLOB di SQLite.
- Backup otomatis berbasis cron eksternal.
- Notifikasi email atau WhatsApp.

### Anti-goals

- Jangan menyalin `data/ravika.sqlite` langsung tanpa SQLite backup API.
- Jangan menaruh file backup di `public/`.
- Jangan menerima upload berdasarkan nama file dari client.
- Jangan mengganti database tanpa konfirmasi dan validasi.
- Jangan membuat fitur restore yang dapat dijalankan tanpa permission `backup.restore`.
- Jangan membuat scheduler yang membutuhkan Redis atau worker terpisah.

## 3. Keputusan yang dikunci

| Keputusan                  | Nilai                                            |
| -------------------------- | ------------------------------------------------ |
| Pendekatan                 | Enhance modul backup existing                    |
| Worker                     | Tidak ada worker terpisah                        |
| Cloud                      | Tidak ada                                        |
| State library              | Tidak ada library baru                           |
| Lokasi file                | `data/backups/`                                  |
| Nama file                  | `ravika-YYYYMMDD-HHMMSS.sqlite`                  |
| Download                   | Tersedia                                         |
| Upload                     | Tersedia                                         |
| Validasi upload            | Checksum, integrity SQLite, schema compatibility |
| Restore                    | Full database replacement dan restart            |
| Jadwal                     | Manual dan harian                                |
| Retensi                    | N backup terakhir, default 7                     |
| Enkripsi                   | Tidak pada MVP                                   |
| Permission create/download | `backup.create`                                  |
| Permission upload/restore  | `backup.restore`                                 |
| Scheduler                  | In-process melalui `instrumentation.ts`          |
| Pre-restore safety backup  | Direkomendasikan, tetapi tidak wajib untuk MVP   |

## 4. Scope dan deliverable

### Deliverable

- Service backup yang mendukung create, list, download, upload, restore, dan cleanup.
- API route untuk download dan upload.
- Scheduler backup harian.
- Retensi backup.
- UI backup dengan tombol create, download, upload, dan restore.
- Peringatan backup.
- Audit event.
- Unit, integration, RTL, dan E2E test.
- Dokumentasi environment variable.

### Dependency

- SQLite `backup()` API dari `node:sqlite`.
- Drizzle ORM dan tabel `backup_records`.
- Permission existing `backup.create` dan `backup.restore`.
- UI primitives existing.
- `instrumentation.ts` untuk scheduler.
- `apiFetch` dan TanStack Query existing.

### Tidak termasuk

- Enkripsi backup.
- Upload ke cloud.
- Backup terjadwal kustom per jam.
- Retensi berbasis usia.
- Restore parsial per tabel.
- Backup database eksternal selain SQLite aplikasi.

## 5. Arsitektur

### 5.1 Lapisan

```text
Route Handler -> backup service -> repository/Drizzle -> SQLite
UI -> TanStack Query hooks -> apiFetch -> Route Handler
Scheduler -> backup service -> SQLite
```

Aturan:

- Route Handler tidak mengakses file backup secara langsung.
- Service bertanggung jawab atas validasi, file, metadata, dan audit.
- UI tidak mengetahui path absolut server.
- Scheduler memakai service yang sama dengan create manual.

### 5.2 Alur create backup

1. User menekan `Buat backup`.
2. API memanggil `createBackup`.
3. Service membuat record `IN_PROGRESS`.
4. Service memanggil SQLite `backup()`.
5. Service menghitung ukuran dan checksum SHA-256.
6. Service mengubah status menjadi `READY`.
7. Service menulis audit `backup.create`.
8. Service menjalankan retention cleanup.
9. UI menampilkan backup terbaru.

### 5.3 Alur download

1. User menekan `Download`.
2. API memanggil service untuk mengambil file.
3. Service memastikan record `READY`.
4. Service memverifikasi checksum file.
5. Service menulis audit `backup.download`.
6. Route Handler mengirim file dengan `Content-Disposition: attachment`.
7. Nama file yang dikirim adalah nama aman dari server.

### 5.4 Alur upload

1. User memilih file `.sqlite`.
2. Route Handler menerima `multipart/form-data`.
3. Service memeriksa ekstensi, ukuran, dan tipe file.
4. File disimpan sementara di `data/backups/`.
5. Service membuka file read-only dan menjalankan `PRAGMA integrity_check`.
6. Service memeriksa tabel wajib.
7. Service menghitung checksum.
8. Service memindahkan file ke nama final yang aman.
9. Service membuat record `READY`.
10. Service menulis audit `backup.upload`.
11. File sementara dihapus jika ada kegagalan.

### 5.5 Alur restore

1. User memilih backup.
2. UI menampilkan ConfirmDialog.
3. API memanggil `restoreBackup` dengan `confirm: true`.
4. Service memastikan record `READY`.
5. Service memverifikasi checksum.
6. Service menjalankan `PRAGMA integrity_check`.
7. Service memvalidasi schema.
8. Service membuat safety backup sebelum replace, jika diaktifkan.
9. Service menutup database bundle.
10. Service menyalin file backup ke path database.
11. Service menghapus file WAL dan SHM.
12. Service menulis audit `backup.restore`.
13. Response mengembalikan `restartRequired: true`.
14. UI menampilkan restart screen.
15. Setelah restart, aplikasi memakai database hasil restore.

### 5.6 Alur scheduler

1. Server mulai.
2. `instrumentation.ts` membaca konfigurasi backup.
3. Jika `RAVIKA_BACKUP_SCHEDULE=daily`, scheduler menghitung waktu berikutnya.
4. Pada waktu yang ditentukan, scheduler memanggil `createBackup`.
5. Setelah backup sukses, retention cleanup berjalan.
6. Jika gagal, record `FAILED` dibuat dan error dicatat.
7. Scheduler tidak berjalan jika `RAVIKA_BACKUP_SCHEDULE=none`.

## 6. Data model

### 6.1 Tabel `backup_records`

Gunakan tabel existing:

| Field       | Tipe    | Keterangan          |
| ----------- | ------- | ------------------- |
| `id`        | text    | Primary key         |
| `fileName`  | text    | Nama file aman      |
| `filePath`  | text    | Path absolut server |
| `fileSize`  | integer | Ukuran byte         |
| `checksum`  | text    | SHA-256             |
| `status`    | text    | Status backup       |
| `createdBy` | text    | User ID             |
| `createdAt` | integer | Timestamp           |

Status existing:

- `READY`
- `IN_PROGRESS`
- `FAILED`

Status tambahan yang direkomendasikan:

- `UPLOADING`: file sedang divalidasi.
- `INVALID`: file upload ditolak.

Jika status enum berubah, wajib membuat migration Drizzle.

### 6.2 Status

| Status        | Arti                     | Boleh download? | Boleh restore? |
| ------------- | ------------------------ | --------------- | -------------- |
| `IN_PROGRESS` | Backup sedang dibuat     | Tidak           | Tidak          |
| `UPLOADING`   | Upload sedang divalidasi | Tidak           | Tidak          |
| `READY`       | Backup siap              | Ya              | Ya             |
| `FAILED`      | Pembuatan backup gagal   | Tidak           | Tidak          |
| `INVALID`     | Upload tidak valid       | Tidak           | Tidak          |

### 6.3 Migration

MVP tidak membutuhkan migration jika status baru tidak ditambahkan.

Jika status baru ditambahkan:

- update schema `backup_records`,
- generate migration dengan `pnpm db:generate`,
- periksa SQL migration,
- tambahkan test untuk status baru.

## 7. Kontrak API

Semua endpoint memakai session cookie dan permission guard.

### 7.1 `GET /api/backup`

- Permission: `backup.create`.
- Response: `BackupRecord[]`.
- Tidak mengembalikan path absolut server.

### 7.2 `POST /api/backup`

- Permission: `backup.create`.
- Request: tanpa body.
- Response: `BackupRecord`.
- Status: `201`.

### 7.3 `GET /api/backup/:id/download`

- Permission: `backup.create`.
- Response: file stream.
- Header:

```http
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="ravika-YYYYMMDD-HHMMSS.sqlite"
```

- Jika checksum tidak cocok: `409`.
- Jika backup tidak ditemukan: `404`.

### 7.4 `POST /api/backup/upload`

- Permission: `backup.restore`.
- Content-Type: `multipart/form-data`.
- Field: `file`.
- Batas ukuran: 250 MB.
- Ekstensi: `.sqlite`.
- Response: `BackupRecord`.
- Status: `201`.

Error:

| Kondisi                 | Status |
| ----------------------- | ------ |
| File tidak ada          | `400`  |
| Ekstensi salah          | `400`  |
| File terlalu besar      | `413`  |
| SQLite tidak valid      | `400`  |
| Integrity check gagal   | `400`  |
| Schema tidak kompatibel | `400`  |

### 7.5 `POST /api/backup/restore`

- Permission: `backup.restore`.
- Request:

```json
{
  "backupId": "backup-id",
  "confirm": true
}
```

- Response:

```json
{
  "restored": true,
  "restartRequired": true
}
```

Error:

| Kondisi                | Status |
| ---------------------- | ------ |
| Backup tidak ditemukan | `404`  |
| Backup belum `READY`   | `404`  |
| Checksum mismatch      | `409`  |
| Integrity gagal        | `409`  |
| Database in-memory     | `422`  |
| Konfirmasi false       | `400`  |

## 8. Backend

### 8.1 Service

File: `src/modules/backup/backup.service.ts`.

Fungsi yang wajib tersedia:

- `listBackups(db)`
- `createBackup(bundle, businessId, actorId)`
- `getBackupFile(db, backupId)`
- `uploadBackup(db, businessId, actorId, file)`
- `restoreBackup(db, bundle, businessId, input, actorId)`
- `cleanupBackups(db, retentionCount)`

Aturan service:

- Tidak ada akses `request` atau `response` HTTP di service.
- File operation hanya di service atau helper server-only.
- Audit ditulis melalui `writeAudit`.
- Error memakai `AppError`.
- Nama file dibuat di server.

### 8.2 Validasi file

Validasi upload:

1. Ekstensi `.sqlite`.
2. Ukuran maksimum 250 MB.
3. Header file SQLite valid.
4. `PRAGMA integrity_check` mengembalikan `ok`.
5. Tabel wajib tersedia.
6. Schema compatible dengan versi aplikasi.

Tabel wajib:

- `business`
- `users`
- `roles`
- `permissions`
- `orders`
- `payments`
- `backup_records`

Rekomendasi tambahan:

- Simpan schema version di `PRAGMA user_version` pada masa depan.
- Untuk MVP, validasi tabel wajib sudah cukup.

### 8.3 File storage

Direktori:

```text
data/backups/
```

Aturan:

- Buat direktori dengan `mkdirSync(..., { recursive: true })`.
- Nama file generate dari timestamp UTC.
- Jangan memakai nama file dari client.
- Jangan mengizinkan path traversal.
- File sementara harus dihapus jika validasi gagal.
- File backup tidak boleh berada di `public/`.

### 8.4 Retention

Konfigurasi:

```text
RAVIKA_BACKUP_RETENTION=7
```

Aturan:

- Default 7.
- Hitung hanya backup `READY`.
- Urutkan berdasarkan `createdAt` descending.
- Hapus file dan record di luar N terbaru.
- Jangan hapus backup `FAILED` atau `INVALID` otomatis kecuali diminta.
- Tulis audit `backup.cleanup`.

### 8.5 Scheduler

Konfigurasi:

```text
RAVIKA_BACKUP_SCHEDULE=none|daily
RAVIKA_BACKUP_TIME=02:00
RAVIKA_BACKUP_RETENTION=7
```

Aturan:

- Default `none`.
- `daily` menjalankan satu backup per hari.
- Waktu memakai zona waktu server.
- Scheduler berjalan in-process.
- Scheduler dimulai dari `instrumentation.ts`.
- Jika server mati pada waktu jadwal, backup tidak dibuat.
- Backup manual tetap tersedia.

### 8.6 Audit

Event:

- `backup.create`
- `backup.download`
- `backup.upload`
- `backup.restore`
- `backup.cleanup`

Metadata minimal:

- `fileName`
- `fileSize`
- `checksum`
- `success`
- `error` jika gagal

Jangan menulis isi database, password, token, atau data pelanggan ke audit.

## 9. Frontend

### 9.1 Route

Route existing: `/app/backup`.

Guard:

- Halaman memakai `RequirePermission permission="backup.create"`.
- Aksi restore dan upload memakai `PermissionGate permission="backup.restore"`.

### 9.2 Daftar backup

Tampilkan:

- nama file,
- ukuran,
- waktu dibuat,
- status,
- checksum,
- tombol download,
- tombol restore.

Gunakan `ResponsiveList` existing untuk tabel desktop dan card mobile.

### 9.3 Aksi create dan download

- Tombol `Buat backup` memakai mutation existing.
- Tombol `Download` memanggil endpoint download.
- Tampilkan loading state.
- Tampilkan toast sukses atau gagal.

### 9.4 Upload backup

- Tombol `Unggah backup`.
- Input file menerima `.sqlite`.
- Tampilkan nama file yang dipilih.
- Tampilkan loading saat upload dan validasi.
- Setelah sukses, refresh daftar backup.
- Setelah gagal, tampilkan pesan error yang aman.

### 9.5 Restore

- Gunakan `ConfirmDialog` existing.
- Dialog menjelaskan bahwa database akan diganti.
- Setelah restore sukses, gunakan `useRestartRequired`.
- Jangan menampilkan toast sukses biasa sebagai pengganti restart screen.

### 9.6 Peringatan backup

Tampilkan peringatan jika:

- belum ada backup,
- backup terakhir lebih lama dari 24 jam,
- backup otomatis tidak aktif.

Copy harus jelas dan tidak menakut-nakuti tanpa alasan.

### 9.7 UI copy

Gunakan bahasa Indonesia.

Contoh:

- `Buat backup`
- `Unggah backup`
- `Download`
- `Restore`
- `Backup berhasil dibuat.`
- `File backup tidak valid.`
- `Database akan diganti dengan isi backup.`
- `Server harus dimulai ulang setelah restore.`

Jangan memakai em dash atau middle dot untuk metadata.

## 10. Keamanan

- Semua endpoint wajib authenticated.
- List, create, dan download memakai `backup.create`.
- Upload dan restore memakai `backup.restore`.
- Validasi ukuran file sebelum membaca seluruh isi.
- Validasi file SQLite dengan koneksi read-only.
- Jangan mempercayai `Content-Type` dari client.
- Jangan mempercayai nama file dari client.
- Jangan mengekspos path absolut server.
- Jangan mengizinkan download backup `IN_PROGRESS`, `FAILED`, atau `INVALID`.
- Jangan menjalankan restore pada database in-memory.
- Jangan menulis secret ke log.
- Audit setiap operasi penting.

## 11. Error handling

Error yang harus aman untuk user:

- `File backup tidak valid.`
- `File backup terlalu besar.`
- `Integritas backup tidak valid.`
- `Backup tidak kompatibel dengan versi aplikasi ini.`
- `Checksum backup tidak cocok.`
- `Backup tidak ditemukan.`
- `Restore tidak tersedia untuk database in-memory.`

Perilaku server:

- Tandai backup gagal sebagai `FAILED`.
- Tandai upload gagal sebagai `INVALID` atau hapus record.
- Hapus file sementara.
- Jangan meninggalkan database dalam kondisi setengah tertimpa.
- Jangan menelan error tanpa audit.

## 12. Testing

### Unit dan service

- Create backup menghasilkan record `READY` dan file valid.
- Checksum file cocok dengan record.
- Download menolak backup yang tidak `READY`.
- Upload menerima SQLite valid.
- Upload menolak file non-SQLite.
- Upload menolak SQLite tanpa tabel wajib.
- Restore menolak checksum mismatch.
- Restore menolak database in-memory.
- Retention menghapus backup lama di luar batas.
- Scheduler membuat satu backup harian.
- Audit tercatat untuk create, download, upload, restore, cleanup.

### Integration

- `GET /api/backup` mengembalikan daftar.
- `POST /api/backup` membuat backup.
- `GET /api/backup/:id/download` mengirim file.
- `POST /api/backup/upload` menyimpan backup.
- `POST /api/backup/restore` memerlukan konfirmasi.
- Backup hasil upload dapat direstore.
- Permission ditolak untuk user tanpa izin.

### RTL

- Halaman backup menampilkan daftar.
- Tombol create memanggil API.
- Tombol download memanggil endpoint download.
- Upload menampilkan state loading dan error.
- Restore membuka ConfirmDialog.
- Restore sukses memicu restart screen.

### E2E

- Owner membuat backup.
- Owner download backup.
- Owner upload backup.
- Owner restore backup dan melihat restart screen.
- Backup lama tetap muncul setelah refresh.

### Manual

1. Buat backup dari UI.
2. Pastikan file ada di `data/backups/`.
3. Download file dan buka dengan SQLite.
4. Upload file yang sama.
5. Restore dan pastikan restart screen muncul.
6. Restart server dan login.
7. Pastikan data kembali.

## 13. Dokumentasi

Dokumen yang perlu diperbarui setelah implementasi:

- `docs/operations/installation.md` untuk env backup.
- `docs/operations/troubleshooting.md` untuk backup gagal.
- `docs/operations/qa-checklist.md` untuk skenario backup.
- `AGENTS.md` jika ada aturan operasional baru.
- `docs/specification/backup-module.md` ini sebagai sumber utama.

## 14. Urutan implementasi

1. Tambah fungsi download di service.
2. Tambah route download.
3. Tambah fungsi upload dan validasi file.
4. Tambah route upload.
5. Tambah retention cleanup.
6. Tambah scheduler dan env.
7. Update UI backup.
8. Tambah audit event.
9. Tambah test unit, integration, RTL, dan E2E.
10. Update dokumentasi.
11. Jalankan verifikasi penuh.

## 15. Verifikasi manual

- Backup manual berhasil.
- File backup muncul di daftar.
- Download mengunduh file yang benar.
- Upload file valid berhasil.
- Upload file invalid ditolak.
- Restore mengganti database.
- Restart screen muncul.
- Setelah restart, data sesuai backup.
- Backup lama terhapus sesuai retensi.
- Backup harian berjalan saat server aktif.
- Audit mencatat semua aksi.

## 16. Acceptance criteria

- Pengguna dengan `backup.create` dapat membuat dan mengunduh backup.
- Pengguna dengan `backup.restore` dapat upload dan restore.
- File backup disimpan di `data/backups/`.
- Nama file aman dan tidak berasal dari client.
- Upload memvalidasi ekstensi, ukuran, integritas, dan schema.
- Restore memvalidasi checksum dan integritas.
- Restore memerlukan konfirmasi.
- Restore menghasilkan restart screen.
- Backup harian dapat dikonfigurasi.
- Retensi menyimpan N backup terakhir.
- Audit event tercatat.
- UI responsif dan memakai permission guard.
- `pnpm check`, `pnpm test`, dan `pnpm build` lulus.
- E2E backup lulus.

## 17. Risiko dan mitigasi

| Risiko                                    | Mitigasi                                            |
| ----------------------------------------- | --------------------------------------------------- |
| File backup rusak                         | Checksum dan integrity check                        |
| Upload file berbahaya                     | Validasi SQLite read-only dan batas ukuran          |
| Restore setengah selesai                  | Safety backup sebelum replace, jika diaktifkan      |
| Scheduler tidak berjalan saat server mati | Dokumentasikan keterbatasan, sediakan backup manual |
| Backup memenuhi disk                      | Retensi N backup dan peringatan disk                |
| Restore ke versi schema lama              | Validasi tabel wajib dan schema compatibility       |
| User tanpa izin mengunduh data            | Permission guard dan audit                          |
| Data sensitif bocor lewat log             | Jangan log isi backup atau data pelanggan           |

## 18. Definition of Done

- Semua fitur MVP tersedia.
- Semua acceptance criteria terpenuhi.
- Unit, integration, RTL, dan E2E test lulus.
- `pnpm check`, `pnpm test`, `pnpm build` lulus.
- Dokumentasi diperbarui.
- Tidak ada dependency baru tanpa keputusan.
- Tidak ada migration yang tidak perlu.
- Tidak ada data demo yang ditambahkan.
- Audit event terverifikasi.

## 19. Handoff

Saat menyerahkan pekerjaan, sertakan:

- daftar file yang diubah,
- endpoint baru,
- env baru,
- migration jika ada,
- bukti test,
- langkah verifikasi manual,
- risiko yang masih terbuka.

Jika implementasi berbeda dari dokumen ini, perbarui dokumen ini dan jelaskan alasannya.

## Appendix A: File map

Backend:

```text
src/modules/backup/backup.service.ts
src/app/api/backup/route.ts
src/app/api/backup/restore/route.ts
src/app/api/backup/[id]/download/route.ts
src/app/api/backup/upload/route.ts
src/instrumentation.ts
```

Frontend:

```text
src/app/(dashboard)/app/backup/page.tsx
src/features/management/api/system.ts
src/lib/api/keys.ts
```

Test:

```text
tests/integration/backup.test.ts
tests/rtl/backup.test.tsx
tests/e2e/backup.spec.ts
```

Dokumentasi:

```text
docs/specification/backup-module.md
docs/operations/installation.md
docs/operations/troubleshooting.md
docs/operations/qa-checklist.md
```

## Appendix B: Contoh request dan response

### Create backup

```http
POST /api/backup
```

Response:

```json
{
  "id": "backup-id",
  "fileName": "ravika-20261119-020000.sqlite",
  "fileSize": 405504,
  "checksum": "sha256...",
  "status": "READY",
  "createdBy": "user-owner",
  "createdAt": "2026-11-19T02:00:00.000Z"
}
```

### Upload backup

```http
POST /api/backup/upload
Content-Type: multipart/form-data

file=@ravika-20261119-020000.sqlite
```

Response:

```json
{
  "id": "backup-id",
  "fileName": "ravika-20261119-020000.sqlite",
  "fileSize": 405504,
  "checksum": "sha256...",
  "status": "READY",
  "createdBy": "user-owner",
  "createdAt": "2026-11-19T02:00:00.000Z"
}
```

### Restore backup

```http
POST /api/backup/restore
Content-Type: application/json
```

```json
{
  "backupId": "backup-id",
  "confirm": true
}
```

Response:

```json
{
  "restored": true,
  "restartRequired": true
}
```

## Appendix C: Checklist implementasi

- [x] Service create backup
- [x] Service list backup
- [x] Service download backup
- [x] Service upload backup
- [x] Service restore backup
- [x] Service cleanup backup
- [x] Route download
- [x] Route upload
- [x] Scheduler harian
- [x] Retention N backup
- [x] Audit event
- [x] UI tombol download
- [x] UI tombol upload
- [x] UI peringatan backup
- [x] Integration test
- [x] RTL test
- [x] E2E test
- [x] Dokumentasi env
- [x] `pnpm check`
- [x] `pnpm test`
- [x] `pnpm build`
- [x] E2E lulus
