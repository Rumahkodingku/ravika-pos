# RAVIKA POS — Spesifikasi Fase 1: Frontend Foundation and Design System

**Status:** Implemented — Fase 1 selesai
**Fase:** 1  
**Referensi:** PRD, ROADMAP, design-brief, design-direction, design-system, ui-ux-guidelines  
**Keputusan user:** komponen lengkap + chart; semua 4 shell; `tokens.css` terpisah; theme global + default per shell; mock 3 role; global + shell-level boundaries

## 1. Tujuan

Membangun fondasi visual dan komponen reusable sebelum halaman fitur. Fase ini hanya frontend. Tidak ada backend, database, API, auth nyata, SSE, atau persistence.

## 2. Ruang lingkup

Termasuk:

- design token lengkap
- typography Plus Jakarta Sans
- light/dark/system theme
- global layout dan responsive container
- empat shell: Management, POS, KDS, Customer
- komponen dasar dan state components
- chart primitive sederhana berbasis SVG
- mock session 3 role
- loading/error/not-found boundaries
- utilitas format data

Tidak termasuk:

- halaman fitur Phase 2/3
- React Hook Form dan Zod
- test runner
- chart library eksternal
- UI library eksternal
- backend operasional

## 3. Keputusan implementasi

- Package manager: pnpm.
- Node baseline: 26.9.0.
- Komponen: custom/native, tanpa Radix/shadcn.
- Token CSS: `src/styles/tokens.css` + mapping di `src/app/globals.css`.
- Theme: global preference, default per shell.
- Mock session: owner, cashier, barista.
- Boundaries: global + shell-level.

## 4. Dependensi

Tambahkan:

- `lucide-react`

Jangan tambahkan:

- Radix, shadcn, Headless UI
- chart library
- React Hook Form, Zod
- Zustand, TanStack Query
- SQLite, Drizzle, better-sqlite3
- Vitest, Playwright

## 5. Struktur file

```text
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── (auth)/login/page.tsx
│   ├── (dashboard)/app/page.tsx
│   ├── (cashier)/app/pos/page.tsx
│   ├── (kds)/kds/page.tsx
│   └── (customer)/menu/[token]/page.tsx
├── components/
│   ├── ui/
│   ├── shells/
│   └── feedback/
├── features/
├── lib/
│   ├── format.ts
│   └── cn.ts
├── mocks/
│   ├── session.ts
│   └── navigation.ts
├── styles/
│   └── tokens.css
└── types/
    └── ui.ts
```

Route page di atas adalah placeholder untuk verifikasi shell dan akan diganti pada Phase 2/3.

## 6. Design token

### 6.1 Brand primitives

| Token                        | Value     |
| ---------------------------- | --------- |
| `--color-brand-deep-navy`    | `#101828` |
| `--color-brand-blue`         | `#315B91` |
| `--color-brand-accent`       | `#3978D5` |
| `--color-neutral-white`      | `#FFFFFF` |
| `--color-neutral-light-gray` | `#F3F5F8` |
| `--color-neutral-gray`       | `#667085` |

### 6.2 Semantic primitives

| Token               | Value     |
| ------------------- | --------- |
| `--color-green-600` | `#16A36A` |
| `--color-amber-600` | `#D99019` |
| `--color-red-600`   | `#DC4C4C` |
| `--color-blue-600`  | `#3978D5` |

### 6.3 Semantic theme tokens

| Token                          | Light     | Dark      |
| ------------------------------ | --------- | --------- |
| `--color-background`           | `#FFFFFF` | `#101828` |
| `--color-foreground`           | `#101828` | `#F8FAFC` |
| `--color-surface`              | `#FFFFFF` | `#172235` |
| `--color-surface-subtle`       | `#F3F5F8` | `#1D2A3D` |
| `--color-surface-elevated`     | `#FFFFFF` | `#243247` |
| `--color-muted`                | `#F3F5F8` | `#29384D` |
| `--color-muted-foreground`     | `#667085` | `#A7B2C2` |
| `--color-border`               | `#E4E7EC` | `#344256` |
| `--color-input`                | `#D0D5DD` | `#46566D` |
| `--color-primary`              | `#3978D5` | `#6EA5F5` |
| `--color-primary-foreground`   | `#FFFFFF` | `#081B34` |
| `--color-secondary`            | `#EEF2F7` | `#29384D` |
| `--color-secondary-foreground` | `#101828` | `#E8EEF6` |
| `--color-success`              | `#16A36A` | `#35C78A` |
| `--color-success-subtle`       | `#E8F7EF` | `#123B2C` |
| `--color-warning`              | `#B7791F` | `#F0B64D` |
| `--color-warning-subtle`       | `#FFF5DF` | `#453414` |
| `--color-danger`               | `#DC4C4C` | `#F07878` |
| `--color-danger-subtle`        | `#FDECEC` | `#481F27` |
| `--color-info`                 | `#3978D5` | `#6EA5F5` |
| `--color-info-subtle`          | `#EAF2FF` | `#172F50` |
| `--color-focus-ring`           | `#3978D5` | `#8AB8FF` |

