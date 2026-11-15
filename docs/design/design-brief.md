# RAVIKA POS — Design Brief

> **Status:** Approved design foundation  
> **Version:** 1.0.0  
> **Date:** 15 November 2026  
> **Product tagline:** Run your business with clarity.  
> **Product category:** Self-hosted, offline-first Point of Sale (POS)

## 1. Purpose of this document

Dokumen ini menjelaskan tujuan, konteks, pengguna, kebutuhan, ruang lingkup, dan hasil yang diharapkan dari desain UI/UX RAVIKA POS. Dokumen ini menjadi landasan bagi `design-direction.md`, `design-system.md`, dan `ui-ux-guidelines.md`.

Dokumen desain tidak boleh mengubah keputusan produk yang telah ditetapkan dalam PRD. Jika terdapat konflik, PRD menjadi sumber kebenaran untuk perilaku dan ruang lingkup produk; dokumen desain menjadi sumber kebenaran untuk presentasi visual dan interaksi.

## 2. Product overview

RAVIKA POS adalah aplikasi Point of Sale self-hosted untuk bisnis yang membutuhkan operasional penjualan melalui jaringan lokal. Satu instalasi melayani satu bisnis, dan satu bisnis dapat memiliki beberapa outlet. Aplikasi berjalan pada komputer server lokal dan diakses perangkat lain melalui LAN/Wi-Fi.

RAVIKA POS bukan SaaS yang bergantung pada cloud, bukan website builder, dan bukan sekadar dashboard analitik. Produk harus mendukung pekerjaan operasional sehari-hari: mengelola katalog, menerima pesanan, memproses pembayaran, menyiapkan pesanan, serta memantau performa bisnis.

### 2.1 Product promise

- **Run your business with clarity.**
- Membuat pekerjaan operasional mudah dipahami.
- Mengurangi langkah yang tidak perlu dalam transaksi.
- Menampilkan status pesanan dan pembayaran secara jelas.
- Menyediakan antarmuka yang konsisten untuk Owner, Cashier, Barista, dan pelanggan.

## 3. Design goals

1. **Operational speed:** tugas berulang seperti mencari produk, menambahkan item, dan menyelesaikan pembayaran harus dapat dilakukan dengan cepat.
2. **Clarity:** pengguna harus dapat memahami status, nilai transaksi, dan tindakan berikutnya tanpa menebak.
3. **Consistency:** pola visual dan interaksi konsisten di seluruh modul.
4. **Role focus:** setiap peran melihat navigasi dan tindakan yang relevan dengan tanggung jawabnya.
5. **Responsive usability:** antarmuka tetap dapat digunakan pada desktop, tablet, dan mobile, dengan prioritas layout sesuai konteks tugas.
6. **Theme flexibility:** seluruh pengalaman internal mendukung light dan dark theme.
7. **Resilience awareness:** koneksi lokal, status server, dan kondisi sinkronisasi harus disampaikan dengan jelas ketika relevan.
8. **Accessibility:** antarmuka dapat dioperasikan dengan keyboard dan tidak mengandalkan warna sebagai satu-satunya pembawa makna.

## 4. Non-goals

Desain tidak mencakup atau mengasumsikan fitur berikut sebagai bagian MVP:

- Website marketing atau website builder.
- Native Android/iOS application.
- Inventory bahan baku, resep, supplier, dan purchase order.
- Loyalty, membership, CRM, atau promosi kompleks.
- Integrasi payment gateway otomatis.
- WhatsApp automation.
- Cloud synchronization atau SaaS multi-tenant.
- Advanced analytics di luar kebutuhan laporan MVP.
- Integrasi printer atau perangkat keras khusus kecuali disetujui sebagai scope terpisah.

PWA dapat menjadi peningkatan setelah core product. Jangan menjadikan service worker sebagai dasar transaksi offline LAN.

## 5. Target users and contexts

### 5.1 Owner

**Tujuan:** mengelola bisnis dan memahami performa operasional.

Kebutuhan utama:

- Melihat ringkasan penjualan dan transaksi.
- Memilih outlet dan rentang tanggal.
- Mengelola produk, kategori, meja, outlet, dan pengguna.
- Mengelola role serta permission.
- Melihat laporan dan riwayat transaksi.
- Mengelola pengaturan, backup, dan status lisensi.

