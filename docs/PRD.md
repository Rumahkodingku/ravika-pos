# PRD - RAVIKA POS

> Dokumen kebutuhan produk untuk pengembangan MVP RAVIKA POS.\
> **Bahasa:** Indonesia\
> **Status:** Baseline kebutuhan MVP\
> **Pemilik produk:** RumahKodingku\
> **Nama produk:** RAVIKA POS\
> **Versi dokumen:** 1.0.0\
> **Tanggal:** 15 November 2026

------------------------------------------------------------------------

## 0. Petunjuk Membaca Dokumen

Dokumen ini menjadi acuan bersama bagi pemilik produk, perancang UI/UX,
pengembang, penguji, dan AI agent.

### 0.1 Aturan interpretasi

- Kata **WAJIB** berarti kebutuhan harus dipenuhi agar fitur dapat
    diterima.
- Kata **SEBAIKNYA** berarti rekomendasi kuat, tetapi dapat
    disesuaikan dengan alasan teknis yang jelas.
- Kata **DAPAT** berarti kebutuhan bersifat opsional.
- Setiap kebutuhan fungsional memiliki ID unik dengan pola
    `FR-AREA-NNN`.
- Setiap kebutuhan nonfungsional memiliki ID unik dengan pola
    `NFR-AREA-NNN`.
- Kriteria penerimaan menggunakan ID `AC-AREA-NNN`.
- Aturan bisnis menggunakan ID `BR-NNN`.
- Jika terdapat konflik antarbagian, urutan prioritasnya adalah:
    1. Keputusan produk yang telah disetujui.
    2. Aturan bisnis pada dokumen ini.
    3. Kebutuhan fungsional.
    4. Catatan implementasi dan contoh.
- Contoh nama endpoint, struktur folder, atau skema data merupakan
    arahan awal. Pengembang boleh menyempurnakannya tanpa mengubah
    perilaku produk yang diwajibkan.
- Jangan menambahkan fitur di luar ruang lingkup MVP tanpa persetujuan
    pemilik produk.

### 0.2 Istilah

  -----------------------------------------------------------------------
  Istilah                             Arti
  ----------------------------------- -----------------------------------
  Bisnis                              Entitas usaha yang menggunakan satu
                                      lisensi RAVIKA POS dan menjalankan
                                      satu lokasi operasional.

  Kasir                               Pengguna yang membuat pesanan dan
                                      mencatat pembayaran.

  Barista                             Pengguna yang menyiapkan pesanan
                                      dan memperbarui status persiapan.

  Pemilik                             Pengguna dengan kewenangan
                                      pengelolaan bisnis.

  KDS                                 Tampilan antrean pesanan untuk staf
                                      persiapan.

  QR ordering                         Pemesanan mandiri oleh pelanggan
                                      melalui halaman web yang dibuka
                                      dari QR Code.

  LAN                                 Jaringan lokal, misalnya jaringan
                                      Wi-Fi di tempat usaha.

  Snapshot                            Salinan nilai penting pada saat
                                      transaksi dibuat, sehingga tidak
                                      berubah ketika data sumber
                                      diperbarui.

  Lisensi                             Bukti hak penggunaan RAVIKA POS
                                      sesuai ketentuan pembelian.

Instalasi                           Satu lingkungan aplikasi produksi
                                      yang dipasang untuk satu bisnis
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 1. Ringkasan Produk

## 1.1 Gambaran umum

RAVIKA POS adalah aplikasi kasir dan pengelolaan operasional bisnis yang
dipasang pada komputer milik pelanggan dan diakses oleh perangkat lain
melalui jaringan lokal.

Produk dikembangkan oleh RumahKodingku dengan model pembelian satu kali.
Aplikasi tidak mewajibkan penggunaan server cloud, basis data cloud,
atau koneksi internet untuk transaksi operasional lokal.

MVP berfokus pada kebutuhan kafe yang menyediakan layanan makan di
tempat dan dibawa pulang. Sistem melayani pesanan dari dua jalur, yaitu
kasir dan pemesanan mandiri melalui QR Code. Semua pesanan masuk ke alur
pengelolaan pesanan yang sama dan dapat ditampilkan pada KDS untuk
diproses oleh barista.

## 1.2 Masalah yang ingin diselesaikan

Proses pemesanan manual pada kafe dapat menimbulkan masalah berikut:

- Pelanggan harus menyampaikan pesanan langsung kepada kasir.
- Pesanan dicatat pada kertas sehingga rawan salah baca atau hilang.
- Kasir harus menyampaikan pesanan secara manual kepada barista.
- Pelanggan dan kasir sulit mengetahui status persiapan pesanan.
- Rekap penjualan membutuhkan pekerjaan manual.
- Riwayat transaksi sulit ditelusuri.
- Pemilik usaha tidak memiliki ringkasan operasional yang mudah
    diakses.

## 1.3 Solusi

RAVIKA POS menyediakan satu sistem lokal yang menghubungkan:

1. Pengelolaan katalog produk.
2. Pemesanan melalui kasir.
3. Pemesanan mandiri melalui QR Code.
4. Pencatatan pembayaran.
5. Antrean persiapan pesanan melalui KDS.
6. Dashboard dan laporan penjualan dasar.
7. Pengelolaan pengguna dan hak akses.
8. Backup dan pemulihan data.

## 1.4 Sasaran produk

- Mengurangi pencatatan pesanan secara manual.
- Mengurangi kesalahan komunikasi antara kasir dan barista.
- Mempercepat proses pemesanan dan pemantauan pesanan.
- Menyediakan catatan transaksi yang konsisten.
- Memberikan laporan dasar kepada pemilik usaha.
- Memungkinkan operasional lokal tanpa ketergantungan internet.

## 1.5 Indikator keberhasilan MVP

Keberhasilan MVP dinilai melalui pengujian operasional, bukan hanya
jumlah halaman yang selesai dibuat.

  -----------------------------------------------------------------------
  Indikator                           Target penerimaan
  ----------------------------------- -----------------------------------
  Pesanan kasir                       Pesanan dapat dibuat, disimpan, dan
                                      muncul pada antrean persiapan.

  Pesanan QR                          Pelanggan dapat membuat pesanan
                                      dari perangkat yang terhubung ke
                                      LAN tanpa akun.

  Konsistensi harga                   Total transaksi dihitung oleh
                                      server dan tidak dapat dimanipulasi
                                      dari browser.

  Pembayaran                          Pembayaran penuh dan beberapa
                                      pembayaran untuk satu pesanan dapat
                                      dicatat.

  KDS                                 Perubahan antrean terlihat tanpa
                                      memuat ulang halaman secara manual
                                      ketika koneksi normal.

  Riwayat                             Transaksi yang sudah tersimpan
                                      dapat ditelusuri kembali.

  Laporan                             Ringkasan penjualan sesuai dengan
                                      transaksi yang tercatat.

  Operasional lokal                   Aplikasi dapat digunakan pada LAN
                                      tanpa akses internet.

  Pemulihan                           Basis data dapat dicadangkan dan
                                      dipulihkan melalui prosedur yang
                                      diuji.

Hak akses                           Pengguna tidak dapat menjalankan
                                      tindakan di luar permission yang
                                      dimilikinya
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 2. Keputusan Produk

## 2.1 Identitas produk

- Nama produk: **RAVIKA POS**.
- Brand utama: **RAVIKA**.
- Pengembang: **RumahKodingku**.
- Karakter brand: modern dan profesional.
- Tagline kerja: **Run your business with clarity.**
- Positioning: perangkat lunak operasional bisnis yang praktis,
    mandiri, dan mudah digunakan.

Identitas visual lengkap dapat ditetapkan pada dokumen panduan merek
terpisah. PRD ini tidak mengunci detail logo atau aset visual.

## 2.2 Model bisnis

- Produk dijual dengan pembayaran satu kali.
- Lisensi memberikan hak penggunaan berkelanjutan sesuai ketentuan
    lisensi.
- Satu lisensi berlaku untuk satu bisnis.
- Satu lisensi berlaku untuk satu instalasi produksi.
- Satu bisnis menjalankan satu lokasi operasional pada MVP.
- Pelanggan mengelola server dan data pada infrastrukturnya sendiri.
- Koneksi internet tidak diwajibkan untuk penggunaan operasional
    lokal.
- Instalasi, pelatihan, dukungan, penyesuaian, dan layanan tambahan
    dapat ditawarkan terpisah.
- Tidak ada pemeriksaan lisensi online yang diwajibkan setiap kali
    aplikasi dijalankan.

## 2.3 Model operasional

- Satu komputer menjadi server utama.
- Server menjalankan aplikasi Next.js dan menyimpan basis data SQLite
    pada disk lokal.
- Kasir, barista, dan pelanggan mengakses aplikasi melalui browser
    menggunakan jaringan lokal.
- Perangkat klien tidak mengakses berkas basis data secara langsung.
- Pelanggan harus terhubung ke jaringan Wi-Fi/LAN bisnis untuk membuka
    layanan lokal.
- Internet tidak diperlukan untuk transaksi lokal, tetapi dapat
    dibutuhkan untuk aktivitas eksternal seperti pembaruan aplikasi atau
    layanan pihak ketiga di masa depan.

## 2.4 Prinsip desain produk

1. Sederhana bagi pengguna nonteknis.
2. Alur kasir harus cepat dan minim langkah.
3. Informasi pesanan harus mudah dibaca dari jarak penggunaan normal
    pada layar KDS.
4. Tindakan penting harus memberikan umpan balik yang jelas.
5. Data transaksi harus konsisten dan dapat ditelusuri.
6. Hak akses harus ditegakkan di sisi server.
7. Kegagalan jaringan harus ditampilkan secara jelas.
8. Antarmuka harus responsif untuk komputer, tablet, dan ponsel.
9. Istilah antarmuka menggunakan bahasa Indonesia.
10. Jangan mengandalkan warna saja untuk menyampaikan status.

------------------------------------------------------------------------

# 3. Pengguna dan Hak Akses

## 3.1 Role MVP

MVP memiliki tiga role bawaan:

  -----------------------------------------------------------------------
  Kode role               Nama                    Tujuan
  ----------------------- ----------------------- -----------------------
  `OWNER`                 Pemilik                 Mengelola konfigurasi
                                                  bisnis dan memantau
                                                  seluruh operasional.

  `CASHIER`               Kasir                   Membuat pesanan,
                                                  mengelola transaksi,
                                                  dan mencatat
                                                  pembayaran.

`BARISTA`               Barista                 Melihat antrean dan
                                                  memperbarui proses
                                                  persiapan pesanan
  -----------------------------------------------------------------------

Role disimpan di basis data. Nama kode di atas merupakan kode awal role
bawaan, bukan alasan untuk mengunci seluruh mekanisme RBAC pada kode
aplikasi.

## 3.2 Customer

Pelanggan bukan role akun internal.

- Pelanggan tidak wajib mendaftar.
- Pelanggan tidak wajib login.
- Pelanggan mengakses menu melalui QR Code.
- Pelanggan hanya dapat melihat dan mengirim pesanan sesuai konteks QR
    atau pilihan takeaway yang tersedia.
- Pelanggan tidak boleh mengakses dashboard internal, data pengguna,
    laporan, atau data transaksi pelanggan lain.

## 3.3 Matriks akses awal

