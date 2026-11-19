# RAVIKA POS - Spesifikasi Fase 11: Public Order Cash Declaration

**Status:** Implemented dan terverifikasi (test otomatis)
**Milestone:** M11 - Faster Table Payment
**Fase:** 11, Public Order Cash Declaration
**Tanggal:** 19 November 2026
**Baseline fitur:** `phase-10-windows-deployment-network-management`
**Referensi utama:** `docs/PRD.md`, `docs/specification/phase-5-backend-foundation.md`, `docs/specification/phase-6-backend-api-modules.md`, `docs/specification/phase-7-frontend-backend-integration.md`, `docs/specification/phase-8-qa-release-readiness.md`, `docs/specification/phase-10-windows-deployment-network-management.md`

## Daftar isi

- [0. Agent quick start](#0-agent-quick-start)
- [1. Ringkasan](#1-ringkasan)
- [2. Goals, non-goals, dan anti-goals](#2-goals-non-goals-dan-anti-goals)
- [3. Keputusan yang dikunci](#3-keputusan-yang-dikunci)
- [4. Alur pengguna](#4-alur-pengguna)
- [5. Model data dan migration](#5-model-data-dan-migration)
- [6. Kontrak API](#6-kontrak-api)
- [7. Aturan backend](#7-aturan-backend)
- [8. Frontend pelanggan](#8-frontend-pelanggan)
- [9. Frontend kasir](#9-frontend-kasir)
- [10. UI copy](#10-ui-copy)
- [11. Testing](#11-testing)
- [12. File map](#12-file-map)
- [13. Urutan implementasi](#13-urutan-implementasi)
- [14. Acceptance criteria](#14-acceptance-criteria)
- [15. Risiko dan mitigasi](#15-risiko-dan-mitigasi)
- [16. Definition of Done](#16-definition-of-done)
- [Appendix A: Contoh request dan response](#appendix-a-contoh-request-dan-response)
- [Appendix B: Checklist implementasi](#appendix-b-checklist-implementasi)

## 0. Agent quick start

Baca dokumen ini sebelum menulis kode Fase 11.

Aturan wajib:

1. `cash_tendered` adalah deklarasi pelanggan, bukan pembayaran.
2. Pesanan tetap `UNPAID` sampai kasir mencatat pembayaran setelah serah-terima.
3. Pembayaran yang dicatat adalah nominal uang yang benar-benar diterima, maksimal sebesar sisa tagihan.
4. Kembalian tidak boleh masuk pendapatan, payment amount, atau laporan penjualan.
5. Server menghitung ulang total. Jangan percaya total atau kembalian dari browser.
6. `cashTendered` minimal sebesar `grandTotal`.
7. QR hanya untuk dine-in. Jangan mengubah alur takeaway.
8. Pesanan QR tetap langsung masuk KDS.
9. Jangan menambah payment gateway, status pembayaran baru, atau auto-paid.
10. Pertahankan `Idempotency-Key` pada mutasi public order.
11. Gunakan pnpm. Jangan menambah dependency.
12. Jalankan `pnpm check`, `pnpm test`, `pnpm build`, dan `pnpm test:e2e` sebelum selesai.
13. Jika ada konflik dengan PRD atau keputusan di dokumen ini, berhenti dan minta keputusan product owner.

## 1. Ringkasan

Fase 11 menambahkan pilihan pembayaran tunai bagi pelanggan QR.

Pelanggan dapat menyatakan akan membayar tunai dan melihat kembalian sebelum mengirim pesanan. Kasir melihat nominal tunai dan kembalian tersebut, membawa kembalian ke meja, menerima uang, lalu mencatat pembayaran.

Hasil akhir:

- Pelanggan memilih `Tunai, siapkan kembalian` atau `Bayar di kasir`.
- Pelanggan yang memilih tunai mengisi nominal minimal sebesar total.
- Kembalian dihitung langsung di keranjang.
- Pesanan tetap langsung dibuat dan masuk KDS.
- Kasir melihat deklarasi tunai di daftar pesanan perlu dibayar.
- Drawer pembayaran kasir terisi nominal tunai pelanggan.
- Kasir mencatat pembayaran sebesar tagihan setelah uang diterima.
- Status publik menampilkan nominal tunai dan kembalian.
- Laporan penjualan tetap hanya menghitung payment yang tercatat.

Fase 11 tidak menambahkan pembayaran digital otomatis. `Bayar di kasir` tetap menjadi jalur untuk QRIS, transfer, dompet digital, atau pembayaran tunai langsung di kasir.

## 2. Goals, non-goals, dan anti-goals

### Goals

- Mengurangi waktu transaksi untuk meja yang jauh dari kasir.
- Memberi kasir informasi kembalian sebelum berangkat ke meja.
- Menjaga status pembayaran tetap akurat.
- Menjaga laporan penjualan tetap berdasarkan uang yang benar-benar diterima.
- Menjaga alur KDS yang sudah ada.
- Menyediakan validasi server untuk nominal tunai.
- Menyediakan test backend, RTL, dan E2E.

### Non-goals

- Tidak ada pembayaran online atau payment gateway.
- Tidak ada pembayaran sebagian lewat QR.
- Tidak ada status pembayaran `PENDING`.
- Tidak ada perubahan pada alur takeaway.
- Tidak ada perubahan pada RBAC.
- Tidak ada perubahan pada perhitungan pajak atau diskon.
- Tidak ada pencetakan struk baru.
- Tidak ada perubahan pada KDS.

### Anti-goals

- Menandai pesanan `PAID` saat pelanggan mengirim nominal tunai.
- Mencatat nominal 55K sebagai pendapatan untuk tagihan 50K.
- Menyimpan nominal tunai di `notes`.
- Membuat ulang perhitungan pembayaran di client sebagai sumber kebenaran.
- Menahan pesanan dari KDS sampai kasir menyetujui nominal.
- Menambahkan status pesanan baru untuk konfirmasi tunai.

## 3. Keputusan yang dikunci

1. Pesanan langsung masuk KDS setelah pelanggan mengirim pesanan.
2. Metode pembayaran dipilih eksplisit di keranjang.
3. Tidak ada metode default. Tombol kirim nonaktif sampai pelanggan memilih metode.
4. Tunai wajib minimal sebesar total pesanan.
5. Tunai di atas total diperbolehkan. Selisihnya adalah kembalian.
6. Tunai di bawah total ditolak oleh client dan server.
7. Deklarasi tunai disimpan di `orders.cash_tendered`.
8. `cash_tendered = null` berarti pelanggan memilih bayar di kasir.
9. Pembayaran dicatat kasir setelah serah-terima.
10. Payment amount tidak pernah melebihi sisa tagihan.
11. Kembalian dihitung dari nominal aktual yang diterima kasir minus sisa tagihan.
12. `cash_tendered` tidak berubah ketika kasir mencatat pembayaran.
13. Public order response dan public status menyertakan `cashTendered`.
14. Idempotent response menyimpan `cashTendered` yang sama.

## 4. Alur pengguna

### 4.1 Pelanggan memilih tunai

1. Pelanggan memindai QR meja.
2. Pelanggan memilih menu dan membuka keranjang.
3. Pelanggan memilih `Tunai, siapkan kembalian`.
4. Pelanggan mengisi `Uang tunai`.
5. Sistem menampilkan total dan kembalian.
6. Pelanggan menekan `Kirim pesanan`.
7. Server memvalidasi item, harga, total, dan nominal tunai.
8. Pesanan dibuat dengan `cash_tendered` terisi dan `paymentStatus = UNPAID`.
9. Pesanan masuk KDS.
10. Pelanggan melihat nomor pesanan dan instruksi kembalian.
11. Kasir melihat pesanan pada daftar pesanan perlu dibayar.
12. Kasir menyiapkan kembalian dan membawanya ke meja.
13. Kasir menerima uang dan menyerahkan kembalian.
14. Kasir membuka pembayaran dan mencatat uang yang diterima.
15. Status pembayaran berubah menjadi `PAID` jika tagihan lunas.

### 4.2 Pelanggan memilih bayar di kasir

1. Pelanggan memilih `Bayar di kasir`.
2. Pelanggan mengirim pesanan tanpa nominal tunai.
3. Pesanan dibuat dengan `cash_tendered = null`.
4. Pesanan masuk KDS.
5. Pembayaran dicatat kasir melalui alur POS yang sudah ada.

### 4.3 Kasir mencatat pembayaran

1. Kasir membuka `Pesanan perlu dibayar`.
2. Kasir melihat `Tunai disiapkan` dan `Kembalian`.
3. Kasir membuka drawer pembayaran.
4. `Uang diterima` terisi nominal tunai pelanggan.
5. Kasir dapat mengubah nominal sesuai uang aktual.
6. Sistem menghitung applied amount sampai sisa tagihan.
7. Kasir menekan `Catat pembayaran`.
8. Payment tercatat sebesar applied amount.
9. Kembalian ditampilkan, tetapi tidak disimpan sebagai pendapatan.

## 5. Model data dan migration

### 5.1 Kolom baru

Tambahkan ke `orders`:

```ts
cashTendered: integer("cash_tendered"),
```

Nullable. Tidak ada default. Tidak ada backfill.

### 5.2 Check constraint

```sql
cash_tendered IS NULL OR cash_tendered >= grand_total
```

Validasi aplikasi tetap wajib. Check constraint adalah lapisan pertahanan terakhir.

### 5.3 Migration

Jalankan:

```bash
pnpm db:generate
```

Expected: migration baru `drizzle/0004_*.sql` yang menambahkan `cash_tendered` dan check constraint. Commit file migration dan metadata.

### 5.4 Domain type

`Order` mendapat field:

```ts
cashTendered: number | null;
```

Field wajib pada type. Semua fixture `Order` di test harus diisi `cashTendered: null` atau nilai tunai.

### 5.5 Yang tidak berubah

- `paymentStatus` tetap memakai `UNPAID`, `PARTIALLY_PAID`, `PAID`, `REFUNDED`.
- Tabel `payments` tidak berubah.
- Tidak ada kolom `change_due`.
- Kembalian dihitung dari `cashTendered - grandTotal` atau `actualTendered - remaining`.
- Laporan penjualan tetap memakai payment record.

## 6. Kontrak API

### 6.1 `POST /api/public/orders`

Request baru:

```json
{
  "tableToken": "token-meja",
  "notes": "",
  "cashTendered": 55000,
  "items": [
    {
      "productId": "product-kopi-susu",
      "variantId": null,
      "addOnIds": [],
      "quantity": 2,
      "notes": ""
    }
  ]
}
```

Aturan:

- `cashTendered` bertipe integer positif atau `null`.
- `null` berarti bayar di kasir.
- Nilai kurang dari total menghasilkan `VALIDATION_FAILED`.
- Header `Idempotency-Key` tetap wajib.

Response `201`:

```json
{
  "orderNumber": "RVK-1234",
  "publicToken": "public-token",
  "grandTotal": 50000,
  "cashTendered": 55000,
  "tableName": "Meja 04"
}
```

Response idempotent replay harus memuat `cashTendered` yang sama.

### 6.2 `GET /api/public/orders/:publicToken`

Response baru menyertakan:

```json
{
  "cashTendered": 55000
}
```

Tidak ada data pengguna internal, payment record, atau pesanan lain.

### 6.3 Endpoint internal

Tidak ada endpoint baru.

Endpoint pembayaran yang ada tetap:

```text
POST /api/orders/:id/payments
```

Payment amount tetap dibatasi sisa tagihan oleh service yang ada.

## 7. Aturan backend

### 7.1 Validasi public order

Di `createOrderInternal`, setelah subtotal dihitung:

```ts
const cashTendered = options.cashTendered ?? null;

if (cashTendered !== null && cashTendered < subtotal) {
  throw AppError.validation([
    {
      path: "cashTendered",
      message: "Nominal tunai kurang dari total pesanan.",
    },
  ]);
}
```

Jangan memakai nominal dari client untuk menghitung subtotal.

### 7.2 Penyimpanan

Simpan `cashTendered` pada insert order. Nilai tetap `null` untuk pesanan kasir.

### 7.3 Mapping response

`mapOrders` wajib memetakan `row.cashTendered`.

Public order route wajib mengembalikan `cashTendered`.

Public status route wajib mengembalikan `cashTendered`.

Idempotent response body wajib menyimpan `cashTendered`.

### 7.4 Payment

Tidak ada perubahan pada `recordPayment`.

Payment amount:

- tetap dibatasi `remaining`;
- tetap menghasilkan `PARTIALLY_PAID` atau `PAID`;
- tidak memasukkan kembalian.

### 7.5 Status pesanan

Tidak ada status pesanan baru. Pesanan QR tetap `NEW` dan langsung masuk KDS.

## 8. Frontend pelanggan

### 8.1 Keranjang

Tambahkan fieldset:

```text
Metode pembayaran
( ) Tunai, siapkan kembalian
( ) Bayar di kasir
```

Tidak ada pilihan default.

Jika belum memilih:

```text
Pilih metode pembayaran sebelum mengirim pesanan.
```

Tombol `Kirim pesanan` nonaktif.

### 8.2 Input tunai

Label:

```text
Uang tunai
```

Gunakan:

```tsx
type="text"
inputMode="numeric"
```

Gunakan `parseCurrencyInput` dari `@/lib/format`. Jangan memakai `type="number"` karena scroll mouse dapat mengubah nominal.

### 8.3 Ringkasan tunai

Tampilkan:

```text
Total       Rp50.000
Kembalian   Rp5.000
```

Jika nominal kurang:

```text
Nominal kurang Rp5.000.
```

Tombol kirim nonaktif.

### 8.4 Payload

```ts
cashTendered: paymentChoice === "CASH" ? cashTendered : null
```

`cashTendered` dihitung dengan `parseCurrencyInput(cashInput)`.

### 8.5 Dialog sukses

Jika tunai:

```text
Kasir akan membawa kembalian Rp5.000 ke meja.
```

Jika bayar di kasir:

```text
Pembayaran dilakukan di kasir.
```

### 8.6 Status publik

Jika tunai dan belum dibayar:

```text
Tunai Rp55.000, kembalian Rp5.000. Pembayaran dicatat kasir setelah serah-terima.
```

Jika tunai dan sudah dibayar:

```text
Tunai Rp55.000, kembalian Rp5.000.
```

Jika `cashTendered` null, pertahankan teks lama:

```text
Pembayaran dilakukan di kasir.
```

## 9. Frontend kasir

### 9.1 Daftar pesanan perlu dibayar

Untuk pesanan dengan `cashTendered !== null`, tampilkan:

```text
Tunai disiapkan Rp55.000
Kembalian Rp5.000
```

Letakkan sebelum tombol `Bayar`.

### 9.2 Drawer pembayaran

Default `Uang diterima`:

```ts
paid === 0 ? (order.cashTendered ?? remaining) : remaining
```

Saat metode berubah:

- `CASH`: gunakan nilai default di atas.
- Digital: gunakan `remaining`.

Jika deklarasi tunai ada dan belum ada pembayaran, tampilkan:

```text
Pelanggan menyiapkan Rp55.000. Konfirmasi setelah uang diterima.
```

Payment amount tetap dihitung dengan aturan lama:

```ts
applied = Math.min(actualTendered, remaining)
change = Math.max(0, actualTendered - remaining)
```

### 9.3 Setelah serah-terima

Kasir mencatat pembayaran setelah menerima uang. Tidak ada auto-paid dari KDS atau status pesanan.

## 10. UI copy

Gunakan copy berikut:

| Konteks         | Copy                                                               |
| --------------- | ------------------------------------------------------------------ |
| Metode          | `Metode pembayaran`                                                |
| Tunai           | `Tunai, siapkan kembalian`                                         |
| Kasir           | `Bayar di kasir`                                                   |
| Input           | `Uang tunai`                                                       |
| Belum pilih     | `Pilih metode pembayaran sebelum mengirim pesanan.`                |
| Kembalian       | `Kembalian`                                                        |
| Kurang          | `Nominal kurang Rp5.000.`                                          |
| Sukses tunai    | `Kasir akan membawa kembalian Rp5.000 ke meja.`                    |
| Kasir melihat   | `Tunai disiapkan Rp55.000`                                         |
| Pengingat kasir | `Pelanggan menyiapkan Rp55.000. Konfirmasi setelah uang diterima.` |

Jangan memakai em dash atau middle dot untuk metadata.

## 11. Testing

### 11.1 Integration

File: `tests/integration/phase6.test.ts`

Test wajib:

- public order dengan `cashTendered` 70000 untuk total 64000 tersimpan;
- `paymentStatus` tetap `UNPAID`;
- `cashTendered` 10000 untuk total 64000 ditolak `VALIDATION_FAILED`;
- idempotent replay memuat `cashTendered` yang sama.

### 11.2 RTL pelanggan

File: `tests/rtl/customer-menu.test.tsx`

Test wajib:

- memilih `Bayar di kasir` mengirim `cashTendered: null`;
- memilih tunai 35000 untuk total 30000 menampilkan kembalian 5000;
- payload mengirim `cashTendered: 35000`;
- tunai 25000 memblokir submit dan menampilkan kekurangan;
- dialog sukses menampilkan instruksi kembalian.

File: `tests/rtl/customer-order-status.test.tsx`

Test wajib:

- payload tunai menampilkan nominal dan kembalian;
- payload tanpa tunai tetap menampilkan teks bayar di kasir.

### 11.3 RTL kasir

File: `tests/rtl/pos-checkout.test.tsx`

Test wajib:

- drawer pembayaran terisi 30000 untuk order 28000 dengan `cashTendered: 30000`;
- kembalian 2000 tampil;
- payment yang dikirim tetap 28000;
- daftar pesanan perlu dibayar menampilkan tunai dan kembalian.

### 11.4 E2E

File: `tests/e2e/customer-qr.spec.ts`

Test wajib:

- pelanggan memilih tunai;
- mengisi 20000 untuk produk 18000;
- melihat kembalian 2000;
- pesanan berhasil dibuat dan status publik terbuka.

### 11.5 Regression

Wajib lulus:

- pembayaran tunai lama;
- split payment;
- refund;
- KDS;
- laporan penjualan;
- public order tanpa tunai.

## 12. File map

### Backend

- `src/infrastructure/database/schema/operations.ts`
- `drizzle/0004_*.sql`
- `drizzle/meta/*`
- `src/types/domain.ts`
- `src/modules/orders/order.schemas.ts`
- `src/modules/orders/order.service.ts`
- `src/app/api/public/orders/route.ts`
- `src/app/api/public/orders/[publicToken]/route.ts`

### Frontend pelanggan

- `src/features/customer/api.ts`
- `src/app/(customer)/menu/[token]/page.tsx`
- `src/features/operational/customer-order-status.tsx`

### Frontend kasir

- `src/features/operational/pos-payable-order-drawer.tsx`
- `src/features/operational/pos-payment-drawer.tsx`

### Test

- `tests/integration/phase6.test.ts`
- `tests/rtl/customer-menu.test.tsx`
- `tests/rtl/customer-order-status.test.tsx`
- `tests/rtl/pos-checkout.test.tsx`
- `tests/e2e/customer-qr.spec.ts`
- `tests/rtl/reports.test.tsx`
- `tests/rtl/orders-refund.test.tsx`
- `tests/rtl/order-detail-timeline.test.tsx`

### Dokumentasi

- `docs/PRD.md`
- `docs/specification/phase-11-public-order-cash-declaration.md`

## 13. Urutan implementasi

### Task 1: Backend cash declaration

- [x] Tulis integration test tunai dan validasi kurang.
- [x] Jalankan test, pastikan gagal.
- [x] Tambah kolom `cash_tendered` dan check constraint.
- [x] Jalankan `pnpm db:generate`.
- [x] Tambah `cashTendered` ke `Order`.
- [x] Tambah `cashTendered` ke `publicOrderCreateSchema`.
- [x] Validasi dan simpan di `createOrderInternal`.
- [x] Tambah ke response public order dan public status.
- [x] Tambah ke idempotent response.
- [x] Update fixture `Order`.
- [x] Jalankan test dan `pnpm check`.
- [x] Commit: `feat: store declared cash on public orders`.

### Task 2: Public cart dan status

- [x] Tulis RTL tunai, bayar di kasir, dan nominal kurang.
- [x] Tambah tipe `cashTendered` di API client.
- [x] Tambah fieldset metode pembayaran.
- [x] Tambah input tunai dan ringkasan kembalian.
- [x] Validasi client dan disable submit.
- [x] Tambah instruksi kembalian di dialog sukses.
- [x] Tampilkan tunai dan kembalian di status publik.
- [x] Update E2E QR.
- [x] Jalankan RTL dan E2E.
- [x] Commit: `feat: let qr customers declare cash and see change`.

### Task 3: Cashier visibility dan payment

- [x] Tulis RTL prefill dan payable list.
- [x] Tampilkan tunai dan kembalian di daftar pesanan perlu dibayar.
- [x] Prefill drawer pembayaran dari deklarasi.
- [x] Tampilkan pengingat konfirmasi setelah serah-terima.
- [x] Pastikan payment amount tetap sebesar tagihan.
- [x] Jalankan RTL dan `pnpm check`.
- [x] Commit: `feat: show declared cash to cashier`.

### Task 4: Dokumentasi dan verifikasi penuh

- [x] Update `docs/PRD.md`.
- [x] Jalankan `pnpm check`.
- [x] Jalankan `pnpm test`.
- [x] Jalankan `pnpm build`.
- [x] Jalankan `pnpm test:e2e`.
- [x] Commit: `docs: document qr cash declaration flow`.

## 14. Acceptance criteria

- [x] Pelanggan dapat memilih tunai atau bayar di kasir.
- [x] Tunai tanpa nominal tidak dapat dikirim.
- [x] Tunai kurang dari total ditolak client dan server.
- [x] Tunai lebih besar dari total menampilkan kembalian.
- [x] Pesanan tunai langsung masuk KDS.
- [x] Pesanan tunai tetap `UNPAID` setelah dibuat.
- [x] Kasir melihat nominal tunai dan kembalian.
- [x] Drawer pembayaran terisi nominal tunai pelanggan.
- [x] Payment tercatat maksimal sebesar sisa tagihan.
- [x] Kembalian tidak masuk laporan penjualan.
- [x] Kasir dapat mencatat pembayaran setelah serah-terima.
- [x] Public status menampilkan tunai dan kembalian.
- [x] Public status tidak menampilkan data internal.
- [x] Idempotent retry mengembalikan `cashTendered` yang sama.
- [x] Alur bayar di kasir tetap bekerja.
- [x] Semua test dan build lulus.

## 15. Risiko dan mitigasi

| Risiko                                              | Dampak                            | Mitigasi                                                          |
| --------------------------------------------------- | --------------------------------- | ----------------------------------------------------------------- |
| Kasir lupa mencatat pembayaran setelah serah-terima | Pesanan tetap `UNPAID`            | Tetap tampil di daftar pesanan perlu dibayar dan public status    |
| Pelanggan mengubah request tunai                    | Nominal tidak valid               | Validasi server terhadap subtotal                                 |
| Kembalian dianggap pendapatan                       | Laporan salah                     | Payment amount dibatasi sisa tagihan                              |
| Harga berubah setelah menu dimuat                   | Nominal tunai bisa kurang         | Server menolak dan client menampilkan error                       |
| Kasir mencatat nominal berbeda                      | Kembalian berubah                 | Drawer menghitung dari nominal aktual dan payment amount dibatasi |
| Kasir mencatat sebelum uang diterima                | Status lebih cepat dari kenyataan | Copy pengingat dan flow yang disepakati                           |

## 16. Definition of Done

- [x] Migration dan check constraint tersedia.
- [x] Domain type dan API client konsisten.
- [x] Backend memvalidasi tunai.
- [x] Public cart, sukses, dan status diperbarui.
- [x] Kasir melihat tunai dan kembalian.
- [x] Payment tetap akurat.
- [x] Test integration, RTL, dan E2E lulus.
- [x] `pnpm check` lulus.
- [x] `pnpm test` lulus.
- [x] `pnpm build` lulus.
- [x] `pnpm test:e2e` lulus.
- [x] PRD diperbarui.
- [x] Tidak ada perubahan di luar scope.

## Appendix A: Contoh request dan response

### Public order tunai

```http
POST /api/public/orders
Content-Type: application/json
Idempotency-Key: 8f2c1a9e-...
```

```json
{
  "tableToken": "token-meja",
  "notes": "",
  "cashTendered": 55000,
  "items": [
    {
      "productId": "product-kopi-susu",
      "variantId": null,
      "addOnIds": [],
      "quantity": 2,
      "notes": ""
    }
  ]
}
```

```json
{
  "orderNumber": "RVK-1234",
  "publicToken": "public-token",
  "grandTotal": 50000,
  "cashTendered": 55000,
  "tableName": "Meja 04"
}
```

### Public order bayar di kasir

```json
{
  "tableToken": "token-meja",
  "notes": "",
  "cashTendered": null,
  "items": [
    {
      "productId": "product-kopi-susu",
      "variantId": null,
      "addOnIds": [],
      "quantity": 1,
      "notes": ""
    }
  ]
}
```

### Public status

```json
{
  "orderNumber": "RVK-1234",
  "orderStatus": "NEW",
  "paymentStatus": "UNPAID",
  "grandTotal": 50000,
  "cashTendered": 55000,
  "tableName": "Meja 04",
  "createdAt": "2026-11-19T12:00:00.000Z",
  "items": []
}
```

### Record payment

```http
POST /api/orders/order-id/payments
Content-Type: application/json
Idempotency-Key: 4b7d...
```

```json
{
  "method": "CASH",
  "amount": 50000,
  "reference": "",
  "notes": "",
  "verified": false
}
```

Kembalian 5000 tidak dikirim ke endpoint pembayaran.

## Appendix B: Checklist implementasi

- [x] T1 migration `cash_tendered`
- [x] T1 check constraint
- [x] T1 domain `Order.cashTendered`
- [x] T1 validasi server
- [x] T1 public order response
- [x] T1 public status response
- [x] T1 idempotent response
- [x] T1 integration test
- [x] T2 fieldset metode pembayaran
- [x] T2 input tunai
- [x] T2 kembalian live
- [x] T2 validasi kurang
- [x] T2 dialog sukses
- [x] T2 status publik
- [x] T2 RTL customer
- [x] T2 E2E customer
- [x] T3 payable list tunai
- [x] T3 prefill payment drawer
- [x] T3 pengingat serah-terima
- [x] T3 RTL kasir
- [x] T4 PRD
- [x] T4 `pnpm check`
- [x] T4 `pnpm test`
- [x] T4 `pnpm build`
- [x] T4 `pnpm test:e2e`
