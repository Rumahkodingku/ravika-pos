# RAVIKA POS

> Run your business with clarity.

POS self-hosted untuk kafe dan UMKM. Satu instalasi melayani satu bisnis, berjalan di komputer server lokal, dan diakses lewat LAN/Wi-Fi tanpa mewajibkan internet untuk transaksi.

**Status:** Fase 1 sampai Fase 10 memiliki implementasi release candidate `1.0.0-rc.1`. UI memakai API backend nyata: TanStack Query untuk server state, session cookie HttpOnly, guard berbasis permission, dan data SQLite melalui Drizzle. Mock data, mock auth, dan `/app/design-system` sudah dihapus. Backend menyediakan katalog, meja dan QR, order, pembayaran, refund penuh, KDS dengan SSE, laporan, backup dan restore, serta network settings. Playwright E2E lokal dan dokumentasi operasional Ubuntu tersedia. Windows installer dan validasi hardware masih menunggu pengujian Windows 11.

## Stack

Sudah terpasang:

- Next.js 16.4.6 (App Router, Turbopack)
- React 19.3
- TypeScript strict
- Tailwind CSS 4.3
- Biome 2.4
- pnpm 10.34.5
- Node.js 26 LTS
- Lucide React
- React Hook Form 7.92
- Zod 4.6
- `@hookform/resolvers` 7.0
- `qrcode.react` 4.2
- Drizzle ORM 0.45
- SQLite `node:sqlite` melalui `drizzle-orm/sqlite-proxy`
- TanStack Query 5.108
- Vitest 5.1, Testing Library, dan jsdom

Direncanakan, belum dipasang:

- Playwright (Fase 8)

Tidak dipakai: Zustand.

## Menjalankan

Instalasi pertama dapat dilakukan lewat browser di `/setup`. Production seed tidak lagi mewajibkan env owner; jika env owner ada, ia tetap menjadi fallback.

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Buka `http://localhost:3000`.

Untuk menjalankan backend produksi, isi `.env` dengan database path, cookie
Secure, bootstrap owner, dan `RAVIKA_QR_TOKEN_KEY` (base64 32 byte). Database
dibuat dan dimigrasikan otomatis saat API pertama kali diakses. Backup ditulis
ke `data/backups/`; restore memerlukan restart proses.

```bash
pnpm build
pnpm start
```

Windows memakai installer terpisah. Service berjalan sebagai WinSW, data dan
config berada di `C:\ProgramData\RAVIKA POS`, dan network settings tersedia di
`/app/settings/network`. Validasi Windows 11 masih diperlukan sebelum rilis.

## Command

- `pnpm test:e2e` - Playwright lokal terhadap production build
- `pnpm perf:baseline` - baseline performa indikatif
- `pnpm release:package` - tarball release dari HEAD

```bash
pnpm dev        # development server
pnpm build      # production build + typecheck
pnpm start      # jalankan hasil build
pnpm lint       # Biome check
pnpm typecheck  # tsc --noEmit
pnpm check      # lint + typecheck
pnpm test       # Vitest
pnpm db:generate # generate Drizzle migration
pnpm format     # Biome format --write
```

Verifikasi perubahan: `pnpm check` → `pnpm test` → `pnpm build`.

## Struktur

```text
src/
├── app/
│   ├── (auth)/          # /login
│   ├── (dashboard)/     # /app
│   ├── (cashier)/       # /app/pos
│   ├── (kds)/           # /kds
│   └── (customer)/      # /menu/[token], /order/[publicToken]
├── components/
│   ├── ui/              # komponen dasar
│   ├── shells/          # layout per experience
│   ├── feedback/        # loading, empty, error, offline
│   └── theme/           # theme provider, script, toggle
├── features/            # auth, management, operational, kds, customer, system
├── infrastructure/      # database, migration, seed, bootstrap
├── modules/             # auth, business, health, rbac, users, katalog, order, payment, laporan
├── lib/                 # utilitas, API client, query keys, navigation
├── shared/              # error, HTTP, logging, permissions, ids
├── styles/              # token CSS
└── types/               # tipe domain bersama
```

API ada di `src/app/api`. UI memanggil API melalui `src/lib/api/client.ts` dan
query hook per domain di `src/features/**/api.ts`. Tidak ada folder `src/mocks`.

## Route aplikasi