Matriks berikut adalah baseline permission. Implementasi harus memeriksa
permission, bukan hanya membandingkan nama role.

  -----------------------------------------------------------------------
  Area                        OWNER            CASHIER            BARISTA
  -------------- ------------------ ------------------ ------------------
  Dashboard                      Ya Ringkasan terbatas              Tidak

  Profil bisnis              Kelola   Lihat seperlunya              Tidak

  Pengguna                   Kelola              Tidak              Tidak

  Role dan                   Kelola              Tidak              Tidak
  permission

  Kategori                   Kelola              Lihat              Lihat
  produk

  Produk dan                 Kelola              Lihat Lihat item pesanan
  harga

  Meja dan QR                Kelola Kelola operasional Lihat konteks meja

  Membuat                        Ya                 Ya              Tidak
  pesanan kasir

  Melihat                        Ya                 Ya Sesuai antrean KDS
  seluruh
  pesanan

  Mencatat                       Ya                 Ya              Tidak
  pembayaran

  Membatalkan           Berdasarkan        Berdasarkan              Tidak
  pesanan                permission         permission

  Memperbarui                    Ya              Tidak                 Ya
  status
  persiapan

  Laporan                        Ya      Terbatas bila              Tidak
  penjualan                                  diberikan

  Backup dan                     Ya              Tidak              Tidak
  restore

  Lisensi              Lihat status              Tidak              Tidak

Pengaturan                 Kelola              Tidak              Tidak
  sistem
  -----------------------------------------------------------------------

## 3.4 RBAC

- Sistem WAJIB memiliki entitas role dan permission terpisah.
- Satu role dapat memiliki banyak permission.
- Satu permission dapat diberikan kepada banyak role.
- Satu pengguna dapat memiliki satu atau lebih role apabila model
    implementasi mendukungnya.
- Pengguna yang tidak memiliki permission harus ditolak oleh backend.
- Menyembunyikan tombol atau menu pada frontend tidak dianggap sebagai
    kontrol keamanan.
- Pengelolaan role dan permission hanya dapat dilakukan oleh pengguna
    dengan permission yang sesuai.
- Role bawaan dapat disediakan melalui proses seeding.
- Nama role dan permission harus konsisten dan terdokumentasi.

Contoh kode permission:

- `dashboard.view`
- `business.view`
- `business.update`
- `users.view`
- `users.manage`
- `roles.manage`
- `permissions.manage`
- `products.view`
- `products.manage`
- `categories.manage`
- `tables.view`
- `tables.manage`
- `orders.view`
- `orders.create`
- `orders.cancel`
- `payments.view`
- `payments.create`
- `payments.refund`
- `kds.view`
- `kds.update_status`
- `reports.view`
- `backup.create`
- `backup.restore`
- `settings.manage`

Daftar permission dapat disempurnakan ketika desain modul dan kebijakan
operasional ditetapkan. Jangan membuat permission terlalu umum jika
tindakan memiliki risiko yang berbeda.

------------------------------------------------------------------------

# 4. Ruang Lingkup MVP

## 4.1 Fitur yang termasuk MVP

  -----------------------------------------------------------------------
  ID                      Modul                   Cakupan
  ----------------------- ----------------------- -----------------------
  SCOPE-01                Autentikasi             Login, logout, sesi,
                                                  dan proteksi akses.

  SCOPE-02                RBAC                    Pengguna, role,
                                                  permission, dan
                                                  otorisasi.

  SCOPE-03                Bisnis                  Profil bisnis dan
                                                  preferensi operasional.

  SCOPE-04                Katalog                 Kategori, produk,
                                                  varian, add-on, dan
                                                  ketersediaan.

  SCOPE-05                Meja dan QR             Pengelolaan meja serta
                                                  QR Code unik.

  SCOPE-06                POS                     Pembuatan pesanan dari
                                                  kasir.

  SCOPE-07                QR ordering             Menu publik dan
                                                  pemesanan tanpa akun.

  SCOPE-08                Pesanan                 Siklus hidup pesanan
                                                  dan riwayat.

  SCOPE-09                Pembayaran              Tunai, pencatatan
                                                  pembayaran digital, dan
                                                  split payment.

  SCOPE-10                KDS                     Antrean dan status
                                                  persiapan pesanan.

  SCOPE-11                Dashboard               Ringkasan operasional
                                                  dasar.

  SCOPE-12                Laporan                 Penjualan dan produk
                                                  terlaris.

  SCOPE-13                Lisensi                 Validasi lisensi lokal.

SCOPE-14                Backup                  Pencadangan dan
                                                  pemulihan basis data
  -----------------------------------------------------------------------

## 4.2 Fitur di luar MVP

Fitur berikut tidak boleh masuk implementasi MVP tanpa persetujuan
perubahan ruang lingkup.

- Persediaan bahan baku.
- Resep dan komposisi bahan.
- Supplier.
- Pembelian dan purchase order.
- Loyalty program.
- Membership pelanggan.
- CRM pelanggan.
- Integrasi payment gateway.
- Verifikasi pembayaran otomatis.
- Integrasi WhatsApp.
- Sinkronisasi cloud.
- Layanan SaaS multi-tenant.
- Website builder.
- Landing page pemasaran bisnis.
- Manajemen kampanye pemasaran.
- Aplikasi Android atau iOS native.
- Integrasi perangkat keras printer atau laci kasir khusus.
- Analitik lanjutan dan peramalan.
- Akuntansi penuh.
- Pengelolaan pajak yang kompleks.
- Sinkronisasi antarinstalasi.

## 4.3 PWA

PWA merupakan peningkatan setelah sistem inti stabil, bukan syarat agar
backend dapat beroperasi secara lokal.

Cakupan yang dapat dikerjakan setelah core MVP:

- Manifest aplikasi.
- Ikon aplikasi.
- Pengalaman pemasangan ke layar utama.
- Cache aset statis.
- Indikator status koneksi.
- Pengalaman pemulihan koneksi.

PWA tidak boleh dianggap sebagai mekanisme transaksi offline otomatis.
Transaksi tetap dikirim dan disimpan pada server lokal. Service Worker
memerlukan secure context; akses HTTP melalui alamat IP LAN biasa
umumnya tidak memenuhi persyaratan tersebut. Strategi HTTPS lokal harus
ditentukan sebelum fitur Service Worker diandalkan.

------------------------------------------------------------------------

# 5. Alur Operasional Utama

## 5.1 Alur pesanan melalui kasir

1. Kasir login.
2. Kasir membuka halaman POS.
3. Kasir memilih tipe pesanan: dine-in atau takeaway.
4. Untuk dine-in, kasir memilih meja.
5. Kasir menambahkan produk.
6. Kasir memilih varian dan add-on jika tersedia.
7. Kasir memasukkan catatan item atau pesanan bila diperlukan.
8. Sistem menghitung harga dan total di server.
9. Kasir mengonfirmasi pesanan.
10. Sistem membuat nomor pesanan dan menyimpan transaksi.
11. Pesanan muncul di KDS.
12. Kasir mencatat pembayaran sesuai metode yang diterima.
13. Barista memproses pesanan.
14. Pesanan diperbarui hingga selesai.

## 5.2 Alur QR ordering

1. Pemilik atau kasir membuat QR Code untuk meja.
2. Pelanggan menghubungkan ponsel ke Wi-Fi bisnis.
3. Pelanggan memindai QR Code.
4. Browser membuka halaman menu publik.
5. Server memvalidasi token QR.
6. Sistem menampilkan nama bisnis dan konteks meja.
7. Pelanggan memilih produk, varian, dan add-on.
8. Pelanggan meninjau keranjang.
9. Pelanggan mengirim pesanan.
10. Server memvalidasi produk, harga, ketersediaan, dan konteks meja.
11. Sistem menyimpan pesanan.
12. Pesanan muncul di KDS dan dapat dilihat kasir.
13. Pelanggan melihat nomor dan status pesanan sesuai kemampuan halaman
    pelacakan.
14. Untuk MVP, pembayaran dapat dilakukan di kasir. QR ordering tidak
    berarti pembayaran digital otomatis.

## 5.3 Alur takeaway dari QR

1. Pelanggan membuka halaman menu dari alamat atau QR publik yang
    disediakan bisnis.
2. Pelanggan memilih mode takeaway.
3. Pelanggan mengisi informasi minimum yang memang diperlukan
    operasional.
4. Pelanggan memilih produk dan mengirim pesanan.
5. Sistem membuat pesanan takeaway tanpa meja.
6. Pesanan masuk ke antrean yang sama dengan pesanan lainnya.

Catatan: metode akses publik untuk takeaway perlu ditentukan pada
implementasi menu. Jangan mengasumsikan token QR meja wajib untuk semua
pesanan.

## 5.4 Alur pembayaran

1. Kasir membuka detail pesanan.
2. Sistem menampilkan jumlah yang harus dibayar.
3. Kasir memilih metode pembayaran.
4. Kasir memasukkan nominal pembayaran.
5. Untuk metode digital, kasir memverifikasi bukti atau konfirmasi
    secara manual di luar sistem.
6. Sistem menyimpan catatan pembayaran.
7. Sistem menghitung ulang jumlah terbayar dan sisa pembayaran.
8. Status pembayaran diperbarui.
9. Jika pembayaran belum lunas, pesanan tetap memiliki sisa tagihan.
10. Jika jumlah pembayaran memenuhi total yang harus dibayar, status
    pembayaran menjadi lunas.

## 5.5 Alur KDS

1. Barista login.
2. Barista membuka KDS.
3. KDS mengambil seluruh pesanan aktif.
4. Pesanan baru ditampilkan sebagai `NEW`.
5. Barista menerima pesanan.
6. Barista memulai persiapan.
7. Barista menandai pesanan siap.
8. Pesanan tetap terlihat sebagai siap sampai diambil atau
    diselesaikan.
9. Pesanan ditandai selesai setelah diserahkan.
10. Pesanan batal tidak boleh tetap tampil sebagai pekerjaan aktif.

## 5.6 Alur pemulihan koneksi

1. Client mendeteksi koneksi terputus.
2. UI menampilkan indikator koneksi terputus.
3. Client mencoba menyambung kembali.
4. Setelah tersambung, client mengambil ulang data penting dari server.
5. KDS memuat ulang antrean aktif.
6. Client tidak boleh menganggap perubahan lokal yang belum
    dikonfirmasi server sebagai transaksi berhasil.

------------------------------------------------------------------------

# 6. Kebutuhan Fungsional

## 6.1 Autentikasi dan sesi

### Kebutuhan

- **FR-AUTH-001** --- Sistem WAJIB menyediakan halaman login untuk
    pengguna internal.
- **FR-AUTH-002** --- Sistem WAJIB memverifikasi kredensial pada
    server.
- **FR-AUTH-003** --- Sistem WAJIB menyediakan logout.
- **FR-AUTH-004** --- Sistem WAJIB melindungi halaman internal dari
    pengguna yang belum terautentikasi.
- **FR-AUTH-005** --- Sistem WAJIB mengelola sesi pengguna secara
    aman.
- **FR-AUTH-006** --- Sistem WAJIB menolak sesi yang tidak valid atau
    telah berakhir.
- **FR-AUTH-007** --- Sistem WAJIB membatasi percobaan login secara
    wajar untuk mengurangi penyalahgunaan.
- **FR-AUTH-008** --- Sistem WAJIB menyediakan mekanisme perubahan
    kata sandi oleh pengguna yang berwenang.
- **FR-AUTH-009** --- Sistem WAJIB menyediakan proses awal untuk
    membuat akun pemilik saat instalasi pertama.
- **FR-AUTH-010** --- Sistem WAJIB menyimpan kata sandi dalam bentuk
    hash menggunakan algoritma yang sesuai, bukan teks biasa.
- **FR-AUTH-011** --- Sistem WAJIB menyediakan first-run setup untuk
    membuat owner pertama dan profil bisnis bila belum ada owner.
- **FR-AUTH-012** --- Sistem WAJIB membuat QR key otomatis saat
    first-run setup dan menyimpannya di `.env`.

### Kriteria penerimaan

- **AC-AUTH-001** --- Pengguna dengan kredensial benar dapat login.
- **AC-AUTH-002** --- Pengguna dengan kredensial salah tidak dapat
    masuk dan menerima pesan yang tidak membocorkan apakah nama pengguna
    atau kata sandi yang salah.
