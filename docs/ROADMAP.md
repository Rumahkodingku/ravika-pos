# RAVIKA POS --- Product Development Roadmap

**Dokumen:** Development Roadmap\
**Produk:** RAVIKA POS\
**Tagline:** Run your business with clarity.\
**Strategi pengerjaan:** Frontend UI terlebih dahulu menggunakan dummy
data, dilanjutkan backend API dan integrasi setelah UI disetujui.

------------------------------------------------------------------------

## 1. Tujuan Roadmap

Roadmap ini mengatur urutan pengembangan RAVIKA POS agar proses validasi
tampilan dan pengalaman pengguna dapat diselesaikan sebelum kompleksitas
backend dimulai.

Strategi utama pengembangan:

1. Membangun seluruh UI frontend berdasarkan PRD dan dokumen UI/UX.
2. Menggunakan dummy data dan simulasi interaksi selama tahap frontend.
3. Melakukan review menyeluruh terhadap UI bersama product owner.
4. Memperbaiki UI berdasarkan hasil review sampai mendapatkan
    persetujuan.
5. Setelah UI disetujui, merancang dan membangun backend API.
6. Mengintegrasikan backend API ke frontend, menggantikan dummy data
    secara bertahap.
7. Melakukan pengujian end-to-end dan persiapan rilis.

**Prinsip penting:** Jangan mulai mengimplementasikan backend
operasional sebelum tahap review UI dinyatakan selesai. Namun, frontend
tetap harus dibangun dengan struktur data, tipe, dan kontrak service
yang konsisten agar proses integrasi tidak memerlukan penulisan ulang
besar-besaran.

## 2. Dokumen Acuan dan Prioritas

Gunakan dokumen berikut sebagai acuan pengembangan:

  -----------------------------------------------------------------------
  Dokumen                             Fungsi
  ----------------------------------- -----------------------------------
  `PRD.md`                            Sumber utama kebutuhan produk,
                                      aturan bisnis, fitur, dan batasan
                                      MVP

  `docs/design/design-brief.md`       Tujuan desain, pengguna, kebutuhan,
                                      dan konteks penggunaan

  `docs/design/design-direction.md`   Arah visual, identitas brand, dan
                                      prinsip komposisi

  `docs/design/design-system.md`      Design tokens, warna, tipografi,
                                      tema, dan spesifikasi komponen

  `docs/design/ui-ux-guidelines.md`   Aturan layout, interaksi,
                                      responsive, aksesibilitas, dan QA
                                      UI

Dokumen roadmap ini                 Urutan fase, dependency, milestone,
                                      dan kriteria penyelesaian
  -----------------------------------------------------------------------

### Urutan prioritas jika terjadi konflik

1. PRD menjadi sumber kebenaran untuk scope produk dan business rules.
2. Design system menjadi sumber kebenaran untuk token dan spesifikasi
    visual.
3. Design direction dan UI/UX guidelines menjadi acuan penerapan
    desain.
4. Roadmap mengatur urutan pengerjaan, bukan mengubah kebutuhan produk.

Jika ditemukan kebutuhan yang belum didefinisikan atau terdapat konflik
antar dokumen, hentikan asumsi pada bagian tersebut dan minta keputusan
product owner.

## 3. Strategi Arsitektur Pengembangan

### 3.1 Teknologi utama

Gunakan stack yang telah ditetapkan untuk RAVIKA POS:

- Next.js App Router
- TypeScript strict mode
- Node.js LTS
- Tailwind CSS v4
- SQLite
- Drizzle ORM
- `better-sqlite3`
- Zod
- Zustand
- TanStack Query
- React Hook Form
- Server-Sent Events (SSE) untuk pembaruan KDS
- Vitest dan Playwright
- pnpm

Tetap gunakan pendekatan Modular Monolith. Jangan menambahkan
microservices, Redis, PostgreSQL, atau backend NestJS terpisah tanpa
keputusan produk/arsitektur baru.

### 3.2 Pemisahan frontend dan backend secara bertahap

Walaupun aplikasi menggunakan Next.js full-stack, pengerjaan tetap
dipisahkan secara logis:

- **Frontend UI:** halaman, layout, komponen, form, state UI, dan
    interaksi pengguna.
- **Mock data layer:** fixtures dan implementasi service sementara
    untuk menyediakan data dummy.
- **API layer:** route handlers/API endpoints, validasi request,
    autentikasi, dan response.
- **Application/business layer:** use cases dan aturan bisnis.
- **Data access layer:** repository dan Drizzle ORM untuk SQLite.

Pada fase frontend, gunakan mock data layer. Pada fase backend,
implementasikan API dan repository nyata. Pada fase integrasi, ganti
implementasi mock dengan API tanpa mengubah komponen UI secara
besar-besaran.