| Route | Area |
|---|---|
| `/login` | Autentikasi internal |
| `/app` | Dashboard |
| `/app/products` | Produk |
| `/app/categories` | Kategori |
| `/app/tables` | Meja dan QR |
| `/app/orders` | Pesanan |
| `/app/payments` | Pembayaran |
| `/app/users` | Pengguna |
| `/app/roles` | Peran dan izin |
| `/app/settings` | Pengaturan |
| `/app/settings/network` | Jaringan |
| `/app/reports` | Laporan |
| `/app/backup` | Backup |
| `/app/pos` | POS kasir |
| `/kds` | Kitchen Display System |
| `/menu/[token]` | Menu pelanggan via QR |
| `/order/[publicToken]` | Status pesanan pelanggan |

Token desain ada di `src/styles/tokens.css`. Theme, shell, dan komponen dasar tersedia di aplikasi. Tidak ada route pratinjau `/app/design-system`.

## API backend

| Method | Route | Akses |
|---|---|---|
| POST | `/api/auth/login` | Publik, rate limited |
| POST | `/api/auth/logout` | Session opsional |
| GET | `/api/auth/me` | Session |
| POST | `/api/auth/change-password` | Session |
| GET | `/api/health` | Publik |
| GET | `/api/business` | `business.view` |
| PATCH | `/api/business` | `business.update` |
| GET/POST | `/api/users` | `users.view` / `users.manage` |
| GET/PATCH | `/api/users/:id` | `users.view` / `users.manage` |
| GET/POST | `/api/roles` | `roles.manage` |
| GET | `/api/roles/options` | `users.view` |
| PATCH | `/api/roles/:id` | `roles.manage` |
| PUT | `/api/roles/:id/permissions` | `permissions.manage` |
| GET | `/api/permissions` | `permissions.manage` |
| GET/POST | `/api/categories` | `categories.view` / `categories.manage` |
| PATCH | `/api/categories/:id` | `categories.manage` |
| POST | `/api/categories/:id/move` | `categories.manage` |
| GET/POST | `/api/products` | `products.view` / `products.manage` |
| GET/PATCH | `/api/products/:id` | `products.view` / `products.manage` |
| GET | `/api/add-ons` | `products.view` |
| POST | `/api/add-ons` | `products.manage` |
| PATCH | `/api/add-ons/:id` | `products.manage` |
| GET/POST | `/api/tables` | `tables.view` / `tables.manage` |
| GET/PATCH | `/api/tables/:id` | `tables.view` / `tables.manage` |
| POST | `/api/tables/:id/regenerate-qr` | `tables.manage` |
| GET/POST | `/api/orders` | `orders.view` / `orders.create` |
| GET | `/api/orders/payable` | `payments.view` |
| GET | `/api/orders/:id` | `orders.view` |
| GET | `/api/orders/:id/history` | `orders.view` |
| GET/POST | `/api/orders/:id/payments` | `payments.view` / `payments.create` |
| POST | `/api/orders/:id/cancel` | `orders.cancel` |
| POST | `/api/orders/:id/refund` | `payments.refund` |
| GET | `/api/payments` | `payments.view` |
| GET | `/api/payments/:id` | `payments.view` |
| GET | `/api/kds/orders` | `kds.view` |
| POST | `/api/kds/orders/:id/status` | `kds.update_status` |
| GET | `/api/events` | `kds.view`, SSE |
| GET | `/api/reports/summary` | `reports.view` |
| GET | `/api/reports/sales` | `reports.view` |
| GET | `/api/reports/top-products` | `reports.view` |
| GET | `/api/system/network` | `settings.manage` |
| PATCH | `/api/system/network/preferred` | `settings.manage` |
| GET/POST | `/api/backup` | `backup.create` |
| GET | `/api/backup/:id/download` | `backup.create` |
| POST | `/api/backup/upload` | `backup.restore` |
| POST | `/api/backup/restore` | `backup.restore` |
| GET | `/api/product-images/:productId` | Publik, versioned image |
| PUT/DELETE | `/api/products/:id/image` | `products.manage` |
| GET | `/api/public/menu/:token` | Publik, rate limited |
| POST | `/api/public/orders` | Publik, rate limited |
| GET | `/api/public/orders/:publicToken` | Publik, rate limited |

Mutasi order, pembayaran, refund, dan order publik memerlukan header
`Idempotency-Key`. Error API memakai RFC 9457 `application/problem+json`.

