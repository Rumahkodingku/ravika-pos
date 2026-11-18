# RAVIKA POS - Spesifikasi Fase 7: Frontend-Backend Integration

**Status:** Implemented dan terverifikasi. Automated gates, manual smoke, dan final review lulus.
**Milestone:** M7 - Integration Complete
**Fase:** 7, Frontend-Backend Integration
**Tanggal:** 18 November 2026
**Baseline backend:** `phase-6-backend-modules`
**Tag backend:** `phase-6-backend-modules`
**Referensi utama:** `docs/PRD.md`, `docs/ROADMAP.md`, `docs/specification/phase-5-backend-foundation.md`, `docs/specification/phase-6-backend-api-modules.md`, `docs/design/ui-ux-guidelines.md`

## Daftar isi

- [0. Agent quick start](#0-agent-quick-start)
- [1. Ringkasan](#1-ringkasan)
- [2. Goals, non-goals, dan anti-goals](#2-goals-non-goals-dan-anti-goals)
- [3. Keputusan yang dikunci](#3-keputusan-yang-dikunci)
- [4. Scope dan deliverable](#4-scope-dan-deliverable)
- [5. Arsitektur integrasi](#5-arsitektur-integrasi)
- [6. Struktur direktori target](#6-struktur-direktori-target)
- [7. Kontrak API](#7-kontrak-api)
- [8. Tipe data dan mapping](#8-tipe-data-dan-mapping)
- [9. Query key dan invalidasi](#9-query-key-dan-invalidasi)
- [10. Auth, session, dan permission](#10-auth-session-dan-permission)
- [11. Integrasi per modul](#11-integrasi-per-modul)
- [12. Perubahan UI minimum](#12-perubahan-ui-minimum)
- [13. Penghapusan mock dan design system](#13-penghapusan-mock-dan-design-system)
- [14. Testing](#14-testing)
- [15. Keamanan dan idempotency](#15-keamanan-dan-idempotency)
- [16. Performa dan caching](#16-performa-dan-caching)
- [17. Urutan implementasi](#17-urutan-implementasi)
- [18. Verifikasi manual](#18-verifikasi-manual)
- [19. Acceptance criteria](#19-acceptance-criteria)
- [20. Risiko dan mitigasi](#20-risiko-dan-mitigasi)
- [21. Definition of Done](#21-definition-of-done)
- [22. Handoff ke Fase 8](#22-handoff-ke-fase-8)
- [Appendix A: File map](#appendix-a-file-map)
- [Appendix B: Contoh request dan response](#appendix-b-contoh-request-dan-response)
- [Appendix C: Checklist implementasi](#appendix-c-checklist-implementasi)

## 0. Agent quick start

Baca dokumen ini sebelum menulis kode Fase 7.

Aturan wajib:

1. Fase 7 mengganti mock dengan API nyata. Jangan redesign halaman atau shell yang sudah approved.
2. Gunakan TanStack Query untuk seluruh server state. Jangan menambahkan Zustand.
3. Jangan memanggil `fetch` langsung dari halaman atau komponen. Gunakan API client di `src/lib/api`.
4. Jangan memakai optimistic update untuk order, payment, atau refund. Server adalah sumber kebenaran.
5. Semua mutasi order, public order, payment, dan refund wajib mengirim `Idempotency-Key`.
6. Session internal memakai cookie HttpOnly dari backend. Jangan menyimpan user atau permission di `sessionStorage`.
7. Guard halaman dan shell memakai permission, bukan nama role.
8. Backend boleh diubah hanya secara aditif. Jangan mengubah perilaku endpoint Fase 6.
9. Tidak ada migration database baru di Fase 7 kecuali ditemukan bug data yang disetujui product owner.
10. Mock store, mock auth, mock controls, dan `/app/design-system` harus dihapus dari production path.
11. Jangan menampilkan “Data simulasi”, “Data contoh”, atau “Mode UI” setelah integrasi selesai.
12. Pertahankan pemisahan status pembayaran dan status persiapan.
13. Jangan menambah endpoint yang tidak dipakai UI atau PRD.
14. Jalankan `pnpm check`, `pnpm test`, dan `pnpm build` sebelum menyatakan selesai.
15. Jika ada konflik antara dokumen ini dan PRD, berhenti dan minta keputusan product owner.

## 1. Ringkasan

Fase 7 menghubungkan UI yang sudah disetujui ke API Fase 6.

Hasil akhir:

- Login, logout, session, permission, dan ganti kata sandi memakai backend nyata.
- Business, users, roles, permissions, catalog, tables, orders, payments, refund, KDS, reports, license, dan backup memakai data SQLite.
- POS, KDS, QR menu, dan halaman status pelanggan memakai data nyata.
- KDS memakai SSE dan refetch setelah reconnect.
- Public order status memakai polling.
- Role custom dapat dibuat dan ditetapkan ke pengguna.
- Refund penuh tersedia dari detail order.
- Restore database memunculkan layar restart yang memblokir operasi.
- Mock layer dan halaman design-system dihapus.
- Test unit, integration backend, dan RTL untuk alur kritis tersedia.

Fase 7 tidak menambah fitur bisnis baru. Perubahan UI hanya untuk menutup alur yang belum ada dan menghapus label simulasi.

## 2. Goals, non-goals, dan anti-goals

### Goals

- Seluruh halaman internal memakai cookie session dan permission server.
- Seluruh server state memakai TanStack Query.
- Mutasi memakai invalidasi query yang konsisten.
- Data order dan payment tidak pernah dianggap berhasil sebelum response server.
- POS dan KDS memulihkan data setelah koneksi kembali.
- Pemilik dapat mengelola role custom dan menetapkannya ke pengguna.
- Refund penuh dapat dilakukan dari UI.
- Restore database memiliki UX yang jujur dan aman.
- Public menu menampilkan add-on yang dapat dipilih.
- Mock layer hilang dari production path.
- Test alur kritis tersedia sebelum handoff.

### Non-goals

- Tidak ada redesign visual.
- Tidak ada Playwright E2E. Itu Fase 8.
- Tidak ada PWA, service worker, atau offline transaction.
- Tidak ada payment gateway.
- Tidak ada takeaway QR.
- Tidak ada refund sebagian.
- Tidak ada upload gambar produk.
- Tidak ada perubahan schema database.
- Tidak ada Zustand.
- Tidak ada server prefetch atau hydration TanStack Query.
- Tidak ada SSE publik.

### Anti-goals

- Jangan mempertahankan dua sumber data setelah modul dimigrasikan.
- Jangan menyimpulkan status transaksi dari state lokal.
- Jangan menampilkan tombol yang permission-nya tidak dimiliki.
- Jangan mengandalkan penyembunyian tombol sebagai keamanan.
- Jangan menyimpan password, token, atau signature di log.
- Jangan mengubah data historis order.
- Jangan membuat abstraksi generik yang belum dipakai.
- Jangan menambahkan dependency di luar daftar Fase 7.

## 3. Keputusan yang dikunci

| ID    | Keputusan                                | Alasan                                                     |
| ----- | ---------------------------------------- | ---------------------------------------------------------- |
| P7-01 | Backend boleh berubah aditif             | Menutup gap kontrak tanpa request tambahan yang rapuh      |
| P7-02 | TanStack Query untuk server state        | Cache, invalidasi, loading, dan retry konsisten            |
| P7-03 | Tanpa Zustand                            | Client state yang ada cukup memakai React state/context    |
| P7-04 | Client-only query                        | UI approved memakai skeleton; menghindari kompleksitas SSR |
| P7-05 | Cookie session dari backend              | Session nyata, HttpOnly, dapat dicabut                     |
| P7-06 | Guard berbasis permission                | Role custom tidak lagi terkunci pada tiga role bawaan      |
| P7-07 | Role assignment dinamis                  | Backend dan halaman role sudah mendukung role custom       |
| P7-08 | Refund penuh dari detail order           | Backend sudah menyediakan endpoint refund penuh            |
| P7-09 | Public order status polling 10 detik     | Tidak perlu endpoint SSE publik baru                       |
| P7-10 | Restore memakai layar restart blocking   | Database ditutup; operasi lanjutan tidak boleh dianggap aman |
| P7-11 | Mock dan design-system dihapus           | Tidak ada data simulasi pada production path               |
| P7-12 | RTL untuk alur kritis                    | Playwright baru tersedia di Fase 8                         |
| P7-13 | Tidak ada migration baru                 | Semua perubahan backend berupa response dan query          |
| P7-14 | Panel akun demo dihapus sepenuhnya       | Kredensial demo tidak boleh tampil di UI                   |

## 4. Scope dan deliverable

### Deliverable

1. Dependency TanStack Query dan test harness RTL.
2. API client, error mapping, query key factory, dan idempotency helper.
3. Session provider, server layout guard, login, logout, dan ganti kata sandi.
4. Integrasi business, users, roles, permissions.
5. Integrasi categories, products, add-ons.
6. Integrasi tables dan QR.
7. Integrasi orders, payments, refund.
8. Integrasi POS.
9. Integrasi KDS dan SSE.
10. Integrasi public menu, public order, dan public status.
11. Integrasi dashboard, reports, license, backup.
12. Restart-required screen setelah restore.
13. Role dinamis.
14. Perubahan kontrak backend aditif.
15. Penghapusan mock store, mock auth, mock controls, dan design-system.
16. Test unit, integration, RTL, dan manual smoke.
17. Dokumentasi PRD, ROADMAP, AGENTS, README, dan spec ini.

### Dependency

- Fase 5 backend foundation selesai.
- Fase 6 backend API modules selesai.
- UI Fase 4 approved.
- Node 26.9.0.
- pnpm 10.34.5.
- Akses ke SQLite lokal melalui backend.

### Tidak termasuk

- Playwright E2E.
- Load testing.
- Installer dan packaging.
- HTTPS LAN.
- Perubahan model data.
- Perubahan business rule.
- UI takeaway QR.
- UI refund sebagian.

## 5. Arsitektur integrasi

### 5.1 Alur request

```text
Page/Component
  -> domain query/mutation hook
  -> apiFetch
  -> Route Handler
  -> application service
  -> repository
  -> Drizzle
  -> SQLite
  -> JSON response / Problem Details
  -> TanStack Query cache
  -> UI
```

### 5.2 Lapisan frontend

| Lapisan        | Lokasi                          | Tanggung jawab                                      |
| -------------- | ------------------------------- | --------------------------------------------------- |
| API client     | `src/lib/api`                   | Fetch, JSON, Problem Details, 401 event, idempotency |
| Query keys     | `src/lib/api/keys.ts`           | Identitas cache yang stabil                         |
| Domain hooks   | `src/features/**/api.ts`        | Query, mutation, invalidasi                         |
| Session        | `src/features/auth`             | User, permission, login, logout, ganti kata sandi  |
| Pages          | `src/app/**`                    | Komposisi UI dan state lokal                        |
| Presentational | `src/components`, `src/features` | Tidak tahu sumber data                             |

### 5.3 Aturan query

- Server state tidak disalin ke state lokal jangka panjang.
- Filter, halaman, dan dialog tetap memakai React state.
- Query key wajib berasal dari factory. Jangan menulis array key literal di halaman.
- Mutation tidak memakai optimistic update untuk data finansial.
- Mutation menunggu response server sebelum toast sukses.
- Query yang gagal menampilkan `ErrorState` dengan retry.
- 404 pada resource publik menampilkan empty state, bukan error generik.

### 5.4 Aturan API client

`apiFetch<T>(path, init?)`:

- Prefix `/api`.
- `credentials: "same-origin"`.
- `accept: application/json`.
- Body object diubah menjadi JSON dan diberi `content-type`.
- Response 204 menghasilkan `undefined`.
- Response non-2xx diparse sebagai Problem Details.
- 401 memicu event `ravika:unauthorized`.
- Error jaringan dilempar sebagai `ApiError` dengan status 0 dan pesan koneksi.

Jangan memakai `fetch` langsung di halaman, kecuali health poll restore yang bersifat publik dan tidak membutuhkan session.

### 5.5 Penanganan error

| Status | Perilaku UI                                                    |
| ------ | -------------------------------------------------------------- |
| 400    | Tampilkan pesan validasi pada field atau root form             |
| 401    | Clear cache dan redirect ke login, kecuali sudah di login      |
| 403    | Tampilkan permission denied atau pesan akses ditolak           |
| 404    | Empty/not found state; public token invalid memakai empty state |
| 409    | Tampilkan konflik state atau idempotency                       |
| 422    | Tampilkan aturan bisnis pada form atau toast                   |
| 429    | Tampilkan pesan coba lagi nanti                                |
| 500    | Tampilkan error umum, tanpa stack trace                        |
| 503    | Tampilkan layanan/database tidak tersedia                      |

Semua pesan fallback berbahasa Indonesia. Detail dari server dipakai bila aman dan tersedia.

### 5.6 Batas state

- Session: server layout + client session provider.
- POS cart: sessionStorage dan React context, tetap dipertahankan.
- Filter dan pagination: React state halaman.
- Dialog: React state halaman.
- Server state: TanStack Query.
- Restart required: localStorage + provider global.
- Theme: tetap seperti sekarang.

## 6. Struktur direktori target

```text
src/
├── app/
│   ├── providers.tsx
│   ├── (auth)/
│   ├── (dashboard)/app/
│   ├── (cashier)/app/pos/
│   ├── (kds)/kds/
│   └── (customer)/
├── features/
│   ├── auth/
│   │   ├── api.ts
│   │   ├── session-provider.tsx
│   │   ├── server-session.ts
│   │   ├── landing.ts
│   │   ├── login-form.tsx
│   │   └── change-password-dialog.tsx
│   ├── management/
│   │   ├── api/
│   │   │   ├── business.ts
│   │   │   ├── users.ts
│   │   │   ├── roles.ts
│   │   │   ├── catalog.ts
│   │   │   ├── tables.ts
│   │   │   ├── orders.ts
│   │   │   ├── payments.ts
│   │   │   ├── reports.ts
│   │   │   └── system.ts
│   │   └── ...
│   ├── operational/
│   │   ├── api.ts
│   │   └── use-connection-status.ts
│   ├── kds/
│   │   ├── api.ts
│   │   └── use-kds-events.ts
│   ├── customer/
│   │   └── api.ts
│   └── system/
│       └── restart-required.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   ├── errors.ts
│   │   ├── keys.ts
│   │   └── idempotency.ts
│   └── navigation.ts
├── types/
│   ├── api.ts
│   ├── auth.ts
│   └── domain.ts
└── ...
```

Folder `src/mocks` tidak boleh ada setelah Fase 7 selesai.

## 7. Kontrak API

Semua endpoint di bawah sudah ada di Fase 6, kecuali yang ditandai **aditif**.

### 7.1 Auth dan session

| Method | Endpoint                   | Akses            | Body                          |
| ------ | -------------------------- | ---------------- | ----------------------------- |
| POST   | `/api/auth/login`          | Publik, limited  | identity, password, remember? |
| POST   | `/api/auth/logout`         | Session opsional | -                             |
| GET    | `/api/auth/me`             | Session          | -                             |
| POST   | `/api/auth/change-password` | Session          | currentPassword, newPassword  |

`SessionUser`:

```json
{
  "id": "user-owner",
  "name": "Rina Pemilik",
  "email": "owner@ravika.id",
  "username": "owner",
  "role": "OWNER",
  "roleLabel": "Pemilik",
  "permissions": ["dashboard.view", "orders.view"]
}
```

`role` adalah kode role. Jangan memakai union tiga role di frontend setelah role custom didukung.

### 7.2 Business

| Method | Endpoint        | Permission      |
| ------ | --------------- | --------------- |
| GET    | `/api/business` | business.view   |
| PATCH  | `/api/business` | business.update |

Body PATCH: `name`, `code`, `address`, `phone`.

### 7.3 Users, roles, permissions

| Method | Endpoint                     | Permission          |
| ------ | ---------------------------- | ------------------- |
| GET    | `/api/users`                 | users.view          |
| POST   | `/api/users`                 | users.manage        |
| GET    | `/api/users/:id`             | users.view          |
| PATCH  | `/api/users/:id`             | users.manage        |
| GET    | `/api/roles`                 | roles.manage        |
| GET    | `/api/roles/options`         | users.view, aditif  |
| POST   | `/api/roles`                 | roles.manage        |
| PATCH  | `/api/roles/:id`             | roles.manage        |
| PUT    | `/api/roles/:id/permissions` | permissions.manage  |
| GET    | `/api/permissions`           | permissions.manage  |

`ManagementUser`:

```json
{
  "id": "user-cashier",
  "name": "Bagas Kasir",
  "email": "cashier@ravika.id",
  "username": "cashier",
  "role": "CASHIER",
  "roleLabel": "Kasir",
  "isActive": true,
  "createdAt": "2026-11-17T00:00:00.000Z",
  "updatedAt": "2026-11-17T00:00:00.000Z"
}
```

`RoleOption`:

```json
{ "id": "role-cashier", "code": "CASHIER", "name": "Kasir" }
```

Aturan UI:

- Create user wajib mengirim password minimum 8 karakter.
- Edit user tidak mengirim password.
- Email dan username lowercase.
- Role diambil dari role options.
- Last owner guard tetap ditampilkan dari error server.
- Update role memakai PATCH lalu PUT permission.

### 7.4 Catalog

| Method | Endpoint                   | Permission        |
| ------ | -------------------------- | ----------------- |
| GET    | `/api/categories`          | categories.view   |
| POST   | `/api/categories`          | categories.manage |
| PATCH  | `/api/categories/:id`      | categories.manage |
| POST   | `/api/categories/:id/move` | categories.manage |
| GET    | `/api/products`            | products.view     |
| GET    | `/api/products/:id`        | products.view     |
| POST   | `/api/products`            | products.manage   |
| PATCH  | `/api/products/:id`        | products.manage   |
| GET    | `/api/add-ons`             | products.view     |

Product PATCH memakai payload penuh yang strict. Jangan mengirim `businessId`, `createdAt`, atau `updatedAt`.

### 7.5 Tables dan QR

| Method | Endpoint                        | Permission    |
| ------ | ------------------------------- | ------------- |
| GET    | `/api/tables`                   | tables.view   |
| GET    | `/api/tables/:id`               | tables.view   |
| POST   | `/api/tables`                   | tables.manage |
| PATCH  | `/api/tables/:id`               | tables.manage |
| POST   | `/api/tables/:id/regenerate-qr` | tables.manage |

`TableSummary`:

```json
{
  "id": "table-1",
  "name": "Meja 01",
  "status": "AVAILABLE",
  "isActive": true,
  "activeOrderCount": 0,
  "createdAt": "2026-11-17T00:00:00.000Z",
  "updatedAt": "2026-11-17T00:00:00.000Z"
}
```

`activeOrderCount` adalah field **aditif**. List tidak mengembalikan `qrToken`. Detail mengembalikan token hasil decrypt. Regenerate mengembalikan `{ table, qrToken }`.

PATCH table hanya mengirim `{ name, status, isActive }`.

### 7.6 Orders

| Method | Endpoint                   | Permission        |
| ------ | -------------------------- | ----------------- |
| GET    | `/api/orders`              | orders.view       |
| POST   | `/api/orders`              | orders.create     |
| GET    | `/api/orders/payable`      | payments.view     |
| GET    | `/api/orders/:id`          | orders.view       |
| GET    | `/api/orders/:id/history`  | orders.view       |
| GET    | `/api/orders/:id/payments` | payments.view     |
| POST   | `/api/orders/:id/cancel`   | orders.cancel     |
| POST   | `/api/orders/:id/refund`   | payments.refund   |

Create order wajib memakai `Idempotency-Key`.

Order DTO memuat `tableName` dan `createdByName`. UI tidak perlu mencari nama meja atau user dari store.

History DTO memuat `changedByName` **aditif**.

### 7.7 Payments dan refund

| Method | Endpoint                   | Permission      |
| ------ | -------------------------- | --------------- |
| GET    | `/api/payments`            | payments.view   |
| GET    | `/api/payments/:id`        | payments.view   |
| POST   | `/api/orders/:id/payments` | payments.create |
| POST   | `/api/orders/:id/refund`   | payments.refund |

Payment DTO memuat field **aditif**:

- `orderNumber`
- `recordedByName`

Search payment mencakup nomor pesanan, reference, dan notes.

`POST /api/orders/:id/payments` tetap mengembalikan `Payment`. Client melakukan refetch order dan payments setelah sukses.

Aturan refund:

- Hanya order `PAID`.
- Semua payment `RECORDED`.
- Full-order refund.
- Reason minimum 3 karakter.
- `Idempotency-Key` wajib.
- Setelah sukses, invalidasi order, payments, payable, KDS, tables, dashboard, dan reports.

### 7.8 KDS dan SSE

| Method | Endpoint                     | Permission          |
| ------ | ---------------------------- | ------------------- |
| GET    | `/api/kds/orders`            | kds.view            |
| POST   | `/api/kds/orders/:id/status` | kds.update_status   |
| GET    | `/api/events`                | kds.view, SSE       |

SSE event yang dipakai:

- `order.created`
- `order.status_changed`
- `payment.status_changed`
- `order.refunded`

Client tidak memakai payload event sebagai data final. Client melakukan invalidasi dan refetch KDS.

### 7.9 Reports

| Method | Endpoint                                          | Permission    |
| ------ | ------------------------------------------------- | ------------- |
| GET    | `/api/reports/summary?range=today\|7d\|30d`       | reports.view  |
| GET    | `/api/reports/sales?dateFrom&dateTo`              | reports.view  |
| GET    | `/api/reports/top-products?dateFrom&dateTo&limit` | reports.view  |

Response mengikuti `DashboardSummary` dan `SalesReport` yang sudah ada.

### 7.10 License

| Method | Endpoint                | Permission    |
| ------ | ----------------------- | ------------- |
| GET    | `/api/licensing/status` | license.view  |

UI wajib menampilkan `validationMessage`, `expiresAt`, dan `publicKeyFingerprint`.

### 7.11 Backup dan restore

| Method | Endpoint              | Permission      |
| ------ | --------------------- | --------------- |
| GET    | `/api/backup`         | backup.create   |
| POST   | `/api/backup`         | backup.create   |
| POST   | `/api/backup/restore` | backup.restore  |

Restore body: `{ backupId, confirm: true }`.

Response restore:

```json
{ "restored": true, "restartRequired": true }
```

### 7.12 Public

| Method | Endpoint                          | Akses          |
| ------ | --------------------------------- | -------------- |
| GET    | `/api/public/menu/:token`         | Publik, 60/menit |
| POST   | `/api/public/orders`              | Publik, 10/menit |
| GET    | `/api/public/orders/:publicToken` | Publik, 60/menit |

Public menu response mendapat field **aditif**:

```json
{
  "business": { "name": "RAVIKA", "address": "Jakarta Selatan" },
  "table": { "id": "table-1", "name": "Meja 01" },
  "categories": [{ "id": "category-kopi", "name": "Kopi" }],
  "products": [],
  "addOns": [
    { "id": "addon-extra-shot", "name": "Extra Shot", "price": 5000, "isActive": true }
  ]
}
```

`products[].addOns` tetap berisi relasi min/max. `addOns` top-level berisi detail nama dan harga.

Public order create response:

```json
{
  "orderNumber": "RVK-2025",
  "publicToken": "pub-...",
  "grandTotal": 26000,
  "tableName": "Meja 01"
}
```

Public order status memuat nomor, status persiapan, status pembayaran, total, nama meja, waktu, dan item. Jangan menampilkan user internal, `businessId`, atau order lain.

### 7.13 Ringkasan perubahan backend aditif

| Area             | Perubahan                                                    |
| ---------------- | ------------------------------------------------------------ |
| Users            | `roleLabel` pada DTO                                          |
| Roles            | `GET /api/roles/options` dengan permission `users.view`       |
| Tables           | `activeOrderCount` pada list                                  |
| Public menu      | `addOns` top-level detail aktif                               |
| Payments         | `orderNumber`, `recordedByName`, search nomor pesanan         |
| Order payments   | `recordedByName`                                              |
| Order history    | `changedByName`                                               |

Tidak ada migration. Tidak ada endpoint yang dihapus. Tidak ada perubahan status code atau business rule.

## 8. Tipe data dan mapping

### 8.1 Perubahan tipe domain

| Tipe                  | Perubahan                                                     |
| --------------------- | ------------------------------------------------------------- |
| `SessionUser`         | `role: string`, `roleLabel: string`                           |
| `ManagementUser`      | `role: string`, `roleLabel: string`, `username?`              |
| `DiningTable`         | tetap untuk detail dengan `qrToken`                           |
| `TableSummary`        | baru: `Omit<DiningTable, "qrToken"> & { activeOrderCount: number }` |
| `Payment`             | `orderNumber?`, `recordedByName?`                             |
| `OrderStatusHistory`  | `changedByName?`                                              |
| `RoleOption`          | baru: `{ id, code, name }`                                    |
| `PublicMenuResponse`  | baru: business, table, categories, products, addOns           |
| `PublicOrderCreated`  | baru: orderNumber, publicToken, grandTotal, tableName         |
| `PublicOrderStatus`   | baru: status publik dan item tanpa data internal              |

### 8.2 Aturan mapping

- Jangan memakai tipe mock sebagai kontrak API.
- DTO API dipetakan ke tipe domain di API layer.
- Jangan mengirim field DTO yang tidak ada di schema Zod backend.
- Field tanggal tetap ISO string di client.
- Uang tetap integer rupiah.
- Status pembayaran dan persiapan tetap terpisah.
- `roleLabel` dipakai untuk tampilan. `role` dipakai untuk request.

## 9. Query key dan invalidasi

### 9.1 Query key factory

```ts
export const queryKeys = {
  business: ["business"] as const,
  users: (filters: UserListParams) => ["users", filters] as const,
  user: (id: string) => ["users", "detail", id] as const,
  roles: ["roles"] as const,
  roleOptions: ["roles", "options"] as const,
  permissions: ["permissions"] as const,
  categories: (filters: CategoryListParams) => ["categories", filters] as const,
  products: (filters: ProductListParams) => ["products", filters] as const,
  product: (id: string) => ["products", "detail", id] as const,
  addOns: ["add-ons"] as const,
  tables: (filters: TableListParams) => ["tables", filters] as const,
  table: (id: string) => ["tables", "detail", id] as const,
  orders: (filters: OrderListParams) => ["orders", filters] as const,
  order: (id: string) => ["orders", "detail", id] as const,
  orderHistory: (id: string) => ["orders", id, "history"] as const,
  orderPayments: (id: string) => ["orders", id, "payments"] as const,
  payableOrders: ["orders", "payable"] as const,
  payments: (filters: PaymentListParams) => ["payments", filters] as const,
  payment: (id: string) => ["payments", "detail", id] as const,
  kds: ["kds"] as const,
  reportSummary: (range: string) => ["reports", "summary", range] as const,
  salesReport: (filters: SalesReportParams) => ["reports", "sales", filters] as const,
  topProducts: (filters: TopProductsParams) => ["reports", "top-products", filters] as const,
  license: ["license"] as const,
  backups: ["backups"] as const,
  publicMenu: (token: string) => ["public", "menu", token] as const,
  publicOrder: (token: string) => ["public", "order", token] as const,
};
```

### 9.2 Invalidasi wajib

| Mutasi                          | Invalidasi                                                                 |
| ------------------------------- | -------------------------------------------------------------------------- |
| Business update                 | `business`                                                                 |
| User create/update              | `users`, `user(id)`, `roles/options`; `router.refresh()` bila current user |
| Role create/update              | `roles`, `roleOptions`, `users`, `router.refresh()`                        |
| Role permission set             | `roles`, `roleOptions`, `users`, `permissions`, `router.refresh()`         |
| Category create/update/move     | `categories`, `products`                                                   |
| Product create/update/flags     | `products`, `product(id)`, `categories`                                    |
| Table create/update             | `tables`, `table(id)`                                                      |
| Table regenerate QR             | `tables`, `table(id)`                                                      |
| Order create                    | `orders`, `payableOrders`, `kds`, `tables`, `reports`                      |
| Order cancel                    | `orders`, `order(id)`, `kds`, `tables`, `reports`                          |
| KDS status                      | `kds`, `orders`, `order(id)`, `tables`, `reports`                          |
| Payment create                  | `orders`, `order(id)`, `orderPayments(id)`, `payableOrders`, `payments`, `kds`, `reports` |
| Refund                          | seluruh invalidasi payment + `order(id)` + `payments`                      |
| Backup create                   | `backups`                                                                  |
| License refresh                 | `license`                                                                  |
| SSE event                       | `kds`                                                                      |
| Public order create             | tidak ada cache internal; simpan response untuk dialog                     |

Gunakan prefix invalidation untuk key yang memiliki turunan, misalnya `["orders"]` untuk detail, history, dan payments.

## 10. Auth, session, dan permission

### 10.1 Login

- Form mengirim `identity`, `password`, dan `remember`.
- Identity boleh email atau username.
- Password input minimum 6 karakter di client; server tetap otoritatif.
- Pesan gagal login generik: tidak membocorkan mana yang salah.
- Setelah sukses, clear cache lama, lalu redirect berdasarkan permission.
- Panel akun demo dan tombol isi akun dihapus.

### 10.2 Landing path

Urutan:

1. `dashboard.view` -> `/app`
2. `orders.create` -> `/app/pos`
3. `kds.view` -> `/kds`
4. Selain itu -> `/login?error=forbidden`

### 10.3 Layout guard

| Layout        | Syarat akses                                      |
| ------------- | ------------------------------------------------- |
| Management    | Terautentikasi                                    |
| POS           | `orders.create` atau `payments.view`              |
| KDS           | `kds.view`                                        |
| Customer      | Publik                                            |

Guard memakai permission, bukan nama role. Halaman tetap memakai `RequirePermission`.

### 10.4 Session provider

- Layout server memanggil `getSessionUser()`.
- Jika 401, redirect `/login`.
- Jika error database/internal, jangan redirect; biarkan error boundary.
- Client `SessionProvider` menerima user awal.
- `useSession` dipakai shell, permission gate, dan dialog.
- `router.refresh()` dipakai setelah perubahan role atau permission user saat ini.

### 10.5 Logout

- POST logout.
- Clear query cache.
- Redirect `/login`.
- Cart POS dibersihkan bila user logout.

### 10.6 Ganti kata sandi

- Dialog dari user menu management.
- Field current, new, confirm.
- New minimum 8 karakter.
- Confirm harus sama.
- Sukses: toast, dialog tutup, sesi saat ini tetap aktif.
- Backend mencabut session lain.

### 10.7 401 global

- Event `ravika:unauthorized`.
- Clear cache.
- Redirect login dengan `next` bila aman.
- Jangan redirect berulang saat sudah di `/login`.

## 11. Integrasi per modul

### 11.1 Business dan settings

- `GET /api/business` mengisi nama bisnis di shell dan settings.
- `PATCH /api/business` memakai payload strict.
- Setelah update, invalidasi `business`.
- Hapus label simulasi dari halaman settings.

### 11.2 Users

- List memakai pagination, search, role filter, active filter.
- Create mengirim password minimum 8.
- Edit tidak mengirim password.
- Role select dari `/api/roles/options`.
- Error email/username duplikat tampil di form.
- Last owner guard tampil dari server.
- Setelah update current user, `router.refresh()`.

### 11.3 Roles dan permissions

- Daftar role dari API.
- Permission matrix dari `/api/permissions`.
- Create role mengirim permissionCodes.
- Edit role memakai PATCH lalu PUT permission.
- Role sistem: kode tidak dapat diubah.
- Role custom dapat ditetapkan ke user.
- Setelah perubahan, invalidasi users dan refresh session.

### 11.4 Catalog

- Categories dan products memakai pagination/filter server.
- Move category memakai endpoint move.
- Product create/update mengirim variants dan add-on relations.
- Toggle active/availability mengambil detail lalu PATCH payload strict.
- Add-on hanya read-only.
- Hapus label simulasi.

### 11.5 Tables dan QR

- List memakai `TableSummary` dan `activeOrderCount`.
- Detail drawer memanggil `GET /api/tables/:id` untuk token QR.
- Create/regenerate menampilkan token mentah satu kali.
- Regenerate mengganti QR yang terlihat.
- Table picker POS memakai `activeOrderCount`.
- Jangan menampilkan ciphertext atau hash.

### 11.6 Orders

- List memakai filter server.
- Detail memakai `order.tableName` dan `createdByName`.
- History dan payments dimuat terpisah.
- Cancel hanya untuk status yang diizinkan dan tanpa payment `RECORDED`.
- Cancel setelah refund penuh diperbolehkan bila status masih memenuhi aturan backend.
- Hapus lookup meja/user dari mock store.

### 11.7 Refund

- Tombol hanya muncul untuk order `PAID` dan permission `payments.refund`.
- Dialog meminta alasan minimum 3 karakter.
- Konfirmasi menjelaskan refund penuh.
- Response sukses menampilkan status `REFUNDED`.
- Double refund ditolak server dan ditampilkan.
- `Idempotency-Key` wajib.

### 11.8 Payments

- List read-only.
- Search memakai nomor pesanan.
- Detail menampilkan `orderNumber` dan `recordedByName`.
- Status `REFUNDED` tetap terlihat.
- Tidak ada tombol refund dari halaman Payments; refund dari detail order.

### 11.9 POS

- Katalog, kategori, add-on, meja, business, dan payable orders memakai query.
- Cart tetap memakai sessionStorage.
- Checkout mengirim `CASHIER`.
- Server menghitung ulang seluruh harga.
- Payment drawer memuat sisa tagihan dari server.
- Digital wajib verified.
- Cash memakai nilai diterapkan; kelebihan tidak dikirim.
- Split payment didukung.
- `ConnectionIndicator` memakai status nyata.
- Setelah order/payment, invalidasi cache terkait.
- Toast sukses hanya setelah response sukses.

### 11.10 KDS

- Queue dari `/api/kds/orders`.
- Active dan completed dipisah sesuai backend.
- Status transition hanya maju.
- Table name dari order.
- SSE menginvalidasi KDS.
- Reconnect memicu refetch.
- `ConnectionIndicator` memakai status SSE.
- CANCELLED tidak ditampilkan sebagai pekerjaan aktif.
- Completed maksimal 10 dari backend.

### 11.11 Public menu

- Token divalidasi lewat public menu.
- Hanya produk aktif dan tersedia yang tampil.
- Add-on memakai field top-level baru.
- Cart publik tidak memerlukan login.
- Submit order memakai `tableToken` dan `Idempotency-Key`.
- Error validasi mempertahankan cart.
- Token invalid menampilkan empty state yang aman.
- Simpan response `PublicOrderCreated` untuk dialog sukses.
- Jangan menampilkan data internal.

### 11.12 Public order status

- Query memakai `refetchInterval: 10_000`.
- Polling berhenti saat tab tidak aktif sesuai default TanStack Query.
- Status pembayaran dan persiapan ditampilkan terpisah.
- Token invalid menampilkan empty state.
- Tidak menampilkan user internal atau order lain.

### 11.13 Dashboard dan reports

- Dashboard memakai range today/7d/30d.
- Reports memakai dateFrom/dateTo.
- Recent order memakai `order.tableName`.
- Empty state tetap tersedia.
- Hapus copy “Angka contoh”.
- Invalidasi reports terjadi dari mutasi order/payment.

### 11.14 License

- Status dari API.
- Tampilkan `validationMessage`.
- Tanggal `expiresAt` nullable.
- Tombol refresh memanggil ulang query.
- Tidak ada aktivasi atau upload lisensi.

### 11.15 Backup dan restore

- List backup nyata.
- Create backup menampilkan record baru.
- Restore meminta konfirmasi.
- Setelah restore sukses, tampilkan layar blocking `Restart diperlukan`.
- Cancel dan clear semua query.
- Poll `/api/health` setiap 3 detik dengan `cache: "no-store"`.
- Setelah health 200, clear flag localStorage dan reload.
- Jika restore gagal sebelum database ditutup, layar restart tidak muncul.
- Jangan menampilkan toast sukses biasa untuk restore.

## 12. Perubahan UI minimum

Perubahan berikut disetujui. Tidak ada redesign.

| Area                   | Perubahan                                                          |
| ---------------------- | ------------------------------------------------------------------ |
| Login                  | Hapus panel demo, badge Mode UI, dan autofill password             |
| Management user menu   | Tambah dialog ganti kata sandi                                     |
| Users                  | Password wajib saat create, role dinamis                           |
| Orders                 | Tombol refund penuh dan dialog alasan                              |
| Tables                 | Fetch detail untuk QR; tampilkan active order count                |
| POS                    | Status koneksi nyata; hapus label data contoh                      |
| KDS                    | Status SSE nyata; hapus label data contoh                          |
| Public menu            | Add-on nyata; hapus label data contoh                              |
| Public status          | Polling dan hapus label data contoh                                |
| Dashboard/reports      | Hapus copy data contoh                                             |
| License                | Tampilkan validationMessage                                       |
| Backup                 | Copy nyata dan layar restart                                       |
| Semua halaman          | Hapus “Data simulasi”, “Data contoh”, dan “Mode UI”                |

## 13. Penghapusan mock dan design system

### 13.1 File yang dihapus

```text
src/mocks/management/**
src/mocks/session.ts
src/mocks/permissions.ts
src/mocks/navigation.ts
src/features/auth/mock-session.tsx
src/features/auth/require-session.tsx
src/features/management/mock-controls.tsx
src/app/(dashboard)/app/design-system/**
```

### 13.2 File yang dipindahkan

- `src/mocks/navigation.ts` -> `src/lib/navigation.ts`.
- Item design-system dihapus dari navigasi.

### 13.3 Aturan cleanup

- Tidak boleh ada import `@/mocks/**` di `src`.
- Tidak boleh ada `useMockSession`, `useManagementStore`, `managementService`, atau `useAsyncData`.
- Tidak boleh ada route `/app/design-system`.
- Tidak boleh ada tombol atau menu yang mengarah ke design-system.
- Update komentar `next.config.ts` yang menyebut mock.
- Update AGENTS, README, dan ROADMAP.

## 14. Testing

### 14.1 Dependency test

```text
@tanstack/react-query 5.108.0
@testing-library/react 16.3.3
@testing-library/dom 10.4.2
@testing-library/user-event 14.6.12
jsdom 31.0.1
```

Tidak ada Playwright di Fase 7.

### 14.2 Unit test

- API client: JSON, 204, Problem Details, 401 event, credentials, body encoding.
- Query keys: bentuk key dan prefix.
- Idempotency: header, reuse, rotasi.
- Landing path berdasarkan permission.
- Mapper DTO ke tipe domain.
- Error fallback bahasa Indonesia.

### 14.3 Integration test backend

- Users: `roleLabel` dan role options.
- Roles: options dan permission.
- Tables: `activeOrderCount`.
- Public menu: add-on detail aktif.
- Payments: `orderNumber`, `recordedByName`, search nomor pesanan.
- Order history: `changedByName`.
- Tidak ada regression pada Phase 6 tests.

### 14.4 RTL test

- Query provider dan render harness.
- Login sukses/gagal dan redirect.
- Ganti kata sandi.
- Users dengan role custom dan password create.
- Roles dan permission composite update.
- Catalog create/update dan flag mutation.
- Tables detail QR dan regenerate.
- Orders refund visibility dan request.
- POS checkout, idempotency reuse/rotate, 401 tanpa sukses.
- Payments enrich.
- KDS SSE connect/error/reconnect cleanup.
- Public menu add-on dan public order.
- Public status polling.
- Dashboard range dan reports.
- Restore restart screen dan health poll.

Setiap test RTL memakai QueryClient baru dengan `retry: false` dan dibersihkan setelah test.

### 14.5 Manual smoke

Lihat bagian 18.

### 14.6 Perintah

```bash
pnpm check
pnpm test
pnpm build
```

## 15. Keamanan dan idempotency

### 15.1 Session

- Cookie HttpOnly, SameSite Lax, Secure dari environment.
- Client tidak membaca token.
- Logout mencabut session server.
- 401 tidak boleh menampilkan sukses transaksi.

### 15.2 Permission

- Server tetap memeriksa permission pada setiap endpoint.
- UI hanya menyembunyikan aksi.
- Role dinamis tidak mengubah enforcement server.
- Permission yang dicabut harus menghasilkan 403 saat request.

### 15.3 Idempotency

Operasi wajib:

- Create order.
- Create public order.
- Record payment.
- Refund.

Aturan:

- Key 8 sampai 128 karakter; gunakan UUID.
- Key dibuat saat operasi dimulai.
- Reuse saat network error atau 5xx.
- Rotasi saat 4xx validasi/konflik.
- Jangan retry mutation otomatis.
- Response replay dari server harus diterima sebagai hasil yang sama.
- Jangan menyimpan key di localStorage jangka panjang.

### 15.4 Data publik

- Public menu tidak membuka user internal.
- Public order status tidak membuka order lain.
- Public token dan table token tetap terpisah.
- Jangan menampilkan hash atau ciphertext QR.
- Rate limit publik tetap berlaku.

## 16. Performa dan caching

- Default stale time 30 detik.
- Operasional memakai stale time lebih pendek bila diperlukan.
- Public menu 60 detik.
- Public order status 10 detik.
- KDS tidak polling; SSE dan refetch.
- Refetch on window focus aktif.
- Query cache hanya di memory browser.
- Tidak ada persistence ke localStorage.
- Jangan fetch seluruh riwayat untuk KDS.
- Jangan memakai `COUNT` atau agregasi client untuk menggantikan reports server.

## 17. Urutan implementasi

### Batch 1: Fondasi

- Dependency dan provider.
- API client, error, query key, idempotency.
- Session provider, guard, login, logout.
- Business dan settings.
- Ganti kata sandi.

Gate: `pnpm check`, unit/RTL auth.

### Batch 2: Users dan roles

- Backend `roleLabel` dan role options.
- Users page dan dynamic roles.
- Roles/permissions page.
- Refresh session setelah perubahan.

Gate: integration backend dan RTL users/roles.

### Batch 3: Catalog dan tables

- Categories, products, add-ons.
- Tables, QR detail, regenerate.
- Backend `activeOrderCount` dan public add-ons.
- Table picker POS.

Gate: RTL catalog/tables.

### Batch 4: Orders, payments, refund, POS

- Orders list/detail/cancel.
- Payments list.
- Refund.
- POS catalog/cart/checkout/payment.
- Backend payment/history enrichment.

Gate: RTL orders, payments, POS; manual split payment.

### Batch 5: KDS dan public

- KDS query, status, SSE, connection.
- Public menu, public order, public status polling.
- Backend public add-ons bila belum.

Gate: RTL KDS/public; manual QR flow.

### Batch 6: Reports dan sistem

- Dashboard, reports.
- License, backup, restore restart screen.
- Hapus mock dan design-system.
- Cleanup copy simulasi.

Gate: no mock imports; `pnpm check`, `pnpm test`.

### Batch 7: Finalisasi

- Docs.
- Manual smoke clean DB.
- `pnpm build`.
- Full review.
- Tag `phase-7-integration`.

## 18. Verifikasi manual

Gunakan database sementara. Jangan menghapus database developer.

```bash
RAVIKA_DB_PATH=/tmp/opencode/ravika-phase7.sqlite pnpm dev
```

Langkah:

1. Login owner, cashier, dan barista.
2. Pastikan redirect sesuai permission.
3. Buat kategori, produk dengan varian dan add-on, serta meja.
4. Buka QR menu dari token meja.
5. Pastikan add-on tampil dengan nama dan harga.
6. Buat public order.
7. Buka halaman status publik dan pastikan polling memperbarui status.
8. Buat order POS, lakukan split payment.
9. Ubah status KDS sampai completed.
10. Pastikan meja kembali available.
11. Refund order PAID.
12. Pastikan payment menjadi REFUNDED dan cancel tetap mengikuti aturan.
13. Buat role custom, assign ke user baru, ganti password, login.
14. Cek dashboard dan reports.
15. Buat backup.
16. Restore backup dan pastikan layar restart muncul.
17. Restart server, pastikan health 200 dan aplikasi reload.
18. Putuskan jaringan, cek indikator POS/KDS.
19. Sambungkan kembali, pastikan KDS refetch.
20. Cek tidak ada label simulasi atau link design-system.
21. Hapus database sementara dan backup hasil smoke.

## 19. Acceptance criteria

### Auth

- Login/logout memakai session backend.
- Cookie HttpOnly.
- User tanpa sesi diarahkan ke login.
- Permission server berlaku.
- Ganti kata sandi berfungsi.
- Panel demo tidak ada.

### Data

- Semua halaman internal memakai API.
- Tidak ada mock store pada production path.
- Role custom dapat ditetapkan.
- Refund penuh berfungsi.
- Public menu add-on berfungsi.
- Public status polling berfungsi.
- KDS SSE dan reconnect berfungsi.
- Restore menampilkan layar restart.
- License menampilkan validation message.

### Mutasi

- Order/payment/refund/public order memakai idempotency.
- Split payment berfungsi.
- Overpay ditolak.
- Cancel guard berfungsi.
- Toast sukses hanya setelah response server.
- 401 tidak menampilkan sukses.

### Kualitas

- Tidak ada import mock.
- Tidak ada design-system.
- `pnpm check` PASS.
- `pnpm test` PASS.
- `pnpm build` PASS.
- Docs diperbarui.
- Tidak ada migration baru.
- Tidak ada dependency di luar daftar.

## 20. Risiko dan mitigasi

| Risiko                                     | Dampak                              | Mitigasi                                                     |
| ------------------------------------------ | ----------------------------------- | ------------------------------------------------------------ |
| Query invalidation terlewat                | Data basi di POS/KDS/reports        | Tabel invalidasi dan review per mutasi                       |
| Cookie session di layout + cacheComponents | Build gagal atau route static salah | Build gate dan verifikasi layout async                       |
| SSE putus                                  | KDS tidak menerima update           | Status koneksi, invalidasi saat reconnect, refetch           |
| Restore menutup database                   | Request berikutnya gagal            | Layar blocking, clear query, health poll, restart            |
| Idempotency key salah rotasi               | Duplikasi atau 409                  | Reuse network/5xx, rotasi 4xx, test RTL                      |
| Role dinamis mengubah tipe                | Banyak error TypeScript             | Perubahan tipe di backend task lebih dulu, typecheck per batch |
| Backend enrichment N+1                     | List lambat                         | Skala data kecil; evaluasi query bila pilot membesar         |
| Test timer flaky                           | Test tidak stabil                   | Fake timers dan QueryClient baru per test                    |
| Mock tersisa                               | Dua sumber data                     | `rg` gate dan review akhir                                   |
| Backup test mengotori repo                 | File `data/backups` menumpuk        | Cleanup file setelah test/manual smoke                       |

## 21. Definition of Done

- Semua acceptance criteria terpenuhi.
- Tidak ada mock import atau design-system route.
- Tidak ada Zustand.
- Semua server state memakai TanStack Query.
- Semua mutasi kritikal memakai idempotency.
- Refund, dynamic roles, change password, restore restart, dan public add-on berfungsi.
- KDS SSE dan reconnect terbukti.
- Public status polling terbukti.
- Test unit, integration, dan RTL lulus.
- `pnpm check`, `pnpm test`, `pnpm build` lulus.
- Manual smoke pada database bersih lulus.
- Docs diperbarui.
- Commit dan tag `phase-7-integration`.

## 22. Handoff ke Fase 8

Fase 8 akan:

- Menambahkan Playwright E2E untuk owner, cashier, barista, dan customer.
- Menguji SSE reconnect secara browser.
- Menguji network loss dan server restart.
- Menguji backup/restore drill.
- Menguji lisensi tanpa internet.
- Menguji performa pada perangkat pilot.
- Menyiapkan installer, firewall, LAN, dan runbook.
- Meninjau security dan dependency.
- Menyusun release candidate.

Fase 8 tidak boleh menganggap Fase 7 selesai tanpa manual smoke dan build gate.

### 22.1 Catatan rekonsiliasi implementasi

Baseline kode: `dd750b9`. Verifikasi otomatis pada 18 November 2026:
`pnpm check` lulus, `pnpm test` lulus (27 file, 98 test), dan `pnpm build`
lulus. Manual smoke pada database bersih dijalankan oleh controller.

Field aditif yang benar-benar dikirim:

- `SessionUser.roleLabel`
- `ManagementUser.roleLabel` dan `username` opsional
- `GET /api/roles/options` mengembalikan `{ id, code, name }[]`
- `TableSummary.activeOrderCount`
- `Payment.orderNumber` dan `Payment.recordedByName`; search payment
  mencakup nomor pesanan, `reference`, dan `notes`
- `OrderStatusHistory.changedByName`
- `PublicMenuResponse.addOns` top-level berisi add-on aktif yang
  dirujuk produk. `products[].addOns` tetap berisi relasi `addOnId`,
  `isRequired`, `minSelection`, dan `maxSelection`.

Create public order mengembalikan:

```json
{
  "orderNumber": "RVK-2025",
  "publicToken": "pub-...",
  "grandTotal": 26000,
  "tableName": "Meja 01"
}
```

`tableName` bertipe `string | null`. Public order status mengembalikan:

```json
{
  "orderNumber": "RVK-2025",
  "orderStatus": "PREPARING",
  "paymentStatus": "PAID",
  "grandTotal": 26000,
  "tableName": "Meja 01",
  "createdAt": "2026-11-18T08:00:00.000Z",
  "items": [
    {
      "productName": "Espresso",
      "variantName": "Large",
      "quantity": 2,
      "unitPrice": 13000,
      "lineTotal": 26000,
      "addOns": [{ "name": "Extra Shot", "price": 5000, "quantity": 1 }]
    }
  ]
}
```

Deviasi minor dari dokumen ini:

1. Landing path juga mengarahkan pengguna dengan `payments.view` ke
   `/app/pos`, meskipun tanpa `orders.create`. Ini menutup operator
   pembayaran agar tidak berakhir di halaman terlarang.
2. UI tidak memakai `staleTime` operasional terpisah; semua query
   memakai default 30 detik kecuali public status yang polling 10 detik
   dan public menu yang memakai 60 detik.

Tidak ada deviasi kontrak API lain, migration baru, atau dependency di
luar daftar.

## Appendix A: File map

### Frontend inti

```text
src/app/providers.tsx
src/lib/api/client.ts
src/lib/api/errors.ts
src/lib/api/keys.ts
src/lib/api/idempotency.ts
src/lib/navigation.ts
src/features/auth/api.ts
src/features/auth/session-provider.tsx
src/features/auth/server-session.ts
src/features/auth/landing.ts
src/features/auth/change-password-dialog.tsx
src/features/management/api/*.ts
src/features/operational/api.ts
src/features/operational/use-connection-status.ts
src/features/kds/api.ts
src/features/kds/use-kds-events.ts
src/features/customer/api.ts
src/features/system/restart-required.tsx
```

### Backend yang berubah

```text
src/modules/users/user.service.ts
src/modules/roles/role.service.ts
src/modules/tables/table.service.ts
src/modules/payments/payment.service.ts
src/modules/orders/order.service.ts
src/app/api/roles/options/route.ts
```

### Test

```text
tests/unit/api-client.test.ts
tests/unit/query-keys.test.ts
tests/unit/auth-landing.test.ts
tests/integration/phase7-users-roles.test.ts
tests/integration/phase7-tables-public.test.ts
tests/integration/phase7-payments-orders.test.ts
tests/rtl/*.test.tsx
```

## Appendix B: Contoh request dan response

### Login

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{ "identity": "owner", "password": "demo123", "remember": false }
```

### Create order

```http
POST /api/orders
Idempotency-Key: 6f5f0f5e-...
Content-Type: application/json
```

```json
{
  "orderType": "DINE_IN",
  "tableId": "table-1",
  "notes": "",
  "items": [
    {
      "productId": "product-espresso",
      "variantId": "variant-espresso-large",
      "addOnIds": ["addon-extra-shot"],
      "quantity": 2,
      "notes": ""
    }
  ]
}
```

### Record payment

```http
POST /api/orders/order-id/payments
Idempotency-Key: 8d6f...
Content-Type: application/json
```

```json
{
  "method": "QRIS",
  "amount": 32000,
  "reference": "QR-1",
  "notes": "",
  "verified": true
}
```

### Refund

```http
POST /api/orders/order-id/refund
Idempotency-Key: 2a1b...
Content-Type: application/json
```

```json
{ "reason": "Pesanan salah input" }
```

### Restore

```http
POST /api/backup/restore
Content-Type: application/json
```

```json
{ "backupId": "backup-id", "confirm": true }
```

Response:

```json
{ "restored": true, "restartRequired": true }
```

## Appendix C: Checklist implementasi

- [x] Dependency dan provider.
- [x] API client dan Problem Details.
- [x] Query keys dan invalidasi.
- [x] Session provider dan server guard.
- [x] Login/logout/change password.
- [x] Backend roleLabel dan role options.
- [x] Users page dynamic roles.
- [x] Roles/permissions page.
- [x] Catalog pages.
- [x] Backend table count dan public add-ons.
- [x] Tables page dan QR.
- [x] Backend payment/history enrichment.
- [x] Orders dan refund.
- [x] Payments page.
- [x] POS.
- [x] KDS dan SSE.
- [x] Public menu/order.
- [x] Public status polling.
- [x] Dashboard/reports.
- [x] License.
- [x] Backup/restore restart.
- [x] Hapus mock dan design-system.
- [x] Cleanup copy simulasi.
- [x] Unit/integration/RTL tests.
- [x] Manual smoke.
- [x] Docs.
- [x] `pnpm check`, `pnpm test`, `pnpm build`.
- [x] Commit dan tag.