### 3.3 Aturan penting penggunaan dummy data

Selama fase frontend:

- Semua data yang tampil berasal dari fixtures atau mock service
    lokal.
- Dilarang menghubungkan UI ke database produksi atau membuat endpoint
    backend operasional.
- Interaksi seperti tambah produk, ubah kuantitas, filter, pencarian,
    pindah status pesanan, dan pembayaran boleh disimulasikan di state
    frontend.
- Tandai perilaku yang masih simulasi agar tidak disalahartikan
    sebagai fitur backend yang sudah selesai.
- Jangan menyimpan data bisnis secara permanen. State dapat kembali ke
    kondisi awal ketika halaman dimuat ulang.
- Siapkan TypeScript types dan service interfaces berdasarkan
    kebutuhan PRD.
- Jangan menaruh data dummy langsung berulang kali di dalam komponen
    halaman. Simpan di lokasi fixtures/mock yang terorganisasi.

## 4. Ringkasan Fase Pengembangan

```{=html}
<details>
```

```{=html}
<summary>
```

Ringkasan fase

```{=html}
</summary>
```

  -----------------------------------------------------------------------
  Fase                    Fokus                   Hasil utama
  ----------------------- ----------------------- -----------------------
  0                       Project foundation      Struktur aplikasi dan
                                                  tooling siap

  1                       UI foundation           Design tokens, theme,
                                                  layout, komponen dasar

  2                       Management UI           Dashboard dan halaman
                                                  pengelolaan

  3                       Operational UI          POS, KDS, dan QR Menu

  4                       Frontend review         UI direview, direvisi,
                                                  dan disetujui

  5                       Backend foundation      Database, migration,
                                                  API foundation,
                                                  auth/RBAC

  6                       Backend modules         API untuk seluruh modul
                                                  MVP

  7                       Frontend-backend        Mock service diganti
                          integration             API nyata

8                       QA and release          E2E, hardening, backup,
                          readiness               dokumentasi, rilis
  -----------------------------------------------------------------------

```{=html}
</details>
```

------------------------------------------------------------------------

## 5. Detail Roadmap

## Fase 0 --- Project Foundation

**Tujuan:** Menyiapkan fondasi repository dan aplikasi agar pengerjaan
frontend dapat dimulai secara konsisten.

### Aktivitas

- [ ] Periksa kondisi repository dan konfigurasi project yang sudah
    tersedia.
- [ ] Pastikan versi Node.js LTS dan pnpm yang digunakan
    terdokumentasi.
- [ ] Konfirmasi Next.js App Router dan TypeScript strict mode.
- [ ] Siapkan struktur direktori untuk app, components, features, lib,
    mocks, dan types.
- [ ] Siapkan linting, formatting, dan type checking.
- [ ] Siapkan environment configuration untuk development.
- [ ] Siapkan strategi route dan layout berdasarkan area aplikasi.
- [ ] Pastikan seluruh dokumen acuan tersedia di repository.
- [ ] Buat README pengembangan singkat jika belum tersedia.

### Output

- Struktur project siap dikembangkan.
- Tooling dasar berjalan.
- Batas pemisahan UI, mock data, dan service layer ditetapkan.

### Acceptance criteria

- Project dapat dijalankan secara lokal.
- Lint, typecheck, dan build dasar berhasil.
- Tidak ada keputusan arsitektur yang bertentangan dengan dokumen
    produk.

------------------------------------------------------------------------

## Fase 1 --- Frontend Foundation and Design System

**Tujuan:** Membangun fondasi visual dan komponen reusable sebelum
mengembangkan halaman fitur.

### Aktivitas

- [ ] Implementasikan design tokens dari `design-system.md`.
- [ ] Implementasikan typography menggunakan Plus Jakarta Sans.
- [ ] Implementasikan light mode dan dark mode.
- [ ] Implementasikan theme resolution: system preference dengan
    fallback light.
- [ ] Siapkan semantic colors untuk success, warning, danger, dan
    info.
- [ ] Implementasikan global layout, spacing, responsive container,
    dan breakpoints.
- [ ] Bangun komponen dasar: button, input, select, checkbox, dialog,
    dropdown, tabs, badge, tooltip, table, card, skeleton, toast, dan
    pagination sesuai kebutuhan.
- [ ] Implementasikan state loading, empty, error, disabled, dan
    success.
- [ ] Pastikan focus state, keyboard navigation, dan reduced motion
    diperhatikan.
- [ ] Siapkan icon system menggunakan Lucide.

### Output

- Design system terimplementasi di aplikasi.
- Komponen UI dasar dapat digunakan ulang.
- Theme light/dark konsisten.

### Acceptance criteria