### 6.4 Typography

Primary: Plus Jakarta Sans.  
Fallback: Inter, system-ui, sans-serif.  
Monospace: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`.

| Token           | Size | Line height | Weight |
| --------------- | ---: | ----------: | -----: |
| `display`       | 32px |        40px |    700 |
| `page-title`    | 28px |        36px |    700 |
| `section-title` | 20px |        28px |    600 |
| `card-title`    | 16px |        24px |    600 |
| `body`          | 14px |        20px |    400 |
| `body-medium`   | 14px |        20px |    500 |
| `label`         | 13px |        18px |    500 |
| `caption`       | 12px |        16px |    400 |
| `button`        | 14px |        20px |    600 |

Gunakan tabular numerals untuk currency, quantity, dan timer.

### 6.5 Spacing

Base 4px. Gunakan Tailwind spacing utilities. Konvensi:

- page padding desktop: 24–32px
- page padding tablet: 20–24px
- page padding mobile: 16px
- section gap: 24px desktop, 16px mobile
- card padding: 16px atau 20px
- form field gap: 12px
- inline control gap: 8px

### 6.6 Radius

| Token         |  Value | Use                   |
| ------------- | -----: | --------------------- |
| `radius-sm`   |    6px | chips, small controls |
| `radius-md`   |    8px | inputs, buttons       |
| `radius-lg`   |   12px | cards, panels         |
| `radius-xl`   |   16px | dialogs, large panels |
| `radius-full` | 9999px | circular controls     |

### 6.7 Border dan elevation

- standard border: 1px solid `border`
- strong border: 1px solid `input`
- cards: flat dengan subtle border
- elevation hanya untuk dialog, popover, dropdown, floating panel
- jangan stack multiple shadow

### 6.8 Breakpoint

| Name  |  Width |
| ----- | -----: |
| `sm`  |  640px |
| `md`  |  768px |
| `lg`  | 1024px |
| `xl`  | 1280px |
| `2xl` | 1440px |

### 6.9 Motion

- micro feedback: 100–150ms
- standard transition: 150–220ms
- overlay transition: 180–240ms
- easing: `cubic-bezier(0.2, 0, 0, 1)` atau Tailwind default ease-out
- hormati `prefers-reduced-motion`

### 6.10 Z-index

| Token        | Value |
| ------------ | ----: |
| `z-base`     |     0 |
| `z-dropdown` |    40 |
| `z-sticky`   |    50 |
| `z-overlay`  |    60 |
| `z-dialog`   |    70 |
| `z-toast`    |    80 |

## 7. Tailwind v4 implementation

`src/styles/tokens.css` berisi CSS variables.  
`src/app/globals.css`:

```css
@import "tailwindcss";
@import "../styles/tokens.css";

@custom-variant dark (&:where(.dark, .dark *));