- **AC-AUTH-003** --- Pengguna yang logout tidak dapat membuka halaman
    internal menggunakan sesi sebelumnya.
- **AC-AUTH-004** --- Pengguna tanpa sesi diarahkan ke halaman login
    ketika membuka halaman internal.
- **AC-AUTH-005** --- Kata sandi tidak tersimpan sebagai teks biasa
    pada basis data.

Catatan implementasi: session memakai token acak yang disimpan sebagai
hash di tabel `sessions`. Cookie session bersifat HttpOnly, SameSite=Lax,
dan atribut Secure dikontrol environment.

## 6.2 Pengguna

### Kebutuhan

- **FR-USER-001** --- Pemilik dapat melihat daftar pengguna.
- **FR-USER-002** --- Pemilik dapat membuat pengguna.
- **FR-USER-003** --- Pemilik dapat memperbarui data pengguna.
- **FR-USER-004** --- Pemilik dapat mengaktifkan atau menonaktifkan
    pengguna.
- **FR-USER-005** --- Pemilik dapat menetapkan role kepada pengguna.
- **FR-USER-006** --- Sistem tidak boleh menghapus atau menonaktifkan
    satu-satunya akun pemilik aktif tanpa prosedur pengganti.
- **FR-USER-007** --- Sistem mencatat waktu pembuatan dan perubahan
    data pengguna.

### Kriteria penerimaan

- **AC-USER-001** --- Pengguna baru dapat login setelah dibuat dan
    diaktifkan.
- **AC-USER-002** --- Pengguna nonaktif tidak dapat membuat sesi baru.
- **AC-USER-003** --- Perubahan role memengaruhi hak akses setelah
    sesi diperbarui atau divalidasi ulang.

## 6.3 Role dan permission

### Kebutuhan

- **FR-RBAC-001** --- Sistem menyediakan manajemen role.
- **FR-RBAC-002** --- Sistem menyediakan manajemen permission.
- **FR-RBAC-003** --- Sistem menyediakan hubungan role dan permission.
- **FR-RBAC-004** --- Sistem menyediakan hubungan pengguna dan role.
- **FR-RBAC-005** --- Backend memeriksa permission pada setiap
    tindakan terlindungi.
- **FR-RBAC-006** --- Sistem menyediakan role awal OWNER, CASHIER, dan
    BARISTA melalui seeder.
- **FR-RBAC-007** --- Sistem tidak boleh mengandalkan nama role
    sebagai satu-satunya mekanisme otorisasi.
- **FR-RBAC-008** --- Perubahan permission harus tercermin pada
    otorisasi backend.

### Kriteria penerimaan

- **AC-RBAC-001** --- Pengguna tanpa permission tidak dapat mengakses
    endpoint terlindungi.
- **AC-RBAC-002** --- Pengguna dengan permission yang sesuai dapat
    melakukan tindakan yang diizinkan.
- **AC-RBAC-003** --- Mengubah permission role mengubah akses pengguna
    yang memiliki role tersebut.
- **AC-RBAC-004** --- Customer publik tidak dapat mengakses endpoint
    internal.

## 6.4 Bisnis

### Kebutuhan

- **FR-BIZ-001** --- Sistem menyimpan profil satu bisnis per
    instalasi.
- **FR-BIZ-002** --- Pemilik dapat memperbarui nama dan informasi
    dasar bisnis.
- **FR-BIZ-003** --- Bisnis menjalankan satu lokasi operasional pada
    MVP.
- **FR-BIZ-004** --- Data operasional terikat pada bisnis.
- **FR-BIZ-005** --- Operasional dapat dimulai tanpa konfigurasi
    lokasi tambahan.

### Kriteria penerimaan

- **AC-BIZ-001** --- Profil bisnis tampil konsisten di seluruh UI.
- **AC-BIZ-002** --- Pesanan selalu memiliki referensi bisnis.
- **AC-BIZ-003** --- Pengguna hanya dapat membaca data bisnis tempat
    ia terdaftar.

## 6.5 Kategori dan produk

### Kebutuhan

- **FR-CAT-001** --- Pemilik dapat membuat kategori.
- **FR-CAT-002** --- Pemilik dapat memperbarui kategori.
- **FR-CAT-003** --- Pemilik dapat mengurutkan kategori untuk tampilan
    menu.
- **FR-CAT-004** --- Pemilik dapat mengaktifkan atau menonaktifkan
    kategori.
- **FR-PROD-001** --- Pemilik dapat membuat produk.
- **FR-PROD-002** --- Pemilik dapat memperbarui produk.
- **FR-PROD-003** --- Pemilik dapat menetapkan nama, deskripsi,
    gambar, harga, kategori, dan status ketersediaan.
- **FR-PROD-004** --- Pemilik dapat mengaktifkan atau menonaktifkan
    produk.
- **FR-PROD-005** --- Sistem mendukung varian produk.
- **FR-PROD-006** --- Sistem mendukung add-on atau topping.
- **FR-ADDON-001** --- Pemilik dapat membuat add-on.
- **FR-ADDON-002** --- Pemilik dapat memperbarui nama, harga, dan status add-on.
- **FR-ADDON-003** --- Add-on dapat dinonaktifkan. Add-on yang tidak aktif tidak dapat dipilih pada produk.
- **FR-ADDON-004** --- Nama add-on unik per bisnis.
- **FR-PROD-007** --- Varian dan add-on dapat memiliki penyesuaian
    harga.
- **FR-PROD-008** --- Sistem hanya menampilkan produk yang tersedia
    pada menu pelanggan.
- **FR-PROD-009** --- Sistem memvalidasi ulang produk dan harga ketika
    pesanan dikirim.
- **FR-PROD-010** --- Produk yang telah digunakan pada transaksi tidak
    boleh menyebabkan riwayat transaksi berubah ketika produk diperbarui
    atau dinonaktifkan.

### Kriteria penerimaan

- **AC-PROD-001** --- Produk aktif dan tersedia tampil pada menu.
- **AC-PROD-002** --- Produk tidak tersedia tidak dapat dipesan.
- **AC-PROD-003** --- Perubahan harga produk tidak mengubah harga item
    transaksi yang telah tersimpan.
- **AC-PROD-004** --- Harga varian dan add-on dihitung oleh server.

## 6.6 Meja dan QR Code

### Kebutuhan

- **FR-TABLE-001** --- Pemilik dapat membuat meja.
- **FR-TABLE-002** --- Pemilik dapat memperbarui nama atau nomor meja.
- **FR-TABLE-003** --- Pemilik dapat mengaktifkan atau menonaktifkan
    meja.
- **FR-TABLE-004** --- Sistem menghasilkan token QR unik dan sulit
    ditebak untuk konteks meja.
- **FR-TABLE-005** --- Sistem menghubungkan token QR dengan meja.
- **FR-TABLE-006** --- Sistem menyediakan QR Code yang dapat
    ditampilkan atau dicetak.
- **FR-TABLE-007** --- Sistem dapat menonaktifkan atau mengganti token
    QR yang dianggap tidak aman.
- **FR-TABLE-008** --- Server memvalidasi token sebelum menampilkan
    konteks meja.
- **FR-TABLE-009** --- Token QR tidak boleh memuat informasi rahasia
    atau data pribadi.

### Kriteria penerimaan

- **AC-TABLE-001** --- QR meja yang valid membuka menu dengan konteks
    meja yang benar.
- **AC-TABLE-002** --- Token tidak valid atau dinonaktifkan ditolak.
- **AC-TABLE-003** --- QR hanya dapat membuat pesanan pada meja yang
    terhubung dengan token tersebut.
- **AC-TABLE-004** --- Penggantian token membuat token lama tidak lagi
    dapat digunakan.

## 6.7 POS dan pembuatan pesanan

### Kebutuhan

- **FR-ORDER-001** --- Kasir dapat membuat pesanan baru.
- **FR-ORDER-002** --- Sistem mendukung tipe pesanan DINE_IN dan
    TAKEAWAY.
- **FR-ORDER-003** --- Pesanan DINE_IN harus memiliki meja yang valid.
- **FR-ORDER-004** --- Pesanan TAKEAWAY tidak memerlukan meja.
- **FR-ORDER-005** --- Kasir dapat menambahkan produk ke pesanan.
- **FR-ORDER-006** --- Kasir dapat memilih varian dan add-on.
- **FR-ORDER-007** --- Kasir dapat memasukkan catatan item atau
    catatan pesanan.
- **FR-ORDER-008** --- Kasir dapat mengubah kuantitas dan menghapus
    item sebelum pesanan dikonfirmasi.
- **FR-ORDER-009** --- Sistem menghitung subtotal dan total di server.
- **FR-ORDER-010** --- Sistem menghasilkan nomor pesanan yang unik
    dalam konteks yang ditentukan.
- **FR-ORDER-011** --- Sistem menyimpan sumber pesanan, minimal
    CASHIER atau QR.
- **FR-ORDER-012** --- Sistem menyimpan snapshot nama produk, varian,
    add-on, harga satuan, kuantitas, dan nilai terkait transaksi.
- **FR-ORDER-013** --- Sistem menyediakan detail dan riwayat pesanan.
- **FR-ORDER-014** --- Pengguna yang memiliki permission dapat
    membatalkan pesanan sesuai aturan status.
- **FR-ORDER-015** --- Sistem mencegah pesanan kosong dikonfirmasi.
- **FR-ORDER-016** --- Sistem mencegah pengiriman ganda akibat
    pengulangan request yang sama melalui mekanisme idempotensi atau
    kontrol duplikasi.
- **FR-ORDER-017** --- Sistem menyimpan waktu pembuatan dan perubahan
    status pesanan.
- **FR-ORDER-018** --- Pesanan dari kasir dan QR menggunakan alur
    domain pesanan yang sama.

### Kriteria penerimaan

- **AC-ORDER-001** --- Kasir dapat membuat pesanan dine-in dengan meja
    valid.
- **AC-ORDER-002** --- Kasir dapat membuat pesanan takeaway tanpa
    meja.
- **AC-ORDER-003** --- Total yang tersimpan sama dengan hasil
    perhitungan server.
- **AC-ORDER-004** --- Mengubah harga produk setelah transaksi tidak
    mengubah transaksi sebelumnya.
- **AC-ORDER-005** --- Request yang dikirim ulang tidak membuat
    transaksi ganda ketika menggunakan kunci idempotensi yang sama.
- **AC-ORDER-006** --- Pesanan yang berhasil dibuat muncul pada daftar
    pesanan dan KDS.

## 6.8 QR ordering

### Kebutuhan

- **FR-QRO-001** --- Sistem menyediakan halaman menu publik.
- **FR-QRO-002** --- Halaman menu dapat dibuka melalui browser tanpa
    instalasi aplikasi.
- **FR-QRO-003** --- Pelanggan tidak diwajibkan membuat akun.
- **FR-QRO-004** --- Halaman menampilkan nama bisnis dan meja
    berdasarkan token QR yang valid.
- **FR-QRO-005** --- Pelanggan dapat melihat kategori dan produk
    tersedia.
- **FR-QRO-006** --- Pelanggan dapat memilih varian dan add-on.
- **FR-QRO-007** --- Pelanggan dapat meninjau keranjang sebelum
    mengirim pesanan.
- **FR-QRO-008** --- Pelanggan dapat mengirim pesanan.
- **FR-QRO-009** --- Server memvalidasi ulang semua item, harga,
    ketersediaan, dan meja.
- **FR-QRO-010** --- Pelanggan menerima nomor pesanan setelah pesanan
    berhasil tersimpan.
- **FR-QRO-011** --- Sistem menyediakan tampilan status pesanan yang
    aman untuk pelanggan.
- **FR-QRO-012** --- Halaman publik tidak menampilkan data internal
    atau informasi pelanggan lain.
