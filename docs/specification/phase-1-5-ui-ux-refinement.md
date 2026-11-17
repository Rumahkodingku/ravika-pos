# RAVIKA POS - Spesifikasi Refactor UI/UX Fase 1.5

**Status:** Implemented. Refactor UI/UX Fase 1.5 selesai.
**Fase:** 1.5, sebelum Fase 2 Management Interface
**Approach:** A, Operational Focus
**Antislop mode:** DURING
**Tanggal:** 16 November 2026
**Referensi utama:** `docs/PRD.md`, `docs/ROADMAP.md`, `docs/design/design-brief.md`, `docs/design/design-direction.md`, `docs/design/design-system.md`, `docs/design/ui-ux-guidelines.md`, `docs/specification/phase-1-frontend-foundation-design-system.md`

## 0. Agent quick start

Baca dokumen ini sebelum mengubah UI Fase 1.

Aturan wajib:

1. Jangan menambah dependency baru.
2. Jangan menambah UI library, Radix, shadcn, atau Headless UI.
3. Jangan menambah route bisnis baru.
4. Jangan menyentuh backend, database, auth nyata, API, atau SSE.
5. Jangan membuat logo, foto produk, testimonial, atau statistik palsu.
6. Gunakan mock data terpusat dan beri label "Data contoh" atau "Data simulasi".
7. Gunakan semantic token, bukan raw hex di komponen.
8. Pertahankan light theme dan dark theme.
9. Pertahankan permission-aware navigation.
10. Jalankan `pnpm check` dan `pnpm build` sebelum menyatakan selesai.
11. Jalankan antislop Delivery Gate sebelum handoff.
12. Jangan memakai em dash di copy UI. Gunakan "Tidak ada" atau "Belum ada" untuk nilai kosong.
13. Jangan memakai middle dot untuk menggabungkan metadata di UI. Gunakan baris terpisah atau kalimat.
14. Jangan memakai glassmorphism, gradient dekoratif, glow, background grid, atau pill badge sebagai default.

## 1. Ringkasan eksekusi

Refactor ini mengubah UI Fase 1 dari dashboard generik menjadi aplikasi operasional yang lebih tegas, rapi, dan mudah dipindai.

Perubahan inti:

- Management navigation memakai quick links dan mega menu.
- Mobile management navigation memakai full-screen sheet.
- Header menjadi solid, tanpa blur.
- Dashboard menjadi operational overview dengan satu metric dominan dan satu panel antrean.
- Card menjadi flat, shadow hanya untuk overlay.
- Badge label tidak lagi pill default.
- Table recent orders berubah menjadi card list di mobile.
- Chart diberi gridline, label sumbu, dan satu accent.
- Warna semantic diperbaiki agar lolos WCAG AA.
- Preview shell dipindahkan dari dashboard ke menu internal.
- POS, KDS, customer menu, order status, dan login ikut dirapikan.
- Copy UI menggunakan bahasa Indonesia, sentence case, dan tanpa em dash.

## 2. Design read

**Surface:** Operate. Pengguna menyelesaikan tugas operasional, bukan membaca landing page.

**Produk:** POS self-hosted untuk owner, kasir, barista, dan pelanggan kafe.

**Karakter:** Modern operational SaaS. Tenang, cepat, jelas, dan dapat dipercaya.

**Dials:**

- ENERGY 2: percaya diri, tidak berisik.
- RHYTHM 2: konsisten dengan beberapa break komposisi.
- MOTION 1: hover, press, focus, dan satu entrance mega menu. Tidak ada loop dekoratif.

**Identitas yang dipertahankan:**

- Deep Navy, Brand Blue, Accent Blue, White, Light Gray.
- Plus Jakarta Sans.
- Lucide Icons dengan pemakaian hemat.
- Radius 8 sampai 12 px.
- Flat surface, border tipis, shadow minimal.

**Identitas motif:**

Service flow. Garis tipis dengan titik status untuk alur:

`Baru -> Diterima -> Disiapkan -> Siap -> Selesai`

Motif ini dipakai di dashboard queue, KDS, dan halaman status pesanan. Fungsinya menunjukkan progres, bukan dekorasi.

## 3. Goals, non-goals, anti-goals

### Goals

- Membuat hierarchy setiap layar jelas.
- Membuat navigasi management mudah dijangkau lewat mega menu.
- Mengurangi jumlah pola template dashboard.
- Meningkatkan keterbacaan status pesanan dan pembayaran.
- Menjaga konsistensi light dan dark theme.
- Menjaga aksesibilitas keyboard, kontras, dan target sentuh.
- Menjaga performa dan tidak menambah dependency.

### Non-goals

- Tidak menambah fitur bisnis baru.
- Tidak menambah route baru selain route yang sudah ada.
- Tidak membuat backend, database, auth, API, atau SSE.
- Tidak membuat implementasi penuh POS, KDS, atau QR ordering.
- Tidak membuat logo atau aset fotografi.
- Tidak mengganti palet atau typeface brand.
- Tidak menambah test runner.

### Anti-goals

- Dashboard berisi empat stat card sama besar, dua chart sama besar, lalu table.
- Header transparan dengan blur.
- Semua card memiliki shadow yang sama.
- Semua label berbentuk pill.
- Eyebrow uppercase dengan tracking lebar.
- Card demo "Pratinjau shell" di dashboard.
- Menu hover-only yang tidak bisa dipakai di touch.
- Data mock yang terlihat seperti data nyata tanpa label.
- Em dash di UI copy.
- Meta string dengan middle dot.

## 4. Approach yang dipilih

### A. Operational focus, dipilih

