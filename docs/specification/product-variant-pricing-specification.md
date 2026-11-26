# RAVIKA POS - Spesifikasi Product Variant Pricing

**Status:** Implemented, menunggu validasi manual Windows
**Milestone:** Catalog Pricing Consistency
**Modul:** Product Catalog, POS, Public Menu, Orders
**Tanggal:** 26 November 2026
**Baseline:** `main`
**Referensi utama:** `docs/PRD.md`, `docs/ROADMAP.md`, `docs/specification/phase-2-management-ui.md`, `docs/specification/phase-5-backend-foundation.md`, `docs/specification/phase-6-backend-api-modules.md`, `docs/specification/phase-7-frontend-backend-integration.md`, `docs/specification/phase-8-qa-release-readiness.md`, `docs/specification/phase-11-public-order-cash-declaration.md`

## Daftar isi

- [0. Agent quick start](#0-agent-quick-start)
- [1. Ringkasan](#1-ringkasan)
- [2. Goals, non-goals, dan anti-goals](#2-goals-non-goals-dan-anti-goals)
- [3. Keputusan yang dikunci](#3-keputusan-yang-dikunci)
- [4. Alur pengguna](#4-alur-pengguna)
- [5. Model data dan migration](#5-model-data-dan-migration)
- [6. Kontrak API](#6-kontrak-api)
- [7. Aturan backend](#7-aturan-backend)
- [8. Frontend management](#8-frontend-management)
- [9. Frontend POS dan public menu](#9-frontend-pos-dan-public-menu)
- [10. UI copy](#10-ui-copy)
- [11. Snapshot order dan kompatibilitas data historis](#11-snapshot-order-dan-kompatibilitas-data-historis)
- [12. Testing](#12-testing)
- [13. File map](#13-file-map)
- [14. Urutan implementasi](#14-urutan-implementasi)
- [15. Acceptance criteria](#15-acceptance-criteria)
- [16. Risiko dan mitigasi](#16-risiko-dan-mitigasi)
- [17. Definition of Done](#17-definition-of-done)
- [Appendix A: Contoh perhitungan harga](#appendix-a-contoh-perhitungan-harga)
- [Appendix B: Checklist implementasi](#appendix-b-checklist-implementasi)

## 0. Agent quick start

Baca dokumen ini dan periksa codebase terbaru sebelum mengubah kode.

Aturan wajib:

1. Jangan mengasumsikan struktur repository masih sama dengan baseline dokumen. Verifikasi file, schema, route, service, dan test pada working tree terbaru.
2. Ubah model harga varian dari **harga tambahan** (`priceAdjustment`) menjadi **harga jual penuh** (`price`).
3. Produk tanpa varian wajib memiliki `basePrice`.
4. Produk dengan varian wajib memiliki harga pada setiap varian dan tidak menggunakan `basePrice` sebagai sumber harga.
5. `basePrice` menjadi nullable di domain, validation schema, dan database.
6. Jangan menghitung harga varian dengan menjumlahkan `basePrice + variant.price`.
7. Add-on tetap merupakan biaya tambahan di atas harga produk/varian terpilih.
8. Harga akhir harus dihitung dan divalidasi di server. Jangan mempercayai harga dari browser.
9. Pertahankan snapshot harga pada order. Perubahan harga katalog tidak boleh mengubah order yang sudah dibuat.
10. Migrasikan data lama dengan rumus `newVariantPrice = oldBasePrice + oldPriceAdjustment`.
11. Jangan mengubah nominal order historis, payment, laporan, atau refund.
12. Semua jalur pembentukan order harus menggunakan satu aturan resolusi harga yang konsisten, termasuk POS dan public QR order.
13. Jangan menambahkan mode pricing baru, tier pricing, price list, atau multi-currency.
14. Jangan membuat varian otomatis seperti `Regular` atau `Normal`.
15. Pertahankan behavior add-on, stok/availability, permission, dan alur order yang sudah ada.
16. Gunakan pnpm dan dependency yang sudah tersedia. Jangan menambah dependency tanpa kebutuhan yang disetujui.
17. Jalankan `pnpm check`, `pnpm test`, `pnpm build`, dan test E2E yang tersedia.
18. Jangan menandai pekerjaan selesai jika migration belum diuji pada database lama yang berisi produk dan varian.
19. Jika menemukan data invalid atau konflik dengan PRD/spec lain, dokumentasikan dan minta keputusan product owner sebelum melakukan perubahan destruktif.

## 1. Ringkasan

Saat ini harga varian menggunakan model additive pricing:

```text
Harga produk + Tambahan harga varian + Harga add-on
```

Model ini mengharuskan produk tetap memiliki `basePrice`, sekalipun seluruh varian sebenarnya memiliki harga jual masing-masing. UI juga menggunakan label `Tambahan harga`, sehingga kurang sesuai untuk produk yang memiliki pilihan seperti ukuran, porsi, atau jenis dengan harga jual mandiri.

Spesifikasi ini mengubah model menjadi **Independent Variant Pricing**:

- Produk tanpa varian menggunakan `product.basePrice`.
- Produk dengan varian menggunakan `variant.price` sebagai harga jual penuh.
- Produk dengan varian tidak menggunakan `product.basePrice`.
- Add-on tetap ditambahkan ke harga produk atau varian terpilih.
- Semua perhitungan harga order dilakukan oleh backend.
- Data order lama tetap mempertahankan snapshot harga saat transaksi dibuat.

Contoh:

| Produk      | Varian    |    Harga |
| ----------- | --------- | -------: |
| Es Teh      | Tidak ada |  Rp5.000 |
| Nasi Goreng | Regular   | Rp15.000 |
| Nasi Goreng | Jumbo     | Rp20.000 |

Untuk Nasi Goreng Jumbo dengan add-on telur Rp5.000, harga item adalah Rp25.000.

Hasil akhir:

- Form produk menampilkan input `Harga dasar` hanya ketika produk tidak memiliki varian.
- Form varian menampilkan input `Harga`, bukan `Tambahan harga`.
- POS dan public menu menampilkan harga varian secara langsung.
- Keranjang dan order memakai harga varian terpilih, bukan penjumlahan harga dasar dan adjustment.
- Product card/list menampilkan harga yang relevan untuk produk dengan maupun tanpa varian.
- Database lama dimigrasikan tanpa mengubah harga jual efektif produk yang sudah ada.

## 2. Goals, non-goals, dan anti-goals

### Goals

- Menyederhanakan pengelolaan harga produk dan varian.
- Mendukung varian dengan harga jual mandiri.
- Menghilangkan ketergantungan `basePrice` untuk produk yang memiliki varian.
- Menyamakan perhitungan harga pada management, POS, public menu, cart, dan backend order.
- Menjaga add-on tetap berfungsi sebagai biaya tambahan.
- Mempertahankan nilai transaksi historis.
- Menyediakan migration yang aman dan dapat diverifikasi.
- Menambahkan test untuk seluruh jalur perhitungan harga.

### Non-goals

- Tidak membuat sistem harga berdasarkan jam, hari, atau periode.
- Tidak membuat harga khusus per outlet.
- Tidak membuat price list atau customer-specific pricing.
- Tidak membuat diskon, promo, pajak, service charge, atau biaya baru.
- Tidak mengubah sistem add-on selain memastikan penjumlahannya tetap benar.
- Tidak mengubah payment, refund, cash declaration, atau status order.
- Tidak mengubah struktur permission.
- Tidak melakukan redesign seluruh halaman katalog, POS, atau public menu.
- Tidak mengubah format mata uang Rupiah.
- Tidak mengubah harga order historis.

### Anti-goals

- Mempertahankan `priceAdjustment` sebagai sumber harga aktif setelah migration selesai.
- Menghitung `basePrice + variant.price` pada produk dengan varian.
- Menggunakan `basePrice` sebagai fallback tersembunyi jika varian belum dipilih.
- Mengirim harga final dari client sebagai sumber kebenaran.
- Mengubah snapshot order lama berdasarkan harga katalog saat ini.
- Mengubah nominal payment atau laporan akibat perubahan katalog.
- Membuat varian default secara otomatis.
- Mengizinkan produk dengan varian aktif tetapi tidak memiliki varian aktif yang dapat dipilih.
- Menyimpan harga dalam floating point.
- Menambahkan abstraksi pricing engine generik yang belum diperlukan.

## 3. Keputusan yang dikunci

| ID    | Area                 | Keputusan                                                                   |
| ----- | -------------------- | --------------------------------------------------------------------------- |
| VP-01 | Model harga          | Menggunakan Independent Variant Pricing                                     |
| VP-02 | Produk tanpa varian  | `basePrice` wajib dan menjadi harga jual                                    |
| VP-03 | Produk dengan varian | Setiap varian memiliki `price` sebagai harga jual penuh                     |
| VP-04 | `basePrice`          | Nullable di domain dan database                                             |
| VP-05 | `priceAdjustment`    | Diganti dengan `price`; tidak lagi digunakan setelah migration              |
| VP-06 | Add-on               | Tetap ditambahkan di atas harga produk/varian terpilih                      |
| VP-07 | Harga server         | Server menghitung ulang harga dari data katalog                             |
| VP-08 | Harga order          | Order menyimpan snapshot harga saat dibuat                                  |
| VP-09 | Produk ber-varian    | Tidak ada harga dasar/fallback untuk transaksi                              |
| VP-10 | Varian default       | Tidak dibuat otomatis                                                       |
| VP-11 | Migration            | `newPrice = oldBasePrice + oldPriceAdjustment`                              |
| VP-12 | Produk list          | Produk ber-varian menampilkan harga minimum varian aktif atau rentang harga |
| VP-13 | Nilai uang           | Tetap integer Rupiah                                                        |
| VP-14 | API                  | Request produk dan varian menggunakan field `price` sesuai model baru       |
| VP-15 | Historis             | Order, payment, refund, dan laporan yang sudah tersimpan tidak diubah       |

### 3.1 Aturan sumber harga

```ts
function resolveUnitPrice(
  product: Product,
  selectedVariant: ProductVariant | null,
): number {
  if (product.variants.length > 0) {
    if (!selectedVariant) {
      throw new Error("Varian produk wajib dipilih.");
    }

    return selectedVariant.price;
  }

  if (product.basePrice === null) {
    throw new Error("Harga produk belum dikonfigurasi.");
  }

  return product.basePrice;
}
```

Kode di atas adalah ilustrasi aturan domain, bukan instruksi untuk membuat helper di lokasi tertentu tanpa memeriksa arsitektur yang sudah ada.

Ketentuan:

- Produk tanpa varian: gunakan `basePrice`.
- Produk dengan varian: gunakan `selectedVariant.price`.
- Produk dengan varian tetapi belum memilih varian: transaksi tidak boleh dilanjutkan.
- Jangan menggunakan `?? 0` untuk menutupi harga yang tidak valid.
- Varian harus berasal dari produk yang sama dan berstatus aktif.
- Harga harus berupa integer Rupiah dengan nilai minimal 0, mengikuti aturan validasi harga yang berlaku di codebase.

### 3.2 Rumus harga item

```text
unitPrice = productWithoutVariant
  ? product.basePrice
  : selectedVariant.price

addOnTotal = sum(selectedAddOn.price)

itemUnitTotal = unitPrice + addOnTotal

lineTotal = itemUnitTotal * quantity
```

Jika terdapat aturan diskon atau pajak yang sudah ada pada codebase, pertahankan urutan dan behavior yang berlaku. Spesifikasi ini hanya mengubah sumber harga dasar produk/varian.

## 4. Alur pengguna

### 4.1 Membuat produk tanpa varian

1. Owner membuka halaman Products.
2. Owner membuat atau mengedit produk.
3. Owner tidak mengaktifkan konfigurasi varian.
4. Form menampilkan field `Harga dasar`.
5. Owner mengisi harga produk.
6. Owner menyimpan produk.
7. Backend memvalidasi `basePrice` wajib.
8. Produk tersimpan dengan `basePrice` berisi nilai dan daftar varian kosong.
9. POS dan public menu menampilkan `basePrice`.

### 4.2 Membuat produk dengan varian

1. Owner membuka halaman Products.
2. Owner membuat atau mengedit produk.
3. Owner mengaktifkan/menambahkan konfigurasi varian melalui mekanisme UI yang sudah ada.
4. Form menampilkan daftar varian.
5. Setiap varian memiliki nama, harga, dan status aktif.
6. Field `Harga dasar` tidak ditampilkan dan tidak diwajibkan.
7. Owner mengisi harga penuh untuk setiap varian.
8. Owner menyimpan produk.
9. Backend memvalidasi setiap varian dan menyimpan `basePrice = null`.
10. POS dan public menu menampilkan pilihan varian beserta harga masing-masing.

### 4.3 Pelanggan memilih varian di POS

1. Kasir memilih produk yang memiliki varian.
2. Product configurator menampilkan varian aktif.
3. Setiap pilihan menampilkan harga jual penuh.
4. Kasir memilih satu varian.
5. Harga item mengikuti `variant.price`.
6. Kasir memilih add-on jika tersedia.
7. Add-on ditambahkan ke harga varian.
8. Kasir menambahkan item ke cart.
9. Backend menghitung ulang harga saat order dibuat.

### 4.4 Pelanggan memilih varian di public menu

1. Pelanggan membuka public menu.
2. Pelanggan memilih produk dengan varian.
3. UI menampilkan varian aktif beserta harga masing-masing.
4. Pelanggan memilih varian.
5. Ringkasan harga mengikuti harga varian.
6. Pelanggan memilih add-on.
7. Total item diperbarui.
8. Saat order dikirim, backend memvalidasi ulang produk, varian, add-on, dan harga.

### 4.5 Mengubah produk dari tanpa varian menjadi ber-varian

1. Owner membuka produk yang sebelumnya tidak memiliki varian.
2. Owner menambahkan varian.
3. Form tidak lagi menggunakan `basePrice` sebagai harga transaksi.
4. Owner wajib memasukkan harga untuk setiap varian.
5. Saat disimpan, `basePrice` menjadi `null`.
6. Produk hanya dapat dijual melalui salah satu varian aktif.

Jangan otomatis menyalin `basePrice` ke varian baru kecuali UI memang menyediakan tindakan eksplisit yang terlihat dan dapat dikonfirmasi pengguna. Default yang disarankan adalah meminta owner mengisi harga setiap varian.

### 4.6 Mengubah produk dari ber-varian menjadi tanpa varian

1. Owner menghapus/nonaktifkan seluruh varian melalui mekanisme yang tersedia.
2. Owner wajib mengisi `Harga dasar`.
3. Backend memvalidasi bahwa produk tidak lagi memiliki varian yang digunakan untuk penjualan.
4. Produk disimpan dengan `basePrice` terisi dan tanpa varian aktif/terkait sesuai aturan relasi yang berlaku.
5. POS dan public menu kembali menggunakan `basePrice`.

Jika varian sudah direferensikan oleh order historis, jangan menghapus data snapshot order. Penghapusan atau penonaktifan varian katalog harus mengikuti kebijakan referential integrity yang sudah ada.

## 5. Model data dan migration

### 5.1 Domain type

Model target:

```ts
type Product = {
  id: string;
  name: string;
  basePrice: number | null;
  variants: ProductVariant[];
  // field lain tetap mengikuti domain yang ada
};

type ProductVariant = {
  id: string;
  productId: string;
  name: string;
  price: number;
  isActive: boolean;
  // field lain tetap mengikuti domain yang ada
};
```

Perubahan utama:

```diff
 type ProductVariant = {
   id: string;
   productId: string;
   name: string;
-  priceAdjustment: number;
+  price: number;
   isActive: boolean;
 };

 type Product = {
-  basePrice: number;
+  basePrice: number | null;
 };
```

Jangan menyalin seluruh contoh type di atas secara membabi buta. Pertahankan field, naming, dan convention aktual pada repository.

### 5.2 Database schema

Target schema:

```ts
// products
basePrice: integer("base_price"),

// product_variants
price: integer("price").notNull(),
```

Perubahan:

- `products.base_price` menjadi nullable.
- `product_variants.price_adjustment` diganti menjadi `product_variants.price`.
- `product_variants.price` wajib diisi.
- Tetap gunakan integer untuk nominal Rupiah.
- Pertahankan foreign key, index, unique constraint, dan relasi lain yang sudah ada.
- Jangan menghapus kolom lama sebelum migration data berhasil dan tervalidasi.

Nama tabel/kolom harus disesuaikan dengan schema aktual setelah agent memeriksa codebase.

### 5.3 Migration data lama

Migration wajib mempertahankan harga efektif lama.

Rumus:

```text
newVariantPrice = oldProductBasePrice + oldVariantPriceAdjustment
```

Contoh:

| Produk      | Base price lama | Adjustment lama | Harga varian baru |
| ----------- | --------------: | --------------: | ----------------: |
| Kopi Susu   |        Rp10.000 |             Rp0 |          Rp10.000 |
| Kopi Susu   |        Rp10.000 |         Rp5.000 |          Rp15.000 |
| Nasi Goreng |        Rp15.000 |             Rp0 |          Rp15.000 |
| Nasi Goreng |        Rp15.000 |         Rp5.000 |          Rp20.000 |

Urutan migration:

1. Tambahkan kolom `price` baru pada tabel varian sebagai nullable sementara atau dengan strategi migration yang kompatibel dengan SQLite/Drizzle yang digunakan.
2. Isi `price` untuk setiap varian menggunakan `base_price + price_adjustment`.
3. Verifikasi tidak ada nilai `price` null.
4. Pastikan harga hasil migration tidak negatif dan sesuai integer.
5. Jadikan kolom `price` not null melalui strategi SQLite yang didukung.
6. Ubah `products.base_price` menjadi nullable.
7. Hapus kolom `price_adjustment` lama melalui rebuild table jika diperlukan oleh SQLite.
8. Commit migration SQL dan metadata Drizzle.
9. Uji migration pada salinan database yang memiliki produk tanpa varian, produk dengan satu varian, dan produk dengan beberapa varian.

Catatan SQLite:

- SQLite memiliki keterbatasan perubahan kolom. Gunakan mekanisme migration Drizzle/rebuild table yang sesuai versi dependency saat ini.
- Jangan mengasumsikan `ALTER COLUMN DROP NOT NULL` atau rename/drop column dapat dilakukan dengan sintaks yang sama seperti PostgreSQL.
- Periksa migration yang sudah ada dan ikuti pola repository.
- Migration harus aman dijalankan satu kali sesuai mekanisme migration project.

### 5.4 Penanganan data tidak valid

Sebelum migration final:

- Produk dengan varian tetapi `base_price` null: investigasi. Jangan mengarang harga.
- Varian dengan `price_adjustment` null atau tidak valid: gunakan nilai yang secara eksplisit ditetapkan schema lama; jika tidak dapat dipastikan, hentikan migration dan laporkan.
- Produk tanpa varian tetapi `base_price` null: data invalid untuk model target; jangan mengisi 0 otomatis.
- Produk dengan varian tetapi seluruh varian nonaktif: boleh tetap tersimpan sebagai katalog, tetapi tidak boleh dijual sampai ada varian aktif.
- Produk dengan varian duplikat: jangan mengubah nama atau menghapus otomatis dalam migration ini.

Jika data invalid ditemukan, buat laporan jumlah record dan ID yang terdampak. Jangan melakukan fallback diam-diam.

### 5.5 Backward compatibility

- Tidak perlu mempertahankan `priceAdjustment` pada domain setelah seluruh consumer dimigrasikan.
- Jangan mengirim kedua field (`price` dan `priceAdjustment`) secara bersamaan dalam response final kecuali diperlukan sementara untuk deployment bertahap yang disetujui.
- Jika aplikasi desktop/lokal melakukan upgrade database saat startup, pastikan mekanisme backup/restore dan migration version tetap berjalan sesuai flow yang sudah ada.
- Pastikan versi aplikasi yang berjalan setelah migration tidak membaca kolom lama.

## 6. Kontrak API

Periksa endpoint catalog, POS, public menu, dan order yang benar-benar tersedia sebelum mengubah kontrak. Nama route di bawah adalah kategori kontrak, bukan instruksi untuk membuat endpoint baru.

### 6.1 Create product

Request target untuk produk tanpa varian:

```json
{
  "name": "Es Teh",
  "basePrice": 5000,
  "variants": []
}
```

Request target untuk produk dengan varian:

```json
{
  "name": "Nasi Goreng",
  "basePrice": null,
  "variants": [
    {
      "name": "Regular",
      "price": 15000,
      "isActive": true
    },
    {
      "name": "Jumbo",
      "price": 20000,
      "isActive": true
    }
  ]
}
```

Aturan:

- Produk tanpa varian wajib mengirim `basePrice` integer.
- Produk dengan varian wajib mengirim minimal satu varian sesuai aturan katalog yang berlaku.
- Setiap varian wajib mengirim `price` integer.
- `basePrice` untuk produk dengan varian harus `null` atau diabaikan pada input lalu dinormalisasi menjadi `null` di server.
- Jangan menerima `priceAdjustment` sebagai field aktif pada kontrak final.

### 6.2 Update product

Update harus mendukung perubahan mode produk:

- Tanpa varian menjadi tanpa varian.
- Tanpa varian menjadi ber-varian.
- Ber-varian menjadi ber-varian.
- Ber-varian menjadi tanpa varian.

Server harus memvalidasi keseluruhan state akhir, bukan hanya field yang berubah.

Jika endpoint menggunakan PATCH, tentukan dengan jelas apakah `variants` yang dikirim menggantikan seluruh daftar atau hanya memperbarui sebagian. Pertahankan semantik API yang sudah ada dan dokumentasikan behavior-nya.

### 6.3 Product response

Produk tanpa varian:

```json
{
  "id": "product-es-teh",
  "name": "Es Teh",
  "basePrice": 5000,
  "variants": []
}
```

Produk dengan varian:

```json
{
  "id": "product-nasi-goreng",
  "name": "Nasi Goreng",
  "basePrice": null,
  "variants": [
    {
      "id": "variant-regular",
      "name": "Regular",
      "price": 15000,
      "isActive": true
    },
    {
      "id": "variant-jumbo",
      "name": "Jumbo",
      "price": 20000,
      "isActive": true
    }
  ]
}
```

### 6.4 Order request

Order tetap mengirim identifier produk, varian, add-on, dan quantity sesuai kontrak yang sudah ada.

Contoh:

```json
{
  "items": [
    {
      "productId": "product-nasi-goreng",
      "variantId": "variant-jumbo",
      "addOnIds": ["addon-extra-egg"],
      "quantity": 1
    }
  ]
}
```

Client tidak boleh mengirim `unitPrice`, `variantPrice`, `priceAdjustment`, `lineTotal`, atau `grandTotal` sebagai sumber perhitungan yang dipercaya server.

Jika kontrak saat ini menerima field harga dari client untuk kebutuhan display/diagnostik, server tetap wajib mengabaikannya untuk kalkulasi dan tidak menyimpannya sebagai nilai otoritatif.

### 6.5 Order response

Pertahankan bentuk response yang sudah ada. Pastikan setiap order item tetap memuat snapshot:

- Nama produk saat transaksi.
- Nama varian saat transaksi jika dipilih.
- Harga unit produk/varian saat transaksi.
- Snapshot add-on dan harga add-on.
- Quantity.
- Total baris.

Nama field harus mengikuti kontrak domain/API yang sudah ada. Jangan mengganti nama snapshot hanya karena perubahan model katalog.

## 7. Aturan backend

### 7.1 Validasi product input

Validasi harus menggunakan discriminated business rule berdasarkan jumlah varian.

Aturan:

1. `variants.length === 0`: `basePrice` wajib.
2. `variants.length > 0`: setiap varian wajib memiliki `price`.
3. Produk dengan varian: `basePrice` dinormalisasi menjadi `null`.
4. `priceAdjustment` tidak diterima pada schema final.
5. Harga menggunakan integer Rupiah.
6. Nama varian wajib mengikuti aturan nama yang sudah ada.
7. Status aktif mengikuti aturan katalog yang sudah ada.
8. Jika seluruh varian nonaktif, produk tidak dapat dipilih untuk transaksi.
9. Validasi unique name/ID varian mengikuti constraint yang sudah ada.

Contoh pseudo-schema:

```ts
const productSchema = z
  .object({
    name: z.string().min(1),
    basePrice: z.number().int().min(0).nullable(),
    variants: z.array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1),
        price: z.number().int().min(0),
        isActive: z.boolean(),
      }),
    ),
  })
  .superRefine((value, context) => {
    if (value.variants.length === 0 && value.basePrice === null) {
      context.addIssue({
        code: "custom",
        path: ["basePrice"],
        message: "Harga dasar wajib diisi jika produk tidak memiliki varian.",
      });
    }

    if (value.variants.length > 0 && value.basePrice !== null) {
      context.addIssue({
        code: "custom",
        path: ["basePrice"],
        message: "Produk dengan varian tidak menggunakan harga dasar.",
      });
    }
  });
```

Ilustrasi schema harus disesuaikan dengan schema composition dan Zod version yang digunakan repository.

### 7.2 Resolusi harga saat order

Buat atau gunakan satu domain/application service untuk menentukan harga item. Jangan menduplikasi formula di POS order, public order, dan service lain.

Urutan:

1. Ambil produk dari database.
2. Pastikan produk aktif dan tersedia untuk dijual.
3. Ambil varian berdasarkan `variantId`, jika ada.
4. Jika produk memiliki varian:
   - `variantId` wajib.
   - Varian harus milik produk tersebut.
   - Varian harus aktif.
   - Unit price = `variant.price`.
5. Jika produk tidak memiliki varian:
   - `variantId` harus null/tidak dikirim.
   - `basePrice` harus tersedia.
   - Unit price = `product.basePrice`.
6. Validasi seluruh add-on berdasarkan relasi produk dan status aktif.
7. Hitung add-on total dari harga database.
8. Hitung total item dan order di server.
9. Simpan snapshot harga ke order item.
10. Jangan memakai nilai harga dari client.

### 7.3 Invalid combination

Server harus menolak:

- Produk dengan varian tetapi `variantId` tidak dikirim.
- Produk tanpa varian tetapi `variantId` dikirim.
- Varian yang bukan milik produk.
- Varian nonaktif.
- Varian yang tidak ditemukan.
- Produk nonaktif/tidak tersedia.
- Produk ber-varian tanpa varian aktif yang dapat dipilih.
- Add-on yang tidak terhubung ke produk.
- Add-on nonaktif atau tidak ditemukan.
- Harga katalog yang null pada kondisi yang seharusnya memiliki harga.

Gunakan error code dan Problem Details convention yang sudah ada. Jangan membuat format error baru.

### 7.4 Konsistensi seluruh order source

Pastikan formula yang sama dipakai oleh:

- POS/cashier order.
- Public QR order.
- Service internal yang membuat order dari source lain jika ada.
- Reorder atau duplicate order jika fitur tersebut ada.

Tidak boleh ada satu flow yang masih menggunakan `basePrice + priceAdjustment`.

### 7.5 Mapping dan serialization

Perbarui seluruh mapper:

- Database row ke domain `Product`.
- Database row ke domain `ProductVariant`.
- Domain ke API response.
- API request ke service input.
- Public catalog/menu response.
- POS catalog response.
- Test factory dan fixtures.

Pastikan `basePrice: null` tidak diubah menjadi 0 oleh mapper atau serializer.

### 7.6 Cache dan invalidation

Setelah create/update product:

- Invalidasi query catalog/products.
- Invalidasi query POS catalog.
- Invalidasi query public menu yang relevan jika cache digunakan.
- Jangan mengubah snapshot order yang sudah ada.
- Ikuti query key factory dan invalidation convention yang sudah ada.

## 8. Frontend management

### 8.1 Product form tanpa varian

Tampilkan:

- Nama produk.
- Kategori dan field lain yang sudah ada.
- Harga dasar.
- Field katalog lain yang sudah ada.

Field harga:

```text
Harga dasar
Rp 5.000
```

Behavior:

- Wajib diisi.
- Gunakan input mata uang Rupiah sesuai komponen/form helper yang sudah ada.
- Nilai disimpan sebagai integer.
- Tidak boleh mengirim `null` ketika produk tidak memiliki varian.

### 8.2 Product form dengan varian

Tampilkan daftar varian dengan field:

| Field       | Keterangan                                       |
| ----------- | ------------------------------------------------ |
| Nama varian | Nama pilihan, misalnya Regular atau Jumbo        |
| Harga       | Harga jual penuh varian                          |
| Status      | Aktif/nonaktif mengikuti behavior yang sudah ada |
| Action      | Tambah/hapus varian mengikuti UI yang sudah ada  |

Label:

```text
Harga
```

Bukan:

```text
Tambahan harga
```

Behavior:

- Input harga wajib untuk setiap varian.
- Nilai merupakan harga final varian sebelum add-on.
- Jangan menampilkan input `Harga dasar`.
- Jangan menampilkan hint yang menyiratkan harga varian akan ditambahkan ke base price.
- Simpan produk dengan `basePrice: null`.
- Jangan membuat varian default otomatis.

### 8.3 Pergantian mode

Saat user menambahkan varian ke produk tanpa varian:

- Sembunyikan field `Harga dasar`.
- Tampilkan field harga untuk setiap varian.
- Beri validasi jika varian belum memiliki harga.
- Jangan diam-diam menganggap harga dasar sebagai harga semua varian.
- Jika UX membutuhkan bantuan migrasi nilai di form, tawarkan tindakan eksplisit seperti `Salin harga dasar ke varian ini`, hanya jika ada kebutuhan nyata dan nilainya dapat ditinjau sebelum disimpan.

Saat user menghapus semua varian:

- Tampilkan kembali `Harga dasar`.
- Harga dasar wajib diisi.
- Jangan mengambil harga varian secara otomatis tanpa konfirmasi.
- Jika nilai base price belum tersedia, tampilkan validasi yang jelas.

### 8.4 Product list/card

Produk tanpa varian:

```text
Es Teh
Rp5.000
```

Produk dengan varian:

Pilihan tampilan yang disarankan:

```text
Nasi Goreng
Mulai dari Rp15.000
```

Gunakan harga minimum dari varian aktif.

Jika hanya satu varian aktif, tetap boleh menampilkan harga varian tersebut secara langsung.

Jika tidak ada varian aktif:

```text
Tidak tersedia
```

Jangan menampilkan `basePrice` untuk produk yang memiliki varian.

Jangan menghitung minimum dari varian nonaktif.

### 8.5 Detail produk

Untuk produk dengan varian, tampilkan harga masing-masing varian. Untuk produk tanpa varian, tampilkan harga dasar. Jangan menampilkan field harga yang tidak berlaku pada mode produk tersebut.

### 8.6 Validation dan feedback

- Error harga dasar ditampilkan pada field `Harga dasar`.
- Error harga varian ditampilkan pada varian terkait.
- Error pergantian mode ditampilkan dengan pesan yang dapat ditindaklanjuti.
- Loading, success, dan error state mengikuti pola halaman management.
- Tombol simpan tidak boleh menghasilkan payload yang tidak konsisten.

## 9. Frontend POS dan public menu

### 9.1 Product configurator POS

Untuk produk tanpa varian:

- Tidak perlu menampilkan pemilihan varian.
- Harga produk berasal dari `basePrice`.

Untuk produk dengan varian:

- Tampilkan varian aktif.
- Setiap varian menampilkan harga penuh.
- Varian wajib dipilih sebelum item dapat ditambahkan.
- Harga unit berubah langsung ketika pilihan varian berubah.
- Jangan menambahkan `basePrice` ke harga varian.

### 9.2 Add-on

Add-on tetap menggunakan model saat ini.

Contoh tampilan:

```text
Nasi Goreng Jumbo          Rp20.000
Extra Telur                 +Rp5.000
Total item                  Rp25.000
```

Jika add-on tidak dipilih, harga item sama dengan harga varian.

### 9.3 Cart POS

Cart harus menyimpan pilihan dan identitas item sesuai model yang sudah ada:

- `productId`
- `variantId` jika ada
- `addOnIds`
- quantity
- notes

Harga yang ditampilkan harus berasal dari catalog state yang valid. Backend tetap menghitung ulang saat order dibuat.

Jangan menyimpan `priceAdjustment` sebagai data aktif pada cart. Jika cart persisten dan dapat bertahan melewati versi aplikasi, siapkan strategi invalidasi/migrasi cart lama agar tidak salah menghitung harga.

### 9.4 Public menu

- Produk tanpa varian menampilkan harga dasar.
- Produk dengan varian menampilkan harga mulai dari varian aktif atau daftar harga varian saat configurator dibuka.
- Pilihan varian menampilkan harga penuh.
- Add-on ditampilkan sebagai biaya tambahan.
- Cart dan ringkasan order menggunakan harga varian yang dipilih.
- Validasi server tetap menjadi sumber kebenaran.

### 9.5 Stale cart dan perubahan harga

Jika harga katalog berubah setelah item masuk cart:

- Jangan menganggap harga lama sebagai harga final.
- Saat submit order, backend menghitung ulang harga berdasarkan katalog saat itu.
- Jika API saat ini mengembalikan total baru, ikuti mekanisme konfirmasi/perubahan harga yang sudah tersedia.
- Jangan membuat order dengan harga lama yang dikirim client.
- Jika belum ada UX untuk perubahan harga, tampilkan error konflik/validasi yang aman dan minta pengguna memuat ulang cart. Jangan membuat mekanisme baru yang melampaui scope tanpa review.

## 10. UI copy

Gunakan copy berbahasa Indonesia yang ringkas dan konsisten.

| Kondisi                                  | Copy                                |
| ---------------------------------------- | ----------------------------------- |
| Produk tanpa varian                      | `Harga dasar`                       |
| Harga varian                             | `Harga`                             |
| Produk dengan varian                     | `Harga ditentukan oleh varian.`     |
| Varian belum memiliki harga              | `Masukkan harga untuk varian ini.`  |
| Produk tanpa varian belum memiliki harga | `Harga dasar wajib diisi.`          |
| Produk dengan varian tanpa pilihan       | `Pilih varian terlebih dahulu.`     |
| Produk tidak memiliki varian aktif       | `Tidak ada varian yang tersedia.`   |
| Harga minimum product list               | `Mulai dari Rp15.000`               |
| Harga katalog tidak valid                | `Harga produk belum dikonfigurasi.` |

Hindari copy:

- `Tambahan harga` untuk harga varian.
- `Harga dasar + varian` pada produk ber-varian.
- `Gratis` untuk harga null atau belum dikonfigurasi.
- Pesan error teknis yang menampilkan SQL atau stack trace.

## 11. Snapshot order dan kompatibilitas data historis

### 11.1 Prinsip snapshot

Harga katalog adalah harga saat ini. Snapshot order adalah harga saat transaksi dibuat.

Perubahan model katalog tidak boleh mengubah:

- Order item yang sudah dibuat.
- Subtotal dan grand total order historis.
- Payment record.
- Refund record.
- Laporan penjualan.
- Struk/receipt historis.

### 11.2 Order baru

Saat order baru dibuat, simpan snapshot berdasarkan hasil kalkulasi server:

```text
snapshot unit price = product.basePrice
  atau selectedVariant.price

snapshot add-ons = harga add-on saat order dibuat

snapshot line total = (unit price + add-on total) * quantity
```

Gunakan field snapshot yang sudah ada. Jangan menambahkan kolom baru jika snapshot yang diperlukan sudah tersedia.

### 11.3 Order lama

- Jangan menjalankan update terhadap order item historis.
- Jangan menghitung ulang harga order lama dari katalog.
- Jangan mengubah `variantId` atau nama varian pada snapshot lama.
- Data order lama harus tetap dapat dibaca oleh detail order, receipt, reports, dan refund.
- Migration katalog hanya mengubah tabel products dan product variants.

### 11.4 Cart lama

Jika cart disimpan pada localStorage/sessionStorage:

- Periksa bentuk data cart sebelum implementasi.
- Jangan menganggap cart lama otomatis kompatibel setelah `priceAdjustment` dihapus.
- Pilih strategi yang paling sederhana dan aman: versioning cart, clear cart yang tidak kompatibel, atau mapping eksplisit.
- Beri pesan yang jelas jika cart perlu dimuat ulang.
- Jangan mengubah order yang sudah tersimpan.

## 12. Testing

### 12.1 Unit test domain pricing

Wajib mencakup:

- Produk tanpa varian menggunakan `basePrice`.
- Produk dengan varian menggunakan `variant.price`.
- Produk dengan varian tidak menambahkan `basePrice`.
- Produk ber-varian tanpa pilihan varian ditolak.
- Produk tanpa varian dengan `basePrice = null` ditolak.
- Varian nonaktif ditolak.
- Varian dari produk lain ditolak.
- Produk tanpa varian yang menerima `variantId` ditolak.
- Add-on ditambahkan di atas harga produk/varian.
- Quantity mengalikan total unit termasuk add-on.
- Nominal tetap integer.

### 12.2 Schema validation test

- `basePrice` wajib ketika `variants` kosong.
- `basePrice` null ketika `variants` tersedia.
- Harga setiap varian wajib.
- Harga negatif ditolak.
- Harga desimal ditolak.
- `priceAdjustment` tidak diterima pada kontrak final.
- Nama varian mengikuti aturan validasi yang ada.
- Payload mode switching valid.

### 12.3 Migration test

Gunakan database fixture/salinan database yang mewakili:

1. Produk tanpa varian.
2. Produk dengan satu varian adjustment 0.
3. Produk dengan beberapa varian dan adjustment berbeda.
4. Produk dengan varian nonaktif.
5. Produk yang sudah direferensikan oleh order historis.
6. Add-on yang terhubung ke produk.
7. Data edge case yang harus menyebabkan migration dihentikan atau dilaporkan.

Assertions:

- Harga varian baru sama dengan harga efektif lama.
- `basePrice` produk tanpa varian tetap sama.
- `basePrice` produk dengan varian menjadi null setelah proses normalisasi yang disepakati.
- Tidak ada `price` varian null.
- Data order/payment historis tidak berubah.
- Migration dapat dijalankan melalui mekanisme migration project.

### 12.4 Backend integration test

- Create/update produk tanpa varian.
- Create/update produk dengan varian.
- Transisi tanpa varian ke ber-varian.
- Transisi ber-varian ke tanpa varian.
- POS order dengan produk tanpa varian.
- POS order dengan varian.
- Public order dengan varian.
- Order dengan add-on.
- Invalid variant/product relation.
- Variant inactive.
- Harga client yang dimanipulasi tidak memengaruhi total.
- Snapshot order tersimpan sesuai harga server.

### 12.5 Frontend test

Management:

- Field `Harga dasar` tampil pada produk tanpa varian.
- Field `Harga dasar` tidak tampil pada produk dengan varian.
- Label varian adalah `Harga`.
- Setiap varian dapat diedit dan divalidasi.
- Product list menampilkan harga dasar atau harga minimum varian aktif.
- Pergantian mode tidak mengirim payload yang invalid.

POS/public menu:

- Harga varian tampil pada pilihan.
- Memilih varian memperbarui harga.
- Add-on menambah harga.
- Produk dengan varian tidak dapat ditambahkan tanpa memilih varian.
- Cart menampilkan total yang sesuai.
- Perubahan harga katalog tidak membuat client dapat memaksakan harga lama.

### 12.6 E2E smoke

Jika Playwright E2E tersedia, verifikasi:

1. Owner membuat produk tanpa varian.
2. Owner membuat produk dengan dua varian.
3. Owner mengedit harga varian.
4. POS memilih varian termurah dan termahal.
5. POS menambahkan add-on.
6. Public menu membuat order dengan varian.
7. Detail order menunjukkan snapshot yang benar.
8. Order historis sebelum migration tetap menunjukkan nominal yang sama.

## 13. File map

Daftar berikut adalah area pemeriksaan berdasarkan struktur codebase yang diketahui. Agent wajib memverifikasi ulang nama dan lokasi file pada branch/working tree terbaru. Jangan membuat file baru jika tanggung jawabnya sudah ditangani file yang ada.

### Domain dan database

- `src/types/domain.ts`
- `src/infrastructure/database/schema/catalog.ts`
- File migration Drizzle di `drizzle/`
- Repository catalog/products/variants
- Catalog mapper dan serializer

### Validation dan service

- `src/modules/catalog/catalog.schemas.ts`
- Catalog service
- Product repository
- Order service, khususnya kalkulasi dan pembuatan order
- POS order creation flow
- Public order creation flow
- Mapper response catalog dan order

### Management UI

- `src/app/(dashboard)/app/products/page.tsx`
- Product form/drawer components
- Product list/card components
- Product query/mutation hooks
- Catalog API client dan query keys

### POS dan public menu

- `src/features/operational/product-configurator.tsx`
- `src/components/shells/pos-cart-context.tsx`
- POS catalog/cart/checkout components
- `src/app/(customer)/menu/[token]/page.tsx`
- Public menu cart/configurator components
- Public order payload builder

### Test

- Catalog schema tests
- Product service/repository tests
- Order service tests
- Public order tests
- POS tests
- Product form/configurator tests
- Migration tests
- E2E flows

### Dokumentasi

Setelah implementasi disetujui dan selesai:

- Perbarui `docs/PRD.md` jika model harga di sana masih menyebut adjustment.
- Perbarui `docs/ROADMAP.md` bila milestone perlu dicatat.
- Tambahkan atau perbarui dokumen spesifikasi ini dengan status dan hasil verifikasi.
- Perbarui `AGENTS.md` hanya jika ada aturan permanen yang memang perlu diketahui agent pada pekerjaan berikutnya.

## 14. Urutan implementasi

### Step 1 - Codebase audit

- Baca dokumen PRD, roadmap, dan specification terkait.
- Telusuri semua referensi `priceAdjustment`.
- Telusuri semua pemakaian `basePrice`.
- Petakan seluruh order creation flow.
- Periksa snapshot order.
- Periksa cart persistence.
- Periksa schema dan migration SQLite/Drizzle.
- Buat daftar file terdampak dan risiko sebelum mengubah kode.

Deliverable: audit singkat yang menyatakan seluruh consumer dan migration plan.

### Step 2 - Domain dan validation

- Ubah domain `ProductVariant.priceAdjustment` menjadi `price`.
- Ubah `Product.basePrice` menjadi nullable.
- Perbarui schema validation.
- Tambahkan test validasi mode produk.
- Perbarui fixtures dan factories.

### Step 3 - Database migration

- Buat migration yang menambahkan kolom harga varian.
- Backfill menggunakan `base_price + price_adjustment`.
- Ubah base price menjadi nullable.
- Hapus kolom adjustment dengan strategi SQLite yang aman.
- Uji terhadap database lama dan data order historis.
- Verifikasi tidak ada data yang hilang.

### Step 4 - Backend catalog

- Perbarui repository dan mapper.
- Perbarui create/update product service.
- Terapkan validasi mode produk.
- Perbarui API request/response.
- Pastikan semua endpoint katalog mengirim `price`.

### Step 5 - Backend order pricing

- Implementasikan atau konsolidasikan resolusi harga.
- Gunakan `variant.price` untuk produk dengan varian.
- Gunakan `basePrice` untuk produk tanpa varian.
- Pertahankan add-on calculation.
- Integrasikan seluruh order source.
- Pastikan snapshot order tetap benar.
- Tambahkan integration tests.

### Step 6 - Management UI

- Ubah label `Tambahan harga` menjadi `Harga`.
- Sembunyikan `Harga dasar` ketika produk memiliki varian.
- Tampilkan `Harga dasar` ketika tidak ada varian.
- Perbarui validation dan payload.
- Perbarui product list/card.
- Uji transisi mode produk.

### Step 7 - POS dan public menu

- Perbarui product configurator.
- Perbarui harga pada cart.
- Perbarui public menu dan cart.
- Pertahankan add-on.
- Perbarui cart compatibility jika dibutuhkan.
- Pastikan tidak ada formula additive lama.

### Step 8 - Regression dan release

- Jalankan pencarian final `priceAdjustment`.
- Verifikasi setiap hasil yang tersisa: migration lama, dokumentasi historis, atau kode aktif.
- Jalankan check, test, build, dan E2E.
- Uji migration dari database lama.
- Uji order historis.
- Perbarui dokumentasi dan status spec.
- Laporkan file yang berubah, hasil test, serta risiko tersisa.

## 15. Acceptance criteria

### Product management

- [x] Produk tanpa varian memiliki `basePrice` wajib.
- [x] Produk dengan varian menyimpan `basePrice = null`.
- [x] Setiap varian memiliki `price` sebagai harga jual penuh.
- [x] Label UI berubah dari `Tambahan harga` menjadi `Harga`.
- [x] Field `Harga dasar` tidak tampil pada produk ber-varian.
- [x] Field `Harga dasar` tampil pada produk tanpa varian.
- [x] Transisi mode produk tervalidasi.
- [x] Product list tidak menampilkan `basePrice` untuk produk ber-varian.
- [x] Harga minimum hanya dihitung dari varian aktif.

### POS dan public menu

- [x] Produk tanpa varian menggunakan `basePrice`.
- [x] Produk ber-varian menggunakan `variant.price`.
- [x] Harga varian tidak ditambahkan ke `basePrice`.
- [x] Produk ber-varian tidak dapat ditambahkan tanpa memilih varian.
- [x] Varian nonaktif tidak dapat dipilih.
- [x] Add-on tetap ditambahkan ke harga dasar/varian.
- [x] POS dan public menu menunjukkan nominal yang konsisten.

### Backend dan data

- [x] Server menghitung ulang harga dari database.
- [x] Harga dari client tidak dipercaya.
- [x] Semua order source memakai aturan yang sama.
- [x] Snapshot order baru menyimpan harga yang benar.
- [x] Order historis tidak berubah.
- [x] Payment, refund, dan laporan tidak berubah.
- [x] Migration mempertahankan harga efektif seluruh varian lama.
- [x] Tidak ada data harga null yang tidak valid.
- [x] Tidak ada penggunaan aktif `priceAdjustment` setelah migrasi.

### Quality

- [x] Unit test pricing lulus.
- [x] Validation test lulus.
- [x] Migration test lulus.
- [x] Backend integration test lulus.
- [x] Frontend test lulus.
- [x] E2E smoke lulus jika tersedia.
- [x] `pnpm check` lulus.
- [x] `pnpm test` lulus.
- [x] `pnpm build` lulus.

## 16. Risiko dan mitigasi

| Risiko                                     | Dampak                           | Mitigasi                                                                             |
| ------------------------------------------ | -------------------------------- | ------------------------------------------------------------------------------------ |
| Backfill salah                             | Harga varian berubah             | Gunakan rumus harga efektif lama dan verifikasi sampel serta seluruh record          |
| Ada consumer yang masih memakai adjustment | Harga berbeda antar halaman      | Audit semua referensi dan test seluruh order source                                  |
| Base price null tidak ditangani            | UI/API crash atau harga 0        | Nullable mapping dan validasi eksplisit                                              |
| Cart lama masih menyimpan adjustment       | Harga cart salah                 | Versioning atau invalidasi cart yang tidak kompatibel                                |
| Varian tidak valid                         | Order gagal atau salah harga     | Validasi relasi, status, dan kepemilikan varian di server                            |
| Public menu tertinggal                     | Harga pelanggan berbeda dari POS | Test public menu dan public order secara terpisah                                    |
| Order historis ikut berubah                | Laporan dan receipt salah        | Migration hanya menyentuh katalog, bukan order                                       |
| Migration SQLite gagal                     | Aplikasi tidak dapat startup     | Uji rebuild table pada salinan database dan siapkan backup sesuai mekanisme aplikasi |
| Product list menampilkan harga salah       | Owner salah memahami harga jual  | Hitung harga minimum dari varian aktif                                               |

## 17. Definition of Done

Pekerjaan dinyatakan selesai hanya jika:

1. Model domain dan database memakai `ProductVariant.price`.
2. `Product.basePrice` nullable dan hanya digunakan untuk produk tanpa varian.
3. Migration mempertahankan harga efektif semua varian lama.
4. Tidak ada kode aktif yang menghitung `basePrice + priceAdjustment`.
5. Management UI memakai label `Harga` untuk varian.
6. POS dan public menu menampilkan harga penuh varian.
7. Add-on tetap dihitung dengan benar.
8. Seluruh order source memakai resolusi harga server yang sama.
9. Order snapshot baru benar dan order historis tidak berubah.
10. Unit, integration, migration, dan frontend tests lulus.
11. `pnpm check`, `pnpm test`, `pnpm build`, dan E2E yang tersedia lulus.
12. Dokumentasi terkait diperbarui.
13. Agent menyerahkan ringkasan perubahan, migration behavior, hasil test, dan risiko yang tersisa.

## 18. Hasil verifikasi implementasi

- `pnpm check` lulus.
- `pnpm test` lulus dengan 51 file dan 191 test.
- `pnpm build` lulus.
- `pnpm test:e2e` lulus dengan 11 test.
- Migration test lama ke baru lulus dan mempertahankan harga efektif, data add-on, gambar, serta snapshot order historis.
- Validasi manual pada Windows dan installer masih pending.

## Appendix A: Contoh perhitungan harga

### A.1 Produk tanpa varian

```text
Produk       Es Teh
Harga dasar  Rp5.000
Add-on       Tidak ada
Quantity     2

Harga unit   Rp5.000
Total        Rp10.000
```

### A.2 Produk dengan varian

```text
Produk       Nasi Goreng
Varian       Jumbo
Harga varian Rp20.000
Base price   null
Add-on       Tidak ada
Quantity     1

Harga unit   Rp20.000
Total        Rp20.000
```

### A.3 Produk dengan varian dan add-on

```text
Produk       Nasi Goreng
Varian       Jumbo
Harga varian Rp20.000
Add-on       Extra Telur Rp5.000
Quantity     1

Harga unit   Rp20.000
Add-on total Rp5.000
Total        Rp25.000
```

### A.4 Migration harga lama

```text
Base price lama          Rp15.000
Adjustment Regular       Rp0
Adjustment Jumbo         Rp5.000

Harga Regular baru       Rp15.000
Harga Jumbo baru         Rp20.000
Base price baru          null
```

### A.5 Perbandingan model lama dan baru

| Model | Harga produk |       Harga varian | Harga efektif |
| ----- | -----------: | -----------------: | ------------: |
| Lama  |     Rp15.000 | Adjustment Rp5.000 |      Rp20.000 |
| Baru  |         null |     Price Rp20.000 |      Rp20.000 |

## Appendix B: Checklist implementasi

### Audit

- [x] Baca PRD dan spesifikasi terkait.
- [x] Cari seluruh penggunaan `priceAdjustment`.
- [x] Cari seluruh penggunaan `basePrice`.
- [x] Petakan seluruh order creation flow.
- [x] Petakan snapshot order dan cart persistence.
- [x] Identifikasi migration SQLite yang dibutuhkan.

### Implementasi

- [x] Domain types.
- [x] Zod schemas.
- [x] Database schema dan migration.
- [x] Catalog repository/service/mapper.
- [x] Order pricing service.
- [x] POS dan public order flow.
- [x] Management product form dan list.
- [x] POS configurator dan cart.
- [x] Public menu dan cart.
- [x] Test dan dokumentasi.

### Verifikasi

- [x] Migration database lama.
- [x] Harga produk tanpa varian.
- [x] Harga varian penuh.
- [x] Add-on calculation.
- [x] POS order.
- [x] Public QR order.
- [x] Snapshot order historis.
- [x] Cart compatibility.
- [x] `pnpm check`.
- [x] `pnpm test`.
- [x] `pnpm build`.
- [x] E2E smoke.
