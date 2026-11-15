# RAVIKA POS — UI/UX Guidelines

> **Status:** Approved  
> **Version:** 1.0.0  
> **Audience:** Product designers, frontend developers, QA, and AI coding agents

## 1. Purpose

Dokumen ini menjelaskan aturan implementasi UI/UX RAVIKA POS: struktur halaman, navigasi, interaksi, responsive behavior, state, accessibility, dan standar kualitas.

Gunakan dokumen ini bersama:

- `design-brief.md`
- `design-direction.md`
- `design-system.md`
- PRD RAVIKA POS

PRD mengatur perilaku produk dan business rules. Dokumen ini mengatur bagaimana perilaku tersebut ditampilkan dan dioperasikan.

## 2. Global experience rules

1. Setiap halaman harus memiliki satu tujuan utama yang jelas.
2. Tampilkan tindakan paling penting secara konsisten.
3. Gunakan istilah yang sama untuk status dan aksi di seluruh aplikasi.
4. Jangan membuat pengguna menebak apakah aksi berhasil.
5. Jangan menghilangkan konteks ketika membuka detail atau dialog.
6. Berikan feedback untuk aksi yang membutuhkan waktu.
7. Jangan menampilkan menu atau aksi yang tidak diizinkan oleh permission pengguna.
8. Jangan menyimpulkan status transaksi dari tampilan lokal; gunakan status otoritatif dari server.
9. Jangan menggabungkan status pembayaran dan status persiapan.
10. Hindari membuat fitur atau alur bisnis baru yang tidak ada di PRD.

## 3. Application shells

RAVIKA POS memiliki empat shells/experiences yang berbeda.

### 3.1 Management shell

Dipakai Owner untuk mengelola bisnis.

Struktur:

- Topbar brand dan primary navigation.
- Outlet selector jika konteks halaman bergantung pada outlet.
- User menu dan theme control.
- Main content.
- Breadcrumb hanya jika membantu orientasi.
- Page title dan deskripsi singkat.
- Page-level actions ditempatkan konsisten.

Topbar behavior:

- Desktop: navigasi utama terlihat secara horizontal.
- Tablet: tampilkan item utama dan pindahkan item sekunder ke menu.
- Mobile: gunakan compact header dan navigation drawer/menu.
- Jangan membiarkan item menu terpotong tanpa akses alternatif.
- Active route harus jelas.
- Navigasi harus mengikuti permission.

### 3.2 Dedicated POS shell

Dipakai Cashier untuk transaksi.

Struktur desktop:

- Compact header: brand, outlet, cashier context, connection/system indicator, exit action sesuai permission.
- Main product discovery region.
- Persistent cart/order summary region.
- Checkout action yang jelas.

Responsive:

- Tablet: optimalkan target sentuh dan pertahankan cart access.
- Mobile: product list menjadi fokus; cart dibuka melalui drawer atau halaman/panel khusus.
- Jangan mengecilkan dua panel desktop menjadi dua kolom sempit.

POS shell tidak menampilkan navigasi dashboard yang tidak relevan. Perpindahan keluar dari mode POS harus jelas dan tidak menghilangkan cart tanpa penanganan.

### 3.3 KDS shell

Dipakai Barista.

Struktur:

- Header ringkas dengan outlet, koneksi, dan ringkasan pesanan aktif.
- Board berdasarkan status.
- Ticket dengan informasi pesanan dan tindakan status.
- Secondary/history view bila disediakan sesuai PRD.

Rules:

- Prioritaskan keterbacaan dari jarak operasional.
- Hindari menu dan kontrol yang tidak dibutuhkan.
- Ticket tidak boleh berubah posisi secara mengejutkan saat update.
- Gunakan indikator koneksi dan reconnect.
- READY tetap terlihat sampai diambil atau diselesaikan.
- Jangan mengubah urutan state transition yang ditetapkan PRD.

### 3.4 Customer QR Menu shell

Dipakai pelanggan tanpa akun.

Struktur:

- Business/outlet identity.
- Search dan kategori.
- Product listing.
- Product detail/customization.
- Cart.
- Checkout.
- Order confirmation.

Rules:

- Mobile-first.
- Tidak meminta registrasi/login.
- Jangan meminta data pelanggan yang belum ditetapkan PRD.
- Jika QR token tidak valid, tampilkan penjelasan dan tindakan yang masuk akal.
- Jika produk tidak tersedia, jangan tampilkan aksi add yang seolah-olah aktif.
- Pertahankan cart selama kesalahan yang dapat dipulihkan.

## 4. Navigation and information architecture

### 4.1 Management navigation

Kelompok menu yang disetujui:

- Overview: Dashboard.
- Operations: Orders, POS, KDS, Tables.
- Catalog: Products, Categories.
- Business: Outlets, Users, Roles & Permissions.
- Analytics: Reports.
- System: Settings, Backup, License.

Tampilkan hanya item yang relevan dan diizinkan. Jangan mengandalkan penyembunyian UI sebagai pengamanan; server tetap wajib menegakkan permission.

### 4.2 Navigation behavior

- Active item memiliki visual state.
- Label menu harus ringkas dan konsisten.
- Gunakan icon + label untuk navigasi utama.
- Dropdown hanya untuk pilihan yang benar-benar merupakan sub-item atau action group.
- Jangan menaruh terlalu banyak item pada satu menu dropdown.
- Back navigation harus mempertahankan konteks bila memungkinkan.

## 5. Page composition guidelines

### 5.1 Page header

Umumnya berisi:

- Page title.
- Deskripsi singkat jika diperlukan.
- Context selector/filter bila relevan.
- Primary action.
- Secondary actions dalam menu atau area yang tidak bersaing dengan primary action.

Jangan menampilkan deskripsi panjang pada halaman operasional.

### 5.2 Dashboard

Prioritas:

1. Outlet dan date context.
2. Sales summary.
3. Transaction count.
4. Order status counts.
5. Top products.
6. Recent transactions.

Rules:

- Definisikan rentang tanggal yang sedang dilihat.
- Jelaskan unit dan periode metrik.
- Jangan menampilkan angka contoh sebagai data nyata.
- Chart memiliki empty state jika belum ada data.
- Hindari visualisasi yang tidak membantu keputusan.

### 5.3 Data listing

Setiap listing perlu mempertimbangkan:

- Search.
- Filter.
- Sort jika relevan.
- Pagination atau bounded loading.
- Loading state.
- Empty state.
- Error state.
- Row/detail action.
- Responsive behavior.

Jangan membuat tabel horizontal terlalu lebar tanpa strategi. Pada mobile, gunakan card/list adaptation atau horizontal scroll yang terkontrol dengan indikator yang jelas.

### 5.4 Create/edit forms

- Kelompokkan field berdasarkan makna.
- Urutkan sesuai alur pengisian.
- Tandai field wajib.
- Gunakan helper text hanya jika membantu.
- Validasi dekat dengan field terkait.
- Pertahankan input saat validasi gagal.
- Konfirmasi sebelum meninggalkan form jika ada perubahan yang belum disimpan.
- Jangan membuat field wajib berdasarkan asumsi; ikuti PRD.

### 5.5 Detail pages

- Tampilkan identitas record dan status utama di bagian atas.
- Kelompokkan informasi terkait.
- Letakkan tindakan sesuai konteks dan permission.
- Riwayat transaksi harus menggunakan snapshot item/price sesuai aturan data produk dalam PRD.

## 6. POS interaction guidelines

### 6.1 Product discovery

- Search harus mudah ditemukan.
- Category filters harus mudah dipindai.
- Product card menampilkan nama, harga, dan availability.
- Klik/tap produk memberi feedback langsung.
- Jika produk memerlukan varian/add-on, tampilkan selector sebelum menambahkan item.
- Jangan menambahkan produk unavailable ke cart.

### 6.2 Cart