Dashboard dan shell disusun ulang berdasarkan pekerjaan operasional. Penjualan hari ini menjadi metric dominan. Antrean pesanan menjadi panel fokus kedua. Navigasi menjadi mega menu. Surface dibuat flat dan rapi.

### B. Analytics-first, tidak dipilih

Terlalu banyak chart dan metric. Terlihat seperti analytics product, bukan alat kerja kasir dan owner.

### C. Minimal polish, tidak dipilih

Hanya memperbaiki spacing dan warna. Struktur dashboard tetap generik dan masalah hierarchy tidak selesai.

## 5. Audit baseline

### 5.1 Visual

- Header memakai `backdrop-blur` dan `bg-background/95`.
- Dashboard memakai 4 stat card dengan ukuran sama.
- Dua chart memiliki bobot visual yang sama.
- Card memakai `shadow-sm` di hampir semua surface.
- Badge memakai `rounded-full` untuk label non-status.
- PageHeader memakai eyebrow uppercase dengan tracking lebar.
- Preview shell card mendominasi bagian bawah dashboard.
- Tabel recent orders menyempit di mobile.
- KDS masih berupa kolom kosong tanpa hierarchy operasional.
- POS masih didominasi skeleton.
- Customer menu masih berupa skeleton.

### 5.2 Kontras

| Pair                   |  Ratio | Hasil           |
| ---------------------- | -----: | --------------- |
| `#3978D5` di `#FFFFFF` | 4.36:1 | Gagal AA normal |
| `#FFFFFF` di `#3978D5` | 4.36:1 | Gagal AA normal |
| `#16A36A` di `#E8F7EF` | 2.93:1 | Gagal AA normal |
| `#B7791F` di `#FFF5DF` | 3.36:1 | Gagal AA normal |
| `#DC4C4C` di `#FDECEC` | 3.55:1 | Gagal AA normal |
| `#3978D5` di `#EAF2FF` | 3.87:1 | Gagal AA normal |

### 5.3 Navigasi

- Belum ada mega menu.
- Quick links masih 6 item dan belum dikelompokkan dengan jelas.
- Menu dropdown kecil tidak cukup untuk 14 destinasi.
- Mobile navigation masih drawer kiri sederhana.

## 6. Token dan warna

### 6.1 Token baru

Tambahkan token berikut di `src/styles/tokens.css`.

Light theme:

| Token                                | Nilai     | Use                                |
| ------------------------------------ | --------- | ---------------------------------- |
| `--ravika-primary-action`            | `#2F66B8` | Fill tombol primary di light theme |
| `--ravika-primary-action-foreground` | `#FFFFFF` | Text di atas primary action        |
| `--ravika-primary-strong`            | `#315B91` | Link, text aksen, icon aktif       |
| `--ravika-success-strong`            | `#0F7A4F` | Text success di light theme        |
| `--ravika-warning-strong`            | `#8A5A12` | Text warning di light theme        |
| `--ravika-danger-strong`             | `#B42318` | Text danger di light theme         |
| `--ravika-info-strong`               | `#315B91` | Text info di light theme           |
| `--ravika-surface-inverse`           | `#101828` | Panel navy, login brand panel      |
| `--ravika-inverse-foreground`        | `#F8FAFC` | Text di panel navy                 |
| `--ravika-header-height`             | `64px`    | Tinggi topbar                      |
| `--ravika-content-max`               | `1440px`  | Lebar maksimum management content  |

Dark theme:

| Token                                | Nilai     |
| ------------------------------------ | --------- |
| `--ravika-primary-action`            | `#6EA5F5` |
| `--ravika-primary-action-foreground` | `#081B34` |
| `--ravika-primary-strong`            | `#8AB8FF` |
| `--ravika-success-strong`            | `#35C78A` |
| `--ravika-warning-strong`            | `#F0B64D` |
| `--ravika-danger-strong`             | `#F07878` |
| `--ravika-info-strong`               | `#6EA5F5` |
| `--ravika-surface-inverse`           | `#101828` |
| `--ravika-inverse-foreground`        | `#F8FAFC` |

### 6.2 Aturan pemakaian warna

- `primary` tetap dipakai untuk accent visual, chart, dan selected indicator.
- `primary-action` dipakai untuk fill tombol utama.
- `primary-strong` dipakai untuk link, text aksen, dan icon aktif.
- Badge status memakai text `foreground` atau `*-strong` dan dot semantic.
- Jangan memakai warna semantic sebagai text normal tanpa token `*-strong`.
- Jangan memakai `primary` sebagai text normal di light theme.
- Jangan memakai raw hex di komponen.

### 6.3 Contrast acceptance

Semua text normal harus minimal 4.5:1. Text besar minimal 3:1. Non-text UI minimal 3:1.

Pair yang harus lolos:

- `primary-action` dengan `primary-action-foreground`.
- `primary-strong` di `background` dan `surface`.
- `success-strong` di `success-subtle`.
- `warning-strong` di `warning-subtle`.
- `danger-strong` di `danger-subtle`.
- `info-strong` di `info-subtle`.
- `muted-foreground` di `surface-subtle`.

### 6.4 Motion token

Tambahkan:

```css
--motion-fast: 120ms;
--motion-base: 160ms;
--motion-overlay: 200ms;
--motion-ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--motion-ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
```

Gunakan `motion-ease-out` untuk entrance dan hover. Gunakan `motion-ease-in-out` untuk perubahan posisi. Jangan memakai `ease-in`.

### 6.5 Shadow token

Shadow hanya untuk overlay:

```css
--shadow-overlay: 0 24px 60px -28px rgb(16 24 40 / 0.35);
```

Card default tidak memakai shadow. Card memakai border.