- Token tidak tersebar sebagai nilai warna/spacing acak di halaman.
- Komponen memiliki variasi dan state yang diperlukan.
- Tampilan dasar konsisten pada mobile, tablet, dan desktop.
- Tidak ada error typecheck atau build.

------------------------------------------------------------------------

## Fase 2 --- Management Interface

**Tujuan:** Menyelesaikan UI untuk aktivitas pengelolaan bisnis oleh
Owner.

### Urutan halaman yang disarankan

1. **Authentication UI**
    - Login
    - Form validasi dan feedback
    - Tampilan loading dan error simulasi
2. **Dashboard**
    - Ringkasan penjualan
    - Jumlah transaksi
    - Ringkasan status pesanan
    - Produk terlaris
    - Filter tanggal
    - Grafik menggunakan data dummy
3. **Products**
    - Daftar produk
    - Pencarian dan filter
    - Tambah/edit produk
    - Detail produk
    - Kategori, varian, dan add-on sesuai scope PRD
    - Status aktif/nonaktif
4. **Categories**
    - Daftar kategori
    - Tambah/edit kategori
    - Pengaturan urutan atau status jika ditetapkan di PRD
5. **Tables**
    - Daftar meja
    - Status meja
    - Detail meja
    - Tampilan QR meja
6. **Users**
    - Daftar pengguna
    - Tambah/edit pengguna
    - Status pengguna
    - Penetapan role
7. **Roles and Permissions**
    - Daftar role
    - Detail role
    - Matriks permission
    - UI pengelolaan role dan permission dinamis
8. **Business Settings**
    - Profil bisnis
    - Pengaturan yang termasuk MVP
9. **Reports**
    - Ringkasan laporan
    - Filter periode
    - Tabel dan grafik laporan menggunakan data dummy
10. **License and Backup UI**
    - Status lisensi
    - Informasi instalasi
    - Tampilan backup/restore sesuai kebutuhan UI MVP

### Aturan implementasi

- Semua halaman menggunakan data dummy yang realistis dan konsisten.
- Form harus memiliki validasi frontend dan feedback.
- CRUD hanya mengubah mock state; belum menulis ke database.
- Filter, sorting, pagination, dan search harus dapat
    didemonstrasikan.
- Jangan menampilkan menu atau tindakan yang tidak termasuk scope MVP
    tanpa persetujuan.

### Output

Seluruh halaman management UI siap direview menggunakan dummy data.

### Acceptance criteria

- Semua halaman dapat diakses melalui navigasi.
- Interaksi utama dapat didemonstrasikan.
- Layout tidak rusak pada ukuran layar yang didukung.
- Loading, empty, error, dan success states tersedia jika relevan.

------------------------------------------------------------------------

## Fase 3 --- Operational Interface

**Tujuan:** Menyelesaikan UI untuk alur operasional utama RAVIKA POS.

Fase ini memiliki prioritas tinggi karena POS, KDS, dan QR Menu
merupakan alur inti penggunaan produk.

### 3.1 Dedicated Cashier POS

- [ ] Header dan informasi bisnis.
- [ ] Kategori produk.
- [ ] Product grid dan pencarian.
- [ ] Product detail/variant/add-on selection.
- [ ] Cart yang persisten selama sesi UI.
- [ ] Pengaturan kuantitas dan catatan item.
- [ ] Pemilihan dine-in atau takeaway.
- [ ] Pemilihan meja untuk dine-in.
- [ ] Ringkasan subtotal, pajak/biaya jika ditentukan PRD, dan total.
- [ ] Simulasi proses pembayaran.
- [ ] Simulasi pembayaran tunai dan metode digital manual.
- [ ] Tampilan sukses/gagal pembayaran.
- [ ] Tampilan ringkasan dan detail pesanan.

### 3.2 Kitchen Display System (KDS)

- [ ] Tampilan order cards/columns.
- [ ] Informasi nomor pesanan, waktu masuk, item, dan catatan.
- [ ] Status NEW, ACCEPTED, PREPARING, READY, COMPLETED, dan CANCELLED
    sesuai aturan PRD.
- [ ] Aksi perubahan status yang disimulasikan.
- [ ] Penanda elapsed time.
- [ ] READY tetap terlihat sampai pesanan diambil/diselesaikan.
- [ ] Layout untuk layar operasional.
- [ ] Dark mode sebagai tema default KDS, tetap mendukung theme
    system.

### 3.3 Customer QR Menu

- [ ] Mobile-first menu.
- [ ] Informasi bisnis.
- [ ] Kategori dan daftar produk.
- [ ] Detail produk, varian, dan add-on.
- [ ] Cart pelanggan.
- [ ] Alur dine-in melalui table token.
- [ ] Alur takeaway sesuai keputusan produk.
- [ ] Form konfirmasi pesanan.
- [ ] Order confirmation/status view.
- [ ] State QR/table token tidak valid atau tidak tersedia.