- **FR-QRO-013** --- Sistem menyediakan mode takeaway tanpa meja
    sesuai konfigurasi operasional.
- **FR-QRO-014** --- Endpoint publik menerapkan pembatasan request
    yang wajar.
- **FR-QRO-015** --- Sistem tidak mempercayai harga atau total yang
    dikirim browser.

### Kriteria penerimaan

- **AC-QRO-001** --- Pelanggan dapat mengirim pesanan tanpa login.
- **AC-QRO-002** --- Pelanggan tidak dapat mengubah harga dengan
    memodifikasi request.
- **AC-QRO-003** --- Token QR yang tidak valid tidak dapat digunakan.
- **AC-QRO-004** --- Pesanan QR tampil pada antrean internal yang sama
    dengan pesanan kasir.
- **AC-QRO-005** --- Pelanggan tidak dapat mengakses detail pesanan
    lain hanya dengan menebak nomor pesanan.

## 6.9 Pembayaran

### Kebutuhan

- **FR-PAY-001** --- Sistem memisahkan status pembayaran dari status
    pesanan.
- **FR-PAY-002** --- Sistem mendukung metode CASH.
- **FR-PAY-003** --- Sistem mendukung pencatatan QRIS.
- **FR-PAY-004** --- Sistem mendukung pencatatan transfer bank.
- **FR-PAY-005** --- Sistem mendukung pencatatan e-wallet.
- **FR-PAY-006** --- Pembayaran digital diverifikasi manual oleh kasir
    pada MVP.
- **FR-PAY-007** --- Satu pesanan dapat memiliki lebih dari satu
    catatan pembayaran.
- **FR-PAY-008** --- Sistem mendukung split payment.
- **FR-PAY-009** --- Sistem menyimpan metode, nominal, waktu, dan
    pengguna pencatat pembayaran.
- **FR-PAY-010** --- Sistem menghitung total pembayaran dan sisa
    tagihan di server.
- **FR-PAY-011** --- Sistem menolak nominal pembayaran nol atau
    negatif.
- **FR-PAY-012** --- Sistem mencegah pembayaran melebihi sisa tagihan,
    kecuali kebijakan uang kembalian untuk metode tunai ditangani secara
    eksplisit.
- **FR-PAY-013** --- Sistem menyediakan riwayat pembayaran.
- **FR-PAY-014** --- Pembatalan atau pengembalian dana harus memiliki
    jejak audit.
- **FR-PAY-015** --- Sistem tidak menganggap pesanan lunas hanya
    karena pelanggan memilih metode digital.
- **FR-PAY-016** --- Sistem tidak mengintegrasikan payment gateway
    pada MVP.

### Status pembayaran

  -----------------------------------------------------------------------
  Status                              Arti
  ----------------------------------- -----------------------------------
  `UNPAID`                            Belum ada pembayaran yang tercatat.

  `PARTIALLY_PAID`                    Pembayaran sudah diterima sebagian.

  `PAID`                              Seluruh nilai yang harus dibayar
                                      sudah diterima.

`REFUNDED`                          Dana telah dikembalikan sesuai
                                      proses pengembalian dana
  -----------------------------------------------------------------------

### Kriteria penerimaan

- **AC-PAY-001** --- Pembayaran tunai dapat dicatat.
- **AC-PAY-002** --- Pembayaran digital dapat dicatat setelah
    diverifikasi kasir.
- **AC-PAY-003** --- Dua atau lebih catatan pembayaran dapat melunasi
    satu pesanan.
- **AC-PAY-004** --- Status menjadi PARTIALLY_PAID ketika jumlah
    pembayaran masih kurang.
- **AC-PAY-005** --- Status menjadi PAID ketika jumlah pembayaran
    memenuhi nilai yang harus dibayar.
- **AC-PAY-006** --- Perubahan status pembayaran tidak otomatis
    mengubah status persiapan pesanan.
- **AC-PAY-007** --- Setiap pembayaran dapat ditelusuri kepada
    pengguna yang mencatatnya.

## 6.10 Kitchen Display System

### Kebutuhan

- **FR-KDS-001** --- Sistem menyediakan tampilan KDS untuk barista.
- **FR-KDS-002** --- KDS menampilkan pesanan aktif sesuai
    permission.
- **FR-KDS-003** --- KDS menampilkan nomor pesanan, waktu, tipe
    pesanan, meja jika ada, item, kuantitas, varian, add-on, dan
    catatan.
- **FR-KDS-004** --- Barista dapat menerima pesanan.
- **FR-KDS-005** --- Barista dapat memulai persiapan pesanan.
- **FR-KDS-006** --- Barista dapat menandai pesanan siap.
- **FR-KDS-007** --- Barista dapat menandai pesanan selesai setelah
    diserahkan.
- **FR-KDS-008** --- Pesanan READY tetap terlihat sampai selesai atau
    diambil.
- **FR-KDS-009** --- Pesanan CANCELLED tidak ditampilkan sebagai
    pekerjaan aktif.
- **FR-KDS-010** --- Perubahan pesanan baru dan status disampaikan
    secara real-time melalui SSE.
- **FR-KDS-011** --- KDS mengambil ulang antrean aktif setelah koneksi
    terputus dan tersambung kembali.
- **FR-KDS-012** --- Perubahan status dilakukan melalui request HTTP
    yang terautentikasi.
- **FR-KDS-013** --- Sistem mencatat waktu perubahan status dan
    pengguna yang melakukan perubahan.

### Status persiapan

  Status        Arti
  ------------- ---------------------------------------------
  `NEW`         Pesanan baru masuk.
  `ACCEPTED`    Pesanan diterima untuk diproses.
  `PREPARING`   Pesanan sedang dibuat.
  `READY`       Pesanan siap diserahkan.
  `COMPLETED`   Pesanan telah diserahkan atau diselesaikan.
  `CANCELLED`   Pesanan dibatalkan.

### Kriteria penerimaan

- **AC-KDS-001** --- Pesanan baru muncul pada KDS tanpa pemuatan ulang
    manual ketika koneksi SSE normal.
- **AC-KDS-002** --- Barista dapat mengubah status sesuai transisi
    yang diizinkan.
- **AC-KDS-003** --- Pesanan READY tetap terlihat sampai ditandai
    COMPLETED.
- **AC-KDS-004** --- Setelah reconnect, KDS memuat ulang antrean aktif
    dari server.
- **AC-KDS-005** --- Pengguna tanpa permission tidak dapat memperbarui
    status KDS.

## 6.11 Dashboard dan laporan

### Kebutuhan

- **FR-REP-001** --- Sistem menyediakan dashboard untuk pemilik.
- **FR-REP-002** --- Dashboard menampilkan ringkasan penjualan pada
    rentang waktu yang dipilih.
- **FR-REP-003** --- Dashboard menampilkan jumlah transaksi.
- **FR-REP-004** --- Dashboard menampilkan jumlah pesanan berdasarkan
    status.
- **FR-REP-005** --- Sistem menyediakan laporan penjualan berdasarkan
    tanggal.
- **FR-REP-006** --- Sistem menyediakan daftar produk terlaris
    berdasarkan kuantitas terjual.
- **FR-REP-007** --- Laporan dapat difilter berdasarkan tanggal.
- **FR-REP-008** --- Sistem membedakan pesanan dibatalkan dan
    transaksi yang menghasilkan penjualan.
- **FR-REP-009** --- Definisi angka pendapatan harus konsisten dan
    terdokumentasi.
- **FR-REP-010** --- Pengguna tanpa permission laporan tidak dapat
    mengakses data laporan melalui API.

### Definisi awal metrik

- Jumlah transaksi: jumlah pesanan yang memenuhi kriteria transaksi
    sah sesuai kebijakan laporan.
- Penjualan kotor: jumlah nilai item sebelum pengurangan atau
    pengembalian yang diperhitungkan.
- Penjualan bersih: nilai penjualan setelah diskon dan pengembalian
    yang tercatat, jika mekanisme tersebut tersedia.
- Produk terlaris: produk dengan kuantitas terjual tertinggi pada
    rentang waktu yang dipilih.

Rumus akhir harus mengikuti skema transaksi yang diimplementasikan.
Jangan menghitung pendapatan dari pesanan yang dibatalkan atau
pembayaran yang belum diterima tanpa label yang jelas.

### Kriteria penerimaan

- **AC-REP-001** --- Ringkasan dashboard sesuai dengan data transaksi
    pada periode yang sama.
- **AC-REP-002** --- Filter tanggal bekerja sesuai zona waktu bisnis.
- **AC-REP-003** --- Data hanya berasal dari satu bisnis.
- **AC-REP-004** --- Pesanan batal tidak dihitung sebagai penjualan
    sah.

## 6.12 Lisensi

### Kebutuhan

- **FR-LIC-001** --- Aplikasi memvalidasi lisensi secara lokal.
- **FR-LIC-002** --- Lisensi memiliki identitas bisnis dan batas
    penggunaan yang diperlukan.
- **FR-LIC-003** --- Lisensi ditandatangani menggunakan mekanisme
    kriptografi kunci publik.
- **FR-LIC-004** --- Private key hanya disimpan oleh pihak penerbit
    lisensi.
- **FR-LIC-005** --- Aplikasi hanya menyimpan public key untuk
    verifikasi.
- **FR-LIC-006** --- Aplikasi tidak menghubungi server lisensi setiap
    kali dijalankan.
- **FR-LIC-007** --- Sistem menampilkan status lisensi.
- **FR-LIC-008** --- Sistem menangani lisensi tidak valid, rusak, atau
    tidak sesuai identitas bisnis.
- **FR-LIC-009** --- Proses pemindahan instalasi harus mengikuti
    kebijakan lisensi.
- **FR-LIC-010** --- Kegagalan internet tidak boleh membuat lisensi
    lokal yang valid otomatis tidak berlaku.

### Kriteria penerimaan

- **AC-LIC-001** --- Lisensi yang ditandatangani oleh penerbit yang
    sah dapat diverifikasi.
- **AC-LIC-002** --- Perubahan isi lisensi menyebabkan verifikasi
    gagal.
- **AC-LIC-003** --- Aplikasi dapat dijalankan tanpa internet ketika
    lisensi lokal valid.
- **AC-LIC-004** --- Aplikasi menampilkan pesan yang dapat dipahami
    ketika lisensi tidak valid.

## 6.13 Backup dan pemulihan

### Kebutuhan

- **FR-BKP-001** --- Pemilik dapat membuat backup basis data.
- **FR-BKP-002** --- Sistem menyimpan backup pada lokasi yang
    ditentukan.
- **FR-BKP-003** --- Sistem menampilkan hasil proses backup.
- **FR-BKP-004** --- Pemilik dapat memulihkan basis data dari backup
    yang valid.
- **FR-BKP-005** --- Proses restore harus memiliki konfirmasi
    eksplisit.
- **FR-BKP-006** --- Sistem harus mencegah proses restore dilakukan
    oleh pengguna tanpa permission.
- **FR-BKP-007** --- Backup harus konsisten dengan transaksi SQLite
    yang sedang berlangsung.
- **FR-BKP-008** --- Sistem menyediakan informasi waktu backup
    terakhir.
- **FR-BKP-009** --- Sistem memberikan peringatan bahwa backup
    sebaiknya disalin ke media penyimpanan terpisah.
- **FR-BKP-010** --- Prosedur backup dan restore harus diuji sebelum
    rilis.

### Kriteria penerimaan

- **AC-BKP-001** --- Backup berhasil menghasilkan berkas yang dapat
    dibaca.
- **AC-BKP-002** --- Restore dari backup uji mengembalikan data yang
    diharapkan.
- **AC-BKP-003** --- Pengguna tanpa permission tidak dapat menjalankan
    backup atau restore.
- **AC-BKP-004** --- Kegagalan backup ditampilkan tanpa menyatakan
    proses berhasil.