## 7. Base CSS

Tambahkan di `src/app/globals.css`:

```css
@layer base {
  button:not(:disabled),
  [role="button"]:not([aria-disabled="true"]),
  summary,
  label[for],
  select:not(:disabled) {
    cursor: pointer;
  }

  button:disabled,
  [role="button"][aria-disabled="true"],
  select:disabled {
    cursor: not-allowed;
  }

  html {
    scroll-padding-top: var(--ravika-header-height);
  }
}
```

Tambahan:

- Pertahankan focus-visible ring.
- Pertahankan `prefers-reduced-motion`.
- Hapus `backdrop-blur` dari semua header shell.
- Gunakan `bg-surface` solid untuk header.
- Pastikan `scroll-padding-top` mencegah fokus tertutup sticky header.

## 8. Update data navigation

### 8.1 Types

Update `src/types/ui.ts`.

```ts
export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: string;
  description: string;
};

export type NavGroup = {
  label: string;
  description?: string;
  items: NavItem[];
};

export type QuickAction = {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: string;
  description?: string;
};

export type ServiceFlowStep = {
  id: string;
  label: string;
  count?: number;
  state: "complete" | "current" | "upcoming" | "cancelled";
};
```

### 8.2 Navigation exports

Update `src/mocks/navigation.ts`.

Export:

- `quickNavigation`: Dashboard, Pesanan, POS, KDS.
- `megaMenuGroups`: semua group dan item.
- `quickActions`: Buat pesanan, Buka KDS, Tambah produk.
- `managementNavigation`: alias dari `megaMenuGroups` jika masih diperlukan.

### 8.3 Group metadata

Gunakan deskripsi grup:

| Group       | Description                             |
| ----------- | --------------------------------------- |
| Ringkasan   | Ringkasan operasional hari ini          |
| Operasional | Alur pesanan, POS, KDS, dan meja        |
| Katalog     | Menu, kategori, dan ketersediaan produk |
| Bisnis      | Pengguna dan akses                      |
| Analitik    | Laporan penjualan dan performa produk   |
| Sistem      | Pengaturan, backup, dan lisensi         |

### 8.4 Item descriptions

| Item         | Description                                   |
| ------------ | --------------------------------------------- |
| Dashboard    | Ringkasan penjualan dan antrean hari ini      |
| Pesanan      | Cari, periksa, dan kelola status pesanan      |
| POS          | Buat pesanan baru untuk dine-in atau takeaway |
| KDS          | Pantau dan ubah status persiapan pesanan      |
| Meja         | Kelola meja dan QR ordering                   |
| Produk       | Atur menu, harga, varian, dan add-on          |
| Kategori     | Susun kategori untuk menu pelanggan           |
| Pengguna     | Atur akses staf dan status akun               |
| Peran & Izin | Tentukan izin untuk setiap peran              |
| Laporan      | Lihat penjualan dan produk terlaris           |
| Pengaturan   | Konfigurasi bisnis dan sistem                 |
| Backup       | Cadangkan dan pulihkan data lokal             |
| Lisensi      | Periksa status lisensi instalasi              |

## 9. Mega menu

### 9.1 Desktop layout

Topbar:

```text
[RAVIKA POS] [Dashboard] [Pesanan] [POS] [KDS]     [Theme] [User] [Menu]
```

- Quick links maksimal 4.
- `Menu` adalah button dengan `LayoutGrid` dan `ChevronDown`.
- Quick links dan `Menu` memiliki permission filter.
- `Menu` tetap terlihat jika ada minimal satu item visible.
- `Menu` tidak terbuka karena hover.

Panel:

```text
+--------------------------------------------------------------------------------+
| Ringkasan              Katalog               Analitik            Aksi cepat    |
| Dashboard              Produk                Laporan             Buat pesanan  |
|                        Kategori                                 Buka KDS      |
| Operasional            Bisnis                                  Tambah produk  |
| Pesanan                Pengguna                                 Design system  |
| POS                    Peran & Izin          Sistem                            |
| Meja                                         Pengaturan                          |
|                                              Backup                              |
|                                              Lisensi                             |
+--------------------------------------------------------------------------------+
| Menu mengikuti izin pengguna. Tekan Esc untuk menutup.                          |
+--------------------------------------------------------------------------------+
```

Spesifikasi panel:

- Posisi: absolute di bawah header, full width container.
- Background: `surface`.
- Border: `border`.
- Radius: `rounded-b-xl`.
- Shadow: `--shadow-overlay`.
- Max height: `min(72dvh, 620px)`.
- Overflow: auto.
- Tidak memakai blur.
- Tidak memakai gradient.
- Tidak memakai garis dekoratif.

Kolom:

- 4 kolom pada `xl`.
- 3 kolom pada `lg`.
- 2 kolom pada `md`.
- 1 kolom di mobile sheet.

Item:

- Link asli.
- Icon 18 px.
- Label `text-label` atau `text-body` medium.
- Description `text-caption` muted.
- Padding 12 px.
- Radius 8 px.
- Hover: background muted.
- Focus-visible: ring.
- Active: background `surface-subtle`, icon `primary-strong`, `aria-current="page"`.
- Target minimal 44 px.

Group:

- Label `text-caption` medium, sentence case, tanpa uppercase tracking.
- Description opsional.
- Gap antar-item 4 px.
- Gap antar-group 24 px.

Quick actions:

- Satu primary action: `Buat pesanan`.
- Dua secondary action: `Buka KDS`, `Tambah produk`.
- Satu internal link: `Design system`.
- Semua mengikuti permission.

Footer panel:

- Text kecil: "Menu mengikuti izin pengguna. Tekan Esc untuk menutup."
- Tidak ada CTA tambahan.