@theme inline {
  /* map all semantic tokens */
  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  --radius-xl: var(--radius-xl);
  --breakpoint-2xl: 1440px;
  --font-sans: var(--font-sans);
}
```

Aturan:

- semua warna komponen memakai semantic token.
- jangan sebar raw hex.
- dark mode class-based, bukan media query.

## 8. Typography implementation

- Load Plus Jakarta Sans via `next/font/google`.
- variable: `--font-sans`.
- fallback: Inter, system-ui, sans-serif.
- `html` class memuat font variable.
- body memakai `font-sans`.
- gunakan tabular numerals bila tersedia.

## 9. Iconography

- Pakai `lucide-react`.
- size default: 16px inline, 18px standard, 20px navigation/action, 24px prominent.
- icon harus memperkuat label, bukan mengganti teks penting.
- gunakan `aria-hidden="true"` jika label sudah ada.

## 10. Theme architecture

### 10.1 Model

- `ThemeProvider` client component.
- values: `light`, `dark`, `system`.
- storage key: `ravika-theme`.
- global preference, bukan per-experience.

### 10.2 Default per shell

- Management: system, fallback light
- POS: light
- KDS: dark
- Customer QR: light

Default hanya dipakai jika user belum memilih theme.

### 10.3 Perilaku

- Jika user memilih light/dark, pakai pilihan itu.
- Jika system, ikuti OS preference.
- Jika preference tidak tersedia, fallback light.
- Theme tidak mengubah data atau behavior.

### 10.4 Flash prevention

- Inline script di shell layout menetapkan class `.dark` sebelum render children.
- Script membaca `localStorage` atau default shell.
- `ThemeProvider` menyinkronkan state setelah hydration.

## 11. Komponen dasar

### 11.1 Button

Variants: `primary`, `secondary`, `outline`, `ghost`, `danger`, `link`.  
Sizes: `sm`, `md`, `lg`, `icon`.  
States: default, hover, focus-visible, active, disabled, loading.  
Rules: satu primary dominan per action group; destructive tidak terlihat seperti primary; loading mencegah duplicate submit; focus indicator tetap ada.

### 11.2 Input dan form controls

Komponen: text input, search input, textarea, select, checkbox, radio group, switch, date picker, quantity control.  
States: default, hover, focus, filled, disabled, invalid, read-only.  
Rules: label wajib; placeholder bukan label; error menjelaskan cara memperbaiki; input tetap ada setelah validation error.

### 11.3 Card dan panel

Variants: `default`, `interactive`, `stat`, `product`, `order`, `surface-subtle`.  
Rules: padding dan border konsisten; interactive card harus menunjukkan affordance; jangan nest interactive control ambigu.

### 11.4 Table

Capability: header, numeric alignment, row hover hanya jika row interactive, empty, loading, error, responsive overflow/alternate mobile.  
Rules: jangan sembunyikan field transaksi kritis tanpa detail path; currency konsisten; action menu predictable; pagination/bounded result.

### 11.5 Badge dan status

Badge semantic: neutral, primary, success, warning, danger, info.  
Status label wajib text.  
Payment status dan preparation status harus terpisah.  
Contoh status pembayaran: Unpaid, Partially paid, Paid, Refunded.  
Contoh status persiapan: New, Accepted, Preparing, Ready, Completed, Cancelled.

### 11.6 Dialog dan drawer

Dialog: confirmation, short form, destructive decision.  
Drawer: mobile cart, secondary detail, contextual editing.  
Rules: title jelas, close/cancel path, focus management, prevent background interaction, mobile gunakan drawer/full-screen sheet.

### 11.7 Toast dan alert

- Toast: transient confirmation non-critical.
- Inline alert: persistent context/actionable warning.
- Dialog: decision requiring explicit confirmation.
- Toast bukan satu-satunya record untuk outcome transaksi kritis.

### 11.8 Chart

Komponen: `ChartContainer`, `BarChart`, `LineChart`, `Sparkline`.  
Rules: restrained palette, labels, units, date context, tooltip.  
Jangan andalkan color alone.  
Sediakan alternatif tekstual untuk angka penting.  
Implementasi SVG custom, tanpa library.

### 11.9 Domain components

POS: `ProductGrid`, `ProductCard`, `CategoryFilter`, `ProductSearch`, `VariantSelector`, `AddonSelector`, `CartPanel`, `CartLineItem`, `OrderTypeSelector`, `TableSelector`, `CheckoutSummary`, `PaymentMethodSelector`, `PaymentEntry`, `ChangeDueSummary`, `TransactionConfirmation`.

KDS: `KDSBoard`, `KDSColumn`, `OrderTicket`, `OrderTimer`, `OrderStatusAction`, `ConnectionIndicator`.

Customer menu: `MenuHeader`, `MenuCategoryNavigation`, `MenuSearch`, `MenuProductCard`, `MenuProductDetail`, `CartBar`, `CustomerCart`, `CheckoutForm`, `OrderSubmittedState`.

Phase 1 membuat fondasi dan placeholder; implementasi domain lengkap di Phase 2/3.

## 12. State components

Wajib ada:

- `LoadingState`
- `EmptyState`
- `ErrorState`
- `PermissionDeniedState`
- `OfflineState`
- `Skeleton`

Setiap state memiliki copy Indonesia yang jelas dan action jika relevan.

## 13. Shell layout

### 13.1 Management shell

Topbar-first: brand, primary nav, utility actions, user menu.
Content area dengan max-width strategy.  
Navigation permission-aware.  
Mobile: compact header + drawer.

### 13.2 POS shell

Compact header dengan business dan cashier context.
Product discovery area utama.  
Cart persisten di desktop.  
Mobile: cart drawer/panel.  
Tidak menampilkan navigasi dashboard yang tidak relevan.

### 13.3 KDS shell

Header ringkas, board berdasarkan status.  
Ticket dengan info pesanan dan aksi status.  
Dark theme default.  
Prioritas keterbacaan jarak operasional.

### 13.4 Customer shell

Mobile-first.  
Business identity, search/category, product listing, cart, checkout, confirmation.
Tanpa account requirement.

### 13.5 Auth shell

Layout sederhana untuk login.  
Tidak menampilkan navigasi internal.

## 14. Mock session dan permission

Mock 3 user:

- owner
- cashier
- barista

Setiap user memiliki permission sesuai matriks PRD.  
Navigation dan action visibility permission-aware.  
Mock data ditandai sebagai simulasi.

## 15. Route placeholder dan boundaries

Route group placeholder:

- `/login`
- `/app`
- `/app/pos`
- `/kds`
- `/menu/[token]`
- `/order/[publicToken]`

Boundaries:

- global `loading.tsx`, `error.tsx`, `not-found.tsx`
- shell-level boundaries untuk POS, KDS, Customer bila perlu
- error boundary tidak menampilkan detail internal

## 16. Utilitas format

- `formatCurrency`: IDR, locale `id-ID`, tanpa pecahan.
- `formatDateTime`: timezone dari config; default `Asia/Jakarta` dengan catatan OPEN-003 belum final.
- `formatNumber`: locale `id-ID`.
- `EMPTY_VALUE = '—'`.

## 17. Aksesibilitas

- Target WCAG 2.2 AA.
- Semua fungsi utama keyboard-operable.
- Focus indicator terlihat.
- Label dan error association.
- Status tidak hanya warna.
- Touch target minimal 44 × 44 CSS px.
- Reduced motion.
- Tidak bergantung pada hover untuk fungsi penting.
- Dialog/drawer focus management.

## 18. Responsive

- Mobile: `< 640px`
- Tablet: `640–1023px`
- Desktop: `≥ 1024px`
- Wide desktop: `≥ 1440px`
- Management topbar compact/drawer pada layar sempit.
- POS product area + cart drawer.
- KDS horizontal scroll bila perlu.
- QR single column pada layar kecil.

## 19. Motion

- micro: 100–150ms
- standard: 150–220ms
- overlay: 180–240ms
- hormati reduced motion.
- jangan animasi yang memblokir input.

## 20. QA dan acceptance criteria Phase 1

Phase 1 selesai jika:

- token tidak tersebar sebagai nilai mentah di halaman
- komponen memiliki variant dan state yang diperlukan
- light/dark konsisten
- responsive pada mobile, tablet, desktop
- keyboard navigation dan focus bekerja
- reduced motion dihormati
- `pnpm lint`, `pnpm typecheck`, `pnpm build` lulus
- tidak ada UI library baru
- tidak ada backend/API/database

## 21. Verifikasi

```bash
pnpm lint
pnpm typecheck
pnpm build
```

Manual:

- cek light/dark
- cek mobile/tablet/desktop
- cek keyboard dan focus
- cek reduced motion
- cek empty/error/loading/success states

## 22. Risiko

- implementasi dropdown/dialog custom berisiko aksesibilitas
- tidak ada test runner; QA manual
- font loading membutuhkan network saat build
- mapping token Tailwind v4 kompleks
- flash theme pada shell default

## 23. Open item

- asset logo belum tersedia; gunakan text wordmark
- combobox dan date picker dapat memakai native fallback
- tooltip delay dan positioning perlu QA
- chart interaction minimal

## 24. Handoff ke Phase 2

Phase 2 memakai fondasi ini untuk membangun management UI dengan dummy data. Placeholder route diganti bertahap. Mock data tetap terpusat. Permission gating tetap mock sampai backend.

## 25. Implementation notes

- Semua komponen dan shell pada spesifikasi ini sudah diimplementasikan.
- Preview komponen tersedia di `/app/design-system`.
- Chart memakai SVG custom; tidak ada chart library.
- Tidak ada test runner pada Fase 1; verifikasi memakai lint, typecheck, build, dan QA visual manual.
- Dynamic customer routes memakai `export const instant = false` untuk menghindari peringatan URL data pada `cacheComponents`.
- Theme global disimpan di `localStorage` dengan key `ravika-theme`; default per shell diterapkan saat belum ada preferensi.