### Aturan implementasi

- Semua alur transaksi hanya simulasi frontend.
- Jangan menganggap status pembayaran atau status pesanan sebagai data
    persisten.
- Gunakan fixture yang sama atau saling konsisten antara POS, KDS,
    dashboard, dan riwayat pesanan.
- UI harus memperlihatkan perbedaan status pembayaran dan status
    persiapan pesanan.
- QR Menu tidak meminta pelanggan membuat akun jika PRD menetapkan
    anonymous ordering.

### Output

Seluruh alur utama POS, KDS, dan QR Menu dapat didemonstrasikan tanpa
backend.

### Acceptance criteria

- Pengguna dapat menjalankan skenario demo dari pemilihan produk
    hingga konfirmasi pesanan.
- Pesanan dummy yang sama dapat direpresentasikan secara konsisten
    pada POS dan KDS.
- Perbedaan dine-in dan takeaway terlihat jelas.
- Layout dan interaksi sesuai karakter perangkat masing-masing.

------------------------------------------------------------------------

## Fase 4 --- Frontend Review, Revision, and Approval

```{=html}
<aside>
```

**Milestone wajib: UI Approval Gate**

Backend API belum boleh masuk ke implementasi operasional sebelum
product owner menyatakan frontend UI telah disetujui.

```{=html}
</aside>
```

**Tujuan:** Memastikan desain, navigasi, alur kerja, dan detail
interaksi sudah sesuai ekspektasi sebelum backend dibangun.

### Aktivitas review

- [x] Review visual seluruh halaman pada light mode.
- [x] Review visual seluruh halaman pada dark mode.
- [x] Review responsive pada mobile, tablet, desktop, dan layar lebar.
- [x] Review dashboard dan seluruh halaman management.
- [x] Review alur kasir dari awal sampai pembayaran simulasi.
- [x] Review alur KDS dan perubahan status.
- [x] Review customer QR Menu.
- [x] Review label, copywriting, format mata uang, tanggal, dan waktu.
- [x] Review empty, loading, error, disabled, dan success states.
- [x] Review navigasi, konsistensi komponen, aksesibilitas, dan
    usability.
- [x] Catat semua temuan sebagai daftar issue.
- [x] Perbaiki issue berdasarkan prioritas.
- [x] Lakukan review ulang setelah revisi.

### Klasifikasi temuan

  -----------------------------------------------------------------------
  Prioritas               Definisi                Perlakuan
  ----------------------- ----------------------- -----------------------
  P0 --- Blocker          Alur utama tidak dapat  Wajib diperbaiki
                          digunakan atau UI salah sebelum approval
                          secara fundamental

  P1 --- High             Kesalahan besar pada    Wajib diperbaiki
                          layout, navigasi, atau  sebelum approval
                          interaksi utama

  P2 --- Medium           Ketidakkonsistenan atau Diselesaikan sebelum
                          masalah usability yang  approval atau
                          tidak memblokir alur    disepakati sebagai
                          utama                   follow-up

P3 --- Low              Detail kosmetik atau    Dapat masuk backlog
                          penyempurnaan minor     jika disetujui
  -----------------------------------------------------------------------

### Kriteria UI approval

Fase ini selesai hanya jika:

- Semua halaman dalam scope MVP sudah tersedia.
- Semua alur utama dapat didemonstrasikan dengan dummy data.
- Tidak ada issue P0 atau P1 yang belum diselesaikan.
- Issue P2/P3 yang tersisa telah disetujui untuk ditunda.
- Product owner secara eksplisit menyatakan UI disetujui.

### Output

- Frontend UI versi yang disetujui.
- Daftar issue yang sudah diselesaikan.
- Daftar backlog UI yang secara eksplisit ditunda.
- Baseline UI yang tidak diubah secara signifikan selama fase backend
    tanpa persetujuan.

**Catatan perubahan scope:** Jika setelah approval ditemukan perubahan
UI yang mengubah business flow atau kebutuhan data, perubahan tersebut
harus dicatat dan dampaknya terhadap API dievaluasi sebelum
implementasi.

### Status approval

- Status: APPROVED
- Tanggal: 17 November 2026
- Baseline: `d6c07b5`
- Tag: `phase-4-ui-approved`
- Dokumen: `docs/specification/phase-4-ui-approval.md`

------------------------------------------------------------------------

## Fase 4.5 --- Single-Location MVP

**Status:** Selesai dan terverifikasi

**Tujuan:** Menyelaraskan UI, data model, dan permission dengan model
MVP satu bisnis dan satu lokasi operasional sebelum Fase 5.

### Hasil