### 9.2 Interaksi desktop

- Klik trigger membuka panel.
- Klik trigger lagi menutup panel.
- Escape menutup panel dan mengembalikan fokus ke trigger.
- Klik di luar panel menutup panel.
- Route change menutup panel.
- Fokus pindah ke item pertama saat panel dibuka dengan keyboard.
- Tab berjalan mengikuti urutan visual.
- Shift+Tab berjalan mundur.
- `aria-expanded` dan `aria-controls` pada trigger.
- Panel memakai `<nav aria-label="Menu utama">`.
- Jangan memakai `role="menu"` karena ini panel navigasi dengan banyak grup.

### 9.3 Mobile dan tablet

- Di bawah `1024px`, quick links disembunyikan.
- Trigger `Menu` tetap terlihat.
- `MobileMenuSheet` memakai native dialog.
- Full-screen sheet, `h-dvh`, `max-h-none`, `rounded-none`.
- Header sheet: wordmark, close button.
- Isi sheet: quick actions, lalu group.
- `640px` sampai `1023px`: 2 kolom.
- Di bawah `640px`: 1 kolom.
- Native dialog menangani focus trap.
- Escape menutup.
- Close button mengembalikan fokus ke trigger.
- Body scroll terkunci selama sheet terbuka.
- Target minimal 44 px.

### 9.4 Permission

- Filter group dan item dengan `hasPermission`.
- Jika group kosong, jangan render.
- Quick action juga difilter.
- Jangan menampilkan menu yang tidak diizinkan.
- Frontend filter bukan pengganti authorization backend.

### 9.5 Empty state

Jika user tidak punya akses ke menu apa pun:

- Tampilkan pesan "Tidak ada menu yang dapat diakses untuk peran ini."
- Tampilkan action "Kembali ke dashboard" jika punya akses dashboard.
- Jangan menampilkan mega menu kosong.

## 10. Management shell

### 10.1 Topbar

- Solid `bg-surface`.
- Border bottom.
- Sticky.
- Tinggi 64 px.
- Tanpa backdrop blur.
- Brand kiri: wordmark RAVIKA dan label POS.
- Quick links tengah.
- Kanan: theme toggle, user menu, menu trigger.

### 10.2 User menu

Isi:

- Nama dan role.
- Profil.
- Keluar.
- Pratinjau role mock.
- Design system, internal.
- Versi aplikasi atau "Mode UI" jika diperlukan.

Pratinjau role harus jelas sebagai mock. Jangan menyamarkan sebagai fitur produksi.

### 10.4 Footer

Gunakan kalimat, bukan middle dot:

```text
Mode UI dengan data simulasi. Sesi: Pemilik.
```

### 10.5 Layout

- Main content `max-width: 1440px`.
- Padding mobile 16 px.
- Padding tablet 24 px.
- Padding desktop 32 px.
- Page gap 24 px mobile, 32 px desktop.
- Skip link ke `#main-content`.
- Main element memiliki `id="main-content"`.

## 11. Dashboard

### 11.1 Struktur

```text
Page header
  Dashboard
  Ringkasan operasional hari ini
  Hari ini, 16 November 2026
  Data simulasi
  Buat pesanan

Hero row
  Penjualan hari ini (8 cols)
  Antrean sekarang (4 cols)

Second row
  Penjualan 7 hari (8 cols)
  Produk terlaris (4 cols)

Recent orders
  Table desktop
  Card list mobile
```

### 11.2 Page header

- Title: "Dashboard".
- Description: "Ringkasan operasional hari ini."
- Context line: "Hari ini, 16 November 2026".
- Badge kecil: "Data simulasi".
- Primary action: "Buat pesanan" menuju `/app/pos`.
- Hapus eyebrow uppercase "RAVIKA Kemang".

### 11.3 Penjualan hari ini

Panel dominan:

- Label: "Penjualan hari ini".
- Value: `formatCurrency(4850000)`.
- Delta: "+12,4% dibanding kemarin" dengan data simulasi.
- Sparkline.
- Sub-metrics:
  - Transaksi: 128.
  - Rata-rata: Rp 37.890.
  - Item terjual: 342.

Aturan:

- Satu angka dominan.
- Jangan memakai empat card sama besar.
- Delta diberi label "Data simulasi" di panel atau page header.
- Sparkline tidak memiliki sumbu.
- Chart memiliki teks alternatif untuk screen reader.

### 11.4 Antrean sekarang

Panel status:

- Baru: 12.
- Diterima: 8.
- Disiapkan: 6.
- Siap: 3.
- Service flow horizontal.
- CTA: "Buka KDS".

Aturan:

- Gunakan `ServiceFlow`.
- Status tidak hanya warna. Sertakan label dan count.
- READY tetap terlihat.
- Panel ini adalah fokus operasional kedua setelah penjualan.

### 11.5 Penjualan 7 hari

- Bar chart dengan gridline horizontal.
- Label sumbu Y dalam juta Rupiah.
- Label sumbu X: hari.
- Satu accent: `primary`.
- Gridline: `border`.
- Tooltip via `<title>` atau elemen aksesibel.
- Tabel teks `sr-only` berisi nilai lengkap.
- Caption: "Dalam juta Rupiah. Data simulasi."

### 11.6 Produk terlaris

Daftar 4 produk contoh:

- Nama produk.
- Jumlah terjual.
- Revenue.
- Progress bar tipis.
- Label "Data contoh".

Jangan memakai chart tambahan jika daftar lebih jelas.

### 11.7 Recent orders

Desktop:

- Table.
- Kolom: Nomor, Waktu, Total, Pembayaran, Persiapan.
- Numeric alignment.
- StatusBadge terpisah.
- Row hover hanya jika row interactive.
- Action "Lihat semua pesanan".

Mobile:

- Card list.
- Card berisi nomor, waktu, total, dua status badge.
- Tidak ada horizontal scroll.
- Maksimal 5 item.
- Action "Lihat semua pesanan".

### 11.8 Hapus preview shell

- Hapus card "Pratinjau shell" dari dashboard.
- Pindahkan link ke user menu atau mega menu.
- Dashboard harus terasa seperti produk, bukan halaman demo.

## 12. POS

### 12.1 Layout desktop

- Category rail kiri 180 sampai 220 px.
- Product area tengah.
- Cart panel kanan 320 sampai 380 px.
- Header compact.
- Page background `surface-subtle`.
- Product card `surface`.

### 12.2 Header

- Wordmark.
- Kasir.
- Connection indicator.
- Cart button mobile.
- Theme toggle.
- Exit POS.

### 12.3 Category rail

- Search di atas.
- Daftar kategori vertikal.
- Item aktif memakai background muted dan text foreground.
- Target 44 px.
- Di tablet dan mobile, berubah menjadi category chips horizontal.

### 12.4 Product grid

- 6 produk contoh.
- Card:
  - Placeholder gambar netral dengan icon kategori.
  - Nama produk.
  - Harga.
  - Status tersedia.
  - Tombol tambah.
- Label "Data contoh" di header area.
- Jangan memakai foto produk palsu.
- Jangan memakai skeleton sebagai produk final.

### 12.5 Cart panel

- Header "Pesanan".
- Order type: Dine-in atau Takeaway.
- Item list contoh.
- Quantity control.
- Subtotal.
- Total.
- Checkout button.
- Jika aksi belum aktif, tampilkan disabled button dengan label "Checkout aktif di Fase 3".
- Empty state jika cart kosong.

### 12.6 Mobile

- Product list satu kolom atau dua kolom.
- Sticky cart bar di bawah:
  - Jumlah item.
  - Total.
  - Button "Lihat keranjang".
- Cart drawer.
- Jangan menutupi konten terakhir. Gunakan padding bawah.

## 13. KDS

### 13.1 Header

- Dark solid.
- Brand.
- Connection indicator.
- Theme toggle.
- Exit.
- Status summary: aktif, siap, rata-rata waktu.
- Label "Data contoh".

### 13.2 Service flow

Horizontal di atas board:

`Baru -> Diterima -> Disiapkan -> Siap -> Selesai`

- Step aktif memakai primary.
- Step selesai memakai success.
- Step berikutnya memakai muted.
- Count ditampilkan per step.

### 13.3 Board

- 5 kolom status.
- Lebar minimum kolom 260 px.
- Horizontal scroll di layar sempit.
- Jangan menyempitkan ticket.
- Setiap kolom memiliki header status, count, dan description.
- Ticket:
  - Nomor pesanan.
  - Tipe pesanan dan meja.
  - Waktu masuk.
  - Elapsed time.
  - Item, quantity, catatan.
  - Status badge.
- Action status tidak ditampilkan sampai Fase 3.
- Empty column menampilkan pesan singkat.

### 13.4 Mock data

- Tambah `src/mocks/kds.ts`.
- 4 sampai 5 ticket contoh.
- Label "Data contoh".
- Jangan mengklaim sebagai pesanan nyata.
- Jangan menampilkan data pelanggan yang tidak perlu.

## 14. Customer menu

### 14.1 Header

- Brand.
- Meja atau tipe pesanan.
- Link "Lihat pesanan" jika tersedia.
- Tanpa account.

### 14.2 Menu

- Search.
- Category chips horizontal.
- Product grid 2 kolom di mobile.
- Product card:
  - Placeholder gambar netral.
  - Nama.
  - Harga.
  - Tombol tambah.
- Label "Data contoh".
- Section heading per kategori.
- Jangan memakai foto stok.

### 14.3 Cart bar

- Sticky di bawah.
- Jumlah item.
- Total.
- Button "Lihat keranjang".
- Cart drawer.
- Padding bawah konten agar tidak tertutup.

### 14.4 Order status

- Halaman `/order/[publicToken]`.
- Card ringkasan.
- Payment status dan preparation status terpisah.
- Service flow vertikal.
- Timeline:
  - Diterima.
  - Disiapkan.
  - Siap.
  - Selesai.
- Status saat ini jelas.
- Tidak menampilkan token mentah.
- Tidak menampilkan data pelanggan lain.

## 15. Login

### 15.1 Desktop

Split layout:

- Kiri: panel `surface-inverse` dengan wordmark, tagline, dan tiga fakta produk dari PRD.
- Kanan: form login.

Fakta produk yang boleh ditampilkan:

- "Kasir, KDS, dan QR menu dalam satu alur."
- "Berjalan di jaringan lokal."
- "Data operasional tetap di komputer server Anda."

Jangan menampilkan testimonial, logo pelanggan, atau statistik.

### 15.2 Mobile

- Panel brand menjadi header ringkas.
- Form di bawah.
- Tetap ada theme toggle.
- Target sentuh 44 px.

### 15.3 Form

- Email atau username.
- Kata sandi.
- Checkbox "Ingat sesi di perangkat ini".
- Button "Masuk".
- Simulasi feedback toast.
- Label dan error association.
- Tidak ada kredensial yang dikirim.

## 16. Design system preview

Route `/app/design-system` tetap ada.

Tambahkan:

- Token color swatches.
- Type scale.
- Spacing scale.
- Button variants dan states.
- Form controls.
- Badges dan status.
- Table desktop dan mobile.
- Mega menu preview.
- Service flow preview.
- Empty, loading, error, permission, offline.
- Chart.
- Dialog, drawer, tabs, tooltip, toast.

Tujuan halaman ini adalah QA internal, bukan produk. Jangan tampilkan di dashboard utama.

## 17. Component specifications

### 17.1 Button

- Hapus `shadow-sm`.
- Primary memakai `primary-action`.
- Focus-visible ring.
- Active scale 0.98.
- Transition 160 ms ease-out.
- Loading state tetap.
- Jangan memakai lebih dari satu primary button per action group.

### 17.2 Card

- Default: flat, border, no shadow.
- `interactive`: hover border primary, no lift.
- `elevated`: shadow overlay, hanya untuk overlay.
- `inverse`: surface inverse, untuk panel login.
- Hapus shadow default dari semua card.

### 17.3 Badge

- Radius `rounded-md`, bukan pill default.
- Text memakai `foreground` atau `*-strong`.
- Status memakai dot semantic dan text.
- Jangan memakai warna saja.
- Label sentence case.

### 17.4 PageHeader

- Hapus eyebrow uppercase.
- Tambah context line sentence case.
- Title, description, actions.
- Context line dapat berisi tanggal.
- Actions maksimal dua.

### 17.5 Table

- Header `surface-subtle`.
- Numeric alignment.
- Row hover hanya jika interactive.
- Mobile card list untuk recent orders.
- Tidak ada horizontal overflow pada halaman.
- Jika table harus scroll, beri wrapper dan hint.

### 17.6 Chart

- Gridline horizontal.
- Label sumbu.
- Satu accent.
- Tooltip atau `<title>`.
- Teks alternatif `sr-only`.
- Jangan memakai chart untuk data yang lebih jelas sebagai daftar.

### 17.7 EmptyState

- Surface solid, bukan dashed default.
- Icon dalam kotak kecil.
- Title, description, action.
- Empty state menjelaskan sebab dan langkah berikutnya.
- Jangan memakai "No data" generik.

### 17.8 Toast

- Surface elevated.
- Border tipis.
- Icon semantic.
- Text foreground.
- Auto dismiss 4 detik.
- Jangan memakai toast sebagai satu-satunya konfirmasi transaksi kritis.

### 17.9 MegaMenu

- Client component.
- Props: `groups`, `quickActions`, `activePath`.
- Trigger internal.
- Panel internal.
- Permission filter dilakukan sebelum data dikirim.
- `aria-expanded`, `aria-controls`.
- Escape, outside click, route change.
- Focus management.
- Tanpa hover opening.

### 17.10 MobileMenuSheet

- Native dialog.
- Full screen.
- Focus trap.
- Escape.
- Close button.
- Body scroll lock.
- 1 kolom di mobile, 2 kolom di tablet.

### 17.11 ServiceFlow

- Horizontal dan vertical.
- State: complete, current, upcoming, cancelled.
- Count opsional.
- Label selalu ada.
- Tidak hanya warna.
- Digunakan di dashboard, KDS, order status.

### 17.13 ProductCard

- Preview only untuk Fase 1.5.
- Placeholder gambar netral.
- Nama, harga, availability.
- Tombol tambah.
- Label "Data contoh".
- Ganti dengan domain component di Fase 3.

### 17.14 OrderTicket

- Preview only untuk Fase 1.5.
- Order number, type, table, time, items, notes.
- Status badge.
- Tanpa action palsu.
- Ganti dengan domain component di Fase 3.

### 17.15 OrderMobileCard

- Card list untuk recent orders di mobile.
- Nomor, waktu, total, payment status, preparation status.
- Target action 44 px.

## 18. Motion

- Hover link: 120 ms ease-out.
- Button press: scale 0.98, 120 ms.
- Mega menu: opacity dan translateY(-4px), 160 ms ease-out.
- Mobile sheet: native dialog, 200 ms overlay.
- Dialog dan drawer: 200 ms.
- Toast: 200 ms.
- Tidak ada loop dekoratif.
- Tidak ada scroll reveal.
- Tidak ada parallax.
- Hormati `prefers-reduced-motion`.

## 19. Responsive

| Width        | Management              | POS                         | KDS               | Customer       |
| ------------ | ----------------------- | --------------------------- | ----------------- | -------------- |
| `< 640`      | Full-screen sheet       | 1 kolom, cart drawer        | Horizontal scroll | 2 kolom produk |
| `640 - 1023` | Sheet 2 kolom           | Category chips, cart drawer | Horizontal scroll | 2 kolom        |
| `>= 1024`    | Quick links + mega menu | Category rail, cart panel   | Board penuh       | Max width 480  |
| `>= 1440`    | Container 1440          | Cart panel lebar            | Board penuh       | Max width 480  |

Aturan:

- Tidak ada horizontal overflow halaman.
- Tidak ada text keluar container.
- Target sentuh minimal 44 px.
- Sticky header tidak menutupi fokus.
- Sticky cart bar memberi padding bawah.
- Table mobile menjadi card list.

## 20. Aksesibilitas

- WCAG 2.2 AA.
- Semua fungsi utama keyboard operable.
- Focus indicator terlihat.
- Skip link.
- Label form.
- Error association.
- Status text, bukan warna saja.
- `aria-current` untuk nav aktif.
- Dialog dan sheet focus trap.
- Escape menutup overlay.
- `prefers-reduced-motion`.
- Touch target 44 px.
- Kontras teruji.
- Heading hierarchy.
- Jangan memakai `outline: none` tanpa replacement.
- Jangan memakai clickable div.

## 21. Copywriting

Aturan:

- Bahasa Indonesia.
- Sentence case.
- Ringkas.
- Spesifik.
- Tanpa em dash.
- Tanpa middle dot untuk metadata.
- Tanpa buzzword.
- Tanpa "seamless", "powerful", "revolutionary".
- CTA memakai verb + object.
- Empty state menjelaskan sebab dan action.
- Error menjelaskan apa yang gagal dan cara memperbaiki.
- Jangan memakai "No data" generik.

Contoh:

| Konteks           | Copy                                                              |
| ----------------- | ----------------------------------------------------------------- |
| Primary dashboard | Buat pesanan                                                      |
| KDS               | Buka KDS                                                          |
| Product           | Tambah produk                                                     |
| Table             | Lihat semua pesanan                                               |
| Empty orders      | Belum ada pesanan. Pesanan baru akan muncul di sini.              |
| Empty cart        | Keranjang masih kosong. Pilih produk untuk mulai membuat pesanan. |
| Offline           | Koneksi ke server terputus. Periksa jaringan LAN atau Wi-Fi.      |
| Error             | Data gagal dimuat. Coba lagi.                                     |
| Logout mock       | Keluar akan tersedia setelah autentikasi nyata.                   |
| Design system     | Design system                                                     |

Placeholder kosong:

- `EMPTY_VALUE = "Tidak ada"`.
- Untuk tanggal: `"Belum ada"`.
- Jangan memakai em dash.

## 22. Mock data

- Semua mock data disimpan di `src/mocks`.
- Jangan hardcode data berulang di komponen.
- Beri komentar bahwa data adalah simulasi.
- Tampilkan label "Data contoh" atau "Data simulasi" di UI.
- Jangan memakai nama pelanggan nyata.
- Jangan memakai foto orang.
- Jangan memakai statistik yang tidak bisa diverifikasi.
- Data KDS dan katalog hanya untuk preview Fase 1.5.
- Jangan menganggap mock data sebagai persistence.

## 23. File map

Baru:

- `src/components/ui/mega-menu.tsx`
- `src/components/ui/mobile-menu-sheet.tsx`
- `src/components/ui/service-flow.tsx`
- `src/components/ui/product-card.tsx`
- `src/components/ui/order-ticket.tsx`
- `src/components/ui/order-mobile-card.tsx`
- `src/mocks/catalog.ts`
- `src/mocks/kds.ts`

Diubah:

- `src/types/ui.ts`
- `src/mocks/navigation.ts`
- `src/mocks/dashboard.ts`
- `src/styles/tokens.css`
- `src/app/globals.css`
- `src/components/shells/management-shell.tsx`
- `src/components/shells/pos-shell.tsx`
- `src/components/shells/kds-shell.tsx`
- `src/components/shells/customer-shell.tsx`
- `src/components/shells/auth-shell.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/layout.tsx`
- `src/components/ui/table.tsx`
- `src/components/ui/chart.tsx`
- `src/components/ui/toast.tsx`
- `src/components/feedback/empty-state.tsx`
- `src/components/feedback/error-state.tsx`
- `src/app/(dashboard)/app/page.tsx`
- `src/app/(dashboard)/app/design-system/page.tsx`
- `src/app/(cashier)/app/pos/page.tsx`
- `src/app/(kds)/kds/page.tsx`
- `src/app/(customer)/menu/[token]/page.tsx`
- `src/app/(customer)/order/[publicToken]/page.tsx`
- `src/app/(auth)/login/page.tsx`
- `src/lib/format.ts`
- `docs/design/design-system.md`
- `README.md`
- `AGENTS.md`

## 24. Implementation order

### Step 1: Foundation

- Tambah token kontras dan motion.
- Update base CSS cursor, scroll padding, focus.
- Update Button, Card, Badge, PageHeader, Table, Chart, EmptyState, Toast.
- Verifikasi build dan typecheck.

### Step 2: Navigation

- Update types dan mock navigation.
- Buat MegaMenu.
- Buat MobileMenuSheet.
- Refactor ManagementShell.
- Verifikasi keyboard dan mobile.

### Step 3: Dashboard

- Update mock dashboard.
- Buat ServiceFlow.
- Buat komposisi metric dominan dan queue.
- Buat chart dengan label sumbu.
- Buat top products.
- Buat OrderMobileCard.
- Hapus preview shell card.

### Step 4: POS, KDS, Customer

- Tambah catalog mock dan KDS mock.
- Buat ProductCard dan OrderTicket.
- Refactor POS, KDS, customer menu, order status.
- Verifikasi responsive dan dark theme.

### Step 5: Login dan design system preview

- Refactor login split layout.
- Update design system preview.
- Tambah mega menu preview.
- Tambah token swatches.

### Step 6: QA dan docs

- Update design system doc.
- Update README dan AGENTS.
- Jalankan semua QA.
- Jalankan antislop Delivery Gate.

## 25. QA matrix

| Surface          | 390 | 768 | 1024 | 1440 | Light | Dark | Keyboard |
| ---------------- | --- | --- | ---- | ---- | ----- | ---- | -------- |
| Management shell | Ya  | Ya  | Ya   | Ya   | Ya    | Ya   | Ya       |
| Mega menu        | Ya  | Ya  | Ya   | Ya   | Ya    | Ya   | Ya       |
| Dashboard        | Ya  | Ya  | Ya   | Ya   | Ya    | Ya   | Ya       |
| POS              | Ya  | Ya  | Ya   | Ya   | Ya    | Ya   | Ya       |
| KDS              | Ya  | Ya  | Ya   | Ya   | Ya    | Ya   | Ya       |
| Customer menu    | Ya  | Ya  | Ya   | Ya   | Ya    | Ya   | Ya       |
| Order status     | Ya  | Ya  | Ya   | Ya   | Ya    | Ya   | Ya       |
| Login            | Ya  | Ya  | Ya   | Ya   | Ya    | Ya   | Ya       |
| Design system    | Ya  | Ya  | Ya   | Ya   | Ya    | Ya   | Ya       |