## 6.14 Catatan integrasi UI Fase 7

Bagian ini mencatat perilaku UI dan field API aditif yang dipakai setelah
integrasi frontend-backend. Tidak ada perubahan aturan bisnis.

- Login, logout, dan ganti kata sandi memakai session cookie HttpOnly
    dari backend. Halaman login tidak menampilkan akun demo atau tombol
    isi kredensial.
- Guard layout dan halaman memakai permission. Role custom dapat dibuat
    lalu ditetapkan ke pengguna; label role ditampilkan dari `roleLabel`.
- Refund penuh tersedia dari detail order `PAID` bila pengguna memiliki
    `payments.refund`. Refund sebagian tetap di luar MVP.
- Halaman status pesanan publik melakukan polling setiap 10 detik dan
    tetap memisahkan status pembayaran dari status persiapan.
- Menu publik memakai `addOns` top-level yang berisi nama dan harga
    add-on aktif yang dirujuk produk.
- Setelah restore berhasil, UI menampilkan layar blocking yang meminta
    restart server, mengosongkan cache query, dan memuat ulang halaman
    setelah `/api/health` merespons.
- Field response aditif untuk UI: `roleLabel` pada user dan session,
    `GET /api/roles/options`, `activeOrderCount` pada daftar meja,
    `orderNumber` dan `recordedByName` pada payment, serta
    `changedByName` pada history order. Tidak ada migration baru.

------------------------------------------------------------------------

# 7. Aturan Bisnis

Aturan berikut berlaku lintas modul.

- **BR-001** --- Satu instalasi produksi hanya melayani satu bisnis
    berdasarkan lisensi.
- **BR-002** --- Satu bisnis menjalankan satu lokasi operasional pada
    MVP.
- **BR-003** --- Setiap transaksi operasional wajib memiliki konteks
    bisnis.
- **BR-004** --- Customer tidak perlu memiliki akun untuk membuat
    pesanan QR.
- **BR-005** --- Pesanan kasir dan QR menggunakan domain pesanan yang
    sama.
- **BR-006** --- Tipe pesanan hanya DINE_IN atau TAKEAWAY pada MVP.
- **BR-007** --- Pesanan DINE_IN wajib memiliki meja yang valid.
- **BR-008** --- Pesanan TAKEAWAY tidak memiliki meja.
- **BR-009** --- Harga dan total transaksi dihitung ulang oleh server.
- **BR-010** --- Data item transaksi menyimpan snapshot nama dan harga
    produk.
- **BR-011** --- Perubahan data katalog tidak mengubah transaksi
    historis.
- **BR-012** --- Status pesanan dan status pembayaran merupakan dua
    state machine berbeda.
- **BR-013** --- Satu pesanan dapat memiliki beberapa catatan
    pembayaran.
- **BR-014** --- Pembayaran digital pada MVP dicatat setelah
    verifikasi manual.
- **BR-015** --- Pesanan READY tetap terlihat di KDS sampai selesai.
- **BR-016** --- Semua perubahan status penting harus memiliki waktu
    perubahan dan aktor.
- **BR-017** --- Pembatalan pesanan tidak boleh menghapus jejak
    transaksi.
- **BR-018** --- Endpoint internal harus memeriksa autentikasi dan
    permission.
- **BR-019** --- Endpoint publik hanya boleh mengakses fungsi yang
    memang diperlukan pelanggan.
- **BR-020** --- Database SQLite hanya diakses oleh proses server
    lokal.
- **BR-021** --- Client tidak boleh mengakses berkas database secara
    langsung.
- **BR-022** --- Koneksi internet bukan syarat transaksi lokal.
- **BR-023** --- Perangkat klien harus dapat menjangkau server melalui
    LAN.
- **BR-024** --- Jika server mati, perangkat lain tidak dapat
    melakukan transaksi sampai server pulih.
- **BR-025** --- Data backup harus dapat dipulihkan melalui prosedur
    yang diuji.
- **BR-026** --- Tidak boleh ada fitur yang menyatakan pembayaran
    berhasil hanya berdasarkan pilihan metode pembayaran pelanggan.
- **BR-027** --- Request pembuatan pesanan yang berulang harus
    dikendalikan agar tidak membuat transaksi ganda.
- **BR-028** --- Perubahan harga, diskon, pembatalan, dan pengembalian
    dana harus dapat ditelusuri.

------------------------------------------------------------------------

# 8. Model Status dan Transisi

## 8.1 Status pesanan

Status pesanan merupakan status operasional pesanan, bukan status
pembayaran.

Status awal yang direkomendasikan:

- `NEW`
- `ACCEPTED`
- `PREPARING`
- `READY`
- `COMPLETED`
- `CANCELLED`

Transisi yang diizinkan:

  -----------------------------------------------------------------------
  Dari                    Ke                      Aktor yang diizinkan
  ----------------------- ----------------------- -----------------------
  NEW                     ACCEPTED                Barista atau pengguna
                                                  dengan permission

  ACCEPTED                PREPARING               Barista atau pengguna
                                                  dengan permission

  PREPARING               READY                   Barista atau pengguna
                                                  dengan permission

  READY                   COMPLETED               Barista atau pengguna
                                                  dengan permission

  NEW                     CANCELLED               Pengguna dengan
                                                  permission pembatalan

  ACCEPTED                CANCELLED               Pengguna dengan
                                                  permission pembatalan
                                                  sesuai kebijakan

PREPARING               CANCELLED               Pengguna dengan
                                                  permission pembatalan
                                                  sesuai kebijakan
  -----------------------------------------------------------------------

Ketentuan:

- Transisi yang tidak tercantum harus ditolak.
- Pesanan COMPLETED tidak dapat kembali ke status sebelumnya melalui
    alur normal.
- Pesanan CANCELLED bersifat terminal pada MVP.
- Perubahan status harus dilakukan di server dalam transaksi yang
    konsisten.
- Pembatalan setelah persiapan dimulai dapat memerlukan konfirmasi
    tambahan dan alasan pembatalan.
- Kebijakan pembatalan dan pengembalian dana harus konsisten dengan
    catatan pembayaran.

## 8.2 Status pembayaran

  Dari             Ke               Kondisi
  ---------------- ---------------- ------------------------------------------------
  UNPAID           PARTIALLY_PAID   Pembayaran sah kurang dari tagihan.
  UNPAID           PAID             Pembayaran sah memenuhi tagihan.
  PARTIALLY_PAID   PAID             Pembayaran tambahan memenuhi sisa tagihan.
  PAID             REFUNDED         Pengembalian dana telah dicatat sesuai proses.

Ketentuan:

- Status dihitung berdasarkan catatan pembayaran yang sah.
- Pembayaran yang gagal atau dibatalkan tidak dihitung sebagai
    pembayaran diterima.
- Refund harus memiliki nominal, waktu, alasan, dan aktor.
- Refund MVP adalah refund penuh satu order. Semua payment `RECORDED`
    berubah menjadi `REFUNDED` dan status pembayaran order menjadi
    `REFUNDED`. Refund sebagian tidak termasuk MVP.

## 8.3 Status meja

Status meja operasional dapat menggunakan:

- `AVAILABLE`
- `OCCUPIED`
- `INACTIVE`

Status meja tidak boleh menjadi sumber kebenaran pembayaran atau status
pesanan. Aturan perubahan status meja harus memperhitungkan pesanan
dine-in yang masih aktif.

------------------------------------------------------------------------

# 9. Model Data Konseptual

Bagian ini mendefinisikan entitas inti. Nama tabel final dapat mengikuti
konvensi Drizzle yang dipilih, tetapi relasi dan integritas datanya
harus dipertahankan.

## 9.1 Entitas utama

### Business

Menyimpan identitas bisnis.

Atribut konseptual: - id - name - business_code - address - phone -
created_at - updated_at

### User

Menyimpan akun pengguna internal.

Atribut konseptual: - id - business_id - role_id - name - email -
username - password_hash - is_active - created_at - updated_at

### Role

Menyimpan role.

Atribut konseptual: - id - business_id atau penanda role sistem - name -
code - description - is_system - created_at - updated_at

### Permission

Menyimpan permission.

Atribut konseptual: - id - code - name - description

### RolePermission

Menghubungkan role dengan permission.

Atribut konseptual: - role_id - permission_id

### Category

Atribut konseptual: - id - business_id - name - description -
sort_order - is_active - created_at - updated_at

### Product

Atribut konseptual: - id - business_id - category_id - name -
description - image_path atau image_key - base_price - is_available -
is_active - created_at - updated_at

### ProductVariant

Atribut konseptual: - id - product_id - name - price_adjustment -
is_active

### AddOn

Atribut konseptual: - id - business_id - name - price - is_active

### ProductAddOn

Menghubungkan produk dengan add-on yang dapat dipilih.

Atribut konseptual: - product_id - add_on_id - is_required -
minimum_selection - maximum_selection

### DiningTable

Atribut konseptual: - id - name - status - qr_token_hash atau referensi
token aman - is_active - created_at - updated_at

### Order

Atribut konseptual: - id - business_id - order_number -
order_type - source - table_id nullable - order_status -
payment_status - subtotal - discount_total - grand_total - notes -
created_by nullable untuk pesanan publik - idempotency_key nullable -
created_at - updated_at - completed_at nullable - cancelled_at nullable

### OrderItem

Atribut konseptual: - id - order_id - product_id nullable atau referensi
historis - product_name_snapshot - variant_name_snapshot nullable -
quantity - unit_price_snapshot - add_on_total_snapshot - line_total -
notes

### OrderItemAddOn

Atribut konseptual: - id - order_item_id - add_on_id nullable -
add_on_name_snapshot - price_snapshot - quantity

### Payment

Atribut konseptual: - id - order_id - method - amount - status -
reference nullable - notes nullable - recorded_by - paid_at - created_at

### Refund

Refund MVP hanya penuh per order dan hanya untuk order `PAID`. Catat
sebagai entitas terpisah agar audit dan nominal pengembalian jelas.

Atribut konseptual: - id - order_id - amount - reason - recorded_by -
created_at

### OrderStatusHistory

Atribut konseptual: - id - order_id - previous_status - new_status -
changed_by nullable - reason nullable - created_at

### AuditLog

Atribut konseptual: - id - business_id - actor_user_id nullable -
action - resource_type - resource_id - metadata yang aman - created_at

### BackupRecord

Atribut konseptual: - id - file_name - file_path - file_size -
checksum - status - created_by - created_at

## 9.2 Ketentuan integritas data

- Semua relasi harus menggunakan foreign key yang sesuai.
- Tabel operasional harus memiliki konteks bisnis yang relevan.
- Harga disimpan sebagai integer satuan mata uang terkecil yang
    digunakan, misalnya rupiah tanpa pecahan, bukan floating point.
- Waktu disimpan dalam format konsisten, disarankan UTC pada
    penyimpanan dan dikonversi ke zona waktu bisnis pada tampilan.
- Nomor pesanan harus memiliki aturan keunikan yang jelas.
- Item transaksi harus memiliki snapshot.
- Penghapusan data yang telah direferensikan transaksi harus dicegah
    atau menggunakan penonaktifan/soft delete sesuai kebutuhan.
- Perubahan penting harus tercatat.
- Perhitungan total harus menggunakan aturan pembulatan yang
    konsisten.
- Transaksi database harus digunakan ketika beberapa tabel harus
    berubah sebagai satu kesatuan.

------------------------------------------------------------------------

# 10. Arsitektur dan Teknologi