- Cart harus mudah dibuka dan diperiksa.
- Setiap line item menunjukkan nama, konfigurasi, kuantitas, dan harga.
- Perubahan kuantitas memperbarui total secara jelas.
- Hapus item harus memiliki affordance yang mudah dipahami.
- Jika cart kosong, tampilkan petunjuk untuk memilih produk.
- Jangan menyembunyikan biaya atau penyesuaian yang memengaruhi total.

### 6.3 Order type and table

- Dine-in dan takeaway harus dibedakan jelas.
- Table selector hanya relevan untuk dine-in.
- Tampilkan meja yang dipilih secara persisten sebelum submit.
- Jangan mengasumsikan aturan pemilihan meja di luar PRD.

### 6.4 Checkout and payment

- Ringkas item, subtotal, dan total sebelum pembayaran.
- Tampilkan metode pembayaran yang tersedia.
- Untuk pembayaran manual digital, UI harus menyediakan status verifikasi sesuai alur PRD.
- Dukung beberapa payment records/split payment sesuai model produk.
- Bedakan UNPAID, PARTIALLY_PAID, PAID, dan REFUNDED.
- Jika pembayaran tunai, tampilkan jumlah diterima dan kembalian ketika relevan dengan aturan PRD.
- Hindari double submit: disable/lock action saat request sedang diproses.
- Jangan menampilkan transaksi sukses sebelum server mengonfirmasi hasil.
- Setelah transaksi, tampilkan konfirmasi yang memuat nomor pesanan dan ringkasan yang relevan.

### 6.5 Critical actions

Pembatalan, refund, atau aksi lain yang berisiko:

- Tampilkan konsekuensi dengan bahasa jelas.
- Minta konfirmasi sesuai tingkat risiko.
- Tampilkan alasan jika diwajibkan PRD.
- Periksa permission di server.
- Berikan hasil yang eksplisit.

## 7. KDS interaction guidelines

### 7.1 Order ticket content

Tampilkan bila tersedia:

- Order number.
- Order type.
- Table atau takeaway context.
- Time received / elapsed time.
- Product names.
- Quantities.
- Variant/add-on details.
- Customer/order notes.

Jangan menghilangkan detail item yang diperlukan untuk menyiapkan pesanan.

### 7.2 State transitions

Gunakan transisi sesuai PRD:
`NEW → ACCEPTED → PREPARING → READY → COMPLETED`

`CANCELLED` mengikuti aturan pembatalan yang ditetapkan PRD dan bukan aksi bebas di setiap state.

- Tampilkan hanya next valid action.
- Berikan feedback setelah server mengonfirmasi perubahan.
- Jika update gagal, pertahankan status terakhir yang diketahui dan tampilkan opsi retry.
- READY tetap terlihat hingga pickup/completion.
- Payment status tidak boleh menggantikan preparation status.

### 7.3 Real-time behavior

- SSE digunakan untuk server-to-client updates sesuai arsitektur produk.
- Ketika koneksi terputus, tampilkan disconnected/reconnecting state.
- Setelah reconnect, refresh/refetch data aktif agar UI kembali konsisten.
- Jangan menganggap event stream sebagai satu-satunya sumber kebenaran.
- Hindari animasi atau perpindahan ticket yang mengganggu pekerjaan barista.

## 8. Customer QR Menu guidelines

### 8.1 Menu browsing

- Kategori mudah dijangkau.
- Search tidak mengambil terlalu banyak ruang.
- Product image konsisten.
- Harga dan availability terlihat.
- Detail produk menampilkan pilihan yang relevan.

### 8.2 Cart and checkout

- Cart summary mudah diakses.
- Kuantitas dan konfigurasi item dapat diperiksa.
- Total terlihat sebelum submit.
- Validasi menjelaskan kesalahan dan mempertahankan input.
- Setelah submit, tampilkan konfirmasi yang tidak ambigu.
- Jangan menjanjikan pembayaran online otomatis; MVP menggunakan mekanisme pembayaran yang ditetapkan PRD.

### 8.3 QR/table context