## 26. Verification commands

```bash
pnpm check
pnpm build
pnpm install --frozen-lockfile
```

Untuk QA visual, jalankan dev server dan periksa:

- 1440x900
- 1024x768
- 768x1024
- 390x844
- 320x568

Periksa:

- Tidak ada horizontal overflow.
- Semua target 44 px.
- Semua focus state terlihat.
- Mega menu buka, Tab, Escape, klik luar, route change.
- Mobile sheet buka, Escape, close, fokus kembali.
- Dialog, drawer, tabs, tooltip, toast.
- Light dan dark.
- Reduced motion.
- Console bersih.
- Tidak ada dead control.
- Tidak ada em dash di UI.
- Semua data mock berlabel.

## 27. Acceptance criteria

Refactor selesai jika:

- Mega menu berfungsi di desktop, tablet, dan mobile.
- Quick links hanya Dashboard, Pesanan, POS, KDS.
- Semua item mega menu memiliki route nyata.
- Permission filter berfungsi.
- Mobile sheet dapat dibuka dan ditutup dengan keyboard.
- Dashboard memiliki satu metric dominan dan satu panel antrean.
- Tidak ada empat stat card sama besar.
- Tidak ada preview shell card di dashboard.
- Header tidak memakai blur.
- Card default tidak memakai shadow.
- Badge label tidak memakai pill default.
- Table recent orders menjadi card list di mobile.
- Chart memiliki label sumbu dan teks alternatif.
- POS, KDS, customer, dan login memakai layout baru.
- Semua text memenuhi WCAG AA.
- Light dan dark theme konsisten.
- Tidak ada overflow di 320 px.
- Tidak ada dependency baru.
- `pnpm check` lulus.
- `pnpm build` lulus.
- Antislop Delivery Gate PASS.

## 28. Antislop Delivery Gate

Sebelum handoff, laporkan PASS atau FAIL untuk:

- Tidak ada em dash di UI.
- Tidak ada horizontal overflow di 320 px.
- Tidak ada statistik atau testimonial palsu.
- Tidak ada aset visual yang dibuat tanpa izin.
- Tidak ada nav link ke route yang tidak ada.
- Semua text memenuhi kontras AA.
- Tidak ada control tanpa behavior.
- Empty, loading, dan error state tersedia.
- Keyboard navigation berfungsi.
- Theme light dan dark berfungsi.
- Build dan click-through sudah dijalankan.
- Tidak ada klaim performa atau keamanan tanpa bukti.
- Dials ENERGY 2, RHYTHM 2, MOTION 1 konsisten.
- Satu focal point per layar.
- Accent dipakai hemat.
- Tidak ada glass, gradient, glow, atau grid dekoratif.
- Tidak ada pill badge default.
- Tidak ada fake data tanpa label.
- Semua target sentuh 44 px.
- Semua field memiliki label.
- Semua gambar atau placeholder memiliki alt atau aria-hidden yang sesuai.
- Reduced motion dihormati.

## 29. Risiko dan mitigasi

| Risiko                                      | Mitigasi                                                                            |
| ------------------------------------------- | ----------------------------------------------------------------------------------- |
| Mega menu focus management rumit            | Gunakan disclosure pattern, bukan role menu. Uji Tab, Shift+Tab, Escape, klik luar. |
| Perubahan warna primary memengaruhi brand   | Tetap di keluarga biru. Hanya text dan fill action yang digelapkan untuk kontras.   |
| Mock data disalahartikan sebagai data nyata | Label "Data contoh" atau "Data simulasi" di setiap surface.                         |
| Table mobile tetap padat                    | Gunakan card list, bukan horizontal scroll untuk recent orders.                     |
| Sticky header menutupi fokus                | `scroll-padding-top` dan uji keyboard.                                              |
| Dark theme kontras                          | Uji semua pair di kedua theme.                                                      |
| Tidak ada test runner                       | Gunakan lint, typecheck, build, Playwright, dan checklist manual.                   |
| Asset logo dan foto belum ada               | Gunakan wordmark dan placeholder netral. Jangan membuat logo atau foto palsu.       |

## 30. Handoff ke Fase 2

Setelah refactor ini selesai:

- Fase 2 memakai shell, token, dan komponen yang sudah dirapikan.
- Halaman management fitur menggantikan placeholder.
- Mega menu tetap dipakai.
- Mock data tetap terpusat.
- Permission gating tetap mock sampai backend.
- Jangan mengubah pola visual yang sudah disetujui tanpa spec baru.

## 31. Implementation notes

- Token kontras dan motion sudah ditambahkan di `src/styles/tokens.css`.
- Mega menu desktop dan full-screen sheet mobile sudah diimplementasikan.
- Dashboard memakai metric dominan, service flow, chart dengan label sumbu, dan card list mobile.
- POS memakai cart context lokal, product card contoh, category rail, dan cart drawer.
- KDS memakai ticket contoh, service flow, dan board horizontal.
- Customer menu memakai product card contoh, sticky cart bar, dan drawer.
- Login memakai split layout dengan panel brand navy.
- `primary-action` dipakai untuk filled action; `primary-strong` dan `*-strong` dipakai untuk text.
- Tidak ada dependency baru.
- `pnpm check` dan `pnpm build` harus tetap lulus setelah perubahan berikutnya.