- [x] Hapus modul lokasi tambahan dari UI dan navigasi.
- [x] Hapus permission pengelolaan lokasi.
- [x] Hapus field lokasi dari pesanan dan meja.
- [x] Hapus penugasan lokasi dari pengguna.
- [x] Gunakan profil bisnis sebagai identitas operasional.
- [x] Gunakan prefix kode bisnis pada nomor pesanan.
- [x] Perbarui PRD, dokumen desain, README, dan spec fase sebelumnya.
- [x] Verifikasi build, route matrix, POS, KDS, QR, dan management.

### Baseline

- Baseline kode: `c33e473`
- Tag: `phase-4-ui-approved-single-location`
- Dokumen: `docs/specification/phase-4-5-single-location-mvp.md`

------------------------------------------------------------------------

## Fase 5 --- Backend Foundation

**Prasyarat:** Fase 4 telah mendapatkan UI approval.

**Tujuan:** Menyiapkan fondasi backend dan database sesuai kebutuhan
produk dan UI yang telah disetujui.

### Aktivitas

- [ ] Finalisasi domain model dan relasi data berdasarkan PRD.
- [ ] Definisikan schema SQLite menggunakan Drizzle ORM.
- [ ] Siapkan migration dan mekanisme migration saat aplikasi
    dijalankan.
- [ ] Siapkan repository/data access layer.
- [ ] Siapkan application services/use cases.
- [ ] Siapkan API route handlers.
- [ ] Tetapkan standar request/response.
- [ ] Tetapkan validasi request menggunakan Zod.
- [ ] Tetapkan format error response yang konsisten, termasuk RFC 9457
    Problem Details jika ditetapkan pada spesifikasi teknis.
- [ ] Implementasikan authentication dan session management sesuai
    keputusan PRD.
- [ ] Implementasikan RBAC dinamis berbasis database.
- [ ] Terapkan authorization di server untuk setiap operasi yang
    dilindungi.
- [ ] Terapkan business ownership boundary.
- [ ] Siapkan logging dan error handling.
- [ ] Siapkan transaction strategy dan SQLite operational settings.
- [ ] Siapkan seed data untuk development dan pengujian.

### Catatan SQLite

- Database berada pada disk lokal mesin server.
- Jangan menempatkan file SQLite pada network share.
- Aktifkan dan konfigurasi WAL, foreign key, serta busy timeout sesuai
    kebutuhan.
- Jaga transaksi tetap singkat.
- Rancang backup dan restore serta lakukan uji pemulihan.
- Jangan membuka akses database langsung ke browser atau perangkat
    client.

### Output

- Database schema dan migration.
- API foundation.
- Authentication dan authorization foundation.
- Standar error dan response.
- Seed data development.

### Acceptance criteria

- Migration dapat dijalankan dari database kosong.
- Seed data berjalan secara deterministik.
- API terlindungi oleh authentication/authorization sesuai kebutuhan.
- Repository dan application layer tidak mencampur tanggung jawab.
- Tidak ada akses database langsung dari client.

------------------------------------------------------------------------

## Fase 6 --- Backend API Modules

**Tujuan:** Mengimplementasikan API untuk seluruh modul MVP secara
bertahap.

Urutan berikut merupakan urutan dependency yang disarankan. Sesuaikan
jika hasil finalisasi domain menunjukkan dependency berbeda.

### 6.1 Business

- [ ] Profil business.
- [ ] Validasi batas data business.

### 6.2 Users, Roles, and Permissions

- [ ] User CRUD dan status.
- [ ] Role CRUD.
- [ ] Permission registry dan assignment.
- [ ] Role-permission management.
- [ ] Authorization policy per endpoint/use case.
- [ ] Seed built-in roles OWNER, CASHIER, BARISTA tanpa mengunci
    desain agar role tetap dinamis.

### 6.3 Catalog

- [ ] Category CRUD.
- [ ] Product CRUD.
- [ ] Variant dan add-on.
- [ ] Harga dan status produk.
- [ ] Validasi relasi produk-kategori.
- [ ] Data snapshot untuk order item.

### 6.4 Tables and QR

- [ ] Table CRUD.
- [ ] Table status.
- [ ] Pembuatan dan validasi token QR yang tidak mudah ditebak.
- [ ] Validasi token saat QR ordering.

### 6.5 Orders

- [ ] Pembuatan order dine-in dan takeaway.
- [ ] Nomor order unik.
- [ ] Order items dan snapshot data produk.
- [ ] Order detail dan history.
- [ ] Pembatalan dengan permission.
- [ ] Validasi transisi status.
- [ ] Transaction boundary untuk proses pembuatan order.

### 6.6 Payments

- [ ] Pencatatan pembayaran.
- [ ] Multiple payment records/split payment.
- [ ] Metode cash, QRIS, transfer, dan e-wallet.
- [ ] Verifikasi manual untuk pembayaran digital pada MVP.
- [ ] Perhitungan status UNPAID, PARTIALLY_PAID, PAID, dan REFUNDED.
- [ ] Refund/correction sesuai aturan PRD dan permission.

