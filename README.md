# RAVIKA POS

> Run your business with clarity.

POS self-hosted untuk kafe dan UMKM. Satu instalasi melayani satu bisnis, berjalan di komputer server lokal, dan diakses lewat LAN/Wi-Fi tanpa mewajibkan internet untuk transaksi.

**Status:** Fase 3 selesai. POS, KDS, QR Menu, dan management UI memakai mock data, mock auth, mock service, dan sinkronisasi antar tab. Backend, database, API, auth nyata, dan SSE belum diimplementasikan.

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

Direncanakan, belum dipasang:

- SQLite + Drizzle ORM + `better-sqlite3`
- Zustand dan TanStack Query
- SSE untuk KDS
- Vitest dan Playwright

## Menjalankan

```bash
pnpm install
pnpm dev
```

Buka `http://localhost:3000`.

Tidak ada environment variable wajib pada fase frontend. Variabel backend dan database ditambahkan pada Fase 5.

## Command

```bash
pnpm dev        # development server
pnpm build      # production build + typecheck
pnpm start      # jalankan hasil build
pnpm lint       # Biome check
pnpm typecheck  # tsc --noEmit
pnpm check      # lint + typecheck
pnpm format     # Biome format --write
```

Verifikasi perubahan: `pnpm lint` → `pnpm typecheck` → `pnpm build`.

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
├── lib/                 # utilitas dan service contracts
├── mocks/               # fixtures, mock auth, dan mock service
├── styles/              # token CSS
└── types/               # tipe domain bersama
```

Fase 3 mengisi POS, KDS, QR Menu, status pelanggan, dan alur operasional lain. `src/modules` dan `src/infrastructure` ditambahkan pada Fase 5 saat backend dimulai.

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

API, database, autentikasi nyata, dan SSE belum dibuat. Login memakai sessionStorage dan tiga akun demo: `owner@ravika.id`, `cashier@ravika.id`, dan `barista@ravika.id` dengan kata sandi `demo123`. Data mock kembali ke seed saat reload. Store operasional disinkronkan antar tab lewat BroadcastChannel. QR meja dibuat dengan `qrcode.react`; untuk memindai dari ponsel, buka aplikasi lewat IP LAN, bukan localhost.

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
