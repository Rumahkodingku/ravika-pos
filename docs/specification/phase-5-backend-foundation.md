# RAVIKA POS - Spesifikasi Fase 5: Backend Foundation

**Status:** Approved untuk implementasi
**Milestone:** M5 - Backend Foundation Ready
**Fase:** 5, Backend Foundation
**Tanggal:** 17 November 2026
**Baseline frontend:** `c33e473`
**Tag frontend:** `phase-4-ui-approved-single-location`
**Referensi utama:** `docs/PRD.md`, `docs/ROADMAP.md`, `docs/specification/phase-4-5-single-location-mvp.md`, `docs/design/design-system.md`

## Daftar isi

- [0. Agent quick start](#0-agent-quick-start)
- [1. Ringkasan](#1-ringkasan)
- [2. Goals, non-goals, dan anti-goals](#2-goals-non-goals-dan-anti-goals)
- [3. Keputusan yang dikunci](#3-keputusan-yang-dikunci)
- [4. Scope dan deliverable](#4-scope-dan-deliverable)
- [5. Arsitektur dan aturan lapisan](#5-arsitektur-dan-aturan-lapisan)
- [6. Struktur direktori](#6-struktur-direktori)
- [7. Domain model dan schema](#7-domain-model-dan-schema)
- [8. Konvensi database](#8-konvensi-database)
- [9. SQLite, Drizzle, migration, dan bootstrap](#9-sqlite-drizzle-migration-dan-bootstrap)
- [10. Auth dan session](#10-auth-dan-session)
- [11. RBAC dan authorization](#11-rbac-dan-authorization)
- [12. Standar API](#12-standar-api)
- [13. Endpoint Fase 5](#13-endpoint-fase-5)
- [14. Seed data](#14-seed-data)
- [15. Repository dan application service](#15-repository-dan-application-service)
- [16. Testing](#16-testing)
- [17. Keamanan](#17-keamanan)
- [18. Logging dan observability](#18-logging-dan-observability)
- [19. Environment dan konfigurasi](#19-environment-dan-konfigurasi)
- [20. Migration, deployment, dan runbook](#20-migration-deployment-dan-runbook)
- [21. Verifikasi dan acceptance criteria](#21-verifikasi-dan-acceptance-criteria)
- [22. Risiko dan mitigasi](#22-risiko-dan-mitigasi)
- [23. Urutan implementasi](#23-urutan-implementasi)
- [24. Definition of Done](#24-definition-of-done)
- [25. Handoff ke Fase 6](#25-handoff-ke-fase-6)
- [Appendix A: Daftar tabel](#appendix-a-daftar-tabel)
- [Appendix B: Permission registry](#appendix-b-permission-registry)
- [Appendix C: Error code](#appendix-c-error-code)
- [Appendix D: Contoh request dan response](#appendix-d-contoh-request-dan-response)
- [Appendix E: File map](#appendix-e-file-map)
- [Appendix F: Checklist implementasi](#appendix-f-checklist-implementasi)

## 0. Agent quick start

Baca dokumen ini sebelum menulis kode backend Fase 5.

Aturan wajib:

1. Fase 5 hanya backend foundation. UI tetap memakai mock sampai Fase 7.
2. Jangan mengubah halaman, komponen UI, mock service, atau alur frontend.
3. Jangan menambahkan endpoint modul yang belum termasuk scope Fase 5.
4. Jangan menambahkan dependency di luar daftar pada bagian 4.
5. Semua akses database hanya melalui repository di server.
6. Route Handler harus tipis. Business rule ada di application service.
7. Semua input divalidasi dengan Zod di server.
8. Semua endpoint internal memeriksa session dan permission.
9. Jangan menulis password, token session, atau secret ke log.
10. Jangan memakai `better-sqlite3`. Driver yang dipakai adalah `node:sqlite`.
11. Jangan membuat tabel refund. Refund menunggu keputusan OPEN-008.
12. Jangan menganggap database client boleh diimpor komponen client.
13. Jalankan `pnpm check`, `pnpm test`, dan `pnpm build` sebelum menyatakan selesai.
14. Jika ada konflik antara dokumen ini dan PRD, berhenti dan minta keputusan product owner.

## 1. Ringkasan

Fase 5 membangun fondasi backend untuk RAVIKA POS:

- Database SQLite dengan schema MVP lengkap.
- Drizzle ORM dan migration.
- Repository dan application service.
- Auth nyata dengan session database.
- RBAC berbasis permission.
- Endpoint auth, health, dan business sebagai vertical slice.
- Standar request, response, error, logging, dan validasi.
- Seed data development dan bootstrap owner produksi.
- Test Vitest untuk fondasi yang berisiko.

Fase ini tidak mengintegrasikan frontend ke API. Login UI masih mock. Integrasi
frontend dilakukan di Fase 7.

## 2. Goals, non-goals, dan anti-goals

### Goals

- Database dapat dibuat dari kosong dan dimigrasikan otomatis.
- Schema MVP lengkap dan konsisten dengan PRD.
- Auth server-side aman dan dapat dicabut.
- Permission diperiksa di server, bukan hanya di UI.
- Endpoint business membuktikan alur route -> service -> repository -> database.
- Error response konsisten dan tidak membocorkan detail internal.
- Seed deterministic dan aman.
- Test foundation tersedia sebelum modul Fase 6 dibangun.

### Non-goals

- Tidak ada integrasi frontend ke API.
- Tidak ada TanStack Query, Zustand, atau perubahan provider UI.
- Tidak ada endpoint users, roles, permissions, catalog, tables, orders,
  payments, KDS, reports, license, atau backup.
- Tidak ada SSE.
- Tidak ada refund.
- Tidak ada upload gambar.
- Tidak ada PWA atau service worker.
- Tidak ada perubahan desain UI.

### Anti-goals

- Jangan membuat abstraksi generik yang belum dipakai.
- Jangan membuat semua module skeleton tanpa endpoint nyata.
- Jangan menyimpan session di memory proses saja.
- Jangan memakai password plaintext atau hash lemah.
- Jangan membuka database langsung ke client.
- Jangan mengandalkan validasi frontend.
- Jangan menaruh query database di Route Handler atau komponen.

## 3. Keputusan yang dikunci

| ID | Keputusan | Alasan |
|---|---|---|
| P5-01 | Full schema MVP dibuat di Fase 5 | Fase 6 tinggal menambah API, bukan mengubah fondasi |
| P5-02 | Refund ditunda | OPEN-008 belum final |
| P5-03 | Driver SQLite `node:sqlite` | Node 26 sudah menyediakannya, tanpa native build |
| P5-04 | ORM Drizzle | Sesuai PRD dan roadmap |
| P5-05 | Session database | Logout dan perubahan role dapat langsung mencabut sesi |
| P5-06 | Password memakai `crypto.scrypt` | Kuat, bawaan Node, tanpa native dependency |
| P5-07 | Login menerima email atau username | Sesuai UI dan OPEN-002 |
| P5-08 | Satu user satu role | Sesuai UI dan paling sederhana untuk MVP |
| P5-09 | Cookie `Secure` configurable | LAN HTTP saat ini belum memakai HTTPS |
| P5-10 | Error response RFC 9457 | Kontrak error konsisten dan standar |
| P5-11 | Seed fondasi + Vitest | Test fondasi sebelum modul Fase 6 |
| P5-12 | Bootstrap owner lewat env produksi | Tidak menambah halaman setup pasca-M4 |
| P5-13 | UI tetap mock | Integrasi frontend adalah Fase 7 |

### Dampak ke dokumen lain

Saat implementasi, dokumen berikut harus diperbarui:

- `docs/PRD.md`
  - `better-sqlite3` menjadi `node:sqlite`.
  - Relasi `UserRole` many-to-many menjadi `users.role_id` tunggal.
  - OPEN-002 dicatat selesai: email atau username.
  - OPEN-012 dicatat: cookie Secure configurable, HTTPS tetap risiko pilot.
  - Format error API dicatat sebagai RFC 9457.
  - Session database dicatat sebagai keputusan auth.
- `docs/ROADMAP.md`
  - Checklist Fase 5 dan status M5.
  - Dependency backend yang benar.
- `AGENTS.md`
  - Backend sudah ada.
  - Command `pnpm test`, `pnpm db:generate`.
  - Aturan server-only dan larangan akses database dari client.
- `README.md`
  - Setup environment, bootstrap owner, migration, dan test.

## 4. Scope dan deliverable

### Deliverable

1. Dependency dan tooling backend.
2. Schema Drizzle untuk seluruh tabel MVP.
3. Migration awal.
4. Database client `node:sqlite`.
5. Bootstrap dan seed.
6. Repository untuk session, user, role, permission, dan business.
7. Application service untuk auth dan business.
8. API foundation: error, validasi, request id, logging, auth guard.
9. Endpoint auth, health, dan business.
10. Test Vitest.
11. Dokumentasi dan verification report.

### Dependency yang ditambahkan

Runtime:

- `drizzle-orm`
- `server-only`

Development:

- `drizzle-kit`
- `vitest`

Tidak ada dependency auth, session, password, atau SQLite native tambahan.

### Dependency yang tidak ditambahkan

- `better-sqlite3`
- `iron-session`
- `next-auth`
- `argon2`
- `bcrypt`
- `jsonwebtoken`
- `jose`
- `tsx`
- `drizzle-zod`
- `@tanstack/react-query`
- `zustand`
- library logging

## 5. Arsitektur dan aturan lapisan

### Alur request

```text
HTTP Request
  -> Route Handler
    -> Validasi Zod
    -> Auth / permission guard
    -> Application Service
      -> Repository
        -> Drizzle ORM
          -> node:sqlite
```

### Aturan lapisan

| Lapisan | Boleh | Tidak boleh |
|---|---|---|
| Route Handler | Baca request, validasi, panggil service, bentuk response | Query database, business rule kompleks |
| Application Service | Orkestrasi, transaksi, aturan use case | Detail HTTP, akses `cookies()` langsung |
| Repository | Query Drizzle, mapping row ke domain | Response HTTP, validasi request |
| Domain/Shared | Tipe, error, aturan murni | Akses database, `next/headers` |
| Infrastructure | Database, migration, seed, crypto | Komponen UI |

### Aturan server-only

- `src/infrastructure/database/**`, `src/modules/**`, dan `src/shared/server/**`
  wajib memakai `import "server-only"` jika mengekspor akses database, session,
  atau crypto.
- Komponen client tidak boleh mengimpor modul tersebut.
- Route Handler adalah satu-satunya pintu masuk HTTP ke service.

### Business boundary

- Satu instalasi melayani satu bisnis.
- Semua query operasional memakai `business_id` dari session context.
- Endpoint business memakai `business_id` dari session, bukan dari body.
- Jangan menerima `businessId` dari client.

## 6. Struktur direktori

```text
src/
├── app/
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── logout/route.ts
│       │   ├── me/route.ts
│       │   └── change-password/route.ts
│       ├── business/route.ts
│       └── health/route.ts
├── infrastructure/
│   └── database/
│       ├── client.ts
│       ├── migrate.ts
│       ├── seed.ts
│       ├── bootstrap.ts
│       └── schema/
│           ├── index.ts
│           ├── business.ts
│           ├── access.ts
│           ├── catalog.ts
│           ├── operations.ts
│           └── system.ts
├── modules/
│   ├── auth/
│   │   ├── auth.service.ts
│   │   ├── auth.schemas.ts
│   │   ├── password.ts
│   │   ├── rate-limit.ts
│   │   ├── session.repository.ts
│   │   └── session.ts
│   ├── business/
│   │   ├── business.repository.ts
│   │   ├── business.schemas.ts
│   │   └── business.service.ts
│   ├── rbac/
│   │   ├── authorization.ts
│   │   └── permission.repository.ts
│   └── users/
│       └── user.repository.ts
├── shared/
│   ├── errors/
│   │   └── app-error.ts
│   ├── http/
│   │   ├── problem-details.ts
│   │   ├── request-context.ts
│   │   └── route-handler.ts
│   ├── logging/
│   │   └── logger.ts
│   ├── permissions.ts
│   ├── ids.ts
│   └── time.ts
└── types/
    └── api.ts

drizzle/
├── 0000_initial.sql
└── meta/

tests/
├── helpers/
│   └── test-db.ts
├── integration/
│   ├── database.test.ts
│   ├── auth.test.ts
│   ├── rbac.test.ts
│   └── business.test.ts
└── unit/
    ├── password.test.ts
    └── problem-details.test.ts

drizzle.config.ts
vitest.config.ts
.env.example
```

`src/mocks/permissions.ts` tetap ada sebagai re-export dari
`src/shared/permissions.ts` agar UI tidak berubah.

## 7. Domain model dan schema

### 7.1 Prinsip schema

- Nama tabel dan kolom memakai `snake_case`.
- Nama properti TypeScript memakai `camelCase`.
- ID memakai teks UUID.
- Waktu memakai epoch milliseconds.
- Uang memakai integer rupiah.
- Boolean memakai integer mode boolean Drizzle.
- Enum memakai text dengan CHECK constraint.
- Foreign key wajib.
- Index dibuat untuk kolom filter dan foreign key.
- Data transaksi tidak dihapus; gunakan status atau nonaktif.

### 7.2 Tabel bisnis dan akses

#### `business`

| Kolom | Tipe | Aturan |
|---|---|---|
| `id` | text | PK |
| `name` | text | not null |
| `code` | text | not null, unique |
| `address` | text | not null, default `""` |
| `phone` | text | not null, default `""` |
| `created_at` | integer timestamp_ms | not null |
| `updated_at` | integer timestamp_ms | not null |

#### `roles`

| Kolom | Tipe | Aturan |
|---|---|---|
| `id` | text | PK |
| `business_id` | text | FK business, restrict |
| `name` | text | not null |
| `code` | text | not null |
| `description` | text | not null, default `""` |
| `is_system` | integer boolean | not null, default false |
| `created_at` | integer timestamp_ms | not null |
| `updated_at` | integer timestamp_ms | not null |

Unique: `(business_id, code)`.

#### `permissions`

| Kolom | Tipe | Aturan |
|---|---|---|
| `id` | text | PK |
| `code` | text | not null, unique |
| `label` | text | not null |
| `group_name` | text | not null |
| `created_at` | integer timestamp_ms | not null |

#### `role_permissions`

| Kolom | Tipe | Aturan |
|---|---|---|
| `role_id` | text | FK roles, cascade |
| `permission_id` | text | FK permissions, restrict |

PK: `(role_id, permission_id)`.

#### `users`

| Kolom | Tipe | Aturan |
|---|---|---|
| `id` | text | PK |
| `business_id` | text | FK business, restrict |
| `role_id` | text | FK roles, restrict |
| `name` | text | not null |
| `email` | text | not null, unique |
| `username` | text | not null, unique |
| `password_hash` | text | not null |
| `is_active` | integer boolean | not null, default true |
| `created_at` | integer timestamp_ms | not null |
| `updated_at` | integer timestamp_ms | not null |

Email dan username disimpan lowercase. Unique bersifat global karena satu
bisnis per instalasi.

#### `sessions`

| Kolom | Tipe | Aturan |
|---|---|---|
| `id` | text | PK |
| `user_id` | text | FK users, cascade |
| `token_hash` | text | not null, unique |
| `expires_at` | integer timestamp_ms | not null |
| `created_at` | integer timestamp_ms | not null |
| `revoked_at` | integer timestamp_ms | nullable |

Index: `user_id`, `expires_at`.

### 7.3 Tabel katalog

#### `categories`

| Kolom | Tipe | Aturan |
|---|---|---|
| `id` | text | PK |
| `business_id` | text | FK business, restrict |
| `name` | text | not null |
| `description` | text | not null, default `""` |
| `sort_order` | integer | not null, default 0 |
| `is_active` | integer boolean | not null, default true |
| `created_at` | integer timestamp_ms | not null |
| `updated_at` | integer timestamp_ms | not null |

Index: `business_id`, `sort_order`.

#### `products`

| Kolom | Tipe | Aturan |
|---|---|---|
| `id` | text | PK |
| `business_id` | text | FK business, restrict |
| `category_id` | text | FK categories, restrict |
| `name` | text | not null |
| `description` | text | not null, default `""` |
| `image_path` | text | nullable |
| `base_price` | integer | not null, CHECK >= 0 |
| `is_available` | integer boolean | not null, default true |
| `is_active` | integer boolean | not null, default true |
| `created_at` | integer timestamp_ms | not null |
| `updated_at` | integer timestamp_ms | not null |

Index: `business_id`, `category_id`.

#### `product_variants`

| Kolom | Tipe | Aturan |
|---|---|---|
| `id` | text | PK |
| `product_id` | text | FK products, cascade |
| `name` | text | not null |
| `price_adjustment` | integer | not null, default 0 |
| `is_active` | integer boolean | not null, default true |

Unique: `(product_id, name)`.
Index: `product_id`.

#### `add_ons`

| Kolom | Tipe | Aturan |
|---|---|---|
| `id` | text | PK |
| `business_id` | text | FK business, restrict |
| `name` | text | not null |
| `price` | integer | not null, CHECK >= 0 |
| `is_active` | integer boolean | not null, default true |
| `created_at` | integer timestamp_ms | not null |
| `updated_at` | integer timestamp_ms | not null |

Index: `business_id`.

#### `product_add_ons`

| Kolom | Tipe | Aturan |
|---|---|---|
| `product_id` | text | FK products, cascade |
| `add_on_id` | text | FK add_ons, restrict |
| `is_required` | integer boolean | not null, default false |
| `min_selection` | integer | not null, default 0 |
| `max_selection` | integer | not null, default 1 |

PK: `(product_id, add_on_id)`.
CHECK: `min_selection >= 0`, `max_selection >= 1`,
`min_selection <= max_selection`.

### 7.4 Tabel operasional

#### `tables`

| Kolom | Tipe | Aturan |
|---|---|---|
| `id` | text | PK |
| `name` | text | not null, unique |
| `status` | text enum | `AVAILABLE`, `OCCUPIED`, `INACTIVE` |
| `qr_token_hash` | text | not null, unique |
| `is_active` | integer boolean | not null, default true |
| `created_at` | integer timestamp_ms | not null |
| `updated_at` | integer timestamp_ms | not null |

CHECK status.

#### `orders`

| Kolom | Tipe | Aturan |
|---|---|---|
| `id` | text | PK |
| `business_id` | text | FK business, restrict |
| `order_number` | text | not null, unique |
| `order_type` | text enum | `DINE_IN`, `TAKEAWAY` |
| `source` | text enum | `CASHIER`, `QR` |
| `table_id` | text | FK tables, restrict, nullable |
| `order_status` | text enum | `NEW`, `ACCEPTED`, `PREPARING`, `READY`, `COMPLETED`, `CANCELLED` |
| `payment_status` | text enum | `UNPAID`, `PARTIALLY_PAID`, `PAID`, `REFUNDED` |
| `public_token` | text | unique, nullable |
| `subtotal` | integer | not null, default 0, CHECK >= 0 |
| `discount_total` | integer | not null, default 0, CHECK >= 0 |
| `grand_total` | integer | not null, default 0, CHECK >= 0 |
| `notes` | text | not null, default `""` |
| `created_by` | text | FK users, restrict, nullable |
| `idempotency_key` | text | unique, nullable |
| `completed_at` | integer timestamp_ms | nullable |
| `cancelled_at` | integer timestamp_ms | nullable |
| `created_at` | integer timestamp_ms | not null |
| `updated_at` | integer timestamp_ms | not null |

Index: `business_id`, `created_at`, `order_status`, `payment_status`,
`table_id`.

CHECK tipe pesanan:
- `DINE_IN` wajib memiliki `table_id`.
- `TAKEAWAY` tidak boleh memiliki `table_id`.

#### `order_items`

| Kolom | Tipe | Aturan |
|---|---|---|
| `id` | text | PK |
| `order_id` | text | FK orders, cascade |
| `product_id` | text | FK products, restrict, nullable |
| `product_name_snapshot` | text | not null |
| `variant_name_snapshot` | text | nullable |
| `quantity` | integer | not null, CHECK >= 1 |
| `unit_price_snapshot` | integer | not null, CHECK >= 0 |
| `add_on_total_snapshot` | integer | not null, default 0, CHECK >= 0 |
| `line_total` | integer | not null, CHECK >= 0 |
| `notes` | text | not null, default `""` |

Index: `order_id`.

#### `order_item_add_ons`

| Kolom | Tipe | Aturan |
|---|---|---|
| `id` | text | PK |
| `order_item_id` | text | FK order_items, cascade |
| `add_on_id` | text | FK add_ons, restrict, nullable |
| `add_on_name_snapshot` | text | not null |
| `price_snapshot` | integer | not null, CHECK >= 0 |
| `quantity` | integer | not null, default 1, CHECK >= 1 |

Index: `order_item_id`.

#### `payments`

| Kolom | Tipe | Aturan |
|---|---|---|
| `id` | text | PK |
| `order_id` | text | FK orders, restrict |
| `method` | text enum | `CASH`, `QRIS`, `TRANSFER`, `E_WALLET` |
| `amount` | integer | not null, CHECK > 0 |
| `status` | text enum | `RECORDED`, `REFUNDED` |
| `reference` | text | not null, default `""` |
| `notes` | text | not null, default `""` |
| `recorded_by` | text | FK users, restrict |
| `paid_at` | integer timestamp_ms | not null |
| `created_at` | integer timestamp_ms | not null |

Index: `order_id`, `paid_at`.

#### `order_status_history`

| Kolom | Tipe | Aturan |
|---|---|---|
| `id` | text | PK |
| `order_id` | text | FK orders, cascade |
| `previous_status` | text enum | nullable |
| `new_status` | text enum | not null |
| `changed_by` | text | FK users, restrict, nullable |
| `reason` | text | not null, default `""` |
| `created_at` | integer timestamp_ms | not null |

Index: `order_id`, `created_at`.

### 7.5 Tabel sistem

#### `audit_logs`

| Kolom | Tipe | Aturan |
|---|---|---|
| `id` | text | PK |
| `business_id` | text | FK business, restrict |
| `actor_user_id` | text | FK users, restrict, nullable |
| `action` | text | not null |
| `resource_type` | text | not null |
| `resource_id` | text | not null |
| `metadata` | text JSON | not null, default `{}` |
| `created_at` | integer timestamp_ms | not null |

Index: `business_id`, `created_at`, `(resource_type, resource_id)`.

#### `licenses`

| Kolom | Tipe | Aturan |
|---|---|---|
| `id` | text | PK |
| `business_identifier` | text | not null |
| `installation_id` | text | not null, unique |
| `license_payload` | text | not null |
| `issued_at` | integer timestamp_ms | not null |
| `expires_at` | integer timestamp_ms | nullable |
| `status` | text enum | `VALID`, `EXPIRING`, `INVALID` |
| `signature` | text | not null |
| `public_key_fingerprint` | text | not null |
| `created_at` | integer timestamp_ms | not null |
| `updated_at` | integer timestamp_ms | not null |

#### `backup_records`

| Kolom | Tipe | Aturan |
|---|---|---|
| `id` | text | PK |
| `file_name` | text | not null |
| `file_path` | text | not null |
| `file_size` | integer | not null, CHECK >= 0 |
| `checksum` | text | not null |
| `status` | text enum | `READY`, `IN_PROGRESS`, `FAILED` |
| `created_by` | text | FK users, restrict |
| `created_at` | integer timestamp_ms | not null |

Index: `created_at`.

### 7.6 Tabel yang tidak dibuat

- `refunds` - menunggu OPEN-008.
- `user_roles` - user memakai `role_id` tunggal.
- Tabel PWA, image storage, atau settings tambahan.

## 8. Konvensi database

### ID

- Domain ID: UUID v4 dari `crypto.randomUUID()`.
- Session token: 32 byte acak, base64url.
- Public token: 32 byte acak, base64url.
- QR token: 32 byte acak, base64url; yang disimpan hanya SHA-256 hash.
- Seed boleh memakai ID stabil seperti `business-ravika`, `role-owner`,
  `user-owner` untuk determinisme.

### Waktu

- Simpan `Date` sebagai epoch milliseconds.
- API mengirim ISO 8601 UTC.
- Tampilan memakai `Asia/Jakarta`.
- Jangan menyimpan string tanggal yang bisa ambigu.

### Uang

- Integer rupiah tanpa pecahan.
- Jangan memakai floating point.
- Perhitungan ulang di server pada Fase 6.

### JSON

- `audit_logs.metadata` memakai JSON text.
- Jangan menyimpan password, token, atau data sensitif di metadata.

### Penghapusan

- Transaksi tidak dihapus.
- Gunakan `is_active`, `CANCELLED`, atau status lain.
- Foreign key transaksi memakai restrict.
- Child yang dimiliki order memakai cascade.

## 9. SQLite, Drizzle, migration, dan bootstrap

### Driver

- Gunakan `node:sqlite` `DatabaseSync`.
- Gunakan `drizzle-orm/node-sqlite`.
- Jangan memakai `better-sqlite3`.

### Path database

Default:

```text
./data/ravika.sqlite
```

Override:

```text
RAVIKA_DB_PATH=/absolute/path/ravika.sqlite
```

Aturan:

- Buat direktori parent jika belum ada.
- Jangan gunakan network share.
- `data/` masuk `.gitignore`.
- File `-wal` dan `-shm` juga tidak boleh di-commit.

### PRAGMA wajib

Saat koneksi dibuat:

```sql
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 5000;
PRAGMA synchronous = NORMAL;
```

### Migration

- Schema Drizzle menjadi source of truth.
- Generate migration dengan `pnpm db:generate`.
- Migration SQL disimpan di `drizzle/`.
- Migration dijalankan otomatis saat database client pertama kali dibuat.
- Migration harus idempotent dari database kosong.
- Jangan mengedit migration yang sudah diterapkan; buat migration baru.

### Bootstrap

Urutan saat database pertama kali diakses:

1. Buka database.
2. Set PRAGMA.
3. Jalankan migration.
4. Cek apakah bisnis dan owner sudah ada.
5. Jika belum, jalankan bootstrap.
6. Kembalikan database client.

Bootstrap development:

- Aktif jika `NODE_ENV !== "production"`.
- Membuat bisnis `RAVIKA`, role, permission, dan tiga akun demo.
- Password demo: `demo123`.
- Hanya membuat data yang belum ada.

Bootstrap produksi:

- Wajib memiliki `RAVIKA_BOOTSTRAP_OWNER_EMAIL` dan
  `RAVIKA_BOOTSTRAP_OWNER_PASSWORD` jika belum ada owner.
- Jika env tidak ada, startup gagal dengan pesan jelas.
- Jangan menulis password ke log.
- Jangan membuat akun demo di production.

Bootstrap harus idempotent. Menjalankan ulang tidak boleh menduplikasi data atau
mengubah password user yang sudah ada.

### Singleton

- Aplikasi memakai singleton database client.
- Gunakan `globalThis` untuk menjaga instance saat HMR development.
- Test memakai factory `createDatabase(":memory:")`, bukan singleton.

## 10. Auth dan session

### Password

- Algoritma: `crypto.scrypt`.
- Salt: 16 byte acak.
- Key length: 64 byte.
- Parameter: N=16384, r=8, p=1.
- Format hash:

```text
scrypt$16384$8$1$<salt-base64url>$<hash-base64url>
```

- Verifikasi memakai `timingSafeEqual`.
- Jangan menyimpan password plaintext.
- Jangan mengirim hash ke client.

### Session

- Token session: 32 byte acak, base64url.
- Yang disimpan di database: SHA-256 hash token.
- Cookie menyimpan token mentah.
- Nama cookie: `ravika_session`.
- Atribut:
  - `HttpOnly`
  - `SameSite=Lax`
  - `Path=/`
  - `Secure` dari `RAVIKA_SESSION_COOKIE_SECURE`
  - `Max-Age` sesuai TTL
- TTL default: 8 jam.
- TTL `remember`: 30 hari.
- Session expired jika `expires_at <= now`.
- Session revoked jika `revoked_at` tidak null.
- User nonaktif membuat session tidak valid.
- Logout mencabut session saat ini.
- Change password mencabut semua session lain.

### Login identity

- Satu field `identity`.
- Normalisasi trim dan lowercase.
- Cocokkan ke `email` atau `username`.
- Jangan membocorkan apakah email/username ada.
- Pesan gagal selalu sama: `Email, username, atau kata sandi tidak cocok.`

### Rate limit

- 5 percobaan gagal per 15 menit.
- Key: identity lowercase + IP.
- In-memory `Map`.
- Reset saat login berhasil.
- Reset saat proses restart.
- Beri komentar:

```text
shortcut: in-memory rate limit resets on restart; replace with shared storage if multi-process.
```

### CSRF

- Cookie `SameSite=Lax`.
- Untuk request mutasi, periksa header `Origin` jika ada.
- Jika `Origin` ada dan tidak sama dengan origin aplikasi, tolak 403.
- Jika `Origin` tidak ada, izinkan untuk client non-browser seperti curl.
- Jangan menambahkan CORS wildcard.

### Session context

`AuthContext` internal berisi:

```ts
type AuthContext = {
  sessionId: string;
  userId: string;
  businessId: string;
  roleId: string;
  roleCode: string;
  roleLabel: string;
  permissions: string[];
};
```

`SessionUser` response berisi:

```ts
type SessionUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  roleLabel: string;
  permissions: string[];
};
```

Role dan permission dibaca ulang dari database pada setiap request. Perubahan
role langsung berlaku tanpa menunggu login ulang.

## 11. RBAC dan authorization

### Registry permission

- Satu source of truth: `src/shared/permissions.ts`.
- `src/mocks/permissions.ts` menjadi re-export.
- Seed menulis registry ke tabel `permissions`.
- Permission code tidak boleh berubah tanpa migration/seed update.

### Default role

| Role | Permission |
|---|---|
| OWNER | Semua permission |
| CASHIER | `dashboard.view`, `business.view`, `categories.view`, `products.view`, `tables.view`, `tables.manage`, `orders.view`, `orders.create`, `orders.cancel`, `payments.view`, `payments.create` |
| BARISTA | `categories.view`, `products.view`, `tables.view`, `orders.view`, `kds.view`, `kds.update_status` |

### Authorization

- `requireSession()` menghasilkan 401 jika tidak ada session valid.
- `requirePermission(code)` menghasilkan 403 jika permission tidak ada.
- Pemeriksaan dilakukan di server sebelum service dipanggil.
- Service juga boleh memeriksa invariant bisnis, tetapi bukan pengganti guard.
- Jangan mengandalkan UI untuk menyembunyikan aksi.

### Business boundary

- `AuthContext.businessId` dipakai untuk semua query.
- Endpoint business tidak menerima `businessId` dari client.
- Repository business selalu menerima `businessId`.

## 12. Standar API

### Runtime

- Semua Route Handler memakai Node.js runtime.
- Jangan memakai Edge runtime karena `node:sqlite`.
- Route Handler tidak di-cache.
- Tambahkan `Cache-Control: no-store` pada auth dan business.

### Request

- JSON body.
- `Content-Type: application/json`.
- Validasi Zod.
- Tolak body invalid dengan 400.
- Jangan menerima field di luar schema; gunakan `.strict()` atau strip yang
  disengaja.
- Body maksimum mengikuti default Next.js; tidak perlu parser manual.

### Response sukses

- Single resource: JSON object domain.
- List: `Paginated<T>` yang sudah dipakai mock.
- No content: 204 tanpa body.
- Jangan membungkus single resource dengan `{ data }` agar kontrak mock dan
  integrasi Fase 7 tetap dekat.

### Response error

Gunakan RFC 9457 `application/problem+json`:

```json
{
  "type": "urn:ravika:problem:validation-failed",
  "title": "Validasi gagal",
  "status": 400,
  "detail": "Request tidak valid.",
  "code": "VALIDATION_FAILED",
  "errors": [
    { "path": "identity", "message": "Wajib diisi." }
  ]
}
```

Field:

| Field | Wajib | Arti |
|---|---|---|
| `type` | Ya | URI masalah |
| `title` | Ya | Ringkasan singkat |
| `status` | Ya | HTTP status |
| `detail` | Ya | Penjelasan aman |
| `code` | Ya | Kode stabil untuk client |
| `errors` | Tidak | Detail validasi |

### Status code

| Status | Penggunaan |
|---|---|
| 200 | Sukses dengan body |
| 204 | Sukses tanpa body |
| 400 | Validasi atau request salah |
| 401 | Session tidak ada, expired, atau kredensial salah |
| 403 | Permission atau origin ditolak |
| 404 | Resource tidak ditemukan |
| 409 | Konflik data |
| 429 | Rate limit |
| 500 | Error internal |
| 503 | Database tidak siap |

### Header

- `X-Request-Id` pada setiap response.
- `Cache-Control: no-store` pada auth dan business.
- `Content-Type` sesuai body.
- Jangan mengirim stack trace.

### Logging request

- Log method, path, status, durasi, dan request id.
- Jangan log body, password, cookie, token, atau hash.
- Error internal dicatat dengan request id.

## 13. Endpoint Fase 5

### 13.1 `POST /api/auth/login`

Akses: publik.

Request:

```json
{
  "identity": "owner@ravika.id",
  "password": "demo123",
  "remember": false
}
```

Validasi:

- `identity` minimal 1 karakter.
- `password` minimal 1 karakter.
- `remember` boolean opsional.

Perilaku:

1. Rate limit check.
2. Cari user aktif berdasarkan email atau username lowercase.
3. Verifikasi scrypt.
4. Jika gagal, catat percobaan dan return 401 generik.
5. Jika berhasil, buat session.
6. Set cookie.
7. Return `SessionUser`.

Response 200:

```json
{
  "id": "user-owner",
  "name": "Rina Pemilik",
  "email": "owner@ravika.id",
  "username": "owner",
  "role": "OWNER",
  "roleLabel": "Pemilik",
  "permissions": ["dashboard.view", "business.view"]
}
```

Error:

- 400 `VALIDATION_FAILED`
- 401 `AUTH_INVALID_CREDENTIALS`
- 429 `RATE_LIMITED`

### 13.2 `POST /api/auth/logout`

Akses: session opsional.

Perilaku:

- Jika cookie ada, revoke session.
- Clear cookie.
- Return 204.
- Jangan membocorkan apakah token valid.

### 13.3 `GET /api/auth/me`

Akses: session.

Perilaku:

- Baca cookie.
- Validasi session, expiry, revoked, user aktif.
- Baca role dan permission terbaru.
- Return `SessionUser`.

Error:

- 401 `AUTH_SESSION_REQUIRED`
- 401 `AUTH_SESSION_EXPIRED`
- 401 `AUTH_SESSION_REVOKED`

### 13.4 `POST /api/auth/change-password`

Akses: session.

Request:

```json
{
  "currentPassword": "demo123",
  "newPassword": "kata-sandi-baru"
}
```

Validasi:

- `currentPassword` minimal 1.
- `newPassword` minimal 8.
- `newPassword` tidak sama dengan `currentPassword`.

Perilaku:

1. Verifikasi current password.
2. Hash password baru.
3. Update user.
4. Revoke semua session lain.
5. Pertahankan session saat ini.
6. Return 204.

Error:

- 400 `VALIDATION_FAILED`
- 400 `AUTH_INVALID_CURRENT_PASSWORD`
- 401 `AUTH_SESSION_REQUIRED`

### 13.5 `GET /api/health`

Akses: publik.

Perilaku:

- Jalankan `select 1`.
- Return 200 jika database siap.
- Return 503 problem jika gagal.
- Jangan mengembalikan path database atau detail internal.

Response 200:

```json
{
  "status": "ok",
  "database": "ok"
}
```

### 13.6 `GET /api/business`

Akses: `business.view`.

Response 200:

```json
{
  "id": "business-ravika",
  "name": "RAVIKA",
  "code": "RVK",
  "address": "Jakarta Selatan",
  "phone": "021-000000",
  "createdAt": "2026-11-17T00:00:00.000Z",
  "updatedAt": "2026-11-17T00:00:00.000Z"
}
```

Error:

- 401 `AUTH_SESSION_REQUIRED`
- 403 `AUTH_FORBIDDEN`

### 13.7 `PATCH /api/business`

Akses: `business.update`.

Request:

```json
{
  "name": "RAVIKA",
  "code": "RVK",
  "address": "Jakarta Selatan",
  "phone": "021-000000"
}
```

Validasi:

- `name` minimal 1, maksimal 120.
- `code` minimal 2, maksimal 10, uppercase alfanumerik.
- `address` maksimal 240.
- `phone` maksimal 32.

Perilaku:

- Update bisnis dari `AuthContext.businessId`.
- Return business terbaru.
- Jangan mengubah `id`, `createdAt`, atau `updatedAt` dari client.

Error:

- 400 `VALIDATION_FAILED`
- 401 `AUTH_SESSION_REQUIRED`
- 403 `AUTH_FORBIDDEN`
- 409 `BUSINESS_CODE_CONFLICT` jika code bentrok.

## 14. Seed data

### Permission seed

- Baca registry `src/shared/permissions.ts`.
- Upsert berdasarkan `code`.
- Update label dan group jika berubah.
- Jangan hapus permission yang sudah dipakai role.

### Role seed

- OWNER, CASHIER, BARISTA.
- `is_system = true`.
- `code` uppercase.
- Permission default hanya diberikan saat role dibuat.
- Jangan menimpa perubahan permission role yang sudah ada.

### Business seed

Development:

```text
id: business-ravika
name: RAVIKA
code: RVK
address: Jakarta Selatan
phone: 021-000000
```

### User seed development

| ID | Nama | Email | Username | Role | Password |
|---|---|---|---|---|---|
| `user-owner` | Rina Pemilik | `owner@ravika.id` | `owner` | OWNER | `demo123` |
| `user-cashier` | Bagas Kasir | `cashier@ravika.id` | `cashier` | CASHIER | `demo123` |
| `user-barista` | Nadia Barista | `barista@ravika.id` | `barista` | BARISTA | `demo123` |

Password di-hash saat seed. Jangan menyimpan plaintext.

### User seed production

- Hanya owner pertama.
- Email dan password dari env.
- Nama default `Pemilik`.
- Role OWNER.
- Jangan membuat cashier/barista demo.

### Determinisme

- ID dan urutan data stabil.
- Password hash boleh berbeda karena salt acak.
- Test memverifikasi password, bukan byte hash.
- Jalankan seed dua kali dan pastikan jumlah data tidak bertambah.

## 15. Repository dan application service

### Repository

| Repository | Tanggung jawab |
|---|---|
| `session.repository.ts` | create, find by token hash, revoke, revoke others |
| `user.repository.ts` | find by identity/id, update password, count owner |
| `permission.repository.ts` | list permissions by role, upsert registry |
| `business.repository.ts` | get by id, update |

Aturan:

- Terima database client atau transaction.
- Kembalikan domain object, bukan row mentah.
- Jangan memanggil `cookies()` atau `headers()`.
- Jangan membentuk HTTP response.
- Gunakan query parameterized Drizzle.

### Application service

| Service | Tanggung jawab |
|---|---|
| `auth.service.ts` | login, logout, me, change password, session validation |
| `business.service.ts` | get dan update business |

Aturan:

- Tidak mengakses `Request`/`Response`.
- Menerima input yang sudah divalidasi atau schema.
- Melempar `AppError`.
- Gunakan transaction untuk operasi multi-tabel.
- Jangan menulis cookie; cookie ditangani lapisan HTTP.

### Transaction

Gunakan transaksi untuk:

- Change password: update password + revoke session lain.
- Bootstrap/seed.
- Operasi multi-tabel Fase 6 nanti.

Jangan gunakan transaksi panjang untuk request read-only.

## 16. Testing

### Setup

- `vitest` dengan environment Node.
- Alias `@` ke `src`.
- Database test memakai `:memory:`.
- Setiap test membuat database baru.
- Migration dan seed dijalankan di helper.
- Jangan memakai database production.

### Test wajib

| File | Kasus |
|---|---|
| `tests/integration/database.test.ts` | migration dari kosong, tabel utama ada, foreign key aktif, seed idempotent |
| `tests/integration/auth.test.ts` | login benar/salah, user nonaktif, session expired/revoked, logout, change password |
| `tests/integration/rbac.test.ts` | owner/cashier/barista permission, 401/403 |
| `tests/integration/business.test.ts` | get/update business, validasi, permission |
| `tests/unit/password.test.ts` | hash dan verify, salt berbeda, format valid |
| `tests/unit/problem-details.test.ts` | bentuk RFC 9457, status, code, validation errors |

### Aturan test

- Jangan memakai `demo123` plaintext di database.
- Jangan memakai sleep.
- Jangan bergantung pada urutan test.
- Jangan memakai global singleton database.
- Test route handler boleh memakai mock cookie/request context.
- Test service tidak perlu HTTP.

### Script

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "db:generate": "drizzle-kit generate"
  }
}
```

## 17. Keamanan

- Password scrypt, bukan plaintext.
- Session token acak dan di-hash di database.
- Cookie HttpOnly dan SameSite=Lax.
- `Secure` aktif jika HTTPS.
- Rate limit login.
- Authorization di server.
- Zod validation.
- Parameterized query Drizzle.
- Jangan log secret.
- Jangan kirim hash/token ke client selain cookie session.
- Jangan menambahkan CORS wildcard.
- Jangan menerima `businessId` dari client.
- Jangan mempercayai role/permission dari client.
- Jangan mengembalikan pesan yang membocorkan keberadaan akun.
- Jangan menaruh database di network share.
- Jangan membuka file SQLite ke client.
- Jangan memakai secret hardcoded di source.
- Untuk LAN HTTP, dokumentasikan risiko sniffing dan rekomendasikan HTTPS
  sebelum pilot.

## 18. Logging dan observability

- Logger minimal di `src/shared/logging/logger.ts`.
- Format JSON satu baris.
- Field: `level`, `message`, `requestId`, `method`, `path`, `status`,
  `durationMs`.
- Jangan log body, password, cookie, token, hash, atau data pribadi.
- Error internal: log stack di server, kirim pesan generik ke client.
- Health endpoint bisa dipakai monitoring lokal.
- Tidak perlu dependency logging.

## 19. Environment dan konfigurasi

Buat `.env.example`:

```text
# Database
RAVIKA_DB_PATH=./data/ravika.sqlite

# Session
RAVIKA_SESSION_COOKIE_SECURE=false

# Bootstrap produksi
RAVIKA_BOOTSTRAP_OWNER_NAME=Pemilik
RAVIKA_BOOTSTRAP_OWNER_EMAIL=owner@example.com
RAVIKA_BOOTSTRAP_OWNER_PASSWORD=ganti-dengan-password-kuat

# Bisnis
RAVIKA_BUSINESS_NAME=RAVIKA
RAVIKA_BUSINESS_CODE=RVK
RAVIKA_BUSINESS_ADDRESS=Jakarta Selatan
RAVIKA_BUSINESS_PHONE=021-000000
```

Aturan:

- `.env*` sudah di-ignore.
- Tambahkan exception `!.env.example` agar contoh env ikut ter-commit.
- Jangan commit secret.
- `RAVIKA_SESSION_COOKIE_SECURE=true` wajib jika HTTPS.
- `RAVIKA_DB_PATH` boleh absolut.
- `data/` di-ignore.

## 20. Migration, deployment, dan runbook

### Instalasi baru

1. Set env produksi.
2. Jalankan aplikasi.
3. Database dibuat otomatis.
4. Migration dijalankan.
5. Bootstrap owner dibuat.
6. Cek `/api/health`.
7. Login owner.
8. Ganti password owner.

### Upgrade

1. Backup database.
2. Hentikan aplikasi.
3. Ganti build.
4. Jalankan aplikasi.
5. Migration berjalan otomatis.
6. Cek health.
7. Cek login.
8. Jika migration gagal, restore backup.

### Backup

- Backup database belum diimplementasikan di Fase 5.
- File SQLite, `-wal`, dan `-shm` harus ditangani bersama pada Fase 6/8.
- Jangan menyalin file saat transaksi berjalan tanpa mekanisme backup SQLite.

## 21. Verifikasi dan acceptance criteria

### Perintah

```bash
pnpm check
pnpm test
pnpm build
pnpm db:generate
```

### Verifikasi manual

1. Hapus `data/ravika.sqlite`.
2. Jalankan `pnpm build` dan `pnpm start`.
3. `GET /api/health` -> 200.
4. Login owner -> 200 dan cookie.
5. `GET /api/auth/me` -> 200.
6. `GET /api/business` -> 200.
7. `PATCH /api/business` sebagai owner -> 200.
8. Logout -> 204.
9. `GET /api/auth/me` setelah logout -> 401.
10. Login cashier.
11. `PATCH /api/business` sebagai cashier -> 403.
12. Login dengan password salah -> 401 generik.
13. Login 6 kali salah -> 429.
14. Change password -> 204; session lain revoked.
15. Seed dua kali -> tidak ada duplikasi.
16. UI 17 route existing tetap berjalan dengan mock.

### Acceptance criteria

- [ ] Migration berjalan dari database kosong.
- [ ] Seed deterministic dan idempotent.
- [ ] Password tidak plaintext.
- [ ] Session database dapat dicabut.
- [ ] Login/logout/me/change-password berfungsi.
- [ ] Email atau username dapat dipakai login.
- [ ] User nonaktif tidak bisa login.
- [ ] Session expired/revoked ditolak.
- [ ] RBAC backend menolak request tanpa permission.
- [ ] Business GET/PATCH berfungsi.
- [ ] Cashier tidak bisa update business.
- [ ] Error response RFC 9457.
- [ ] Request id dan no-store header ada.
- [ ] Tidak ada query database di route/component luar repository.
- [ ] Tidak ada akses database dari client.
- [ ] `pnpm check` PASS.
- [ ] `pnpm test` PASS.
- [ ] `pnpm build` PASS.
- [ ] UI existing tidak berubah.

## 22. Risiko dan mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| `node:sqlite` atau Drizzle migrator tidak kompatibel | Fase 5 terhenti | Verifikasi Task 1 sebelum schema; fallback `drizzle-kit migrate` CLI |
| Node 26.9.0 non-LTS | Risiko produksi | Catat di README; uji di mesin pilot |
| Full schema berubah di Fase 6 | Migration tambahan | Migration additive; jangan edit migration lama |
| Cookie Secure false di LAN HTTP | Session sniffing | Dokumentasikan; aktifkan HTTPS sebelum pilot |
| Rate limit in-memory | Reset saat restart | `shortcut:` comment; ganti shared storage jika multi-process |
| Bootstrap env salah | Owner tidak dibuat | Gagal cepat dengan pesan jelas; test bootstrap |
| UI masih mock | Backend belum terasa di UI | Diharapkan; integrasi Fase 7 |
| Refund belum ada | Order refund tidak bisa diproses | Tetap OPEN-008; jangan buat endpoint |
| WAL dan backup file | Backup tidak konsisten | Tangani di Fase 6/8; dokumentasikan |

## 23. Urutan implementasi

### Task 0: Baseline

- Pastikan working tree bersih.
- Buat branch `phase-5-backend-foundation`.
- Catat baseline `c33e473`.
- Baca dokumen ini dan PRD.

### Task 1: Tooling

- Tambah dependency.
- Tambah script.
- Tambah `drizzle.config.ts`.
- Tambah `vitest.config.ts`.
- Tambah `.env.example`.
- Tambah `.gitignore` untuk `data/` dan exception `!.env.example`.
- Verifikasi import `drizzle-orm/node-sqlite` dan migrator.
- `pnpm check` PASS.

### Task 2: Schema dan database

- Buat schema.
- Generate migration.
- Buat client, migrate, bootstrap, seed.
- Buat test database.
- `pnpm test` PASS untuk database.

### Task 3: API foundation

- AppError.
- Problem Details.
- Route wrapper.
- Request id.
- Logger.
- Zod helper.
- Session cookie.
- Auth context.
- Permission guard.
- Test unit/integration foundation.

### Task 4: Auth

- Login.
- Logout.
- Me.
- Change password.
- Rate limit.
- Test auth.

### Task 5: Health dan business

- Health.
- Business repository/service.
- GET/PATCH.
- Test RBAC dan business.

### Task 6: Verifikasi dan dokumentasi

- `pnpm check`.
- `pnpm test`.
- `pnpm build`.
- Manual curl.
- Clean database bootstrap.
- UI smoke.
- Update PRD, ROADMAP, AGENTS, README.
- Commit.
- Tag `phase-5-backend-foundation`.

## 24. Definition of Done

Fase 5 selesai jika:

- Semua acceptance criteria bagian 21 terpenuhi.
- Tidak ada endpoint di luar scope.
- Tidak ada perubahan UI.
- Tidak ada dependency di luar daftar.
- Dokumentasi diperbarui.
- Migration dan seed dapat dijalankan ulang.
- Tidak ada secret di repository atau log.
- Handoff Fase 6 jelas.

## 25. Handoff ke Fase 6

Fase 6 akan menambahkan:

- Users, roles, permissions API.
- Catalog API.
- Tables dan QR API.
- Orders API.
- Payments API.
- KDS API dan SSE.
- Reports API.
- License dan backup API.

Yang sudah tersedia dari Fase 5:

- Database client dan schema.
- Repository pattern.
- Application service pattern.
- Auth context dan permission guard.
- Error response.
- Validation.
- Logging.
- Seed.
- Test helper.

Yang belum tersedia:

- Endpoint modul selain business.
- SSE.
- Integrasi frontend.
- Refund.
- Backup file nyata.
- License validation nyata.

## Appendix A: Daftar tabel

```text
business
users
roles
permissions
role_permissions
sessions
categories
products
product_variants
add_ons
product_add_ons
tables
orders
order_items
order_item_add_ons
payments
order_status_history
audit_logs
licenses
backup_records
```

## Appendix B: Permission registry

```text
dashboard.view

business.view
business.update

users.view
users.manage

roles.manage
permissions.manage

categories.view
categories.manage

products.view
products.manage

tables.view
tables.manage

orders.view
orders.create
orders.cancel

payments.view
payments.create
payments.refund

kds.view
kds.update_status

reports.view

backup.create
backup.restore

settings.manage

license.view
```

## Appendix C: Error code

| Code | Status | Arti |
|---|---|---|
| `VALIDATION_FAILED` | 400 | Input tidak valid |
| `AUTH_INVALID_CREDENTIALS` | 401 | Email/username/password salah |
| `AUTH_SESSION_REQUIRED` | 401 | Session tidak ada |
| `AUTH_SESSION_EXPIRED` | 401 | Session kedaluwarsa |
| `AUTH_SESSION_REVOKED` | 401 | Session dicabut |
| `AUTH_INVALID_CURRENT_PASSWORD` | 400 | Password saat ini salah |
| `AUTH_FORBIDDEN` | 403 | Permission tidak cukup |
| `ORIGIN_FORBIDDEN` | 403 | Origin mutasi tidak valid |
| `RATE_LIMITED` | 429 | Terlalu banyak percobaan |
| `BUSINESS_NOT_FOUND` | 404 | Bisnis tidak ditemukan |
| `BUSINESS_CODE_CONFLICT` | 409 | Kode bisnis bentrok |
| `DATABASE_UNAVAILABLE` | 503 | Database tidak siap |
| `INTERNAL_ERROR` | 500 | Error internal |

## Appendix D: Contoh request dan response

### Login

```bash
curl -i -c cookies.txt \
  -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"identity":"owner@ravika.id","password":"demo123","remember":false}'
```

### Me

```bash
curl -i -b cookies.txt http://localhost:3000/api/auth/me
```

### Business

```bash
curl -i -b cookies.txt http://localhost:3000/api/business
```

### Update business

```bash
curl -i -b cookies.txt \
  -X PATCH http://localhost:3000/api/business \
  -H 'Content-Type: application/json' \
  -d '{"name":"RAVIKA","code":"RVK","address":"Jakarta Selatan","phone":"021-000000"}'
```

### Logout

```bash
curl -i -b cookies.txt -X POST http://localhost:3000/api/auth/logout
```

## Appendix E: File map

### Baru

- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/app/api/auth/me/route.ts`
- `src/app/api/auth/change-password/route.ts`
- `src/app/api/business/route.ts`
- `src/app/api/health/route.ts`
- `src/infrastructure/database/client.ts`
- `src/infrastructure/database/migrate.ts`
- `src/infrastructure/database/seed.ts`
- `src/infrastructure/database/bootstrap.ts`
- `src/infrastructure/database/schema/index.ts`
- `src/infrastructure/database/schema/business.ts`
- `src/infrastructure/database/schema/access.ts`
- `src/infrastructure/database/schema/catalog.ts`
- `src/infrastructure/database/schema/operations.ts`
- `src/infrastructure/database/schema/system.ts`
- `src/modules/auth/auth.service.ts`
- `src/modules/auth/auth.schemas.ts`
- `src/modules/auth/password.ts`
- `src/modules/auth/rate-limit.ts`
- `src/modules/auth/session.repository.ts`
- `src/modules/auth/session.ts`
- `src/modules/business/business.repository.ts`
- `src/modules/business/business.schemas.ts`
- `src/modules/business/business.service.ts`
- `src/modules/rbac/authorization.ts`
- `src/modules/rbac/permission.repository.ts`
- `src/modules/users/user.repository.ts`
- `src/shared/errors/app-error.ts`
- `src/shared/http/problem-details.ts`
- `src/shared/http/request-context.ts`
- `src/shared/http/route-handler.ts`
- `src/shared/logging/logger.ts`
- `src/shared/permissions.ts`
- `src/shared/ids.ts`
- `src/shared/time.ts`
- `src/types/api.ts`
- `drizzle.config.ts`
- `vitest.config.ts`
- `.env.example`
- `tests/helpers/test-db.ts`
- `tests/integration/database.test.ts`
- `tests/integration/auth.test.ts`
- `tests/integration/rbac.test.ts`
- `tests/integration/business.test.ts`
- `tests/unit/password.test.ts`
- `tests/unit/problem-details.test.ts`

### Diubah

- `package.json`
- `.gitignore`
- `src/mocks/permissions.ts` menjadi re-export
- `docs/PRD.md`
- `docs/ROADMAP.md`
- `README.md`
- `AGENTS.md`

### Tidak diubah

- Semua halaman dan komponen UI.
- `src/mocks/management/**`.
- `src/features/**`.
- `src/components/**`.
- `src/app/(auth)`, `(dashboard)`, `(cashier)`, `(kds)`, `(customer)`.

## Appendix F: Checklist implementasi

- [ ] Branch dibuat.
- [ ] Dependency ditambahkan.
- [ ] Script ditambahkan.
- [ ] `.env.example` dibuat.
- [ ] `data/` di-ignore dan `!.env.example` ditambahkan.
- [ ] Schema lengkap dibuat.
- [ ] Migration dihasilkan.
- [ ] Database client dan PRAGMA dibuat.
- [ ] Bootstrap dan seed dibuat.
- [ ] Password scrypt dibuat.
- [ ] Session repository dibuat.
- [ ] Auth context dan guard dibuat.
- [ ] Problem Details dibuat.
- [ ] Route wrapper dibuat.
- [ ] Logger dibuat.
- [ ] Login endpoint dibuat.
- [ ] Logout endpoint dibuat.
- [ ] Me endpoint dibuat.
- [ ] Change password endpoint dibuat.
- [ ] Health endpoint dibuat.
- [ ] Business GET dibuat.
- [ ] Business PATCH dibuat.
- [ ] Test database dibuat.
- [ ] Test auth dibuat.
- [ ] Test RBAC dibuat.
- [ ] Test business dibuat.
- [ ] Test password dibuat.
- [ ] Test problem details dibuat.
- [ ] `pnpm check` PASS.
- [ ] `pnpm test` PASS.
- [ ] `pnpm build` PASS.
- [ ] Manual curl PASS.
- [ ] Clean database bootstrap PASS.
- [ ] UI smoke PASS.
- [ ] Dokumentasi diperbarui.
- [ ] Commit dibuat.
- [ ] Tag `phase-5-backend-foundation` dibuat.