Konteks:

- Umumnya menggunakan desktop atau laptop.
- Membutuhkan tabel, filter, ringkasan, dan form yang jelas.
- Tidak perlu melihat kontrol kasir yang terlalu dominan.

### 5.2 Cashier

**Tujuan:** membuat pesanan dan menyelesaikan transaksi dengan cepat dan akurat.

Kebutuhan utama:

- Mencari dan memilih produk.
- Memilih varian dan add-on jika tersedia.
- Membuat pesanan dine-in atau takeaway.
- Memilih meja untuk dine-in.
- Memeriksa keranjang dan total.
- Mencatat satu atau beberapa pembayaran.
- Melihat status pembayaran dan riwayat pesanan yang relevan.

Konteks:

- Menggunakan desktop atau tablet pada area kasir.
- Dapat bekerja dalam periode sibuk dan mengalami interupsi.
- Membutuhkan target sentuh yang nyaman dan informasi total yang selalu terlihat.
- Memerlukan dedicated POS mode, bukan dashboard penuh.

### 5.3 Barista

**Tujuan:** menerima dan memproses pesanan yang perlu disiapkan.

Kebutuhan utama:

- Melihat pesanan baru.
- Menerima pesanan.
- Memperbarui status accepted, preparing, ready, dan completed.
- Melihat item, kuantitas, catatan, nomor pesanan, meja atau tipe pesanan, serta durasi.

Konteks:

- Menggunakan layar desktop/tablet yang dapat dilihat dari jarak tertentu.
- Bekerja cepat dan sering menggunakan sentuhan.
- Membutuhkan kontras, hierarki, dan status yang mudah dikenali.
- READY harus tetap terlihat sampai pesanan diambil atau diselesaikan.

### 5.4 Customer

**Tujuan:** melihat menu dan mengirim pesanan melalui QR tanpa membuat akun.

Kebutuhan utama:

- Membuka menu melalui QR.
- Menelusuri kategori dan produk.
- Melihat deskripsi, harga, varian, dan add-on.
- Menambahkan item ke keranjang.
- Mengirim pesanan dan melihat konfirmasi.

Konteks:

- Mobile-first, browser-based.
- Tidak memerlukan instalasi aplikasi atau akun.
- Pengalaman harus sederhana, cepat, dan dapat dipahami pengguna baru.

## 6. Approved experience architecture

RAVIKA POS memiliki empat pengalaman antarmuka:

| Experience             | Primary user | Primary device   | Layout                                            |
| ---------------------- | ------------ | ---------------- | ------------------------------------------------- |
| Owner Management       | Owner        | Desktop / tablet | Responsive management shell dengan top navigation |
| Dedicated POS          | Cashier      | Desktop / tablet | Transaction-focused workspace                     |
| Kitchen Display System | Barista      | Desktop / tablet | Order board dengan kolom status                   |
| Customer QR Menu       | Customer     | Mobile           | Mobile-first storefront/menu                      |

Keempat pengalaman menggunakan identitas brand dan design tokens yang sama. Namun, mereka tidak harus menggunakan satu layout universal.

## 7. Approved design decisions

| Area                       | Approved decision                                     |
| -------------------------- | ----------------------------------------------------- |
| Product design approach    | Modern Operational SaaS                               |
| Platform                   | Responsive                                            |
| Theme                      | Light dan dark                                        |
| Information density        | Balanced                                              |
| Main management navigation | Topbar                                                |
| Cashier experience         | Dedicated POS                                         |
| Main font                  | Plus Jakarta Sans                                     |
| Alternative font           | Inter                                                 |
| Iconography                | Lucide Icons                                          |
| Brand palette              | Deep Navy, Brand Blue, Accent Blue, White, Light Gray |
| Card style                 | Flat, subtle border, minimal shadow                   |
| Radius                     | Umumnya 8–12 px                                       |
| Motion                     | Subtle dan cepat                                      |
| Default theme resolution   | System preference, fallback light                     |
| KDS default                | Dark                                                  |
| POS default                | Light                                                 |
| QR Menu default            | Light                                                 |

## 8. Information architecture scope

### Management

- Dashboard
- Orders
- Products
- Categories
- Tables
- Outlets
- Users
- Roles & Permissions
- Reports
- Settings
- Backup
- License