## 10.1 Keputusan teknologi

  -----------------------------------------------------------------------
  Area                    Teknologi               Penggunaan
  ----------------------- ----------------------- -----------------------
  Kerangka kerja          Next.js App Router      Antarmuka dan API dalam
                                                  satu aplikasi.

  Bahasa                  TypeScript              Mode strict.

  Runtime                 Node.js LTS             Menjalankan server
                                                  lokal.

  Gaya antarmuka          Tailwind CSS v4         Styling.

  Komponen UI             Sistem komponen khusus  Komponen sesuai
                                                  kebutuhan aplikasi POS.

  Basis data              SQLite                  Penyimpanan lokal.

  ORM                     Drizzle ORM             Skema, query, dan
                                                  migrasi.

  Driver SQLite           `node:sqlite`           Akses basis data
                                                  melalui Node.js.

  Validasi                Zod                     Validasi input dan
                                                  bentuk data.

  State antarmuka         Zustand                 State UI lokal yang
                                                  memang diperlukan.

  Data server             TanStack Query          Pengambilan, cache, dan
                                                  sinkronisasi data API.

  Formulir                React Hook Form         Pengelolaan formulir.

  Real-time               Server-Sent Events      Pembaruan antrean dari
                                                  server ke client.

  Pengujian unit          Vitest                  Unit dan integration
                                                  test.

  Pengujian alur          Playwright              End-to-end test.

  Pengelola paket         pnpm                    Dependency management.

  PWA                     Manifest dan Service    Peningkatan pengalaman
                          Worker                  setelah core stabil.

Deployment              Node.js self-hosted     Berjalan pada komputer
                                                  bisnis
  -----------------------------------------------------------------------

## 10.2 Arsitektur aplikasi

Gunakan pola **Modular Monolith** dengan batas domain yang jelas.

Lapisan yang direkomendasikan:

1. **Presentation**
    - Halaman Next.js.
    - Komponen antarmuka.
    - Route Handler.
2. **Application**
    - Use case.
    - Application service.
    - Pengaturan transaksi dan orkestrasi proses.
3. **Domain**
    - Entitas dan aturan bisnis.
    - Value object jika diperlukan.
    - Aturan transisi status.
    - Validasi invariant bisnis.
4. **Infrastructure**
    - Repository Drizzle.
    - Koneksi SQLite.
    - Penyimpanan berkas.
    - SSE.
    - Backup.
    - Implementasi lisensi.

Ketentuan:

- Route Handler harus tipis.
- Komponen UI tidak boleh berisi aturan bisnis kritis.
- Query database tidak boleh tersebar di komponen.
- Domain tidak boleh bergantung pada detail HTTP.
- Validasi otorisasi dilakukan pada batas server dan use case.
- Modul berkomunikasi melalui kontrak yang jelas.
- Hindari abstraksi berlebihan yang belum dibutuhkan.

## 10.3 Modul domain

- `auth`
- `users`
- `roles`
- `permissions`
- `businesses`
- `categories`
- `products`
- `tables`
- `orders`
- `payments`
- `kds`
- `reporting`
- `backup`

## 10.4 Rancangan struktur direktori awal

``` text
ravika-pos/
├── drizzle/
│   └── migrations/
├── public/
│   ├── icons/
│   └── images/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── (cashier)/
│   │   ├── (customer)/
│   │   ├── (kds)/
│   │   └── api/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── roles/
│   │   ├── permissions/
│   │   ├── businesses/
│   │   ├── categories/
│   │   ├── products/
│   │   ├── tables/
│   │   ├── orders/
│   │   ├── payments/
│   │   ├── kds/
│   │   ├── reporting/
│   │   └── backup/
│   ├── infrastructure/
│   │   ├── database/
│   │   ├── events/
│   │   ├── storage/
│   │   └── backup/
│   ├── components/
│   └── shared/
│       ├── errors/
│       ├── validation/
│       ├── utilities/
│       └── constants/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
├── drizzle.config.ts
├── next.config.ts
├── package.json
└── pnpm-workspace.yaml
```

Struktur ini merupakan baseline. Tidak wajib membuat workspace monorepo
atau Turborepo untuk satu aplikasi pada MVP.

## 10.5 API

API menggunakan Next.js Route Handlers pada runtime Node.js.

Contoh kelompok endpoint:

``` text
/api/auth/*
/api/users/*
/api/roles/*
/api/permissions/*
/api/business/*
/api/categories/*
/api/products/*
/api/tables/*
/api/orders/*
/api/payments/*
/api/kds/*
/api/reports/*
/api/backup/*
/api/events/*
```

Ketentuan API:

- Validasi request menggunakan Zod.
- Respons error konsisten memakai RFC 9457 `application/problem+json`.
- Otorisasi dilakukan pada server.
- Request mutasi harus menangani pengiriman ulang.
- Endpoint publik dan internal harus dipisahkan secara jelas.
- Data sensitif tidak boleh dikirim ke client jika tidak dibutuhkan.
- Jangan mempercayai nilai total atau harga dari browser.
- Gunakan transaksi database untuk operasi yang memerlukan
    konsistensi.

## 10.6 Real-time

Gunakan SSE untuk pengiriman peristiwa dari server ke client.

Contoh peristiwa:

- `order.created`
- `order.status_changed`
- `payment.status_changed`

Ketentuan:

- Perubahan status tetap menggunakan HTTP request.
- SSE hanya untuk pemberitahuan perubahan dari server.
- Client harus melakukan reconnect ketika koneksi terputus.
- Setelah reconnect, client harus mengambil ulang data aktif.
- Jangan menganggap event sebagai satu-satunya sumber kebenaran.
- Data basis data tetap menjadi sumber kebenaran.
- Implementasi streaming harus diuji pada server Node.js lokal.
- Jika SSE tidak memadai, evaluasi Socket.IO atau server event
    terpisah sebelum mengubah arsitektur besar.

## 10.7 SQLite

Konfigurasi dan praktik wajib:

- Basis data berada pada disk lokal komputer server.
- Gunakan `node:sqlite` melalui adapter Drizzle `sqlite-proxy`.
- Aktifkan foreign key.
- Gunakan WAL mode setelah pengujian kesesuaian.
- Atur busy timeout.
- Gunakan transaksi singkat.
- Hindari operasi tulis yang tidak perlu.
- Jangan menempatkan berkas SQLite pada network share.
- Jangan membuka berkas SQLite langsung dari perangkat klien.
- Gunakan mekanisme backup SQLite yang aman terhadap WAL.
- Uji restore secara berkala.

SQLite memiliki pola penulisan yang terbatas dibandingkan basis data
server multi-penulis. Aplikasi harus menjaga transaksi singkat dan
menangani kondisi database sibuk dengan baik.

## 10.8 Deployment

- Jalankan aplikasi sebagai proses Node.js persisten.
- Jangan gunakan ekspor statis Next.js karena aplikasi membutuhkan API
    dinamis dan koneksi lokal.
- Aplikasi harus dapat berjalan setelah komputer server dinyalakan
    kembali.
- Sediakan prosedur instalasi, pembaruan, backup, dan pemulihan.
- Integrasi Electron bukan kebutuhan MVP.
- Docker bukan syarat wajib deployment MVP.

------------------------------------------------------------------------

# 11. Kebutuhan Nonfungsional

## 11.1 Keamanan

- **NFR-SEC-001** --- Kata sandi wajib disimpan dalam bentuk hash yang
    kuat.
- **NFR-SEC-002** --- Sesi harus dikelola dengan aman.
- **NFR-SEC-003** --- Cookie sesi, bila digunakan, harus memakai
    atribut keamanan yang sesuai.
- **NFR-SEC-004** --- Endpoint internal wajib memeriksa autentikasi
    dan permission.
- **NFR-SEC-005** --- Endpoint publik harus membatasi akses hanya pada
    kebutuhan pemesanan.
- **NFR-SEC-006** --- Input harus divalidasi di server.
- **NFR-SEC-007** --- Query database harus menggunakan mekanisme
    parameterisasi ORM.
- **NFR-SEC-008** --- Token QR harus acak dan sulit ditebak.
- **NFR-SEC-009** --- Rahasia kriptografi dan private key tidak boleh
    dikirim ke client.
- **NFR-SEC-010** --- Pesan error tidak boleh membocorkan kredensial,
    token, atau detail internal.
- **NFR-SEC-011** --- Aplikasi harus membatasi akses jaringan sesuai
    kebutuhan LAN.
- **NFR-SEC-012** --- Komputer server sebaiknya menggunakan firewall
    dan akun sistem operasi dengan hak minimum.
- **NFR-SEC-013** --- Penggunaan HTTP pada LAN memiliki risiko
    penyadapan. HTTPS lokal direkomendasikan, terutama untuk kredensial
    dan penggunaan Service Worker.
- **NFR-SEC-014** --- Perubahan harga, pembayaran, pembatalan, dan
    permission harus dapat diaudit.

## 11.2 Kinerja

- **NFR-PERF-001** --- Halaman operasional utama harus terasa
    responsif pada perangkat yang sesuai dengan spesifikasi minimum yang
    ditentukan saat pengujian.
- **NFR-PERF-002** --- Query daftar pesanan harus menggunakan filter
    dan indeks yang sesuai.
- **NFR-PERF-003** --- Koneksi SSE tidak boleh membuat query database
    terus-menerus tanpa kebutuhan.
- **NFR-PERF-004** --- Operasi tulis database harus singkat.
- **NFR-PERF-005** --- Gambar produk harus dioptimalkan untuk jaringan
    lokal.
- **NFR-PERF-006** --- Antrean KDS harus dapat dimuat ulang tanpa
    mengambil seluruh riwayat transaksi.
- **NFR-PERF-007** --- Pengujian beban dasar harus dilakukan dengan
    skenario jumlah perangkat yang realistis untuk pilot.

Target angka waktu respons dan kapasitas perangkat harus ditentukan
melalui pengujian pada komputer target. Jangan mengklaim kapasitas
maksimum tanpa hasil uji.

## 11.3 Keandalan dan pemulihan

- **NFR-REL-001** --- Kesalahan request tidak boleh membuat transaksi
    tersimpan sebagian.
- **NFR-REL-002** --- Operasi multi-tabel yang kritis harus
    menggunakan transaksi database.
- **NFR-REL-003** --- Aplikasi harus menangani database sibuk dengan
    pesan dan retry yang terkontrol.
- **NFR-REL-004** --- Client harus dapat memulihkan tampilan setelah
    koneksi LAN terputus.
- **NFR-REL-005** --- KDS harus mengambil ulang data setelah
    reconnect.
- **NFR-REL-006** --- Proses backup dan restore harus diuji.
- **NFR-REL-007** --- Disarankan menggunakan UPS untuk komputer
    server.
- **NFR-REL-008** --- Aplikasi harus memberikan pesan yang jelas
    ketika server tidak dapat dijangkau.

## 11.4 Kemudahan penggunaan

- **NFR-UX-001** --- Antarmuka menggunakan bahasa Indonesia.
- **NFR-UX-002** --- Alur kasir harus meminimalkan langkah yang tidak
    diperlukan.
- **NFR-UX-003** --- Status pesanan dan pembayaran harus dibedakan
    secara visual dan tekstual.
- **NFR-UX-004** --- Formulir harus menampilkan validasi yang dapat
    dipahami.
- **NFR-UX-005** --- Tindakan destruktif harus meminta konfirmasi.
- **NFR-UX-006** --- UI harus responsif untuk komputer, tablet, dan
    ponsel.
- **NFR-UX-007** --- KDS harus mudah dibaca dalam penggunaan
    operasional.
- **NFR-UX-008** --- Indikator koneksi harus terlihat ketika client
    kehilangan akses server.
- **NFR-UX-009** --- Tombol dan kontrol harus memiliki label atau
    petunjuk yang jelas.
- **NFR-UX-010** --- Warna bukan satu-satunya pembeda status.

## 11.5 Pemeliharaan

- **NFR-MNT-001** --- Kode menggunakan TypeScript strict.
- **NFR-MNT-002** --- Modul domain memiliki batas tanggung jawab yang
    jelas.
