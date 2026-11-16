# RAVIKA POS - Spesifikasi Fase 3: Operational UI

**Status:** Approved scope, siap implementasi
**Fase:** 3, Operational Interface
**Tanggal:** 16 November 2026
**Referensi utama:** `docs/PRD.md`, `docs/ROADMAP.md`, `docs/design/design-brief.md`, `docs/design/design-direction.md`, `docs/design/design-system.md`, `docs/design/ui-ux-guidelines.md`, `docs/specification/phase-2-management-ui.md`

## Daftar isi

- [0. Agent quick start](#0-agent-quick-start)
- [0.1 Prioritas dokumen](#01-prioritas-dokumen)
- [0.2 Istilah](#02-istilah)
- [1. Ringkasan](#1-ringkasan)
- [2. Goals, non-goals, anti-goals](#2-goals-non-goals-anti-goals)
- [3. Keputusan yang dikunci](#3-keputusan-yang-dikunci)
- [4. Dependency](#4-dependency)
- [5. Arsitektur](#5-arsitektur)
- [6. Domain types](#6-domain-types)
- [7. Service contract](#7-service-contract)
- [8. Aturan bisnis operasional](#8-aturan-bisnis-operasional)
- [9. Navigasi dan route](#9-navigasi-dan-route)
- [10. Page specification](#10-page-specification)
- [11. Shared components](#11-shared-components)
- [12. Form specification](#12-form-specification)
- [13. Mock data dan seed](#13-mock-data-dan-seed)
- [14. State handling](#14-state-handling)
- [15. Responsive](#15-responsive)
- [16. Accessibility](#16-accessibility)
- [17. Copywriting](#17-copywriting)
- [18. QA matrix](#18-qa-matrix)
- [19. Acceptance criteria](#19-acceptance-criteria)
- [20. Delivery Gate](#20-delivery-gate)
- [21. Implementation order](#21-implementation-order)
- [22. File map](#22-file-map)
- [23. Risks](#23-risks)
- [24. Open items dari PRD](#24-open-items-dari-prd)
- [25. Handoff ke Fase 4](#25-handoff-ke-fase-4)

## 0. Agent quick start

Baca dokumen ini sebelum mengubah POS, KDS, QR Menu, atau data operasional.

Aturan wajib:

1. Fase 3 hanya frontend. Jangan membuat backend, database, API, autentikasi nyata, atau SSE.
2. Gunakan satu mock store dan satu mock service yang sudah ada di `src/mocks/management`. Jangan membuat mock POS, KDS, atau QR terpisah.
3. Gunakan `Product`, `Order`, `Payment`, dan `DiningTable` dari `src/types/domain.ts`. Jangan membuat tipe produk atau order duplikat.
4. Jangan menambah dependency selain `qrcode.react` untuk generator QR.
5. Jangan menambah TanStack Query, Zustand, payment gateway, QR scanner, atau test runner.
6. Jangan menambah pajak, diskon, biaya layanan, refund, atau field pelanggan yang belum final.
7. Jangan membuat takeaway QR. Takeaway QR ditunda sampai OPEN-009 dan OPEN-010 final.
8. Order dibuat dulu sebagai `NEW` dan `UNPAID`, lalu pembayaran dicatat dari POS.
9. Pembayaran hanya di POS. Halaman management Payments tetap read-only.
10. QR meja sekarang scannable. Gunakan `qrcode.react`, bukan placeholder palsu.
11. Sinkronkan store antar tab dengan `BroadcastChannel`. Tidak ada persistence bisnis.
12. Pertahankan permission-aware navigation dan action.
13. Setiap halaman dan aksi harus memiliki loading, empty, error, dan success state yang relevan.
14. Jalankan `pnpm check` dan `pnpm build` sebelum menyatakan selesai.
15. Jalankan antislop Delivery Gate sebelum handoff.

### 0.1 Prioritas dokumen

Jika terjadi konflik:

1. `docs/PRD.md` untuk scope, business rules, dan status.
2. `docs/design/design-system.md` untuk token dan komponen.
3. `docs/design/design-direction.md` dan `docs/design/ui-ux-guidelines.md` untuk penerapan visual dan interaksi.
4. `docs/ROADMAP.md` untuk urutan fase.
5. Dokumen ini untuk keputusan implementasi Fase 3.

Jika requirement baru mengubah data model, business flow, permission, atau status, berhenti dan minta keputusan product owner.

### 0.2 Istilah

| Istilah            | Arti                                                             |
| ------------------ | ---------------------------------------------------------------- |
| POS                | Dedicated Cashier POS di `/app/pos`                              |
| KDS                | Kitchen Display System di `/kds`                                 |
| QR Menu            | Menu pelanggan di `/menu/[token]`                                |
| Status publik      | Halaman pelanggan di `/order/[publicToken]`                      |
| Order aktif        | Order dengan status `NEW`, `ACCEPTED`, `PREPARING`, atau `READY` |
| Payment diterapkan | Nilai payment yang disimpan setelah dibatasi oleh sisa tagihan   |
| Uang diterima      | Nominal tunai yang dimasukkan kasir                              |
| Kembalian          | Uang diterima dikurangi payment diterapkan                       |
| Token QR           | Token meja untuk membuka menu pelanggan                          |
| Public token       | Token order untuk membuka status pelanggan                       |
| BroadcastChannel   | Sinkronisasi mock store antar tab browser                        |

## 1. Ringkasan

Fase 3 menyelesaikan alur operasional utama RAVIKA POS dengan data dummy yang konsisten:

- Dedicated Cashier POS.
- Kitchen Display System.
- Customer QR Menu.
- Status pesanan pelanggan.
- Integrasi data operasional dengan management Orders, Payments, Tables, Dashboard, dan Reports.

Fase 3 tidak membuat backend, SSE nyata, atau persistence. Semua transaksi hanya simulasi frontend yang disinkronkan antar tab selama sesi browser.

## 2. Goals, non-goals, anti-goals

### Goals

- Kasir dapat membuat order dine-in dan takeaway.
- Kasir dapat memilih varian, add-on, kuantitas, dan catatan item.
- Kasir dapat memilih meja untuk dine-in.
- Kasir dapat mencatat pembayaran tunai, digital, dan split payment.
- KDS menampilkan order aktif dari store yang sama.
- Barista dapat mengubah status persiapan sesuai transisi PRD.
- Pelanggan dapat membuka menu dari QR meja tanpa akun.
- Pelanggan dapat mengirim order dan melihat status pesanan.
- Data POS, KDS, QR Menu, management Orders, dan Payments konsisten.
- Sinkronisasi antar tab berjalan tanpa backend.
- Loading, empty, error, dan success state tersedia.
- Layout responsive, light/dark, dan keyboard accessible.

### Non-goals

- Tidak ada backend, database, API, atau SSE nyata.
- Tidak ada persistence bisnis setelah semua tab ditutup.
- Tidak ada takeaway QR.
- Tidak ada refund.
- Tidak ada pajak, diskon, atau biaya layanan.
- Tidak ada payment gateway atau verifikasi otomatis.
- Tidak ada print struk.
- Tidak ada akun pelanggan.
- Tidak ada upload gambar produk.
- Tidak ada QR scanner internal.
- Tidak ada test runner baru.

### Anti-goals

- Mock POS, KDS, dan QR yang terpisah dan tidak konsisten.
- Order yang hanya muncul di satu halaman.
- KDS statis tanpa aksi status.
- Tombol yang tidak memiliki perilaku.
- Pembayaran yang mengubah status persiapan.
- Status persiapan yang mengubah status pembayaran.
- QR yang diklaim scannable tetapi berisi URL palsu.
- Data internal atau pelanggan lain tampil di halaman publik.
- Form tanpa validasi atau feedback.
- Layout rusak di mobile atau layar operasional.
- Aksi ganda akibat double submit.
- Cancel order berbayar tanpa jejak refund.

## 3. Keputusan yang dikunci

| Area                  | Keputusan                                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| Alur order            | Order dibuat `NEW` dan `UNPAID`, lalu pembayaran dicatat dari POS                                    |
| Pembayaran            | Hanya di POS. Management Payments read-only                                                          |
| Tunai                 | Boleh melebihi sisa tagihan. UI menghitung kembalian. Payment record menyimpan nilai yang diterapkan |
| Digital               | Tidak boleh melebihi sisa tagihan. Wajib konfirmasi verifikasi manual                                |
| Split payment         | Didukung                                                                                             |
| Cancel order berbayar | Ditolak jika ada payment `RECORDED`                                                                  |
| QR meja               | Scannable dengan `qrcode.react`                                                                      |
| Takeaway QR           | Ditunda sampai OPEN-009 dan OPEN-010 final                                                           |
| Status meja           | Otomatis `OCCUPIED` saat order dine-in dibuat                                                        |
| Meja `OCCUPIED`       | Boleh menerima order tambahan                                                                        |
| KDS                   | Hanya transisi maju, tanpa cancel                                                                    |
| Nomor order           | Kode outlet plus urutan, contoh `KMG-2025`                                                           |
| Daftar pesanan POS    | Hanya order `UNPAID` atau `PARTIALLY_PAID` yang belum `CANCELLED`                                    |
| Cart POS              | `sessionStorage`, bertahan setelah reload, hilang saat tab ditutup                                   |
| Sinkronisasi          | `BroadcastChannel`, full-state sync, tanpa persistence                                               |
| SSE                   | Tidak ada di Fase 3                                                                                  |
| Customer              | Tanpa akun, tanpa data pelanggan untuk dine-in                                                       |
| Status publik         | Lewat `publicToken` acak, hanya order yang cocok                                                     |
| Refund                | Tidak ada                                                                                            |
| Pajak/diskon          | Tidak ada                                                                                            |
| Dependency baru       | `qrcode.react`                                                                                       |

## 4. Dependency

Tambahkan:

- `qrcode.react`

Jangan tambahkan:

- TanStack Query
- Zustand
- Payment gateway
- QR scanner
- UI library
- Test runner
- SQLite, Drizzle, better-sqlite3
- SSE library

`qrcode.react` hanya untuk rendering QR. Tidak ada dependency baru untuk state, form, atau data fetching.

## 5. Arsitektur

### 5.1 Satu store operasional

Semua data operasional berasal dari `src/mocks/management/store.ts`.

Store yang sama dipakai oleh:

- POS
- KDS
- Customer QR Menu
- Customer order status
- Management Orders
- Management Payments
- Management Tables
- Dashboard
- Reports

Tidak boleh ada array produk, order, atau payment terpisah di komponen halaman.

### 5.2 Live view vs async service

Gunakan aturan berikut:

- View operasional yang harus live membaca store lewat `useManagementStore`.
- Mutasi dan validasi memakai `managementService`.
- Halaman management Phase 2 tetap memakai `useAsyncData` dan service.
- Jangan memakai selector yang membuat array baru setiap render. Ambil state mentah, lalu filter dengan `useMemo`.

Contoh:

```ts
const orders = useManagementStore((state) => state.orders);
const activeOrders = useMemo(
  () => orders.filter((order) => order.outletId === outletId),
  [orders, outletId],
);
```

### 5.3 BroadcastChannel

`store.ts` menambahkan sinkronisasi antar tab.

Channel:

```text
ravika-management-store
```

Pesan:

```ts
type StoreMessage =
  | { type: "request-state" }
  | { type: "state"; state: ManagementState }
  | { type: "reset"; state: ManagementState };
```

Perilaku:

- Saat store dibuat di browser, buka `BroadcastChannel`.
- Tab baru mengirim `request-state`.
- Tab yang sudah memiliki state membalas `state`.
- Respons pertama dipakai. Respons berikutnya diabaikan.
- Setiap `setState` mengirim state penuh ke tab lain.
- `reset()` mengirim `reset` dengan seed baru.
- Tab yang menerima state tidak mengirim ulang state.
- Jika `BroadcastChannel` tidak tersedia, store tetap berjalan lokal.
- Tidak ada localStorage atau database untuk data bisnis.

Beri komentar:

```ts
// shortcut: full-state BroadcastChannel sync, last write wins.
// Replace with API/SSE in Phase 6-7.
```

Konsekuensi yang diterima:

- Dua tab yang mengubah data bersamaan dapat saling menimpa.
- State hilang saat semua tab ditutup.
- Reload penuh memuat seed baru jika tidak ada tab lain yang membalas snapshot.

### 5.4 Session dan outlet

- `sessionStorage` tetap hanya untuk auth dan cart POS.
- Key auth: `ravika-session-user-id`.
- Key cart POS: `ravika-pos-cart`.
- POS memakai outlet aktif dari user yang login.
- Jika user memiliki lebih dari satu outlet, POS header menampilkan outlet switcher.
- Ganti outlet saat cart terisi meminta konfirmasi dan mengosongkan cart.
- KDS memakai outlet aktif yang dipilih di halaman KDS.
- Customer QR Menu memakai outlet dari token meja.

### 5.5 Permission

| Area                     | Permission                  |
| ------------------------ | --------------------------- |
| POS page                 | `orders.create`             |
| POS payment              | `payments.create`           |
| POS payable list         | `payments.view`             |
| KDS page                 | `kds.view`                  |
| KDS status action        | `kds.update_status`         |
| Management Orders cancel | `orders.cancel`             |
| Customer menu            | public, tanpa session       |
| Customer order status    | public, lewat `publicToken` |

Frontend permission hanya simulasi. Server authorization tetap Fase 6.

## 6. Domain types

### 6.1 Perubahan `Order`

Tambahkan:

```ts
export type Order = {
  // field Phase 2 tetap
  publicToken: string | null;
};
```

Aturan:

- `publicToken` hanya dibuat untuk order `source: "QR"`.
- Order `CASHIER` memakai `publicToken: null`.
- `publicToken` tidak boleh ditebak.
- Halaman publik hanya mencari order lewat token ini.

### 6.2 Input service

```ts
export type CreateOrderItemInput = {
  productId: string;
  variantId: string | null;
  addOnIds: string[];
  quantity: number;
  notes: string;
};

export type CreateOrderInput = {
  outletId: string;
  orderType: "DINE_IN" | "TAKEAWAY";
  tableId: string | null;
  tableToken?: string | null;
  source: "CASHIER" | "QR";
  createdBy: string | null;
  notes: string;
  items: CreateOrderItemInput[];
};

export type RecordPaymentInput = {
  orderId: string;
  method: "CASH" | "QRIS" | "TRANSFER" | "E_WALLET";
  amount: number;
  reference: string;
  notes: string;
  actorId: string;
};

export type OrderStatusUpdateInput = {
  orderId: string;
  nextStatus: "ACCEPTED" | "PREPARING" | "READY" | "COMPLETED";
  actorId: string;
};
```

### 6.3 Aturan snapshot

Order item menyimpan snapshot:

- `productId`
- `productName`
- `variantName`
- `addOns[].addOnId`
- `addOns[].name`
- `addOns[].price`
- `quantity`
- `unitPrice`
- `lineTotal`
- `notes`

Perubahan produk setelah order dibuat tidak boleh mengubah order lama.

### 6.4 Tidak ada field baru yang dilarang

Jangan menambah:

- `taxTotal`
- `discountTotal`
- `serviceFee`
- `customerName`
- `customerPhone`
- `refund`
- `tenderedAmount` di payment record

Uang diterima dan kembalian hanya nilai UI. Payment record menyimpan nilai yang diterapkan.

## 7. Service contract

Tambahkan method berikut ke `managementService`.

### 7.1 `createOrder`

```ts
createOrder(input: CreateOrderInput): Promise<Order>
```

Validasi:

- Outlet ada dan aktif.
- `source: "CASHIER"` wajib memiliki `createdBy`.
- `source: "QR"` wajib `createdBy: null`.
- `DINE_IN` wajib memiliki meja.
- Meja harus ada, aktif, dan berada di outlet yang sama.
- Meja `INACTIVE` ditolak.
- Untuk `source: "QR"`, `tableToken` wajib cocok dengan `qrToken` meja.
- Token QR yang sudah diganti ditolak.
- `TAKEAWAY` tidak boleh memiliki meja.
- Item minimal 1.
- Quantity minimal 1.
- Produk ada, aktif, dan tersedia.
- Varian harus ada dan aktif jika produk memiliki varian aktif.
- Produk tanpa varian tidak boleh menerima `variantId`.
- Add-on harus ada, aktif, dan terhubung ke produk.
- Add-on wajib, minimum, dan maksimum harus terpenuhi.
- Harga dihitung ulang dari store.
- Subtotal dan total dihitung dari store.
- Order kosong ditolak.
- Nomor order dibuat unik per outlet.
- Status awal `NEW`.
- Payment status awal `UNPAID`.
- `publicToken` dibuat untuk QR.
- Table status menjadi `OCCUPIED` untuk dine-in.
- Status history awal `NEW` ditambahkan.
- Mutasi berhasil menulis satu state baru.

Return order yang dibuat.

### 7.2 `updateOrderStatus`

```ts
updateOrderStatus(input: OrderStatusUpdateInput): Promise<Order>
```

Transisi yang diizinkan:

```text
NEW -> ACCEPTED
ACCEPTED -> PREPARING
PREPARING -> READY
READY -> COMPLETED
```

Aturan:

- Transisi lain ditolak.
- `CANCELLED` tidak boleh lewat method ini.
- Order yang sudah `COMPLETED` atau `CANCELLED` tidak bisa diubah.
- Actor wajib ada.
- Status history ditambahkan.
- `updatedAt` diperbarui.
- Saat `COMPLETED`, meja dilepas jika tidak ada order aktif lain.
- Payment status tidak berubah.

### 7.3 `recordPayment`

```ts
recordPayment(input: RecordPaymentInput): Promise<{
  payment: Payment;
  order: Order;
}>
```

Validasi:

- Order ada.
- Order belum `CANCELLED`.
- Payment status belum `REFUNDED`.
- `amount` integer lebih dari 0.
- `amount` tidak melebihi sisa tagihan.
- Metode valid.
- Actor ada.
- Referensi dan catatan boleh kosong.
- Verifikasi digital adalah validasi UI. Service tidak menyimpan field verifikasi.

Perilaku:

- Tambah payment `RECORDED`.
- Hitung ulang total payment `RECORDED`.
- Hitung status pembayaran:
  - `UNPAID` jika total 0.
  - `PARTIALLY_PAID` jika 0 < total < grandTotal.
  - `PAID` jika total >= grandTotal.
- Jangan mengubah status persiapan.
- Kembalikan payment dan order terbaru.

### 7.4 `listPayableOrders`

```ts
listPayableOrders(outletId: string): Promise<Order[]>
```

Mengembalikan order:

- Outlet cocok.
- `paymentStatus` `UNPAID` atau `PARTIALLY_PAID`.
- `orderStatus` bukan `CANCELLED`.
- Urut dari `createdAt` terbaru.

### 7.5 `getOrderByPublicToken`

```ts
getOrderByPublicToken(token: string): Promise<Order | null>
```

Mengembalikan order dengan `publicToken` yang cocok. Token kosong atau tidak cocok menghasilkan `null`.

### 7.6 `validateTableToken`

```ts
validateTableToken(token: string): Promise<{
  table: DiningTable;
  outlet: Outlet;
} | null>
```

Validasi:

- Token tidak kosong.
- Meja ditemukan lewat `qrToken`.
- Meja aktif.
- Meja bukan `INACTIVE`.
- Outlet meja ada dan aktif.

Meja `AVAILABLE` dan `OCCUPIED` valid. `OCCUPIED` berarti meja boleh menerima order tambahan.

### 7.7 `cancelOrder` yang diperbarui

`cancelOrder(id, reason, actorId)` tetap ada, dengan tambahan:

- Tolak jika ada payment `RECORDED`.
- Tolak jika order `COMPLETED` atau `CANCELLED`.
- Hanya `NEW`, `ACCEPTED`, `PREPARING` yang bisa dibatalkan.
- Tambah status history `CANCELLED`.
- Lepas meja jika tidak ada order aktif lain.

Pesan error:

```text
Pesanan dengan pembayaran tercatat tidak dapat dibatalkan. Refund belum tersedia di Fase 3.
```

### 7.8 Helper internal

Helper yang disarankan:

```ts
function remainingAmount(order: Order): number
function recalculatePaymentStatus(orderId: string): PaymentStatus
function nextOrderNumber(outletId: string): string
function activeOrdersForTable(tableId: string): Order[]
function syncTableOccupancy(tableId: string): void
function makePublicToken(): string
function calculateOrderItems(input: CreateOrderInput): OrderItem[]
```

### 7.9 Guard status meja

`updateTable` dan `setTableStatus` harus menolak perubahan status menjadi `AVAILABLE` atau `INACTIVE` jika meja masih memiliki order aktif.

Pesan error:

```text
Meja masih memiliki pesanan aktif. Selesaikan atau batalkan pesanan terlebih dahulu.
```

Perubahan nama, outlet, dan `isActive` tetap boleh selama tidak membuat meja nonaktif dengan order aktif. Jika `isActive` diubah menjadi false, perlakukan sama seperti `INACTIVE`.

## 8. Aturan bisnis operasional

### 8.1 Order number

Format:

```text
<OUTLET_CODE>-<URUTAN>
```

Contoh:

```text
KMG-2025
SNP-2026
```

Aturan:

- Ambil angka terakhir dari nomor order outlet yang ada.
- Nomor baru adalah maksimum + 1.
- Jika belum ada order, mulai dari 2001.
- Nomor harus unik per outlet.
- Nomor tidak berubah setelah order dibuat.

### 8.2 Status meja

Order aktif adalah order dengan status:

- `NEW`
- `ACCEPTED`
- `PREPARING`
- `READY`

Aturan:

- Order dine-in baru membuat meja `OCCUPIED`.
- Order takeaway tidak mengubah meja.
- Meja `OCCUPIED` boleh menerima order tambahan.
- Meja `INACTIVE` tidak boleh menerima order.
- Saat order `COMPLETED` atau `CANCELLED`, cek order aktif lain di meja yang sama.
- Jika tidak ada order aktif lain dan status meja `OCCUPIED`, ubah menjadi `AVAILABLE`.
- Jika status meja `INACTIVE`, jangan ubah otomatis.
- Payment status tidak memengaruhi status meja.
- Dari management Tables, perubahan status menjadi `AVAILABLE` atau `INACTIVE` ditolak jika meja masih memiliki order aktif.
- Pesan error: "Meja masih memiliki pesanan aktif. Selesaikan atau batalkan pesanan terlebih dahulu."

### 8.3 Status pembayaran

Status dihitung dari payment `RECORDED`.

```text
total = sum(payment.amount where status RECORDED)
UNPAID jika total = 0
PARTIALLY_PAID jika 0 < total < grandTotal
PAID jika total >= grandTotal
```

Payment `REFUNDED` tidak dihitung.

### 8.4 Uang tunai dan kembalian

Untuk CASH:

- Input adalah uang diterima.
- `applied = min(tendered, remaining)`.
- `change = max(0, tendered - remaining)`.
- Payment record memakai `applied`.
- Jika `tendered < remaining`, pembayaran menjadi partial.
- Jika `tendered >= remaining`, pembayaran melunasi sisa.

Contoh:

```text
Sisa tagihan: Rp 50.000
Uang diterima: Rp 100.000
Payment record: Rp 50.000
Kembalian: Rp 50.000
```

Untuk QRIS, TRANSFER, E_WALLET:

- Nominal tidak boleh melebihi sisa.
- Wajib centang verifikasi manual.
- Tidak ada kembalian.

### 8.5 Cancel dan payment

- Cancel order yang sudah memiliki payment `RECORDED` ditolak.
- Refund tidak tersedia.
- Payment `REFUNDED` dari seed tetap ditampilkan sebagai data historis, tetapi tidak ada aksi refund baru.
- Cancel tidak menghapus order.
- Cancel menambah status history.

### 8.6 QR token

- Token QR adalah string acak dan tidak memuat data pribadi.
- Token seed harus terlihat acak, bukan `demo-table-1`.
- Token baru dibuat saat create table dan regenerate.
- Regenerate membuat token lama invalid.
- Order QR yang dikirim dari halaman lama dengan token yang sudah diganti ditolak oleh service.
- QR URL memakai origin aplikasi:

```text
window.location.origin + "/menu/" + token
```

- Jika aplikasi dibuka lewat `localhost`, ponsel tidak bisa memindai. Demo harus lewat IP LAN.
- Token publik order (`publicToken`) berbeda dari token QR meja.
- `publicToken` hanya untuk status order.

### 8.7 Customer

- Customer tidak login.
- Customer tidak mengisi nama atau telepon untuk dine-in.
- Customer melihat outlet dan meja dari token.
- Customer tidak melihat data internal.
- Customer tidak bisa mengakses order lain.
- Pembayaran dilakukan di kasir.

## 9. Navigasi dan route

Route yang dipakai:

| Route                  | Page                   |
| ---------------------- | ---------------------- |
| `/app/pos`             | Dedicated POS          |
| `/kds`                 | Kitchen Display System |
| `/menu/[token]`        | Customer QR Menu       |
| `/order/[publicToken]` | Customer order status  |

Tidak ada route detail order baru. Detail operasional memakai drawer atau dialog.

Management route yang sudah ada tetap:

- `/app/orders`
- `/app/payments`
- `/app/tables`
- `/app`
- `/app/reports`

## 10. Page specification

### 10.1 POS shell

Tujuan: shell kasir yang fokus pada transaksi.

Header desktop:

- Brand RAVIKA POS.
- Outlet switcher.
- Nama kasir.
- Connection indicator.
- Theme toggle.
- Tombol pesanan perlu dibayar.
- Tombol keluar POS.

Header mobile:

- Brand.
- Connection indicator.
- Theme toggle.
- Tombol keranjang.
- Tombol pesanan.
- Tombol keluar.

Aturan:

- Jangan tampilkan navigasi dashboard.
- Outlet switcher hanya muncul jika user punya lebih dari satu outlet.
- Ganti outlet dengan cart terisi meminta konfirmasi.
- Konfirmasi ganti outlet mengosongkan cart.
- Cart tetap dapat diakses di mobile lewat drawer.
- Jangan mengecilkan dua panel desktop menjadi dua kolom sempit.

### 10.2 POS product discovery

Konten:

- Search produk.
- Kategori dari store.
- Grid produk aktif dan tersedia.
- Product card menampilkan nama, kategori, harga, status.
- Produk dengan varian menampilkan "Mulai dari".
- Produk habis tidak bisa ditambahkan.
- Klik produk atau tombol tambah membuka configurator jika perlu.
- Produk tanpa varian dan add-on langsung masuk cart.
- Feedback langsung setelah menambah.

State:

- Empty jika tidak ada produk atau hasil pencarian kosong.
- Error tidak berlaku untuk store sync.
- Loading hanya untuk aksi tambah jika diperlukan. Jangan membuat spinner palsu.

### 10.3 Product configurator

Dipakai POS dan Customer QR Menu.

Konten:

- Nama produk.
- Harga dasar.
- Varian aktif, single select.
- Add-on aktif, checkbox.
- Required, minimum, maximum.
- Quantity.
- Catatan item.
- Ringkasan harga.
- Tombol tambah ke keranjang.

Validasi:

- Varian wajib jika produk memiliki varian aktif.
- Add-on wajib harus dipilih.
- Jumlah add-on minimal dan maksimal.
- Quantity minimal 1.
- Produk harus tersedia.

State:

- Error inline.
- Tombol disabled saat produk tidak tersedia.
- Drawer dapat ditutup dengan Escape.

### 10.4 Cart POS

Konten:

- Order type: dine-in atau takeaway.
- Table selector untuk dine-in.
- Order notes.
- Line item:
  - Nama produk.
  - Varian.
  - Add-on.
  - Catatan.
  - Harga satuan.
  - Quantity control.
  - Hapus.
  - Line total.
- Subtotal.
- Total.
- Tombol checkout.

Aturan:

- Cart kosong menampilkan empty state.
- Checkout disabled jika cart kosong.
- Checkout disabled jika dine-in belum memilih meja.
- Cart disimpan di `sessionStorage`.
- Cart bertahan setelah reload.
- Cart hilang saat tab ditutup.
- Cart divalidasi ulang saat load dan checkout.
- Line yang produknya sudah tidak valid dibuang saat load.

### 10.5 Table selector

Konten:

- Meja aktif di outlet.
- Status `AVAILABLE` dan `OCCUPIED`.
- Jumlah order aktif per meja.
- Meja `INACTIVE` tidak ditampilkan.
- Aksi pilih meja.

Aturan:

- Dine-in wajib memilih meja.
- Takeaway menyembunyikan table selector.
- Meja `OCCUPIED` boleh dipilih untuk order tambahan.
- Meja yang dipilih tampil persisten di cart.

### 10.6 POS checkout

Konten:

- Ringkasan item.
- Order type.
- Meja.
- Catatan order.
- Subtotal.
- Total.
- Tombol konfirmasi.

Perilaku:

- Validasi ulang item dan meja.
- Panggil `createOrder`.
- Disable tombol saat pending.
- Error mock ditampilkan di atas form atau toast.
- Input dan cart tetap ada setelah error.
- Sukses:
  - Tampilkan order confirmation.
  - Kosongkan cart.
  - Tampilkan nomor order, total, status `NEW`, status `UNPAID`.
  - Sediakan tombol "Catat pembayaran" dan "Buat pesanan baru".

### 10.7 Order confirmation

Konten:

- Nomor order.
- Tipe order.
- Meja.
- Total.
- Status persiapan.
- Status pembayaran.
- Catatan "Pesanan masuk antrean KDS."
- Tombol bayar.
- Tombol buat pesanan baru.

### 10.8 POS payable orders

Konten:

- Tombol "Pesanan perlu dibayar" dengan badge jumlah.
- Drawer daftar order.
- Order number.
- Tipe dan meja.
- Waktu.
- Total.
- Sudah dibayar.
- Sisa.
- Status pembayaran.
- Tombol "Bayar".

Aturan:

- Hanya `UNPAID` dan `PARTIALLY_PAID`.
- Bukan `CANCELLED`.
- Urut terbaru.
- Empty state jika tidak ada tagihan.
- Data live dari store.
- Setelah pembayaran, daftar langsung diperbarui.

### 10.9 Payment drawer

Konten:

- Order number.
- Total.
- Total dibayar.
- Sisa tagihan.
- Riwayat payment.
- Form pembayaran:
  - Metode.
  - Nominal atau uang diterima.
  - Kembalian untuk tunai.
  - Referensi.
  - Catatan.
  - Verifikasi manual untuk digital.
- Tombol catat pembayaran.

Aturan:

- RHF + Zod.
- CASH boleh lebih dari sisa.
- Digital tidak boleh lebih dari sisa.
- Digital wajib verifikasi.
- Split payment didukung.
- Payment record menyimpan nilai yang diterapkan.
- Jangan mengubah status persiapan.
- Jika masih ada sisa, drawer tetap terbuka dan form direset ke sisa.
- Jika lunas, tampilkan success dan tutup drawer.
- Double submit dicegah.
- Error mempertahankan input.

### 10.10 KDS

Header:

- Brand RAVIKA KDS.
- Outlet switcher untuk user multi-outlet.
- Connection indicator.
- Theme toggle.
- Tombol keluar.

Board:

- Kolom `NEW`, `ACCEPTED`, `PREPARING`, `READY`, `COMPLETED`.
- `COMPLETED` menampilkan maksimal 10 order selesai terbaru, bukan antrean aktif.
- Horizontal scroll jika layar sempit.
- Jangan mengubah posisi ticket secara mengejutkan.

Ticket:

- Nomor order.
- Tipe order.
- Meja atau takeaway.
- Waktu masuk.
- Elapsed time.
- Item, quantity, varian, add-on, catatan.
- Status persiapan.
- Tombol next action.
- Payment status ditampilkan terpisah jika ada.

Aksi:

- `NEW` -> `ACCEPTED`, label "Terima".
- `ACCEPTED` -> `PREPARING`, label "Mulai siapkan".
- `PREPARING` -> `READY`, label "Tandai siap".
- `READY` -> `COMPLETED`, label "Selesai".
- Tidak ada cancel.
- Loading per ticket.
- Error toast.
- Status terakhir tetap jika gagal.

State:

- Empty per kolom.
- Empty board.
- Connection indicator mock.
- Tidak ada SSE nyata.

### 10.11 Customer QR Menu

Konten:

- Validasi token.
- Nama outlet.
- Nama meja.
- Search.
- Kategori.
- Grid produk.
- Product configurator.
- Cart.
- Checkout.
- Konfirmasi order.

Aturan:

- Tanpa login.
- Tanpa data pelanggan.
- Token invalid menampilkan recovery state.
- Produk habis tidak bisa ditambahkan.
- Cart dipertahankan saat error yang dapat dipulihkan.
- Checkout mengirim `source: "QR"`, `createdBy: null`, `DINE_IN`, `tableId` dan `tableToken` dari token.
- Order awal `NEW` dan `UNPAID`.
- Setelah sukses, tampilkan nomor order dan tombol lihat status.
- Pembayaran dilakukan di kasir.

### 10.12 Customer order status

Konten:

- Nomor order.
- Tipe dan meja.
- Waktu.
- Status pembayaran.
- Status persiapan.
- Item dan konfigurasi.
- Total.
- Catatan pembayaran di kasir.

Aturan:

- Hanya lewat `publicToken`.
- Tidak menampilkan user internal.
- Tidak menampilkan order lain.
- Update status dari KDS terlihat lewat BroadcastChannel.
- Token tidak valid menampilkan empty state.
- Jika store reset, tampilkan pesan minta bantuan staf.

### 10.13 Management integration

- Management Orders menampilkan order baru setelah refresh atau navigasi.
- Management Payments menampilkan payment baru setelah refresh atau navigasi.
- Management Payments tetap read-only.
- Management Orders cancel menolak order berbayar.
- Jika order memiliki payment `RECORDED`, tombol cancel di management Orders dinonaktifkan atau menampilkan pesan bahwa refund belum tersedia.
- Management Tables menampilkan status meja terbaru setelah refresh atau navigasi.
- Dashboard dan Reports menghitung order dan payment baru setelah refresh atau navigasi.
- Tidak ada perubahan besar pada layout management Phase 2.

## 11. Shared components

Komponen baru yang disarankan:

- `ProductConfigurator`
- `PosCheckoutDrawer`
- `PosPaymentDrawer`
- `PosPayableOrderDrawer`
- `OrderConfirmation`
- `TableSelector`
- `CustomerOrderStatus`
- `TableQrCode`
- `useNow`

Komponen yang diubah:

- `ProductCard`
- `OrderTicket`
- `PosCartContext`
- `PosShell`
- `KdsShell`
- `CustomerShell`
- `QrPlaceholder` diganti atau diubah menjadi `TableQrCode`

Aturan komponen:

- Gunakan token semantic.
- Gunakan `Drawer` atau `Dialog` native.
- Jangan membuat UI library baru.
- Jangan menduplikasi format harga.
- Gunakan `formatCurrency`, `formatDateTime`, dan helper waktu.
- Jangan membuat komponen untuk satu baris yang tidak dipakai ulang.

## 12. Form specification

Semua form memakai RHF + Zod.

### 12.1 Payment

```ts
const paymentSchema = z.object({
  method: z.enum(["CASH", "QRIS", "TRANSFER", "E_WALLET"]),
  amount: z.number().int().positive("Nominal harus lebih dari 0."),
  reference: z.string(),
  notes: z.string(),
  verified: z.boolean(),
});
```

Validasi tambahan:

- Digital wajib `verified`.
- Digital amount tidak boleh melebihi remaining.
- CASH amount boleh melebihi remaining.
- Amount tidak boleh 0 atau negatif.

Copy error:

- "Nominal harus lebih dari 0."
- "Nominal melebihi sisa tagihan."
- "Centang verifikasi pembayaran digital."

### 12.2 Cart notes

Catatan item dan catatan order adalah input terkontrol, bukan form terpisah. Tidak perlu Zod jika tidak ada validasi khusus.

### 12.3 Customer checkout

Customer checkout tidak meminta data pelanggan. Tidak ada form field baru. Tombol kirim memakai validasi cart dan token.

## 13. Mock data dan seed

### 13.1 Produk

Gunakan produk Phase 2. Jangan membuat produk baru di `mocks/catalog.ts`.

### 13.2 Meja

- Seed token QR harus acak dan tidak memuat data pribadi.
- Status meja harus konsisten dengan order aktif.
- Meja dengan order aktif dine-in menjadi `OCCUPIED`.
- Meja tanpa order aktif menjadi `AVAILABLE`, kecuali `INACTIVE`.

### 13.3 Order

- Seed QR order memiliki `publicToken` yang terlihat acak.
- Seed order aktif memiliki waktu yang realistis untuk timer KDS.
- Seed order harus konsisten dengan table status.
- Order `CANCELLED` tidak dihitung aktif.
- Order `COMPLETED` tidak dihitung aktif.

### 13.4 Payment

- Seed payment tetap ada.
- Payment baru ditambahkan lewat POS.
- Payment status dihitung ulang.
- Tidak ada refund baru.

### 13.5 Reset

- `reset()` mengembalikan seed awal.
- Reset disiarkan ke semua tab.
- Cart POS tidak otomatis direset oleh store reset. Cart tetap sampai reload atau checkout.
- MockControls reset tetap tersedia di design system.

## 14. State handling

### 14.1 POS

- Cart kosong: empty state.
- Produk tidak ditemukan: empty state.
- Produk habis: disabled.
- Checkout pending: loading dan disabled.
- Checkout gagal: error dan cart tetap.
- Order sukses: confirmation.
- Payment pending: loading.
- Payment gagal: error dan input tetap.
- Payment partial: toast dan sisa diperbarui.
- Payment lunas: success dan tutup drawer.
- Payable list kosong: empty state.
- Outlet switch dengan cart: confirmation.

### 14.2 KDS

- Kolom kosong: empty state.
- Board kosong: empty state.
- Status pending: loading per ticket.
- Status gagal: toast dan status tetap.
- Reconnect: tidak ada SSE. Connection indicator hanya mock.
- READY tetap terlihat.
- COMPLETED tidak dihitung aktif.

### 14.3 Customer

- Token invalid: empty state recovery.
- Menu kosong: empty state.
- Produk habis: disabled.
- Checkout pending: loading.
- Checkout gagal: error dan cart tetap.
- Order sukses: confirmation.
- Status tidak ditemukan: empty state.
- Status update: live dari store.

### 14.4 Management

- Order cancel berbayar: error toast.
- Payment read-only: tidak ada aksi create/refund.
- Table status update: tampil setelah refresh.
- Dashboard/Reports: data baru setelah refresh.

## 15. Responsive

| Area                 | Mobile                                    | Tablet                    | Desktop                           |
| -------------------- | ----------------------------------------- | ------------------------- | --------------------------------- |
| POS                  | Product list, cart drawer, payable drawer | Product list, cart drawer | Product area plus persistent cart |
| KDS                  | Horizontal scroll board                   | Horizontal scroll board   | Multi-column board                |
| Customer menu        | Single column                             | Single column, max width  | Centered max width                |
| Customer status      | Single column                             | Single column             | Centered max width                |
| Payment              | Full-screen sheet                         | Drawer                    | Drawer                            |
| Table selector       | Sheet                                     | Sheet                     | Drawer                            |
| Product configurator | Full-screen sheet                         | Drawer                    | Drawer                            |

Aturan:

- Tidak ada horizontal overflow halaman.
- Target sentuh minimal 44 px.
- Cart tetap dapat diakses di mobile.
- KDS board boleh scroll horizontal.
- QR Menu tetap mobile-first.
- Jangan mengecilkan dua panel desktop menjadi dua kolom sempit.

## 16. Accessibility

- WCAG 2.2 AA.
- Semua field memiliki label.
- Error terhubung ke field.
- Focus ring terlihat.
- Drawer dan dialog focus trap.
- Escape menutup overlay.
- Status tidak hanya warna.
- Touch target 44 px.
- Reduced motion.
- Tidak ada clickable div.
- Tombol KDS punya accessible name.
- QR memiliki label teks dan URL.
- Halaman publik tidak menampilkan data internal.
- Keyboard dapat menyelesaikan alur utama.

## 17. Copywriting

- Bahasa Indonesia.
- Sentence case.
- Tanpa em dash.
- Tanpa middle dot.
- CTA spesifik.
- Data simulasi diberi label "Data simulasi" atau "Data contoh".
- Jangan mengklaim pembayaran online otomatis.
- Jangan mengklaim SSE nyata.

Contoh copy:

| Konteks | Copy                                                       |
| ------- | ---------------------------------------------------------- |
| POS     | Buat pesanan                                               |
| POS     | Pesanan perlu dibayar                                      |
| POS     | Catat pembayaran                                           |
| POS     | Uang diterima                                              |
| POS     | Kembalian                                                  |
| POS     | Pesanan masuk antrean KDS                                  |
| KDS     | Terima                                                     |
| KDS     | Mulai siapkan                                              |
| KDS     | Tandai siap                                                |
| KDS     | Selesai                                                    |
| KDS     | Belum ada tiket                                            |
| QR      | Pindai QR untuk membuka menu                               |
| QR      | Kirim pesanan                                              |
| QR      | Pembayaran dilakukan di kasir                              |
| Status  | Pesanan tidak ditemukan                                    |
| Error   | Data gagal dimuat. Coba lagi.                              |
| Error   | Pesanan dengan pembayaran tercatat tidak dapat dibatalkan. |
| Empty   | Belum ada pesanan yang perlu dibayar.                      |

## 18. QA matrix

| Surface              | 390 | 768 | 1024 | 1440 | Light | Dark | Keyboard |
| -------------------- | --- | --- | ---- | ---- | ----- | ---- | -------- |
| POS                  | Ya  | Ya  | Ya   | Ya   | Ya    | Ya   | Ya       |
| Product configurator | Ya  | Ya  | Ya   | Ya   | Ya    | Ya   | Ya       |
| Cart                 | Ya  | Ya  | Ya   | Ya   | Ya    | Ya   | Ya       |
| Checkout             | Ya  | Ya  | Ya   | Ya   | Ya    | Ya   | Ya       |
| Payment              | Ya  | Ya  | Ya   | Ya   | Ya    | Ya   | Ya       |
| KDS                  | Ya  | Ya  | Ya   | Ya   | Ya    | Ya   | Ya       |
| Customer menu        | Ya  | Ya  | Ya   | Ya   | Ya    | Ya   | Ya       |
| Customer status      | Ya  | Ya  | Ya   | Ya   | Ya    | Ya   | Ya       |

QA tambahan:

- Dua tab: POS dan KDS.
- Dua tab: POS dan customer status.
- QR invalid.
- QR regenerate.
- Cart reload.
- Split payment.
- Cash change.
- Digital verification.
- Cancel order berbayar.
- Table occupancy.
- Store reset.
- BroadcastChannel fallback.

## 19. Acceptance criteria

Fase 3 selesai jika:

- POS memakai produk store, bukan mock katalog terpisah.
- Kasir dapat membuat order dine-in dengan meja valid.
- Kasir dapat membuat order takeaway tanpa meja.
- Varian dan add-on dapat dipilih dan divalidasi.
- Catatan item dan catatan order tersimpan.
- Total dihitung ulang oleh service.
- Nomor order unik per outlet.
- Order baru berstatus `NEW` dan `UNPAID`.
- Order baru muncul di KDS.
- Meja dine-in menjadi `OCCUPIED`.
- Meja kembali `AVAILABLE` saat tidak ada order aktif.
- Meja `OCCUPIED` boleh menerima order tambahan.
- Kasir dapat mencatat pembayaran tunai dan digital.
- Split payment berfungsi.
- Kembalian tunai benar.
- Payment record menyimpan nilai yang diterapkan.
- Status pembayaran berubah sesuai aturan.
- Status persiapan tidak berubah karena pembayaran.
- Order berbayar tidak bisa dibatalkan.
- KDS hanya menampilkan transisi maju.
- READY tetap terlihat sampai COMPLETED.
- KDS tidak memiliki cancel.
- KDS menampilkan elapsed time.
- QR meja scannable.
- Token invalid ditolak.
- Customer menu memakai konteks outlet dan meja.
- Customer dapat mengirim order tanpa login.
- Customer order muncul di KDS dan management Orders.
- Customer status memakai `publicToken`.
- Customer status tidak menampilkan data internal.
- Sinkronisasi antar tab berfungsi.
- Cart POS bertahan setelah reload.
- Loading, empty, error, dan success state tersedia.
- Light dan dark berfungsi.
- Tidak ada overflow 320.
- Keyboard dan focus berfungsi.
- `pnpm check` lulus.
- `pnpm build` lulus.
- Antislop Delivery Gate PASS.

## 20. Delivery Gate

Sebelum handoff, laporkan PASS atau FAIL untuk:

- Tidak ada em dash atau middle dot di UI.
- Tidak ada horizontal overflow di 320.
- Tidak ada statistik, testimonial, atau klaim palsu.
- Semua data mock berlabel.
- Semua nav menuju route yang ada.
- Semua text memenuhi kontras AA.
- Tidak ada control tanpa behavior.
- Empty, loading, error, dan success state tersedia.
- Keyboard navigation dan focus terlihat.
- Drawer dan dialog bisa ditutup dengan Escape.
- Theme light dan dark berfungsi.
- Build dan click-through sudah dijalankan.
- Permission-aware nav dan action.
- Session guard berfungsi.
- Form validation berfungsi.
- Search, filter, sort, dan pagination management tetap berfungsi.
- Touch target minimal 44 px.
- Reduced motion dihormati.
- Tidak ada dependency baru selain `qrcode.react`.
- QR meja benar-benar berisi URL menu.
- QR token invalid ditolak.
- Order POS, KDS, QR, dan management konsisten.
- Tidak ada double submit.
- Payment status dan preparation status terpisah.
- Cancel order berbayar ditolak.
- BroadcastChannel sync bekerja antar tab.
- Tidak ada SSE atau backend yang diklaim.

## 21. Implementation order

### Task 1: Fondasi data operasional

- Tambah `Order.publicToken`.
- Tambah input types.
- Tambah service `createOrder`, `updateOrderStatus`, `recordPayment`, `listPayableOrders`, `getOrderByPublicToken`, `validateTableToken`.
- Update `cancelOrder`.
- Tambah guard status meja untuk order aktif.
- Update seed.
- Tambah BroadcastChannel.
- Verifikasi typecheck dan build.

### Task 2: POS katalog dan cart

- Ganti `mocks/catalog.ts` dengan store.
- Product card domain.
- Product configurator.
- Cart line customization.
- Cart sessionStorage.
- Outlet context.
- Verifikasi POS product discovery.

### Task 3: POS checkout

- Order type.
- Table selector.
- Order notes.
- Checkout drawer.
- Order confirmation.
- Create order.
- Clear cart.
- Verifikasi order masuk store.

### Task 4: POS payment

- Payable orders drawer.
- Payment drawer.
- RHF + Zod.
- Cash change.
- Digital verification.
- Split payment.
- Payment status.
- Cancel paid order guard.
- Verifikasi payment flows.

### Task 5: KDS

- Store board.
- Outlet switcher.
- Ticket domain.
- Status actions.
- Elapsed timer.
- Completed column.
- Verifikasi dua tab.

### Task 6: QR dan customer menu

- Tambah `qrcode.react`.
- Table QR scannable.
- Token validation.
- CustomerShell dynamic.
- Customer menu store.
- Product configurator.
- Customer cart.
- Verifikasi token valid/invalid.

### Task 7: Customer checkout dan status

- Customer checkout.
- Create QR order.
- Public token.
- Order confirmation.
- Customer status page.
- Live update.
- Verifikasi dua tab.

### Task 8: Integrasi dan QA

- Management integration.
- Responsive.
- Light/dark.
- Console.
- `pnpm check`.
- `pnpm build`.
- Antislop gate.
- Docs.

Setiap task selesai jika:

- Implementasi dan typecheck lulus.
- Interaksi utama dapat didemonstrasikan.
- Loading, empty, error, dan success state tersedia.
- Responsive dan keyboard diperiksa.
- Tidak ada console error.
- Tidak ada issue P0 atau P1.

## 22. File map

Baru:

- `src/features/operational/product-configurator.tsx`
- `src/features/operational/pos-checkout-drawer.tsx`
- `src/features/operational/pos-payment-drawer.tsx`
- `src/features/operational/pos-payable-order-drawer.tsx`
- `src/features/operational/order-confirmation.tsx`
- `src/features/operational/table-selector.tsx`
- `src/features/operational/customer-order-status.tsx`
- `src/features/operational/use-now.ts`
- `src/features/management/table-qr-code.tsx`

Diubah:

- `package.json`
- `pnpm-lock.yaml`
- `src/types/domain.ts`
- `src/mocks/management/seed.ts`
- `src/mocks/management/store.ts`
- `src/mocks/management/service.ts`
- `src/components/shells/pos-cart-context.tsx`
- `src/components/shells/pos-shell.tsx`
- `src/components/shells/kds-shell.tsx`
- `src/components/shells/customer-shell.tsx`
- `src/components/ui/product-card.tsx`
- `src/components/ui/order-ticket.tsx`
- `src/app/(cashier)/app/pos/page.tsx`
- `src/app/(kds)/kds/page.tsx`
- `src/app/(customer)/menu/[token]/page.tsx`
- `src/app/(customer)/order/[publicToken]/page.tsx`
- `src/app/(dashboard)/app/design-system/page.tsx`
- `src/app/(dashboard)/app/tables/page.tsx`
- `src/features/management/qr-placeholder.tsx`
- `src/lib/format.ts`
- `README.md`
- `AGENTS.md`
- `docs/design/design-system.md`

Dihapus jika sudah tidak dipakai:

- `src/mocks/catalog.ts`
- `src/mocks/kds.ts`

## 23. Risks

| Risiko                                               | Mitigasi                                                      |
| ---------------------------------------------------- | ------------------------------------------------------------- |
| BroadcastChannel full-state sync, last write wins    | Mock saja. Catat `shortcut:` dan gunakan satu kasir saat demo |
| Reload penuh mereset store                           | Gunakan dua tab yang tetap terbuka saat demo                  |
| Link status pelanggan mati setelah semua tab ditutup | Jelaskan di UI sebagai data simulasi                          |
| QR berisi localhost                                  | Buka aplikasi lewat IP LAN saat memindai                      |
| Nomor order bentrok antar tab                        | Demo satu kasir. Backend akan memakai transaksi di Fase 6     |
| `qrcode.react` tidak kompatibel                      | Cek build setelah menambah dependency                         |
| Timer KDS tidak realistis                            | Rebase timestamp order aktif saat seed                        |
| Payment status tidak konsisten                       | Hitung ulang dari payment `RECORDED` di service               |
| Cancel order berbayar                                | Tolak di service dan tampilkan pesan                          |
| Data management tidak live                           | Refresh atau navigasi ulang setelah transaksi                 |
| Tidak ada test runner                                | Playwright manual, `pnpm check`, `pnpm build`                 |

## 24. Open items dari PRD

| ID       | Dampak ke Fase 3             | Perlakuan                                                                                             |
| -------- | ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| OPEN-003 | Zona waktu                   | Tetap `Asia/Jakarta` untuk pilot                                                                      |
| OPEN-004 | Nomor order                  | Mock memakai kode outlet plus urutan                                                                  |
| OPEN-005 | Diskon                       | Tidak ada field diskon                                                                                |
| OPEN-006 | Pajak dan biaya layanan      | Tidak ada field pajak                                                                                 |
| OPEN-007 | Uang kembalian               | Mock mengizinkan tunai lebih dan menghitung kembalian. Payment record menyimpan nilai yang diterapkan |
| OPEN-008 | Refund                       | Tidak ada refund. Cancel order berbayar ditolak                                                       |
| OPEN-009 | Takeaway QR                  | Ditunda                                                                                               |
| OPEN-010 | Data pelanggan               | Tidak ada data pelanggan untuk dine-in                                                                |
| OPEN-011 | Pembatalan setelah persiapan | Mock memakai aturan Phase 2. Belum final                                                              |
| OPEN-012 | HTTPS LAN                    | Tidak relevan untuk QR generation di Fase 3                                                           |
| OPEN-013 | Penyimpanan gambar           | Placeholder netral, tanpa upload                                                                      |
| OPEN-014 | Cetak struk                  | Tidak ada                                                                                             |

## 25. Handoff ke Fase 4

Setelah Fase 3 selesai:

- POS, KDS, dan QR Menu siap direview.
- Mock service operasional siap dipakai ulang di Fase 7.
- Phase 4 review mencakup seluruh alur operasional.
- Jangan mulai backend sebelum UI Approval Gate M4.
- Jangan mengubah shell dan design system yang sudah disetujui tanpa spec baru.
- Catat semua issue P0/P1 sebelum approval.