### 6.7 KDS

- [ ] Daftar order untuk KDS.
- [ ] Transisi NEW, ACCEPTED, PREPARING, READY, COMPLETED, CANCELLED.
- [ ] Validasi transisi status.
- [ ] SSE event untuk pembaruan KDS.
- [ ] Reconnect dan refetch saat koneksi SSE terputus.

### 6.8 Reporting

- [ ] Ringkasan penjualan.
- [ ] Jumlah transaksi.
- [ ] Ringkasan status order.
- [ ] Produk terlaris.
- [ ] Filter periode.
- [ ] Validasi konsistensi perhitungan laporan.

### 6.9 License and Backup

- [ ] Validasi license token lokal menggunakan public key.
- [ ] Status dan informasi lisensi.
- [ ] Backup database.
- [ ] Restore database dengan validasi keamanan dan integritas.
- [ ] Dokumentasi prosedur backup/restore.

### Output

API seluruh modul MVP tersedia dan terdokumentasi.

### Acceptance criteria

- Setiap endpoint memiliki validasi, authorization, dan error
    handling.
- Business rules tidak hanya bergantung pada validasi frontend.
- Data historis order tidak berubah ketika data produk diperbarui.
- Status payment dan status preparation terpisah.
- Pengujian unit/integration untuk business-critical use cases
    tersedia.

------------------------------------------------------------------------

## Fase 7 --- Frontend and Backend Integration

**Tujuan:** Mengganti mock service dengan API nyata tanpa mengubah
pengalaman UI yang telah disetujui secara tidak perlu.

### Strategi integrasi

Lakukan integrasi per modul, bukan mengganti seluruh aplikasi sekaligus.

Urutan yang disarankan:

1. Authentication dan session.
2. Business context.
3. Users, roles, dan permissions.
4. Categories dan products.
5. Tables dan QR token.
6. Orders.
7. Payments.
8. KDS dan SSE.
9. Dashboard dan reports.
10. License dan backup.

### Aktivitas per modul

- [ ] Cocokkan TypeScript types frontend dengan API contracts.
- [ ] Implementasikan API client/service.
- [ ] Implementasikan TanStack Query untuk server state.
- [ ] Implementasikan mutation dan invalidation/refetch.
- [ ] Hubungkan loading, empty, error, dan success states ke response
    API.
- [ ] Implementasikan form submission ke API.
- [ ] Implementasikan authorization-aware navigation dan action
    visibility.
- [ ] Pastikan server tetap melakukan authorization; menyembunyikan
    tombol bukan mekanisme keamanan.
- [ ] Hapus ketergantungan halaman terhadap mock data setelah
    integrasi modul selesai.
- [ ] Pertahankan fixtures untuk automated tests jika masih
    diperlukan.
- [ ] Uji alur lintas modul.

### Kriteria integrasi

- UI menggunakan data API nyata.
- Tidak ada dummy data yang tampil pada production path.
- Error API ditampilkan dengan feedback yang sesuai.
- Loading dan pending states tidak menyebabkan interaksi ganda.
- Data yang berubah diperbarui secara konsisten.
- Hak akses diterapkan di server dan tercermin di UI.
- SSE reconnect/refetch berfungsi untuk KDS.
- UI yang telah disetujui tetap konsisten, kecuali ada perubahan yang
    disepakati.

------------------------------------------------------------------------

## Fase 8 --- Quality Assurance and Release Readiness

**Tujuan:** Memastikan aplikasi stabil, aman, dan siap dipasang pada
lingkungan usaha lokal.

### Pengujian

- [ ] Unit test untuk business logic.
- [ ] Integration test untuk API dan database.
- [ ] Playwright E2E untuk alur Owner.
- [ ] Playwright E2E untuk alur Cashier.
- [ ] Playwright E2E untuk alur Barista/KDS.
- [ ] Playwright E2E untuk customer QR ordering.
- [ ] Pengujian permission dan akses bisnis.
- [ ] Pengujian pembayaran parsial dan status pembayaran.
- [ ] Pengujian pembatalan dan transisi status order.
- [ ] Pengujian reconnect SSE.
- [ ] Pengujian backup dan restore.
- [ ] Pengujian lisensi tanpa koneksi internet wajib.
- [ ] Pengujian responsive dan light/dark theme.
- [ ] Pengujian performa pada perangkat target pilot.
- [ ] Pengujian kondisi jaringan LAN terputus dan server restart.

### Operasional dan rilis