### Dedicated POS

- Product search
- Category filters
- Product selection
- Variant/add-on selection
- Order type
- Table selection
- Cart
- Checkout
- Payment entry
- Transaction confirmation

### KDS

- New
- Accepted
- Preparing
- Ready
- Completed (dapat berada di history/secondary view sesuai kebutuhan operasional)

### Customer QR Menu

- Business/outlet identity
- Menu categories
- Product listing and detail
- Cart
- Checkout/order submission
- Order confirmation

Navigasi dan tindakan internal wajib mengikuti permission pengguna. Jangan menganggap seluruh menu dapat diakses oleh semua role.

## 9. Design principles

### 9.1 Clarity before decoration

Gunakan hierarki, alignment, spacing, dan typography untuk menjelaskan informasi. Hindari ornamen yang tidak menambah pemahaman.

### 9.2 Task-first interfaces

Susun halaman berdasarkan pekerjaan utama pengguna, bukan berdasarkan keinginan menampilkan sebanyak mungkin komponen.

### 9.3 Visible system status

Tampilkan status pesanan, pembayaran, koneksi, dan aksi yang sedang diproses secara eksplisit.

### 9.4 Safe transactions

Total, metode pembayaran, jumlah diterima, dan kembalian harus mudah diverifikasi. Aksi destruktif membutuhkan konfirmasi yang sesuai.

### 9.5 Progressive disclosure

Tampilkan informasi inti terlebih dahulu. Detail lanjutan dapat muncul melalui dialog, drawer, expandable section, atau detail page.

### 9.6 Consistent behavior

Komponen yang memiliki fungsi sama harus berperilaku sama di seluruh aplikasi.

## 10. Responsive strategy

Breakpoint awal:

- Mobile: `< 640px`
- Tablet: `640–1023px`
- Desktop: `≥ 1024px`
- Wide desktop: `≥ 1440px`

Breakpoint adalah titik awal implementasi, bukan aturan kaku. Keputusan layout harus berdasarkan kebutuhan konten dan pengujian.

- Management: topbar menjadi compact navigation atau drawer pada layar sempit.
- POS: product area dan cart berubah menjadi stacked layout atau cart drawer/panel.
- KDS: board dapat menjadi horizontal scroll atau kolom adaptif; jangan membuat ticket terlalu sempit.
- QR Menu: mobile-first, satu kolom pada layar kecil, grid hanya ketika ruang mencukupi.

## 11. Accessibility and usability targets

- Semua fungsi utama dapat dioperasikan dengan keyboard.
- Focus indicator terlihat jelas.
- Kontras teks dan kontrol memenuhi WCAG 2.2 AA sebagai target.
- Status tidak hanya dibedakan melalui warna.
- Form memiliki label yang jelas dan pesan error yang spesifik.
- Touch target utama disarankan minimal 44 × 44 CSS px.
- Animasi menghormati `prefers-reduced-motion`.
- Layout tidak bergantung pada hover untuk mengungkap fungsi penting.

## 12. Success criteria

Desain dianggap berhasil ketika:

- Pengguna baru dapat memahami navigasi utama tanpa pelatihan panjang.
- Kasir dapat menyelesaikan alur transaksi inti dengan langkah yang jelas.
- Barista dapat mengenali pesanan baru dan statusnya dari tampilan KDS.
- Pelanggan dapat menyelesaikan pemesanan QR melalui browser mobile tanpa akun.
- Perubahan theme tidak mengurangi keterbacaan atau konsistensi.
- Layout tetap usable pada ukuran desktop, tablet, dan mobile yang didukung.
- Loading, empty, error, offline/disconnected, dan success states dirancang, bukan dibiarkan sebagai kondisi tak tertangani.

## 13. Dependencies and source of truth

Urutan otoritas:

1. PRD RAVIKA POS — scope, business rules, workflow, permissions, and product behavior.
2. `design-brief.md` — design objectives and user context.
3. `design-direction.md` — visual direction and composition.
4. `design-system.md` — tokens and reusable component foundations.
5. `ui-ux-guidelines.md` — implementation and interaction rules.

Jika ada keputusan yang belum ditentukan di PRD, jangan membuat asumsi produk baru. Catat sebagai unresolved decision dan minta klarifikasi sebelum implementasi yang berdampak pada alur bisnis.
