# RAVIKA POS - Spesifikasi Fase 6: Backend API Modules

**Status:** Approved untuk implementasi
**Milestone:** M6 - Backend MVP Ready
**Fase:** 6, Backend API Modules
**Tanggal:** 17 November 2026
**Baseline frontend:** `c33e473`
**Baseline backend foundation:** `c05faf1`
**Tag backend foundation:** `phase-5-backend-foundation`
**Referensi utama:** `docs/PRD.md`, `docs/ROADMAP.md`, `docs/specification/phase-5-backend-foundation.md`, `docs/specification/phase-4-5-single-location-mvp.md`

## Daftar isi

- [0. Agent quick start](#0-agent-quick-start)
- [1. Ringkasan](#1-ringkasan)
- [2. Goals, non-goals, dan anti-goals](#2-goals-non-goals-dan-anti-goals)
- [3. Keputusan yang dikunci](#3-keputusan-yang-dikunci)
- [4. Scope dan deliverable](#4-scope-dan-deliverable)
- [5. Arsitektur dan aturan lapisan](#5-arsitektur-dan-aturan-lapisan)
- [6. Struktur direktori](#6-struktur-direktori)
- [7. Perubahan schema](#7-perubahan-schema)
- [8. Infrastruktur bersama](#8-infrastruktur-bersama)
- [9. Standar API](#9-standar-api)
- [10. Modul API](#10-modul-api)
  - [10.1 Business](#101-business)
  - [10.2 Users, roles, permissions](#102-users-roles-permissions)
  - [10.3 Catalog](#103-catalog)
  - [10.4 Tables dan QR](#104-tables-dan-qr)
  - [10.5 Orders](#105-orders)
  - [10.6 Payments dan refund](#106-payments-dan-refund)
  - [10.7 KDS dan SSE](#107-kds-dan-sse)
  - [10.8 Reports](#108-reports)
  - [10.9 License](#109-license)
  - [10.10 Backup dan restore](#1010-backup-dan-restore)
- [11. Aturan domain dan state machine](#11-aturan-domain-dan-state-machine)
- [12. Idempotency](#12-idempotency)
- [13. QR token encryption](#13-qr-token-encryption)
- [14. Format lisensi](#14-format-lisensi)
- [15. Backup dan restore](#15-backup-dan-restore)
- [16. Seed data](#16-seed-data)
- [17. Keamanan dan rate limit](#17-keamanan-dan-rate-limit)
- [18. Testing](#18-testing)
- [19. Verifikasi dan acceptance criteria](#19-verifikasi-dan-acceptance-criteria)
- [20. Risiko dan mitigasi](#20-risiko-dan-mitigasi)
- [21. Urutan implementasi](#21-urutan-implementasi)
- [22. Definition of Done](#22-definition-of-done)
- [23. Handoff ke Fase 7](#23-handoff-ke-fase-7)
- [Appendix A: Daftar endpoint](#appendix-a-daftar-endpoint)
- [Appendix B: Permission matrix](#appendix-b-permission-matrix)
- [Appendix C: Error code](#appendix-c-error-code)
- [Appendix D: Contoh request dan response](#appendix-d-contoh-request-dan-response)
- [Appendix E: File map](#appendix-e-file-map)
- [Appendix F: Checklist implementasi](#appendix-f-checklist-implementasi)

## 0. Agent quick start

Baca dokumen ini sebelum menulis kode Fase 6.

Aturan wajib:

1. Fase 6 hanya backend API. UI tetap memakai mock sampai Fase 7.
2. Jangan mengubah halaman, komponen UI, atau mock service frontend.
3. Jangan menambahkan endpoint di luar daftar dokumen ini tanpa keputusan product owner.
4. Jangan menambahkan dependency baru tanpa persetujuan.
5. Route Handler tipis. Business rule ada di application service.
6. Akses database hanya melalui repository.
7. Semua input divalidasi Zod di server.
8. Semua endpoint internal memeriksa session dan permission.
9. Semua mutasi finansial dan order memakai transaction dan audit log.
10. Jangan menulis password, token, signature, atau secret ke log.
11. Jangan memakai `better-sqlite3`. Driver tetap `node:sqlite`.
12. Jangan membuat UI refund di Fase 6. Refund hanya API.
13. Jangan mengubah data historis order saat produk berubah.
14. Jalankan `pnpm check`, `pnpm test`, dan `pnpm build` sebelum menyatakan selesai.
15. Jika ada konflik dengan PRD, berhenti dan minta keputusan product owner.

## 1. Ringkasan

Fase 6 mengimplementasikan seluruh API modul MVP di atas fondasi Fase 5:

- Users, roles, dan permissions.
- Categories, products, variants, dan add-ons.
- Tables dan QR ordering.
- Orders kasir dan QR.
- Payments dan refund penuh.
- KDS dan SSE.
- Reports.
- License Ed25519.
- Backup dan restore.

Modul business sudah tersedia dari Fase 5. Fase 6 tidak mengganti fondasi auth,
database, error, atau session.

## 2. Goals, non-goals, dan anti-goals

### Goals

- Seluruh alur operasional MVP tersedia melalui API nyata.
- Business rules kritis diterapkan di server.
- Order, payment, refund, dan status KDS konsisten secara transaksional.
- Data historis order memakai snapshot.
- Endpoint publik aman dan terbatas.
- KDS menerima perubahan melalui SSE dan dapat refetch setelah reconnect.
- Reports memakai data transaksi nyata.
- Lisensi diverifikasi secara lokal dengan Ed25519.
- Backup dapat dibuat dan direstore dengan prosedur aman.
- API contract siap dipakai Fase 7.

### Non-goals

- Tidak ada integrasi frontend.
- Tidak ada TanStack Query atau perubahan provider UI.
- Tidak ada UI refund.
- Tidak ada refund sebagian.
- Tidak ada takeaway QR.
- Tidak ada diskon, pajak, atau biaya layanan.
- Tidak ada payment gateway.
- Tidak ada upload gambar.
- Tidak ada Playwright E2E.
- Tidak ada worker atau job queue.
- Tidak ada multi-process atau Redis.

### Anti-goals

- Jangan menaruh aturan harga di client.
- Jangan mempercayai total, status, atau permission dari client.
- Jangan menyimpan password, token, atau signature di log.
- Jangan membuat endpoint yang tidak dipakai UI atau PRD.
- Jangan membuat abstraksi generik yang belum dipakai.
- Jangan mengubah schema tanpa migration.
- Jangan mengubah data order historis.

## 3. Keputusan yang dikunci

| ID     | Keputusan                                      | Alasan |
| ------ | ---------------------------------------------- | ------ |
| P6-01  | Refund penuh satu order                        | OPEN-008 diputuskan untuk full refund |
| P6-02  | Refund hanya untuk order `PAID`                | Menghindari status parsial yang rumit |
| P6-03  | Idempotency order, payment, refund             | Mencegah transaksi ganda |
| P6-04  | Tabel `idempotency_keys`                       | Response replay dan request hash |
| P6-05  | QR hash + ciphertext AES-256-GCM               | QR dapat ditampilkan ulang tanpa plaintext |
| P6-06  | SSE in-process event bus                       | Satu proses Node, tanpa Redis |
| P6-07  | License Ed25519 file via env                   | Validasi lokal nyata |
| P6-08  | Backup nyata + restore restart                 | Aman untuk SQLite WAL |
| P6-09  | Full demo seed development                     | Kebutuhan Fase 7 dan QA manual |
| P6-10  | Add-on read-only API                           | UI hanya memilih add-on katalog |
| P6-11  | UI tetap mock                                  | Integrasi adalah Fase 7 |
| P6-12  | Takeaway QR tetap ditunda                      | OPEN-009 belum final |
| P6-13  | Cash overpay tidak disimpan                    | Amount adalah nilai yang diterapkan |

## 4. Scope dan deliverable

### Deliverable

1. Migration schema Fase 6.
2. Modul users, roles, dan permissions.
3. Modul catalog.
4. Modul tables dan QR.
5. Modul orders.
6. Modul payments dan refund.
7. Modul KDS dan SSE.
8. Modul reports.
9. Modul license.
10. Modul backup dan restore.
11. Full demo seed development.
12. Unit/integration test.
13. Dokumentasi dan verification report.

### Dependency

Tidak ada dependency baru. Fase 6 memakai:

- `node:sqlite`
- `node:crypto`
- `node:fs`
- `node:events`
- Drizzle ORM
- Zod
- Vitest

### Tidak termasuk

- Frontend integration.
- Refund UI.
- Playwright.
- Payment gateway.
- SSE persistence/replay.
- Multi-process event bus.
- Takeaway QR.
- Diskon/pajak/service charge.

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
| --- | --- | --- |
| Route Handler | Baca request, validasi, panggil service, bentuk response | Query database, business rule kompleks |
| Application Service | Orkestrasi, transaksi, aturan use case | Detail HTTP, akses `cookies()` langsung |
| Repository | Query Drizzle, mapping row | Response HTTP, validasi request |
| Domain/Shared | Tipe, error, aturan murni | Akses database, `next/headers` |
| Infrastructure | Database, event bus, QR crypto, backup | Komponen UI |

### Aturan wajib

- Semua modul memakai pola repository -> service -> route.
- Semua query operasional memakai `business_id` dari `AuthContext`.
- Jangan menerima `businessId` dari client.
- Semua mutasi multi-tabel memakai `db.transaction`.
- Publish SSE setelah transaksi commit.
- Audit log ditulis untuk aksi penting.
- Response sukses mengikuti bentuk domain mock.
- Error memakai RFC 9457.

## 6. Struktur direktori

```text
src/
├── app/api/
│   ├── add-ons/route.ts
│   ├── backup/
│   │   ├── route.ts
│   │   └── restore/route.ts
│   ├── categories/
│   │   ├── route.ts
│   │   └── [id]/
│   │       ├── route.ts
│   │       └── move/route.ts
│   ├── events/route.ts
│   ├── kds/orders/
│   │   ├── route.ts
│   │   └── [id]/status/route.ts
│   ├── licensing/status/route.ts
│   ├── orders/
│   │   ├── route.ts
│   │   ├── payable/route.ts
│   │   └── [id]/
│   │       ├── route.ts
│   │       ├── cancel/route.ts
│   │       ├── history/route.ts
│   │       ├── payments/route.ts
│   │       └── refund/route.ts
│   ├── payments/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── permissions/route.ts
│   ├── products/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── public/
│   │   ├── menu/[token]/route.ts
│   │   └── orders/
│   │       ├── route.ts
│   │       └── [publicToken]/route.ts
│   ├── reports/
│   │   ├── summary/route.ts
│   │   ├── sales/route.ts
│   │   └── top-products/route.ts
│   ├── roles/
│   │   ├── route.ts
│   │   └── [id]/
│   │       ├── route.ts
│   │       └── permissions/route.ts
│   ├── tables/
│   │   ├── route.ts
│   │   └── [id]/
│   │       ├── route.ts
│   │       └── regenerate-qr/route.ts
│   └── users/
│       ├── route.ts
│       └── [id]/route.ts
├── modules/
│   ├── audit/
│   ├── backup/
│   ├── catalog/
│   ├── events/
│   ├── kds/
│   ├── licensing/
│   ├── orders/
│   ├── payments/
│   ├── permissions/
│   ├── reports/
│   ├── roles/
│   ├── tables/
│   └── users/
├── infrastructure/database/schema/
│   ├── operations.ts
│   └── system.ts
└── shared/
    ├── crypto/
    ├── http/
    └── rate-limit.ts
```

Struktur aktual boleh berbeda selama aturan lapisan tetap.

## 7. Perubahan schema

### 7.1 `tables.qr_token_ciphertext`

Tambahkan kolom:

| Kolom | Tipe | Aturan |
| --- | --- | --- |
| `qr_token_ciphertext` | text | nullable |

- Format: `v1.<nonce>.<ciphertext>.<tag>` base64url.
- `qr_token_hash` tetap dipakai untuk lookup publik.
- Baris lama tanpa ciphertext harus regenerate QR.
- Migration additive; jangan hapus `qr_token_hash`.

### 7.2 `refunds`

| Kolom | Tipe | Aturan |
| --- | --- | --- |
| `id` | text | PK |
| `order_id` | text | FK orders, unique, restrict |
| `amount` | integer | not null, CHECK > 0 |
| `reason` | text | not null |
| `recorded_by` | text | FK users, restrict |
| `created_at` | integer timestamp_ms | not null |

Unique `order_id` mencegah refund ganda.

### 7.3 `idempotency_keys`

| Kolom | Tipe | Aturan |
| --- | --- | --- |
| `id` | text | PK |
| `business_id` | text | FK business, restrict |
| `key` | text | not null |
| `operation` | text | not null |
| `request_hash` | text | not null |
| `resource_type` | text | not null |
| `resource_id` | text | not null |
| `response_status` | integer | not null |
| `response_body` | text JSON | not null |
| `created_at` | integer timestamp_ms | not null |
| `expires_at` | integer timestamp_ms | not null |

Unique: `(business_id, operation, key)`.
Index: `expires_at`, `(resource_type, resource_id)`.

### 7.4 `tables.qr_token_ciphertext` dan QR lama

- Token lama hanya punya hash.
- Endpoint detail QR mengembalikan 409 `QR_TOKEN_UNAVAILABLE` jika ciphertext null.
- Regenerate membuat token baru dan ciphertext baru.
- Seed development membuat ciphertext untuk semua meja.

### 7.5 Tidak ada perubahan schema lain

- `orders.idempotency_key` tetap ada, tetapi sumber replay adalah
  `idempotency_keys`.
- `payments.status` sudah memiliki `REFUNDED`.
- `licenses` sudah memiliki payload, signature, status, fingerprint.

## 8. Infrastruktur bersama

### 8.1 Route wrapper dynamic params

Perluas `withApi` agar menerima context route:

```ts
withApi<{ params: Promise<{ id: string }> }>(handler)
```

Handler menerima `requestId` dan context. Route Handler tetap tipis.

### 8.2 Idempotency service

- Header `Idempotency-Key` wajib untuk:
  - `POST /api/orders`
  - `POST /api/public/orders`
  - `POST /api/orders/:id/payments`
  - `POST /api/orders/:id/refund`
- Key 8-128 karakter.
- Request hash memakai stable JSON dari body tervalidasi.
- Key sama + hash sama: return response tersimpan, header
  `Idempotency-Replayed: true`.
- Key sama + hash beda: 409 `IDEMPOTENCY_KEY_REUSED`.
- TTL 24 jam.
- Simpan response sukses dalam transaksi yang sama.
- Jangan menyimpan response gagal.

### 8.3 Audit log service

Tulis `audit_logs` untuk:

- user create/update/active change
- role create/update/permission change
- category/product/table changes
- order create/cancel
- payment create
- refund
- KDS status change
- backup create/restore
- license import

Metadata tidak boleh berisi password, token, signature, atau data sensitif.

### 8.4 Realtime event bus

- In-process `Set` subscriber.
- Event:
  - `order.created`
  - `order.status_changed`
  - `payment.status_changed`
  - `order.refunded`
- Publish setelah transaksi commit.
- `GET /api/events` memakai `text/event-stream`.
- Heartbeat setiap 15 detik.
- `retry: 3000`.
- Cleanup subscriber saat request abort.
- Tidak ada replay event. Client refetch setelah reconnect.
- `shortcut:` single-process only. Ganti shared transport jika multi-process.

### 8.5 Public rate limit

- In-memory fixed window.
- Menu dan status publik: 60 request/menit per IP.
- Create order publik: 10 request/menit per IP.
- Reset saat restart.
- `shortcut:` comment dan upgrade path.

### 8.6 Stable JSON

Helper untuk:

- idempotency request hash
- license canonical payload

Aturan:

- Sort object keys secara rekursif.
- Array mempertahankan urutan.
- `undefined` diabaikan.
- Number dan boolean apa adanya.
- Jangan memakai `JSON.stringify` langsung untuk signature.

## 9. Standar API

### Runtime

- Default Node.js runtime dari Next.js.
- Jangan menambahkan `export const runtime` karena `cacheComponents`
  menolaknya.
- Response API dinamis.
- `Cache-Control: no-store` untuk data internal.
- Public menu boleh `no-store` juga.

### Request

- JSON body.
- Validasi Zod.
- Tolak field tak dikenal dengan `.strict()`.
- Path parameter divalidasi.
- Query parameter divalidasi.
- Body maksimum mengikuti default Next.js.

### Response sukses

- Single resource: JSON domain.
- List: `{ items, page, pageSize, total, pageCount }`.
- No content: 204.
- Jangan membungkus single resource dengan `{ data }`.

### Response error

RFC 9457:

```json
{
  "type": "urn:ravika:problem:order-invalid-state",
  "title": "Status pesanan tidak valid",
  "status": 409,
  "detail": "Pesanan tidak dapat dibatalkan pada status ini.",
  "code": "ORDER_INVALID_STATE"
}
```

### Header

- `X-Request-Id`
- `Cache-Control: no-store`
- `Idempotency-Replayed` bila replay
- Jangan kirim stack trace

### Status code

| Status | Penggunaan |
| --- | --- |
| 200 | Sukses |
| 201 | Resource dibuat |
| 204 | Sukses tanpa body |
| 400 | Validasi |
| 401 | Session |
| 403 | Permission |
| 404 | Resource |
| 409 | Konflik state/idempotency |
| 422 | Aturan bisnis |
| 429 | Rate limit |
| 500 | Internal |
| 503 | Database/backup |

## 10. Modul API

### 10.1 Business

Endpoint dari Fase 5 tetap:

- `GET /api/business`
- `PATCH /api/business`

Fase 6 hanya memastikan semua query baru memakai `businessId` dari session.
Tidak ada endpoint baru.

### 10.2 Users, roles, permissions

#### Endpoint

| Method | Endpoint | Permission | Body/Query |
| --- | --- | --- | --- |
| GET | `/api/users` | `users.view` | page, pageSize, search, role, active |
| POST | `/api/users` | `users.manage` | name, email, username?, role, password, isActive |
| GET | `/api/users/:id` | `users.view` | - |
| PATCH | `/api/users/:id` | `users.manage` | name, email, username?, role, isActive |
| GET | `/api/roles` | `roles.manage` | - |
| POST | `/api/roles` | `roles.manage` | name, code, description, permissionCodes |
| PATCH | `/api/roles/:id` | `roles.manage` | name, code?, description |
| PUT | `/api/roles/:id/permissions` | `permissions.manage` | permissionCodes |
| GET | `/api/permissions` | `permissions.manage` | - |

#### Aturan user

- Email dan username lowercase.
- Username opsional; default dari email local-part.
- Username dan email unik.
- Password create minimal 8 karakter.
- Jangan pernah mengembalikan `password_hash`.
- Role harus ada.
- Role system code tidak bisa diubah.
- Tidak bisa menonaktifkan owner aktif terakhir.
- Tidak bisa mengganti role owner aktif terakhir menjadi non-owner.
- Perubahan role/permission langsung berlaku pada request berikutnya.

#### Aturan role

- Role custom boleh dibuat.
- Role system tidak bisa dihapus.
- Permission code harus ada di registry.
- Update permission role mengganti assignment lama.
- Minimal satu permission `roles.manage`? Tidak dipaksa.
- Role response memuat `permissionCodes`.

#### Response user

```json
{
  "id": "user-cashier",
  "name": "Bagas Kasir",
  "email": "cashier@ravika.id",
  "username": "cashier",
  "role": "CASHIER",
  "isActive": true,
  "createdAt": "2026-11-17T00:00:00.000Z",
  "updatedAt": "2026-11-17T00:00:00.000Z"
}
```

`username` boleh ditambahkan ke DTO walaupun UI lama tidak menampilkannya.

### 10.3 Catalog

#### Endpoint

| Method | Endpoint | Permission | Body/Query |
| --- | --- | --- | --- |
| GET | `/api/categories` | `categories.view` | page, pageSize, search, active |
| POST | `/api/categories` | `categories.manage` | name, description, sortOrder, isActive |
| PATCH | `/api/categories/:id` | `categories.manage` | name, description, sortOrder, isActive |
| POST | `/api/categories/:id/move` | `categories.manage` | direction: up/down |
| GET | `/api/products` | `products.view` | page, pageSize, search, categoryId, active, availability, sort |
| GET | `/api/products/:id` | `products.view` | - |
| POST | `/api/products` | `products.manage` | name, description, categoryId, basePrice, isAvailable, isActive, variants, addOns |
| PATCH | `/api/products/:id` | `products.manage` | field yang sama |
| GET | `/api/add-ons` | `products.view` | - |

#### Aturan category

- Sort order integer >= 0.
- Move menukar sort order dengan tetangga.
- Nonaktifkan kategori tidak menghapus produk.
- Kategori harus ada saat product create/update.

#### Aturan product

- Base price integer >= 0.
- Variant name unik dalam produk.
- Add-on relation unik.
- Add-on harus ada di business.
- `minSelection <= maxSelection`.
- `maxSelection >= 1`.
- Update produk mengganti variants dan product_add_ons dalam transaksi.
- Order historis tidak berubah.
- Produk nonaktif/tidak tersedia tidak bisa dipesan.
- Add-on API read-only; seed menyediakan add-on.

### 10.4 Tables dan QR

#### Endpoint

| Method | Endpoint | Permission | Body/Query |
| --- | --- | --- | --- |
| GET | `/api/tables` | `tables.view` | page, pageSize, search, status |
| GET | `/api/tables/:id` | `tables.view` | - |
| POST | `/api/tables` | `tables.manage` | name, status, isActive |
| PATCH | `/api/tables/:id` | `tables.manage` | name, status, isActive |
| POST | `/api/tables/:id/regenerate-qr` | `tables.manage` | - |
| GET | `/api/public/menu/:token` | Publik | - |
| POST | `/api/public/orders` | Publik | tableToken, items, notes |
| GET | `/api/public/orders/:publicToken` | Publik | - |

#### Aturan table

- Nama meja unik.
- Status `AVAILABLE`, `OCCUPIED`, `INACTIVE`.
- Status `OCCUPIED` boleh menerima order tambahan.
- Table dengan order aktif tidak bisa dinonaktifkan.
- Create/regenerate mengembalikan `qrToken` mentah satu kali.
- List tidak mengembalikan `qrToken`.
- Detail mengembalikan `qrToken` hasil decrypt.
- Jika ciphertext null, detail QR mengembalikan 409 `QR_TOKEN_UNAVAILABLE`.
- Public menu hanya produk aktif dan tersedia.
- Public order hanya dine-in.
- Token invalid atau meja inactive -> 404/409 yang aman.

#### Public menu response

```json
{
  "business": { "name": "RAVIKA", "address": "Jakarta Selatan" },
  "table": { "id": "table-1", "name": "Meja 01" },
  "categories": [{ "id": "category-1", "name": "Kopi" }],
  "products": [
    {
      "id": "product-1",
      "categoryId": "category-1",
      "name": "Espresso",
      "description": "",
      "basePrice": 22000,
      "variants": [],
      "addOns": []
    }
  ]
}
```

Jangan tampilkan user internal, order lain, atau token internal.

#### Public order response

```json
{
  "orderNumber": "RVK-2025",
  "publicToken": "pub-...",
  "grandTotal": 26000,
  "tableName": "Meja 01"
}
```

### 10.5 Orders

#### Endpoint

| Method | Endpoint | Permission | Body/Query |
| --- | --- | --- | --- |
| GET | `/api/orders` | `orders.view` | page, pageSize, search, orderStatus, paymentStatus, dateFrom, dateTo, sort |
| POST | `/api/orders` | `orders.create` | orderType, tableId, notes, items |
| GET | `/api/orders/:id` | `orders.view` | - |
| GET | `/api/orders/:id/history` | `orders.view` | - |
| GET | `/api/orders/:id/payments` | `payments.view` | - |
| GET | `/api/orders/payable` | `payments.view` | - |
| POST | `/api/orders/:id/cancel` | `orders.cancel` | reason |
| POST | `/api/orders/:id/refund` | `payments.refund` | reason |

#### Create order body

```json
{
  "orderType": "DINE_IN",
  "tableId": "table-1",
  "notes": "",
  "items": [
    {
      "productId": "product-1",
      "variantId": "variant-1",
      "addOnIds": ["addon-1"],
      "quantity": 2,
      "notes": ""
    }
  ]
}
```

Public order body memakai `tableToken` dan tidak memiliki `tableId`.

#### Aturan create

- Source CASHIER dari session; source QR dari public endpoint.
- Minimal 1 item.
- Quantity >= 1.
- Produk harus ada, aktif, tersedia.
- Varian harus valid.
- Add-on harus valid dan memenuhi min/max.
- Server menghitung ulang seluruh harga.
- Snapshot:
  - product name
  - variant name
  - add-on name dan price
  - unit price
  - line total
- Subtotal = sum line total.
- Discount = 0.
- Grand total = subtotal.
- Dine-in wajib meja valid dan aktif.
- Takeaway tidak boleh memiliki meja.
- QR wajib dine-in dan token meja valid.
- Meja dine-in menjadi `OCCUPIED`.
- Status awal `NEW`, payment `UNPAID`.
- Nomor order global `RVK-####`.
- Status history awal dibuat.
- Audit log.
- Idempotency.
- Publish `order.created`.

#### Order number

- Prefix `RVK-`.
- Ambil nomor terbesar yang ada.
- Nomor baru = maksimum + 1.
- Minimal 2001.
- Unique constraint dijaga database.
- Dibuat dalam transaksi create order.

#### Cancel

- Permission `orders.cancel`.
- Status `NEW`, `ACCEPTED`, atau `PREPARING`.
- Ditolak jika ada payment `RECORDED`.
- Setelah refund penuh, payment `REFUNDED`, cancel boleh.
- Reason minimal 3 karakter.
- Set `CANCELLED`, `cancelled_at`.
- History baru.
- Sinkronkan status meja.
- Audit log.
- Publish `order.status_changed`.

#### Detail order

Response memuat:

- order fields
- items snapshot
- add-ons snapshot
- table name
- creator name
- payment status dan preparation status terpisah

History dan payments memakai endpoint terpisah.

### 10.6 Payments dan refund

#### Endpoint

| Method | Endpoint | Permission | Body/Query |
| --- | --- | --- | --- |
| GET | `/api/payments` | `payments.view` | page, pageSize, search, method, status, dateFrom, dateTo |
| GET | `/api/payments/:id` | `payments.view` | - |
| POST | `/api/orders/:id/payments` | `payments.create` | method, amount, reference, notes, verified |
| POST | `/api/orders/:id/refund` | `payments.refund` | reason |

#### Payment

- Amount integer > 0.
- Amount <= sisa tagihan.
- Cash overpay tidak disimpan.
- Digital wajib `verified: true`.
- Order tidak boleh `CANCELLED` atau `REFUNDED`.
- Insert payment `RECORDED`.
- Recalculate payment status:
  - 0 -> `UNPAID`
  - kurang -> `PARTIALLY_PAID`
  - cukup -> `PAID`
- Preparation status tidak berubah.
- Audit log.
- Idempotency.
- Publish `payment.status_changed`.

#### Refund

- Hanya order `PAID`.
- Semua payment harus `RECORDED`.
- Tidak boleh ada refund sebelumnya.
- Insert satu row `refunds`.
- Amount = sum payment recorded.
- Semua payment menjadi `REFUNDED`.
- Order payment status menjadi `REFUNDED`.
- Preparation status tidak berubah.
- Audit log.
- Idempotency.
- Publish `order.refunded`.

Endpoint refund memakai `POST /api/orders/:id/refund`, bukan
`/api/payments/:id/refunds`, karena keputusan refund adalah full order.
PRD perlu diperbarui.

### 10.7 KDS dan SSE

#### Endpoint

| Method | Endpoint | Permission |
| --- | --- | --- |
| GET | `/api/kds/orders` | `kds.view` |
| POST | `/api/kds/orders/:id/status` | `kds.update_status` |
| GET | `/api/events` | `kds.view` |

#### KDS response

```json
{
  "active": [],
  "completed": []
}
```

- Active: `NEW`, `ACCEPTED`, `PREPARING`, `READY`.
- Completed: maksimal 10 `COMPLETED` terbaru.
- CANCELLED tidak ditampilkan.

#### Status transition

```text
NEW -> ACCEPTED -> PREPARING -> READY -> COMPLETED
```

- Hanya maju.
- Tidak ada cancel dari KDS.
- `COMPLETED` mengisi `completed_at`.
- Status history baru.
- Sinkronkan meja.
- Audit log.
- Publish `order.status_changed`.

#### SSE

- Header `text/event-stream`.
- `cache-control: no-cache, no-transform`.
- Event format:

```text
id: <uuid>
event: order.status_changed
data: {"orderId":"...","orderNumber":"RVK-2025","orderStatus":"READY","paymentStatus":"PAID"}
retry: 3000
```

- Heartbeat komentar setiap 15 detik.
- Cleanup on abort.
- Event tidak disimpan.
- Reconnect harus refetch `/api/kds/orders`.

### 10.8 Reports

#### Endpoint

| Method | Endpoint | Permission |
| --- | --- | --- |
| GET | `/api/reports/summary?range=today\|7d\|30d` | `reports.view` |
| GET | `/api/reports/sales?dateFrom&dateTo` | `reports.view` |
| GET | `/api/reports/top-products?dateFrom&dateTo&limit` | `reports.view` |

#### Summary response

Mengikuti `DashboardSummary`:

- `salesTotal`
- `paidTotal`
- `transactionCount`
- `averageTransaction`
- `itemsSold`
- `queue`
- `queueOrders`
- `salesTrend`
- `topProducts`
- `recentOrders`

#### Sales response

Mengikuti `SalesReport`:

- `salesTotal`
- `paidTotal`
- `transactionCount`
- `averageTransaction`
- `salesTrend`
- `topProducts`
- `orders`

#### Aturan

- `salesTotal`: grand total order non-cancelled pada periode.
- `paidTotal`: jumlah payment `RECORDED` pada periode.
- Refund tidak dihitung sebagai paid.
- `transactionCount`: jumlah order non-cancelled.
- Top products dari snapshot order item.
- Tanggal memakai zona waktu `Asia/Jakarta`.
- Trend 7 hari terakhir dari periode.
- Jangan memakai `COUNT`/sum float.

### 10.9 License

#### Endpoint

| Method | Endpoint | Permission |
| --- | --- | --- |
| GET | `/api/licensing/status` | `license.view` |

#### Input file

`RAVIKA_LICENSE_FILE`:

```json
{
  "payload": {
    "licenseId": "lic-001",
    "businessIdentifier": "business-ravika",
    "installationId": "installation-ravika",
    "issuedAt": "2026-11-17T00:00:00.000Z",
    "expiresAt": "2027-11-17T00:00:00.000Z"
  },
  "signature": "base64url-ed25519-signature"
}
```

#### Verifikasi

- Public key Ed25519 base64 DER SPKI dari `RAVIKA_LICENSE_PUBLIC_KEY`.
- Signature base64url.
- Payload canonical JSON key terurut.
- `businessIdentifier` harus cocok dengan business id.
- `installationId` harus cocok dengan `RAVIKA_INSTALLATION_ID`.
- Expired -> `INVALID`.
- Expires dalam 30 hari -> `EXPIRING`.
- Selain itu -> `VALID`.
- Fingerprint = SHA-256 public key DER.
- Simpan payload, signature, status, fingerprint.
- Jika file tidak ada, simpan placeholder `INVALID`.
- Jika signature/identitas invalid, simpan `INVALID` dan alasan aman.
- Tidak ada endpoint aktivasi.

#### Response

Mengikuti `License`:

- `id`
- `businessIdentifier`
- `installationId`
- `issuedAt`
- `expiresAt`
- `status`
- `publicKeyFingerprint`

### 10.10 Backup dan restore

#### Endpoint

| Method | Endpoint | Permission | Body |
| --- | --- | --- | --- |
| GET | `/api/backup` | `backup.create` | - |
| POST | `/api/backup` | `backup.create` | - |
| POST | `/api/backup/restore` | `backup.restore` | backupId, confirm |

#### Backup

- Direktori `data/backups/`.
- Nama `ravika-YYYYMMDD-HHmmss.sqlite`.
- Gunakan `node:sqlite` `backup()`.
- Hitung ukuran dan SHA-256.
- Simpan `backup_records` status `READY`.
- Jika gagal, simpan `FAILED` dan return error.
- Audit log.
- Response `BackupRecord`.

#### Restore

- `confirm` wajib `true`.
- Backup harus ada dan status `READY`.
- Validasi checksum jika tersedia.
- Buka read-only, jalankan `PRAGMA integrity_check`.
- Tutup database aktif.
- Copy backup ke path database.
- Hapus `-wal` dan `-shm`.
- Return `{ restored: true, restartRequired: true }`.
- Instance harus restart sebelum operasional dilanjutkan.
- Jangan melakukan query DB setelah restore dalam request yang sama.
- Audit log.

## 11. Aturan domain dan state machine

### Order preparation

```text
NEW -> ACCEPTED -> PREPARING -> READY -> COMPLETED
NEW/ACCEPTED/PREPARING -> CANCELLED
```

- Cancel hanya dari management Orders.
- KDS tidak cancel.
- Cancel ditolak jika ada payment `RECORDED`.
- Setelah full refund, cancel boleh.

### Payment

```text
UNPAID -> PARTIALLY_PAID -> PAID
PAID -> REFUNDED
```

- Payment status dihitung dari payment `RECORDED`.
- Refund penuh mengubah semua payment dan order.
- Preparation status tidak berubah.

### Table

- `AVAILABLE` jika tidak ada order aktif.
- `OCCUPIED` jika ada order aktif.
- `INACTIVE` tidak bisa menerima order.
- Table `OCCUPIED` boleh menerima order tambahan.
- Table kembali `AVAILABLE` saat tidak ada order aktif.
- Table `INACTIVE` dipertahankan.

### Order number

- Format `RVK-<nomor>`.
- Nomor unik global.
- Dibuat dalam transaksi.
- Tidak berubah setelah order dibuat.

## 12. Idempotency

Header:

```text
Idempotency-Key: 8-128-character-string
```

Operation:

- `CREATE_ORDER`
- `CREATE_PUBLIC_ORDER`
- `RECORD_PAYMENT`
- `REFUND_ORDER`

Request hash:

- Stable JSON dari body tervalidasi.
- Untuk user/actor internal yang memengaruhi hasil, hash boleh memasukkan
  userId/source.
- Jangan hash token session atau cookie.

Replay:

- Response status dan body disimpan sebagai JSON.
- Replay mengembalikan status/body yang sama.
- Header `Idempotency-Replayed: true`.
- Key sama + hash beda -> 409.
- TTL 24 jam.

Transaksi:

- Simpan resource dan idempotency record dalam transaksi yang sama.
- Jangan commit resource tanpa idempotency record.
- Jangan menyimpan response gagal.

## 13. QR token encryption

### Key

- `RAVIKA_QR_TOKEN_KEY`: base64 32 byte.
- Production wajib.
- Development fallback hanya untuk dev/test dengan komentar `shortcut:`.
- Jangan commit key production.

### Format ciphertext

```text
v1.<nonce-base64url>.<ciphertext-base64url>.<tag-base64url>
```

- AES-256-GCM.
- Nonce 12 byte acak.
- Tag 16 byte.
- AAD: table id.

### Alur

- Create/regenerate: generate token 32 byte, hash SHA-256, encrypt token.
- Simpan hash + ciphertext.
- Public menu: hash token, lookup table.
- Internal detail: decrypt dengan AAD table id.
- Jangan pernah mengembalikan ciphertext.
- Jika ciphertext invalid -> 409 `QR_TOKEN_UNAVAILABLE`.
- Jika key salah -> 500 tanpa detail.

## 14. Format lisensi

### Canonical payload

Urutan key rekursif:

```text
businessIdentifier
expiresAt
installationId
issuedAt
licenseId
```

Payload yang ditandatangani adalah stable JSON tanpa spasi.

### Public key

- Ed25519.
- Base64 DER SPKI di `RAVIKA_LICENSE_PUBLIC_KEY`.
- Public key fingerprint = SHA-256 DER hex.

### Signature

- Ed25519 signature base64url.
- Verifikasi dengan `crypto.verify(null, payload, publicKey, signature)`.

### Status

- `VALID`: signature valid, identitas cocok, expires > 30 hari.
- `EXPIRING`: expires <= 30 hari.
- `INVALID`: signature/identitas/expiry gagal.
- Tanpa file: placeholder `INVALID`.

### Penyimpanan

- Satu row lisensi aktif.
- Upsert berdasarkan business identifier.
- Jangan menyimpan private key.

## 15. Backup dan restore

### Backup

- `node:sqlite` `backup()` memberi snapshot konsisten WAL.
- File backup disimpan di `data/backups/`.
- Backup record menyimpan ukuran dan checksum.
- Jangan menghapus backup lama otomatis.
- Backup harus disalin ke media terpisah oleh operator.

### Restore

- Restore adalah operasi berisiko.
- Wajib permission `backup.restore` dan `confirm: true`.
- Validasi file dan integrity check.
- Tutup database.
- Copy file.
- Hapus WAL/SHM.
- Return restart required.
- Jangan lanjutkan request yang menyentuh database setelah restore.
- Dokumentasikan prosedur restart.

## 16. Seed data

### Development

- Business RAVIKA.
- Permission registry.
- Roles OWNER, CASHIER, BARISTA.
- Users:
  - owner@ravika.id / owner
  - cashier@ravika.id / cashier
  - barista@ravika.id / barista
- Password `demo123`.
- 5 kategori.
- 12 produk.
- Varian untuk produk tertentu.
- 4 add-on.
- 4 meja dengan QR hash + ciphertext.
- 24 order selama 7 hari.
- Payment campuran: paid, partial, unpaid.
- Status history.
- Tidak ada refund seed.

### Production

- Hanya owner pertama.
- Permission dan role system.
- Tidak ada katalog/order demo.
- Lisensi dari env jika ada, jika tidak placeholder invalid.

### Determinisme

- ID stabil.
- Seed idempotent.
- Password hash boleh berbeda.
- Jangan reset password user existing.
- Jangan duplikasi order/payment.

## 17. Keamanan dan rate limit

- Semua endpoint internal memakai session.
- Permission diperiksa server.
- Public endpoint hanya data publik.
- Public order tidak membuka ID internal berlebihan.
- Rate limit login dari Fase 5 tetap.
- Rate limit publik:
  - menu/status 60/menit/IP
  - create order 10/menit/IP
- In-memory, reset saat restart.
- `shortcut:` comment.
- Origin check untuk mutasi internal.
- Jangan log password/token/signature.
- Jangan kirim hash/ciphertext ke client.
- Jangan menerima `businessId` dari client.
- Jangan mempercayai total/harga/status dari client.
- Jangan menaruh file SQLite di network share.
- Jangan membuka SQLite ke client.

## 18. Testing

### Test wajib

| Area | Kasus |
| --- | --- |
| Users | create, update, last-owner guard, duplicate email/username |
| Roles | create, update, permission assignment, system code |
| Catalog | category reorder, product create/update, variant/add-on validation |
| Tables | create, QR regenerate, decrypt, invalid token |
| Orders | cashier create, QR create, totals, snapshots, table occupancy, cancel guard, idempotency |
| Payments | cash, digital verified, split, overpay rejected, status recalculation |
| Refund | full refund, double refund, partial order rejected, permission |
| KDS | valid/invalid transitions, completed, table sync |
| SSE | subscriber receives event, cleanup |
| Reports | totals, filters, top products |
| License | valid, expiring, invalid signature, expired, business mismatch |
| Backup | create, checksum, integrity, restore restart marker |

### Test data

- Database `:memory:`.
- Migration + seed helper.
- Fixed IDs untuk assertion.
- Jangan memakai sleep.
- Jangan memakai global singleton.
- Jangan memakai database production.

### Script

```json
{
  "test": "vitest run",
  "test:watch": "vitest"
}
```

## 19. Verifikasi dan acceptance criteria

### Perintah

```bash
pnpm check
pnpm test
pnpm build
```

### Manual flow

1. Hapus database.
2. Jalankan app.
3. Login owner.
4. Buat kategori dan produk.
5. Buat meja.
6. Ambil QR token.
7. Buka public menu.
8. Buat order QR.
9. Buat order kasir.
10. Catat pembayaran split.
11. Update KDS.
12. Cek SSE.
13. Refund order PAID.
14. Cek reports.
15. Cek license valid/invalid.
16. Buat backup.
17. Restore backup dan restart.
18. Cek health setelah restart.

### Acceptance

- [ ] Migration dari kosong.
- [ ] Seed demo idempotent.
- [ ] Users/roles/permissions API.
- [ ] Last-owner guard.
- [ ] Catalog CRUD dan snapshot.
- [ ] Table QR create/regenerate/public menu.
- [ ] Order kasir dan QR.
- [ ] Order number unik.
- [ ] Idempotency order/payment/refund.
- [ ] Split payment dan status.
- [ ] Full refund.
- [ ] KDS transitions dan SSE.
- [ ] Reports.
- [ ] License Ed25519.
- [ ] Backup dan restore.
- [ ] Permission di server.
- [ ] Public data aman.
- [ ] `pnpm check` PASS.
- [ ] `pnpm test` PASS.
- [ ] `pnpm build` PASS.
- [ ] UI existing tetap mock.

## 20. Risiko dan mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Refund API tanpa UI | Tidak bisa dipakai operator | Dokumentasikan; UI Fase 7 |
| SSE in-process | Tidak multi-process | Single process; upgrade shared transport |
| Restore menutup DB | Downtime | Restart procedure |
| QR key hilang | QR tidak bisa decrypt | Backup env key |
| License public key salah | License invalid | Validasi startup |
| Full seed besar | Migration/seed lambat | Test idempotent |
| Idempotency table tumbuh | Ukuran DB | TTL cleanup |
| Public endpoint abuse | Spam order | Rate limit |
| Report refunded order | Angka ambigu | Dokumentasikan gross vs paid |
| Node 26 non-LTS | Risiko produksi | Uji mesin pilot |

## 21. Urutan implementasi

### Task 0: Spec dan baseline

- Tulis spec ini.
- Branch `phase-6-backend-api-modules`.
- Catat baseline `c05faf1`.

### Task 1: Migration

- `refunds`
- `idempotency_keys`
- `tables.qr_token_ciphertext`
- Generate migration.
- Update schema types.

### Task 2: Shared infrastructure

- `withApi` dynamic params.
- Idempotency service.
- Audit log.
- Event bus.
- QR crypto.
- Stable JSON.
- Public rate limit.
- DTO mapper.
- Tests.

### Task 3: Users, roles, permissions

- Repositories.
- Services.
- Routes.
- Tests.

### Task 4: Catalog

- Categories.
- Products.
- Add-ons read-only.
- Tests.

### Task 5: Tables dan QR

- CRUD.
- QR encrypt/decrypt.
- Regenerate.
- Public menu.
- Tests.

### Task 6: Orders

- Create cashier.
- Create public QR.
- List/detail/history/payable.
- Cancel.
- Idempotency.
- Table occupancy.
- Tests.

### Task 7: Payments dan refund

- Split payment.
- Status recalculation.
- Full refund.
- Idempotency.
- Tests.

### Task 8: KDS dan SSE

- KDS list.
- Status transition.
- Event bus.
- SSE route.
- Tests.

### Task 9: Reports

- Summary.
- Sales.
- Top products.
- Tests.

### Task 10: License

- Ed25519 verify.
- File import.
- Status.
- Tests.

### Task 11: Backup dan restore

- Backup.
- Integrity check.
- Restore restart.
- Tests.

### Task 12: Full seed

- Demo catalog.
- Tables.
- Orders.
- Payments.
- Tests.

### Task 13: Verification dan docs

- `pnpm check`.
- `pnpm test`.
- `pnpm build`.
- Manual curl.
- Clean DB bootstrap.
- UI smoke.
- Update PRD/ROADMAP/AGENTS/README.
- Commit.
- Tag `phase-6-backend-modules`.

## 22. Definition of Done

- Semua acceptance criteria terpenuhi.
- Tidak ada endpoint di luar scope.
- Tidak ada perubahan UI.
- Semua mutasi kritikal memakai transaction dan audit log.
- Semua endpoint internal memakai permission.
- Semua public endpoint aman.
- Migration dan seed idempotent.
- `pnpm check`, `pnpm test`, `pnpm build` PASS.
- Dokumentasi diperbarui.
- Handoff Fase 7 jelas.

## 23. Handoff ke Fase 7

Fase 7 akan:

- Mengganti mock service dengan API client.
- Menambahkan TanStack Query.
- Menghubungkan auth session nyata.
- Menghubungkan seluruh modul.
- Menambahkan UI refund jika disetujui.
- Menambahkan SSE client.
- Menghapus mock data dari production path.

Fase 6 menyediakan:

- API seluruh modul.
- Contract stabil.
- Error RFC 9457.
- Idempotency.
- SSE.
- Seed demo.
- Test helper.

## Appendix A: Daftar endpoint

```text
GET    /api/users
POST   /api/users
GET    /api/users/:id
PATCH  /api/users/:id

GET    /api/roles
POST   /api/roles
PATCH  /api/roles/:id
PUT    /api/roles/:id/permissions
GET    /api/permissions

GET    /api/categories
POST   /api/categories
PATCH  /api/categories/:id
POST   /api/categories/:id/move

GET    /api/products
GET    /api/products/:id
POST   /api/products
PATCH  /api/products/:id
GET    /api/add-ons

GET    /api/tables
GET    /api/tables/:id
POST   /api/tables
PATCH  /api/tables/:id
POST   /api/tables/:id/regenerate-qr

GET    /api/orders
POST   /api/orders
GET    /api/orders/payable
GET    /api/orders/:id
GET    /api/orders/:id/history
GET    /api/orders/:id/payments
POST   /api/orders/:id/cancel
POST   /api/orders/:id/refund

GET    /api/payments
GET    /api/payments/:id
POST   /api/orders/:id/payments

GET    /api/kds/orders
POST   /api/kds/orders/:id/status
GET    /api/events

GET    /api/reports/summary
GET    /api/reports/sales
GET    /api/reports/top-products

GET    /api/licensing/status

GET    /api/backup
POST   /api/backup
POST   /api/backup/restore

GET    /api/public/menu/:token
POST   /api/public/orders
GET    /api/public/orders/:publicToken
```

## Appendix B: Permission matrix

| Endpoint group | Permission |
| --- | --- |
| Users read | `users.view` |
| Users write | `users.manage` |
| Roles write | `roles.manage` |
| Permissions write | `permissions.manage` |
| Categories read | `categories.view` |
| Categories write | `categories.manage` |
| Products read | `products.view` |
| Products write | `products.manage` |
| Tables read | `tables.view` |
| Tables write | `tables.manage` |
| Orders read | `orders.view` |
| Orders create | `orders.create` |
| Orders cancel | `orders.cancel` |
| Payments read | `payments.view` |
| Payments create | `payments.create` |
| Refund | `payments.refund` |
| KDS read | `kds.view` |
| KDS status | `kds.update_status` |
| Reports | `reports.view` |
| License | `license.view` |
| Backup | `backup.create` |
| Restore | `backup.restore` |

## Appendix C: Error code

| Code | Status | Arti |
| --- | --- | --- |
| `VALIDATION_FAILED` | 400 | Input invalid |
| `AUTH_SESSION_REQUIRED` | 401 | Session tidak ada |
| `AUTH_FORBIDDEN` | 403 | Permission kurang |
| `ORIGIN_FORBIDDEN` | 403 | Origin mutasi |
| `USER_NOT_FOUND` | 404 | User |
| `USER_EMAIL_CONFLICT` | 409 | Email/username |
| `LAST_OWNER_GUARD` | 409 | Owner terakhir |
| `ROLE_NOT_FOUND` | 404 | Role |
| `ROLE_CODE_IMMUTABLE` | 409 | Role system |
| `PERMISSION_UNKNOWN` | 400 | Permission code |
| `CATEGORY_NOT_FOUND` | 404 | Kategori |
| `PRODUCT_NOT_FOUND` | 404 | Produk |
| `PRODUCT_UNAVAILABLE` | 409 | Produk tidak tersedia |
| `VARIANT_INVALID` | 400 | Varian |
| `ADD_ON_INVALID` | 400 | Add-on |
| `TABLE_NOT_FOUND` | 404 | Meja |
| `TABLE_NOT_AVAILABLE` | 409 | Meja |
| `QR_TOKEN_UNAVAILABLE` | 409 | Ciphertext null |
| `QR_TOKEN_INVALID` | 404 | Token publik |
| `ORDER_NOT_FOUND` | 404 | Order |
| `ORDER_INVALID_STATE` | 409 | Status order |
| `ORDER_EMPTY` | 400 | Item kosong |
| `ORDER_TABLE_INVALID` | 400 | Tipe/meja |
| `ORDER_NUMBER_CONFLICT` | 409 | Nomor order |
| `PAYMENT_NOT_FOUND` | 404 | Payment |
| `PAYMENT_EXCEEDS_REMAINING` | 409 | Nominal |
| `PAYMENT_DIGITAL_UNVERIFIED` | 400 | Verifikasi digital |
| `ORDER_NOT_PAID` | 409 | Refund |
| `REFUND_ALREADY_EXISTS` | 409 | Refund ganda |
| `REFUND_NOT_ALLOWED` | 409 | Refund |
| `KDS_TRANSITION_INVALID` | 409 | Transisi |
| `IDEMPOTENCY_KEY_REQUIRED` | 400 | Header |
| `IDEMPOTENCY_KEY_REUSED` | 409 | Hash beda |
| `RATE_LIMITED` | 429 | Rate limit |
| `LICENSE_INVALID` | 409 | Lisensi |
| `LICENSE_EXPIRED` | 409 | Lisensi |
| `LICENSE_IDENTITY_MISMATCH` | 409 | Lisensi |
| `BACKUP_NOT_FOUND` | 404 | Backup |
| `BACKUP_INVALID` | 422 | Backup |
| `RESTORE_CONFIRMATION_REQUIRED` | 400 | Confirm |
| `DATABASE_UNAVAILABLE` | 503 | Database |
| `INTERNAL_ERROR` | 500 | Internal |

## Appendix D: Contoh request dan response

### Create order

```bash
curl -i -b cookies.txt \
  -X POST http://localhost:3000/api/orders \
  -H 'Content-Type: application/json' \
  -H 'Idempotency-Key: order-2026-11-17-0001' \
  -d '{
    "orderType":"DINE_IN",
    "tableId":"table-1",
    "notes":"",
    "items":[
      {"productId":"product-1","variantId":null,"addOnIds":[],"quantity":2,"notes":""}
    ]
  }'
```

### Create payment

```bash
curl -i -b cookies.txt \
  -X POST http://localhost:3000/api/orders/order-1/payments \
  -H 'Content-Type: application/json' \
  -H 'Idempotency-Key: payment-2026-11-17-0001' \
  -d '{"method":"CASH","amount":26000,"reference":"","notes":"","verified":false}'
```

### Refund

```bash
curl -i -b cookies.txt \
  -X POST http://localhost:3000/api/orders/order-1/refund \
  -H 'Content-Type: application/json' \
  -H 'Idempotency-Key: refund-2026-11-17-0001' \
  -d '{"reason":"Salah input"}'
```

### Public order

```bash
curl -i \
  -X POST http://localhost:3000/api/public/orders \
  -H 'Content-Type: application/json' \
  -H 'Idempotency-Key: public-order-0001' \
  -d '{
    "tableToken":"tbl-1-...",
    "notes":"",
    "items":[
      {"productId":"product-1","variantId":null,"addOnIds":[],"quantity":1,"notes":""}
    ]
  }'
```

## Appendix E: File map

### Baru

- `src/app/api/users/**`
- `src/app/api/roles/**`
- `src/app/api/permissions/route.ts`
- `src/app/api/categories/**`
- `src/app/api/products/**`
- `src/app/api/add-ons/route.ts`
- `src/app/api/tables/**`
- `src/app/api/orders/**`
- `src/app/api/payments/**`
- `src/app/api/kds/**`
- `src/app/api/events/route.ts`
- `src/app/api/reports/**`
- `src/app/api/licensing/**`
- `src/app/api/backup/**`
- `src/app/api/public/**`
- `src/modules/audit/**`
- `src/modules/backup/**`
- `src/modules/catalog/**`
- `src/modules/events/**`
- `src/modules/kds/**`
- `src/modules/licensing/**`
- `src/modules/orders/**`
- `src/modules/payments/**`
- `src/modules/reports/**`
- `src/modules/roles/**`
- `src/modules/tables/**`
- `src/modules/users/**`
- `src/shared/crypto/**`
- `src/shared/rate-limit.ts`
- `tests/integration/**`
- `docs/specification/phase-6-backend-api-modules.md`

### Diubah

- `src/infrastructure/database/schema/operations.ts`
- `src/infrastructure/database/schema/system.ts`
- `src/infrastructure/database/seed.ts`
- `src/infrastructure/database/client.ts`
- `src/shared/http/route-handler.ts`
- `src/types/domain.ts`
- `.env.example`
- `.gitignore`
- `docs/PRD.md`
- `docs/ROADMAP.md`
- `README.md`
- `AGENTS.md`

### Tidak diubah

- Semua halaman dan komponen UI.
- `src/mocks/**`.
- `src/features/**`.
- `src/components/**`.

## Appendix F: Checklist implementasi

- [ ] Spec disetujui.
- [ ] Branch dibuat.
- [ ] Migration dibuat.
- [ ] `refunds` dibuat.
- [ ] `idempotency_keys` dibuat.
- [ ] `qr_token_ciphertext` dibuat.
- [ ] Shared route wrapper dynamic params.
- [ ] Idempotency service.
- [ ] Audit log.
- [ ] Event bus.
- [ ] QR crypto.
- [ ] Stable JSON.
- [ ] Public rate limit.
- [ ] Users/roles/permissions.
- [ ] Catalog.
- [ ] Tables/QR/public menu.
- [ ] Orders.
- [ ] Payments/refund.
- [ ] KDS/SSE.
- [ ] Reports.
- [ ] License.
- [ ] Backup/restore.
- [ ] Full seed.
- [ ] Tests.
- [ ] `pnpm check` PASS.
- [ ] `pnpm test` PASS.
- [ ] `pnpm build` PASS.
- [ ] Manual flow PASS.
- [ ] UI smoke PASS.
- [ ] Docs updated.
- [ ] Commit.
- [ ] Tag `phase-6-backend-modules`.