- [ ] Dokumentasikan instalasi pada komputer server lokal.
- [ ] Dokumentasikan akses client melalui LAN/Wi-Fi.
- [ ] Dokumentasikan konfigurasi jaringan yang diperlukan.
- [ ] Dokumentasikan prosedur backup terjadwal dan restore.
- [ ] Rekomendasikan UPS untuk komputer server.
- [ ] Siapkan panduan troubleshooting.
- [ ] Siapkan proses update aplikasi dan database migration.
- [ ] Lakukan pilot pada lingkungan cafe.
- [ ] Catat feedback pilot dan susun perbaikan pasca-MVP.

### Output

- Build kandidat rilis.
- Test report.
- Installation guide.
- Backup/restore guide.
- Pilot feedback dan backlog perbaikan.

------------------------------------------------------------------------

## 6. Milestone dan Approval Gate

  -----------------------------------------------------------------------
  Milestone               Kondisi selesai         Persetujuan
  ----------------------- ----------------------- -----------------------
  M0 --- Foundation Ready Project dan tooling     Internal
                          siap

  M1 --- UI Foundation    Theme, tokens, komponen Internal
  Ready                   dasar siap

  M2 --- Management UI    Semua management pages  Product owner review
  Ready                   siap dengan dummy data  

  M3 --- Operational UI   POS, KDS, QR Menu siap  Product owner review
  Ready                   didemonstrasikan

  M4 --- UI Approved      Review dan revisi       **Product owner wajib
                          selesai; UI disetujui   approve**

  M5 --- Backend          Database, API           Internal
  Foundation Ready        foundation, auth/RBAC
                          siap

  M6 --- Backend MVP      API modul MVP selesai   Internal
  Ready                   dan diuji

  M7 --- Integration      Frontend menggunakan    Product owner review
  Complete                API nyata

M8 --- Release          QA dan dokumentasi      Release approval
  Candidate               rilis selesai
  -----------------------------------------------------------------------

**Gate utama:** M4 --- UI Approved. Fase 5 tidak dimulai sebelum
milestone ini disetujui.

------------------------------------------------------------------------

## 7. Definition of Done

### Frontend UI

Sebuah halaman dianggap selesai apabila:

- Sesuai PRD dan dokumen desain.
- Menggunakan design tokens dan komponen yang konsisten.
- Memiliki responsive behavior.
- Memiliki state loading, empty, error, dan success yang relevan.
- Interaksi utama dapat didemonstrasikan.
- Menggunakan mock data terpusat, bukan hardcoded data berulang dalam
    komponen.
- Lulus lint, typecheck, dan build.
- Tidak memiliki issue P0/P1 yang belum diselesaikan.

### Backend API

Sebuah modul API dianggap selesai apabila:

- Request dan response memiliki kontrak yang jelas.
- Validasi dilakukan di server.
- Authentication dan authorization diterapkan sesuai kebutuhan.
- Business rules diuji.
- Error response konsisten.
- Database operation menggunakan repository/data access layer.
- Migration dan seed relevan tersedia.
- Unit/integration test lulus.

### Integrasi

Sebuah modul dianggap terintegrasi apabila:

- Frontend membaca dan mengubah data melalui API nyata.
- Tidak ada mock service pada production path modul tersebut.
- Loading, error, dan success state ditangani.
- Authorization dan business rules diverifikasi server.
- Automated test untuk alur penting lulus.

------------------------------------------------------------------------

## 8. Aturan untuk AI Coding Agent dan Developer

Instruksi berikut berlaku selama pengerjaan roadmap:

1. Baca `PRD.md` dan seluruh dokumen `docs/design/` sebelum mengubah
    fitur UI.
2. Kerjakan fase secara berurutan. Jangan melompati UI approval gate.
3. Pada fase 0--4, gunakan dummy data dan mock service saja. Jangan
    membangun backend operasional atau database persistence.
4. Buat mock data terpusat dan TypeScript types yang dapat dipakai
    kembali saat integrasi.
5. Pisahkan komponen presentasi dari data access/service logic.
6. Jangan menaruh business rules kritis hanya di frontend. Pada fase
    UI, simulasi hanya untuk demonstrasi; aturan final tetap harus
    diterapkan dan diuji di backend.
7. Jangan mengubah scope MVP tanpa persetujuan.
8. Jangan menambahkan teknologi atau infrastruktur baru tanpa alasan
    dan persetujuan.
9. Jangan mengubah desain yang sudah disetujui secara signifikan ketika
    integrasi, kecuali ada issue nyata dan perubahan disetujui.
10. Setelah menyelesaikan satu fase, laporkan:
    - pekerjaan yang selesai,
    - halaman/modul yang dibuat,
    - file penting yang berubah,
    - hasil lint/typecheck/build/test,
    - issue atau keputusan yang masih diperlukan,
    - fase berikutnya yang direkomendasikan.
11. Jangan menyatakan fase selesai jika acceptance criteria belum
    terpenuhi.