Session internal memakai cookie HttpOnly dari backend dan tidak membaca token di
browser. Guard layout dan halaman memakai permission, bukan nama role. Role
custom dapat dibuat lalu ditetapkan ke pengguna. Login tidak menampilkan akun
demo atau tombol isi kredensial.

Beberapa response backend memuat field tambahan untuk UI:

- `SessionUser` dan `ManagementUser` memuat `roleLabel`.
- `GET /api/roles/options` menyediakan pilihan role untuk form pengguna.
- `TableSummary` memuat `activeOrderCount`.
- `Payment` memuat `orderNumber` dan `recordedByName`; pencarian juga mencakup nomor pesanan.
- History order memuat `changedByName`.
- Public menu memuat `addOns` top-level berisi nama dan harga add-on aktif.

KDS memakai SSE `/api/events` dan melakukan refetch setelah reconnect. Halaman
status publik melakukan polling setiap 10 detik. Refund penuh tersedia dari
detail order `PAID`. QR meja dibuat dengan `qrcode.react`; untuk memindai dari
ponsel, buka aplikasi lewat IP LAN, bukan localhost.

Restore hanya berhasil setelah database diganti. Setelah itu aplikasi menampilkan
layar blocking "Restart diperlukan", mengosongkan cache query, dan memanggil
`/api/health` setiap 3 detik. Setelah server hidup kembali, halaman memuat ulang
otomatis. Restore memerlukan restart proses server; jangan menampilkan toast
sukses biasa.

## Dokumen

- `docs/PRD.md` — sumber kebenaran produk, aturan bisnis, permission, API konseptual
- `docs/ROADMAP.md` — urutan fase dan approval gate
- `docs/design/design-brief.md` — konteks pengguna dan tujuan desain
- `docs/design/design-direction.md` — arah visual
- `docs/design/design-system.md` — token dan spesifikasi komponen
- `docs/design/ui-ux-guidelines.md` — interaksi, responsive, aksesibilitas, QA
- `docs/specification/phase-1-5-ui-ux-refinement.md` — spec refactor Fase 1.5
- `docs/specification/phase-2-management-ui.md` — spec management UI Fase 2
- `docs/specification/phase-3-operational-ui.md` — spec POS, KDS, dan QR Menu Fase 3
- `docs/specification/phase-4-ui-approval.md` — audit, issue register, dan approval M4
- `docs/specification/phase-4-5-single-location-mvp.md` — penyelarasan satu lokasi
- `docs/specification/phase-5-backend-foundation.md` — spec backend foundation Fase 5
- `docs/specification/phase-6-backend-api-modules.md` — spec API modul Fase 6
- `docs/specification/phase-7-frontend-backend-integration.md` — spec integrasi frontend-backend Fase 7

Baca PRD dan seluruh dokumen desain sebelum membuat halaman atau komponen baru.

## Aturan pengembangan

- Frontend UI disetujui pada M4 (17 November 2026, baseline `d6c07b5`). Baseline MVP satu lokasi `c33e473`. Integrasi frontend-backend selesai di Fase 7.
- MVP satu bisnis dan satu lokasi operasional. Modul lokasi tambahan tidak termasuk ruang lingkup.
- UI memakai API backend nyata. Jangan menambahkan mock data, mock auth, atau service mock baru.
- Server state memakai TanStack Query melalui `src/lib/api` dan hook domain. Jangan menambahkan Zustand atau data-fetching library lain.
- Mutasi order, pembayaran, refund, dan order publik wajib memakai `Idempotency-Key`.
- Jangan menambah UI library tanpa persetujuan. Komponen dasar dibuat custom dengan HTML native.
- Gunakan token desain; jangan sebar nilai warna, spacing, atau radius mentah.
- Copy UI berbahasa Indonesia. Kode dan komentar berbahasa Inggris.
- Copy UI tidak memakai em dash atau middle dot untuk metadata.
- Status pembayaran dan status persiapan pesanan harus tetap terpisah.
- POS membuat order `NEW` dan `UNPAID`, lalu mencatat pembayaran. Management Payments tetap read-only.
- KDS hanya memakai transisi maju. Pembatalan tetap di halaman Pesanan.
- QR meja scannable. Jangan mengembalikan placeholder QR palsu.
- Navigasi management memakai quick links dan mega menu. Mobile memakai full-screen sheet.
- Jangan mengarang aturan bisnis, field, permission, atau transisi status.
- Keputusan yang belum final ada di `docs/PRD.md` bagian 17.