- **NFR-MNT-003** --- Perubahan skema basis data menggunakan
    migration.
- **NFR-MNT-004** --- Aturan bisnis kritis memiliki pengujian.
- **NFR-MNT-005** --- Konfigurasi lingkungan didokumentasikan.
- **NFR-MNT-006** --- Error penting dicatat tanpa menyimpan rahasia.
- **NFR-MNT-007** --- Proses instalasi dan pembaruan harus
    terdokumentasi.
- **NFR-MNT-008** --- Dependency harus dipilih berdasarkan
    kompatibilitas dengan Node.js LTS dan lingkungan target.

## 11.6 Privasi

- **NFR-PRV-001** --- Sistem hanya mengumpulkan data pelanggan yang
    diperlukan untuk operasional.
- **NFR-PRV-002** --- Halaman publik tidak menampilkan data transaksi
    pelanggan lain.
- **NFR-PRV-003** --- Log tidak boleh menyimpan kata sandi, token
    sesi, atau rahasia.
- **NFR-PRV-004** --- Data bisnis disimpan pada infrastruktur milik
    pelanggan.
- **NFR-PRV-005** --- Prosedur backup harus menjelaskan bahwa salinan
    backup mengandung data bisnis dan harus dilindungi.

------------------------------------------------------------------------

# 12. Antarmuka dan Navigasi

## 12.1 Area aplikasi

Rute berikut merupakan rancangan awal dan dapat disempurnakan.

  Area             Rute awal                Pengguna
  ---------------- ------------------------ -------------------------------------
  Autentikasi      `/login`                 Pengguna internal
  Dashboard        `/app`                   Pemilik
  Produk           `/app/products`          Pemilik, sesuai permission
  Kategori         `/app/categories`        Pemilik
  Meja             `/app/tables`            Pemilik dan kasir sesuai permission
  Pesanan          `/app/orders`            Pemilik dan kasir
  POS              `/app/pos`               Kasir dan pemilik sesuai permission
  Pembayaran       `/app/payments`          Pemilik dan kasir
  Pengguna         `/app/users`             Pemilik
  Role             `/app/roles`             Pemilik
  Laporan          `/app/reports`           Pemilik
  Pengaturan       `/app/settings`          Pemilik
  KDS              `/kds`                   Barista
  Menu pelanggan   `/menu/[token]`          Pelanggan
  Status pesanan   `/order/[publicToken]`   Pelanggan

## 12.2 Prinsip UI

- Dashboard dan halaman internal menggunakan sistem navigasi yang
    konsisten.
- POS mengutamakan kecepatan pemilihan produk dan visibilitas
    keranjang.
- KDS menggunakan tampilan antrean yang jelas dan mudah dipindai.
- Menu pelanggan mengutamakan keterbacaan pada layar ponsel.
- Formulir memiliki label, validasi, status loading, dan pesan hasil.
- Daftar data memiliki kondisi loading, kosong, gagal, dan berhasil.
- Tidak boleh ada tombol utama yang tidak memiliki fungsi.
- Data sensitif hanya ditampilkan sesuai permission.

## 12.3 Status antarmuka yang wajib dirancang

Setiap halaman data setidaknya mempertimbangkan:

- Memuat.
- Berhasil.
- Kosong.
- Gagal.
- Tidak memiliki akses.
- Koneksi ke server terputus.
- Data berubah dan perlu dimuat ulang.
- Tindakan sedang diproses.

------------------------------------------------------------------------

# 13. Rancangan API Konseptual

Endpoint berikut adalah baseline, bukan kontrak final OpenAPI.

## 13.1 Autentikasi

``` text
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/change-password
```

## 13.2 Pengguna dan akses

``` text
GET    /api/users
POST   /api/users
GET    /api/users/:id
PATCH  /api/users/:id
GET    /api/roles
POST   /api/roles
PATCH  /api/roles/:id
GET    /api/permissions
PUT    /api/roles/:id/permissions
```

## 13.3 Bisnis

``` text
GET    /api/business
PATCH  /api/business
```

## 13.4 Katalog

``` text
GET    /api/categories
POST   /api/categories
PATCH  /api/categories/:id
GET    /api/products
POST   /api/products
GET    /api/products/:id
PATCH  /api/products/:id
```

## 13.5 Meja dan QR

``` text
GET    /api/tables
POST   /api/tables
PATCH  /api/tables/:id
POST   /api/tables/:id/regenerate-qr
GET    /api/public/menu/:token
```

## 13.6 Pesanan

``` text
GET    /api/orders
POST   /api/orders
GET    /api/orders/:id
POST   /api/orders/:id/cancel
GET    /api/public/orders/:publicToken
POST   /api/public/orders
```

## 13.7 Pembayaran

``` text
GET    /api/orders/:id/payments
POST   /api/orders/:id/payments
POST   /api/orders/:id/refund
```

## 13.8 KDS dan peristiwa

``` text
GET    /api/kds/orders
POST   /api/kds/orders/:id/status
GET    /api/events
```

## 13.9 Laporan dan sistem

``` text
GET    /api/reports/summary
GET    /api/reports/sales
GET    /api/reports/top-products
GET    /api/licensing/status
POST   /api/backup
GET    /api/backup
POST   /api/backup/restore
```

Ketentuan:

- Bentuk request dan response harus didokumentasikan.
- Semua endpoint mutasi harus memiliki validasi dan otorisasi.
- Endpoint publik menggunakan token akses terbatas dan tidak membuka
    ID internal secara berlebihan.
- Endpoint restore harus memiliki proteksi tambahan dan konfirmasi.
- Jangan mengimplementasikan endpoint yang tidak memiliki kebutuhan
    produk.

------------------------------------------------------------------------

# 14. Pengujian dan Kriteria Mutu

## 14.1 Unit test

Minimal menguji:

- Perhitungan harga produk.
- Perhitungan varian dan add-on.
- Perhitungan subtotal dan total.
- Perhitungan split payment.
- Perhitungan sisa tagihan.
- Transisi status pesanan.
- Transisi status pembayaran.
- Validasi tipe pesanan dan meja.
- Pemeriksaan permission.
- Validasi token QR.
- Validasi lisensi.

## 14.2 Integration test

Minimal menguji:

- Pembuatan pesanan dan item dalam satu transaksi.
- Pembuatan pesanan QR.
- Pencatatan pembayaran.
- Pembayaran bertahap.
- Pembatalan pesanan.
- Pembaruan status KDS.
- Pembatasan akses berdasarkan bisnis.
- Backup dan restore basis data.
- Penolakan request tanpa permission.

## 14.3 End-to-end test

Skenario minimum:

1. Pemilik login.
2. Pemilik membuat kategori dan produk.
3. Pemilik membuat meja dan QR.
4. Kasir login.
5. Kasir membuat pesanan dine-in.
6. Pesanan muncul pada KDS.
7. Barista memproses hingga READY.
8. Kasir mencatat pembayaran.
9. Barista menyelesaikan pesanan.
10. Pemilik melihat transaksi pada laporan.
11. Pelanggan membuat pesanan melalui QR tanpa login.
12. Sistem menolak token QR tidak valid.
13. Sistem menolak akses pengguna tanpa permission.
14. Koneksi client terputus lalu pulih dan data aktif dimuat ulang.
15. Backup dibuat dan dipulihkan pada lingkungan pengujian.

## 14.4 Syarat mutu rilis

MVP tidak boleh dinyatakan siap pilot jika:

- Alur pesanan utama gagal.
- Total transaksi dapat dimanipulasi dari client.
- Pembayaran dapat tercatat ganda akibat request ulang yang tidak
    terkendali.
- Hak akses hanya diterapkan pada frontend.
- Pesanan QR dapat mengakses data internal.
- KDS tidak dapat memulihkan antrean setelah reconnect.
- Backup tidak dapat dipulihkan.
- Migration gagal pada instalasi baru.
- Terdapat bug kritis yang menyebabkan kehilangan atau korupsi data
    transaksi.

------------------------------------------------------------------------

# 15. Tahapan Pengembangan

Tahapan berikut adalah urutan implementasi yang direkomendasikan.
Pembagian fase tidak mengubah ruang lingkup produk yang telah disetujui.

## Fase 0 --- Fondasi proyek

- Inisialisasi Next.js dan TypeScript strict.
- Konfigurasi pnpm.
- Konfigurasi Tailwind CSS v4.
- Penetapan sistem komponen dasar.
- Konfigurasi Drizzle dan SQLite.
- Koneksi database.
- Migration awal.
- Struktur modul.
- Konfigurasi lint, format, dan test.
- Dokumentasi cara menjalankan proyek.

**Hasil:** proyek dapat dijalankan dan memiliki fondasi teknis yang
teruji.

## Fase 1 --- Autentikasi dan RBAC

- Setup akun pemilik pertama.
- Login dan logout.
- Sesi.
- Pengguna.
- Role.
- Permission.
- Middleware atau mekanisme proteksi halaman.
- Otorisasi pada use case dan endpoint.
- Seeder role dan permission awal.

**Hasil:** akses internal berjalan berdasarkan permission.

## Fase 2 --- Bisnis dan katalog

- Profil bisnis.
- Kategori.
- Produk.
- Varian.
- Add-on.
- Ketersediaan produk.
- Pengelolaan meja.
- QR Code meja.

**Hasil:** katalog dan konteks operasional tersedia.

## Fase 3 --- Order dan POS

- Model pesanan.
- Item snapshot.
- Perhitungan harga server.
- Nomor pesanan.
- POS kasir.
- Dine-in.
- Takeaway.
- Riwayat dan detail pesanan.
- Pembatalan.
- Idempotensi pembuatan pesanan.

**Hasil:** kasir dapat membuat dan mengelola pesanan.

## Fase 4 --- Pembayaran

- Metode pembayaran.
- Pencatatan pembayaran.
- Pembayaran sebagian.
- Split payment.
- Status pembayaran.
- Riwayat pembayaran.
- Audit pembayaran.

**Hasil:** transaksi dapat dicatat dan dilunasi dengan satu atau
beberapa metode.

## Fase 5 --- QR ordering

- Menu publik.
- Validasi token QR.
- Keranjang.
- Pengiriman pesanan.
- Mode dine-in dan takeaway.
- Halaman status pesanan.
- Proteksi endpoint publik.

**Hasil:** pelanggan dapat memesan tanpa login melalui jaringan lokal.

## Fase 6 --- KDS dan real-time

- Antrean KDS.
- Transisi status.
- SSE.
- Reconnect.
- Refetch antrean.
- Tampilan pesanan READY.
- Audit perubahan status.

**Hasil:** barista dapat memproses pesanan dari satu antrean.

## Fase 7 --- Dashboard dan laporan

- Ringkasan penjualan.
- Jumlah transaksi.
- Status pesanan.
- Produk terlaris.
- Filter tanggal.

**Hasil:** pemilik dapat memantau operasional dasar.

## Fase 8 --- Lisensi, backup, dan kesiapan instalasi

- Validasi lisensi lokal.
- Backup.
- Restore.
- Prosedur instalasi.
- Prosedur pembaruan.
- Konfigurasi server lokal.
- Firewall dan akses LAN.
- Pengujian tanpa internet.
- Pengujian pemulihan.

**Hasil:** aplikasi dapat dipasang dan digunakan pada lingkungan bisnis.

## Fase 9 --- Uji pilot dan penyempurnaan

- Uji pada lingkungan kafe.
- Uji kasir dan barista.
- Uji QR dari ponsel pelanggan.
- Uji kondisi Wi-Fi tidak stabil.
- Uji restart komputer server.
- Uji backup dan restore.
- Perbaikan bug.
- Penyempurnaan alur berdasarkan observasi.

**Hasil:** MVP siap digunakan secara operasional pada pilot.

## Fase setelah MVP