12. Jika menemukan requirement ambigu atau konflik antar dokumen, ajukan
    pertanyaan sebelum membuat asumsi yang memengaruhi data model,
    business flow, permission, atau API contract.

------------------------------------------------------------------------

## 9. Risiko dan Mitigasi

  -----------------------------------------------------------------------
  Risiko                  Dampak                  Mitigasi
  ----------------------- ----------------------- -----------------------
  UI dibuat tanpa mengacu UI tidak sesuai         Review requirement
  PRD                     kebutuhan operasional   sebelum implementasi
                                                  setiap modul

  Dummy data tidak        Demo lintas halaman     Gunakan fixture bersama
  konsisten               membingungkan           dan relasi data yang
                                                  konsisten

  UI terlalu terikat mock Integrasi API           Gunakan service
  implementation          memerlukan refactor     interface dan pisahkan
                          besar                   data layer

  Review UI terlambat     Perubahan desain        Terapkan UI approval
                          terjadi setelah backend gate sebelum backend
                          selesai

  API contract berubah    Integrasi               Finalisasi contract per
  berulang                frontend/backend        modul sebelum
                          terhambat               implementasi endpoint

  Business rules hanya    Data tidak aman dan     Validasi dan
  berada di frontend      tidak konsisten         authorization wajib di
                                                  server

  SQLite diakses melalui  Risiko korupsi dan      Database hanya di mesin
  network share           konflik database        server; client memakai
                                                  API

  Server lokal mati atau  Operasional POS         UPS, backup, restore
  listrik padam           berhenti                drill, dan panduan
                                                  pemulihan

SSE terputus            KDS tidak menerima      Reconnect otomatis dan
                          update terbaru          refetch data aktif
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 10. Pembagian Scope: UI Phase vs Backend Phase

  -----------------------------------------------------------------------
  Area                    Fase Frontend           Fase Backend dan
                                                  Integrasi
  ----------------------- ----------------------- -----------------------
  Authentication          Login UI dan simulasi   Session, credential
                          state                   verification,
                                                  authorization

  Dashboard               Grafik dan statistik    Query laporan dari
                          dummy                   database

  Products                CRUD simulasi           API dan persistence
                                                  produk

  Users/Roles             Form dan matriks        User, role, permission,
                          permission dummy        enforcement

  Tables/QR               Tampilan meja dan QR    Table records dan token
                          dummy                   validation

  POS                     Cart dan checkout       Create order dan
                          simulasi                payment records

  KDS                     Order cards dan status  Order query, status
                          simulasi                transition, SSE

  QR Menu                 Menu dan submit         Public ordering API dan
                          simulasi                token validation

  Reports                 Data grafik dummy       Aggregation/query dari
                                                  data transaksi

  License                 Tampilan status dummy   Local license
                                                  validation

Backup                  Tampilan dan konfirmasi Backup/restore database
                          simulasi                nyata
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 11. Hal yang Tidak Boleh Dianggap Selesai pada Fase UI

Walaupun tampilannya sudah dapat didemonstrasikan, hal-hal berikut belum
dianggap selesai sebelum backend dan integrasi:

- Authentication dan session yang benar-benar aman.
- Penyimpanan data permanen.
- Validasi permission di server.
- Konsistensi transaksi dan nomor order.
- Perhitungan pembayaran dan status pembayaran yang otoritatif.
- Validasi transisi status order.
- Validasi QR token.
- Pembaruan KDS real-time dari server.
- Pelaporan berdasarkan transaksi nyata.
- Aktivasi dan validasi lisensi.
- Backup dan restore database.

------------------------------------------------------------------------

## 12. Rencana Eksekusi Pertama

Mulai dari **Fase 0 --- Project Foundation**, lalu lanjut ke Fase 1 dan
seterusnya.

Sebelum implementasi dimulai, lakukan pemeriksaan repository untuk
mengetahui bagian yang sudah tersedia. Jangan membuat ulang konfigurasi
atau komponen yang sudah benar.

Urutan kerja awal yang direkomendasikan:

1. Audit repository dan dokumen acuan.
2. Buat daftar gap antara kondisi repository saat ini dan Fase 0.
3. Selesaikan gap Fase 0.
4. Implementasikan design system dan theme.
5. Bangun halaman management UI dengan dummy data.
6. Bangun POS, KDS, dan QR Menu dengan dummy data.
7. Serahkan hasil untuk review.
8. Revisi sampai UI disetujui.
9. Baru mulai backend API dan integrasi.

**Keputusan urutan pengembangan:** Frontend UI → Review dan Approval →
Backend API → Integrasi → QA dan Release.

Dokumen ini mengatur urutan pengerjaan. Detail fitur dan business rules
tetap mengikuti PRD serta keputusan produk terbaru.