- Token QR harus diperlakukan sebagai konteks akses, bukan informasi yang perlu ditampilkan mentah kepada pelanggan.
- Tampilkan nama/meja yang sesuai bila konteks tersedia.
- Jangan menampilkan data internal atau informasi pelanggan lain.
- Jika token invalid/expired, tampilkan recovery message yang jelas.

## 9. Feedback and system states

Setiap halaman atau komponen data harus mempertimbangkan state berikut.

### Loading

- Gunakan skeleton untuk struktur konten yang dapat diperkirakan.
- Gunakan spinner untuk aksi singkat yang sedang diproses.
- Hindari mengganti seluruh halaman dengan spinner jika hanya satu bagian yang memuat.

### Empty

- Jelaskan bahwa belum ada data.
- Berikan tindakan berikutnya jika pengguna memiliki permission.
- Jangan tampilkan angka nol yang menyesatkan ketika data belum dimuat.

### Error

- Jelaskan apa yang gagal dengan bahasa pengguna.
- Berikan retry jika aman.
- Jangan tampilkan stack trace atau detail internal.
- Pertahankan input dan konteks yang dapat dipulihkan.

### Success

- Konfirmasi hanya setelah server mengonfirmasi aksi.
- Untuk transaksi, gunakan confirmation screen/detail, bukan hanya toast.
- Hindari notifikasi berulang untuk event yang sama.

### Offline/disconnected

- Bedakan server lokal tidak terjangkau, koneksi sedang reconnect, dan request gagal.
- Tampilkan status yang jelas.
- Jangan mengklaim transaksi berhasil ketika server belum mengonfirmasi.
- Jangan menyiratkan transaksi offline telah tersimpan jika mekanisme tersebut tidak dijamin oleh PRD.

### Permission denied

- Jangan tampilkan kontrol yang tidak diizinkan.
- Jika deep link atau request langsung ditolak, tampilkan pesan akses ditolak yang jelas.
- Jangan mengungkap informasi yang tidak boleh dilihat pengguna.

## 10. Responsive rules

### Desktop (≥ 1024 px)

- Management topbar horizontal.
- Dashboard multi-column.
- Tables use available width.
- POS product area + persistent cart.
- KDS multi-column board when sufficient width.

### Tablet (640–1023 px)

- Compact topbar.
- Reduce secondary columns.
- Preserve touch-friendly action sizes.
- POS cart accessible without losing product context.
- KDS columns may scroll horizontally if necessary.

### Mobile (< 640 px)

- Compact header and menu/drawer.
- Single-column content.
- Forms stack vertically.
- Data tables adapt to cards or controlled horizontal scrolling.
- POS cart uses drawer or dedicated panel.
- Customer QR Menu remains primary mobile experience.
- Avoid sticky elements that cover content or keyboard.

Test at intermediate widths as well as named breakpoints.

## 11. Accessibility guidelines

- Semantic HTML landmarks and headings.
- Keyboard access for all primary workflows.
- Visible focus indicator.
- Labels associated with controls.
- Accessible names for icon-only buttons.
- Error text associated with invalid fields.
- Status text includes meaning, not color only.
- Contrast target WCAG 2.2 AA.
- Touch target recommendation at least 44 × 44 CSS px.
- Respect reduced motion.
- Dialog/drawer focus management.
- Do not use placeholder as the only label.
- Do not communicate state only through animation or sound.

## 12. Content and microcopy

Tone:

- Clear.
- Concise.
- Professional.
- Helpful.
- Non-technical for operational users.

Examples:

- Prefer “Pesanan berhasil dibuat” over “Success”.
- Prefer “Koneksi ke server terputus” over “Network error”.
- Prefer “Tidak ada produk dalam kategori ini” over “No data”.
- Prefer “Coba lagi” over “Retry operation” for Indonesian UI.

Use consistent terminology:

- Pesanan (order)
- Pembayaran (payment)
- Belum dibayar (unpaid)
- Dibayar sebagian (partially paid)
- Lunas (paid)
- Dikembalikan (refunded)
- Baru (new)
- Diterima (accepted)
- Disiapkan (preparing)
- Siap (ready)
- Selesai (completed)
- Dibatalkan (cancelled)

Exact labels can be localized, but underlying state meanings must remain consistent with PRD.

## 13. Performance and perceived performance

- Avoid unnecessary page-wide loading states.
- Keep product browsing responsive.
- Prevent image layout shift.
- Avoid heavy animation.
- Do not block the main UI while unrelated data loads.
- Show pending state for mutations.
- Prevent duplicate submissions.
- Use optimistic updates only when rollback and server reconciliation are designed and safe.
- For KDS, reconcile after reconnect rather than trusting missed events.

## 14. Security and privacy in UI

- Never expose secrets, license signing keys, raw QR tokens, or internal implementation details.
- Do not treat hidden UI as authorization.
- Avoid showing unnecessary customer information.
- Confirm sensitive actions.
- Mask or omit sensitive values where appropriate.
- Do not put private data in URLs unless explicitly designed and secured by product architecture.

## 15. QA acceptance checklist

### Visual

- [ ] Follows approved visual direction.
- [ ] Uses design tokens.
- [ ] Light and dark themes are legible.
- [ ] Typography hierarchy is consistent.
- [ ] Spacing and alignment are consistent.
- [ ] No excessive shadows, gradients, or decoration.

### Functional

- [ ] Primary task is obvious.
- [ ] All actions have clear feedback.
- [ ] Permission-aware navigation/actions.
- [ ] Payment and preparation statuses remain distinct.
- [ ] Critical actions have suitable confirmation.
- [ ] Loading/empty/error/success states are handled.

### Responsive

- [ ] Desktop works.
- [ ] Tablet works.
- [ ] Mobile works where applicable.
- [ ] No clipped navigation or controls.
- [ ] Touch targets are practical.
- [ ] Keyboard does not obscure essential mobile controls.

### Accessibility

- [ ] Keyboard navigation works.
- [ ] Focus is visible.
- [ ] Form labels and errors are accessible.
- [ ] Contrast checked.
- [ ] Status is not color-only.
- [ ] Reduced motion is respected.

### Operational reliability

- [ ] UI does not claim success before server confirmation.
- [ ] Duplicate mutation is prevented where needed.
- [ ] Reconnect/refetch behavior is clear for KDS.
- [ ] Failed actions preserve recoverable context.
- [ ] No unsupported offline capability is implied.

## 16. AI coding agent instructions

When implementing RAVIKA POS UI:

1. Read the PRD and all four design documents before implementing a new page or shared component.
2. Follow PRD for product behavior, state transitions, permission, and scope.
3. Follow `design-direction.md` for visual language.
4. Follow `design-system.md` for tokens and component variants.
5. Follow this document for page composition, interaction, responsive behavior, and state handling.
6. Reuse existing components and tokens before creating new ones.
7. Do not introduce a new UI library or replace the design system without approval.
8. Do not hardcode role-based access as a substitute for permission checks.
9. Do not invent business rules or data fields to complete a UI.
10. If a requirement is ambiguous and affects workflow, data, payment, permission, or state, stop and ask for clarification.
11. For minor visual decisions, use the closest established token/pattern and document any exception.
12. Verify light/dark themes and responsive states for every new page.
13. Include loading, empty, error, disabled, and success states where applicable.
14. Run relevant tests and visual checks before declaring work complete.
15. Do not use fabricated sample data in production paths; clearly mark fixtures and demo data.

## 17. Definition of done for a UI page

A page is ready when:

- It fulfills the relevant PRD requirements.
- It follows the approved design direction and tokens.
- It works in applicable themes and screen sizes.
- It handles all relevant UI states.
- It respects permissions and server-confirmed outcomes.
- It is keyboard accessible and has visible focus.
- It has no blocking console/runtime errors.
- Its primary workflow has been tested.
- Any unresolved product decision is recorded rather than silently assumed.