- PWA dan strategi HTTPS lokal.
- Persediaan bahan baku.
- Resep.
- Supplier.
- Loyalty.
- Integrasi payment gateway.
- Printer dan perangkat keras kasir.
- Analitik lanjutan.
- Aplikasi desktop pembungkus jika diperlukan.

------------------------------------------------------------------------

# 16. Risiko dan Mitigasi

  -----------------------------------------------------------------------
  Risiko                  Dampak                  Mitigasi
  ----------------------- ----------------------- -----------------------
  Komputer server mati    Semua perangkat         UPS, prosedur restart,
                          kehilangan akses        backup berkala.

  Jaringan Wi-Fi terputus Client tidak dapat      Indikator koneksi,
                          menjangkau server       reconnect, refetch.

  Database terkunci       Transaksi gagal atau    WAL, transaksi singkat,
                          tertunda                busy timeout, retry
                                                  terkontrol.

  Database rusak          Kehilangan data         Backup teruji dan
                                                  salinan terpisah.

  QR disalahgunakan       Pesanan tidak sah       Token acak, rotasi
                                                  token, validasi server,
                                                  pembatasan request.

  Harga dimanipulasi      Kerugian finansial      Perhitungan ulang
  client                                          seluruh harga di
                                                  server.

  Akses tidak sah         Kebocoran atau          RBAC backend, sesi
                          perubahan data          aman, firewall.

  Event SSE terlewat      Antrean tidak mutakhir  Reconnect dan refetch
                                                  dari database.

  Pembayaran tercatat     Data keuangan tidak     Idempotensi dan
  ganda                   akurat                  constraint transaksi.

  Instalasi rumit         Beban dukungan tinggi   Installer/prosedur
                                                  sederhana, dokumentasi,
                                                  uji instalasi bersih.

PWA tidak berjalan di   Fitur instalasi/cache   Tunda Service Worker
  HTTP LAN                terbatas                sampai strategi HTTPS
                                                  lokal tersedia
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 17. Keputusan yang Masih Perlu Ditetapkan Sebelum Implementasi Terkait

Bagian ini tidak membatalkan keputusan produk utama. Bagian ini mencatat
detail operasional yang belum dikunci agar AI agent tidak membuat asumsi
diam-diam.

  -----------------------------------------------------------------------
  ID                      Keputusan               Rekomendasi awal
  ----------------------- ----------------------- -----------------------
  OPEN-001                Sistem operasi komputer Tentukan berdasarkan
                          server                  perangkat pilot; jangan
                                                  mengunci Windows atau
                                                  Linux tanpa konfirmasi.

  OPEN-002                Identitas login         Selesai: login menerima
                                                  email atau username.

  OPEN-003                Zona waktu              Gunakan `Asia/Jakarta`
                                                  untuk pilot di wilayah
                                                  WIB, dengan penyimpanan
                                                  waktu yang konsisten.

  OPEN-004                Nomor pesanan           Gunakan nomor yang
                                                  mudah dibaca dan unik
                                                  per periode sesuai
                                                  kebijakan.

  OPEN-005                Diskon                  MVP hanya mendukung
                                                  diskon sederhana jika
                                                  kebutuhan pilot
                                                  mengharuskannya; aturan
                                                  nominal/persentase
                                                  perlu dikunci.

  OPEN-006                Pajak dan biaya layanan Belum termasuk sampai
                                                  aturan bisnis pilot
                                                  dikonfirmasi.

  OPEN-007                Uang kembalian          Diputuskan Fase 6:
                                                  nominal tunai tidak
                                                  melebihi tagihan; amount
                                                  adalah nilai diterapkan.

  OPEN-008                Refund                  Diputuskan Fase 6:
                                                  refund penuh per order,
                                                  hanya untuk order PAID.

  OPEN-009                Identitas takeaway QR   Tentukan apakah menu
                                                  takeaway menggunakan QR
                                                  umum atau tautan publik
                                                  yang dapat dibagikan.

  OPEN-010                Informasi pelanggan     Kumpulkan hanya data
                          takeaway                yang benar-benar
                                                  dibutuhkan untuk
                                                  penyerahan pesanan.

  OPEN-011                Pembatalan setelah      Tetapkan siapa yang
                          persiapan dimulai       berwenang dan apakah
                                                  perlu persetujuan
                                                  pemilik.

  OPEN-012                HTTPS LAN               Cookie session Secure
                                                  dikontrol environment.
                                                  HTTPS tetap risiko pilot
                                                  sebelum Service Worker
                                                  dan PWA diaktifkan.

  OPEN-013                Penyimpanan gambar      Diputuskan: BLOB SQLite,
                                                  JPEG/PNG/WebP, maks 5 MB,
                                                  client resize 1600px WebP.

  OPEN-014                Cetak struk             Tidak termasuk MVP;
                                                  evaluasi setelah
                                                  kebutuhan pilot
                                                  dikonfirmasi.

OPEN-015                Spesifikasi minimum     Tentukan melalui
                          server                  pengujian aplikasi pada
                                                  komputer target
  -----------------------------------------------------------------------

AI agent wajib membaca bagian ini dan tidak menganggap rekomendasi
sebagai keputusan final. Jika keputusan diperlukan untuk melanjutkan
implementasi, ajukan pertanyaan yang spesifik kepada pemilik produk.

------------------------------------------------------------------------

# 18. Definisi Selesai MVP

MVP dinyatakan selesai apabila seluruh kondisi berikut terpenuhi:

- [ ] Aplikasi dapat diinstal dan dijalankan pada komputer server
    lokal.
- [ ] Aplikasi dapat diakses oleh perangkat lain melalui LAN.
- [ ] Aplikasi dapat digunakan untuk operasional lokal tanpa internet.
- [ ] Akun OWNER dapat dibuat pada instalasi pertama.
- [ ] Login, logout, sesi, dan RBAC berfungsi.
- [ ] OWNER, CASHIER, dan BARISTA memiliki akses sesuai permission.
- [ ] Bisnis dapat dikelola.
- [ ] Kategori, produk, varian, dan add-on dapat dikelola.
- [ ] Meja dan QR Code dapat dikelola.
- [ ] Kasir dapat membuat pesanan dine-in dan takeaway.
- [ ] Pelanggan dapat membuat pesanan melalui QR tanpa akun.
- [ ] Pesanan kasir dan QR menggunakan alur pesanan yang sama.
- [ ] Harga dan total selalu dihitung oleh server.
- [ ] Snapshot item transaksi tersimpan.
- [ ] Pembayaran tunai dan digital dapat dicatat.
- [ ] Split payment berfungsi.
- [ ] Status pembayaran terpisah dari status pesanan.
- [ ] Barista dapat memproses pesanan melalui KDS.
- [ ] KDS menerima pembaruan real-time dan pulih setelah reconnect.
- [ ] Dashboard dan laporan dasar berfungsi.
- [ ] Lisensi dapat divalidasi secara lokal.
- [ ] Backup dan restore telah diuji.
- [ ] Pengujian unit, integrasi, dan alur utama lulus.
- [ ] Tidak ada bug kritis yang menyebabkan kehilangan atau korupsi
    data.
- [ ] Dokumentasi instalasi, penggunaan, backup, dan pemulihan
    tersedia.

------------------------------------------------------------------------

# 19. Instruksi untuk AI Agent dan Pengembang

Bagian ini wajib dibaca sebelum melakukan perubahan kode.

## 19.1 Sumber kebenaran

- Dokumen ini adalah sumber kebutuhan produk MVP.
- Jangan mengubah keputusan produk secara sepihak.
- Jangan menganggap fitur di luar MVP sebagai kebutuhan tersirat.
- Jika terdapat kebutuhan yang bertentangan, berhenti dan minta
    klarifikasi.
- Catat perubahan keputusan pada dokumen keputusan arsitektur atau
    catatan perubahan yang disepakati.

## 19.2 Cara mengimplementasikan kebutuhan

1. Identifikasi ID kebutuhan yang sedang dikerjakan.
2. Baca aturan bisnis terkait.
3. Periksa model data dan batas modul terkait.
4. Tentukan validasi dan otorisasi server.
5. Implementasikan logika domain dan use case.
6. Implementasikan API.
7. Implementasikan antarmuka.
8. Tambahkan pengujian.
9. Verifikasi kriteria penerimaan.
10. Perbarui dokumentasi jika kontrak atau keputusan berubah.

## 19.3 Larangan asumsi

AI agent dan pengembang tidak boleh:

- Menghitung total transaksi hanya di browser.
- Menyimpan kata sandi sebagai teks biasa.
- Mengandalkan proteksi menu frontend sebagai RBAC.
- Membuat jalur pesanan QR terpisah dari domain pesanan utama.
- Menyatukan status pembayaran dan status persiapan.
- Mengubah transaksi historis ketika produk berubah.
- Mengakses SQLite langsung dari perangkat klien.
- Menggunakan network share sebagai lokasi berkas SQLite aktif.
- Menganggap PWA otomatis membuat transaksi tetap berjalan ketika
    client kehilangan koneksi.
- Menganggap internet diperlukan untuk transaksi lokal.
- Menambahkan layanan cloud wajib.
- Menambahkan multi-tenant SaaS.
- Menambahkan website builder atau landing page bisnis.
- Menambahkan modul inventaris bahan baku sebelum fase yang disetujui.
- Mengganti teknologi inti tanpa alasan teknis dan persetujuan.
- Mengklaim fitur selesai tanpa pengujian yang relevan.

## 19.4 Standar kualitas perubahan

Setiap perubahan harus:

- Memiliki tujuan yang jelas.
- Mengikuti batas domain.
- Memiliki validasi server.
- Memiliki otorisasi yang sesuai.
- Memiliki penanganan error.
- Memiliki pengujian yang relevan.
- Tidak merusak migration atau data historis.
- Tidak memperluas ruang lingkup tanpa persetujuan.
- Memperbarui dokumentasi jika perilaku produk berubah.

------------------------------------------------------------------------

# 20. Ringkasan Keputusan Final

  Area                      Keputusan
  ------------------------- -------------------------------------
  Nama produk               RAVIKA POS
  Pengembang                RumahKodingku
  Karakter brand            Modern dan profesional
  Target awal               Kafe dan UMKM
  Model penjualan           Pembelian satu kali
  Model deployment          Self-hosted lokal
  Ketergantungan internet   Tidak wajib untuk operasional lokal
  Arsitektur                Modular Monolith
  Framework                 Next.js App Router
  Bahasa                    TypeScript strict
  Runtime                   Node.js LTS
  Basis data                SQLite
  ORM                       Drizzle ORM
  Driver                    `node:sqlite`
  Validasi                  Zod
  State antarmuka           Zustand
  Data server               TanStack Query
  Formulir                  React Hook Form
  Real-time                 SSE
  Pengujian                 Vitest dan Playwright
  Styling                   Tailwind CSS v4
  Role MVP                  OWNER, CASHIER, BARISTA
  Autentikasi customer      Tidak wajib
  Sumber pesanan            CASHIER dan QR
  Tipe pesanan              DINE_IN dan TAKEAWAY
  Pembayaran                Tunai dan pencatatan digital manual
  Split payment             Termasuk MVP
  KDS                       Termasuk MVP
  PWA                       Enhancement setelah core stabil
  Website builder           Tidak termasuk
  Inventaris bahan baku     Tidak termasuk MVP
  Payment gateway           Tidak termasuk MVP
  Cloud wajib               Tidak ada

**Kesimpulan:** RAVIKA POS MVP adalah aplikasi POS lokal untuk bisnis
dengan alur kasir, QR ordering, pembayaran, dan KDS yang terintegrasi.
Sistem menggunakan Next.js full-stack, SQLite, dan arsitektur modular
monolith. Fokus utama pengembangan adalah keandalan transaksi, kemudahan
operasional, keamanan akses, dan kemampuan pemulihan data.
