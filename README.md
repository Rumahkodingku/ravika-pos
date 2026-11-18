# RAVIKA POS

> Run your business with clarity.

POS self-hosted untuk kafe dan UMKM. Satu instalasi melayani satu bisnis, berjalan di komputer server lokal, dan diakses lewat LAN/Wi-Fi tanpa mewajibkan internet untuk transaksi.

**Status:** Fase 4.5, Fase 5 backend foundation, dan Fase 6 backend API modules selesai. UI masih memakai mock data dan mock auth sampai Fase 7. Backend menyediakan SQLite, Drizzle, session database, RBAC, katalog, meja dan QR, order, pembayaran, refund penuh, KDS dengan SSE, laporan, lisensi, serta backup dan restore.

## Stack

Sudah terpasang:

- Next.js 16.4.6 (App Router, Turbopack)
- React 19.3
- TypeScript strict
- Tailwind CSS 4.3
- Biome 2.4
- pnpm 10.34.5
- Node.js 26.9.0
- Lucide React
- React Hook Form 7.92
- Zod 4.6
- `@hookform/resolvers` 7.0
- `qrcode.react` 4.2
- Drizzle ORM 0.45
- SQLite `node:sqlite` melalui `drizzle-orm/sqlite-proxy`
- Vitest 5.1

Direncanakan, belum dipasang:

- Zustand dan TanStack Query
- Playwright

## Menjalankan

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Buka `http://localhost:3000`.

Untuk menjalankan backend produksi, isi `.env` dengan database path, cookie
Secure, bootstrap owner, `RAVIKA_QR_TOKEN_KEY` (base64 32 byte), serta
`RAVIKA_INSTALLATION_ID`, `RAVIKA_LICENSE_FILE`, dan
`RAVIKA_LICENSE_PUBLIC_KEY` bila lisensi dipakai. Database dibuat dan
dimigrasikan otomatis saat API pertama kali diakses. Backup ditulis ke
`data/backups/`; restore memerlukan restart proses.

```bash
pnpm build
pnpm start
```

Bootstrap development membuat akun demo `owner@ravika.id`,
`cashier@ravika.id`, dan `barista@ravika.id` dengan password `demo123`.
Bootstrap produksi hanya membuat owner dari environment variable.

## Command

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
├── features/            # auth, management, dan UI per domain
├── infrastructure/      # database, migration, seed, bootstrap
├── modules/             # auth, business, health, rbac, users
├── lib/                 # utilitas dan service contracts
├── mocks/               # fixtures, mock auth, dan mock service
├── shared/              # error, HTTP, logging, permissions, ids
├── styles/              # token CSS
└── types/               # tipe domain bersama
```

API ada di `src/app/api`. UI belum terhubung ke API sampai Fase 7.

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
| `/app/reports` | Laporan |
| `/app/license` | Lisensi |
| `/app/backup` | Backup |
| `/app/pos` | POS kasir |
| `/kds` | Kitchen Display System |
| `/menu/[token]` | Menu pelanggan via QR |
| `/order/[publicToken]` | Status pesanan pelanggan |
| `/app/design-system` | Pratinjau komponen internal |

Token desain ada di `src/styles/tokens.css`. Theme, shell, dan komponen dasar sudah tersedia; pratinjau ada di `/app/design-system`.

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
| PATCH | `/api/roles/:id` | `roles.manage` |
| PUT | `/api/roles/:id/permissions` | `permissions.manage` |
| GET | `/api/permissions` | `permissions.manage` |
| GET/POST | `/api/categories` | `categories.view` / `categories.manage` |
| PATCH | `/api/categories/:id` | `categories.manage` |
| POST | `/api/categories/:id/move` | `categories.manage` |
| GET/POST | `/api/products` | `products.view` / `products.manage` |
| GET/PATCH | `/api/products/:id` | `products.view` / `products.manage` |
| GET | `/api/add-ons` | `products.view` |
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
| GET | `/api/licensing/status` | `license.view` |
| GET/POST | `/api/backup` | `backup.create` |
| POST | `/api/backup/restore` | `backup.restore` |
| GET | `/api/public/menu/:token` | Publik, rate limited |
| POST | `/api/public/orders` | Publik, rate limited |
| GET | `/api/public/orders/:publicToken` | Publik, rate limited |

Mutasi order, pembayaran, refund, dan order publik memerlukan header
`Idempotency-Key`. Error API memakai RFC 9457 `application/problem+json`.

UI belum terhubung ke API sampai Fase 7. Login UI masih memakai sessionStorage dan tiga akun demo: `owner@ravika.id`, `cashier@ravika.id`, dan `barista@ravika.id` dengan kata sandi `demo123`. Data mock kembali ke seed saat reload. Store operasional disinkronkan antar tab lewat BroadcastChannel. Backend sudah menyediakan SSE untuk KDS. QR meja dibuat dengan `qrcode.react`; untuk memindai dari ponsel, buka aplikasi lewat IP LAN, bukan localhost.

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

Baca PRD dan seluruh dokumen desain sebelum membuat halaman atau komponen baru.

## Aturan pengembangan

- Frontend UI sudah disetujui pada M4 (17 November 2026, baseline `d6c07b5`). Baseline MVP satu lokasi `c33e473`. Backend operasional dimulai di Fase 5.
- MVP satu bisnis dan satu lokasi operasional. Modul lokasi tambahan tidak termasuk ruang lingkup.
- Fase 0–4 memakai mock data terpusat; jangan membuat API atau persistence.
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
