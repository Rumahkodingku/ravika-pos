# RAVIKA POS

> Run your business with clarity.

POS self-hosted untuk kafe dan UMKM. Satu instalasi melayani satu bisnis, berjalan di komputer server lokal, dan diakses lewat LAN/Wi-Fi tanpa mewajibkan internet untuk transaksi.

**Status:** Fase 1.5 selesai. Frontend foundation, design system, dan refactor UI/UX operational focus sudah diterapkan. Fase 2 (management UI) berikutnya. Backend belum diimplementasikan.

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

Direncanakan, belum dipasang:

- SQLite + Drizzle ORM + `better-sqlite3`
- Zod, Zustand, TanStack Query, React Hook Form
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
├── features/            # UI per domain
├── lib/                 # utilitas dan service contracts
├── mocks/               # fixtures dan mock service
├── styles/              # token CSS
└── types/               # tipe domain bersama
```

Route group masih placeholder. Halaman fitur diisi pada Fase 2 dan Fase 3. `src/modules` dan `src/infrastructure` ditambahkan pada Fase 5 saat backend dimulai.

## Route yang direncanakan

| Route | Area |
|---|---|
| `/login` | Autentikasi internal |
| `/app` | Dashboard owner |
| `/app/pos` | POS kasir |
| `/kds` | Kitchen Display System |
| `/menu/[token]` | Menu pelanggan via QR |
| `/order/[publicToken]` | Status pesanan pelanggan |
| `/app/design-system` | Pratinjau komponen Fase 1.5 |

Token desain ada di `src/styles/tokens.css`. Theme, shell, dan komponen dasar sudah tersedia; pratinjau ada di `/app/design-system`.

API, database, autentikasi nyata, dan SSE belum dibuat.

## Dokumen

- `docs/PRD.md` — sumber kebenaran produk, aturan bisnis, permission, API konseptual
- `docs/ROADMAP.md` — urutan fase dan approval gate
- `docs/design/design-brief.md` — konteks pengguna dan tujuan desain
- `docs/design/design-direction.md` — arah visual
- `docs/design/design-system.md` — token dan spesifikasi komponen
- `docs/design/ui-ux-guidelines.md` — interaksi, responsive, aksesibilitas, QA
- `docs/specification/phase-1-5-ui-ux-refinement.md` — spec refactor Fase 1.5

Baca PRD dan seluruh dokumen desain sebelum membuat halaman atau komponen baru.

## Aturan pengembangan

- Frontend UI dulu. Backend operasional baru dimulai setelah UI Approval Gate (M4).
- Fase 0–4 memakai mock data terpusat; jangan membuat API atau persistence.
- Jangan menambah UI library tanpa persetujuan. Komponen dasar dibuat custom dengan HTML native.
- Gunakan token desain; jangan sebar nilai warna, spacing, atau radius mentah.
- Copy UI berbahasa Indonesia. Kode dan komentar berbahasa Inggris.
- Copy UI tidak memakai em dash atau middle dot untuk metadata.
- Status pembayaran dan status persiapan pesanan harus tetap terpisah.
- Navigasi management memakai quick links dan mega menu. Mobile memakai full-screen sheet.
- Jangan mengarang aturan bisnis, field, permission, atau transisi status.
- Keputusan yang belum final ada di `docs/PRD.md` bagian 17.
