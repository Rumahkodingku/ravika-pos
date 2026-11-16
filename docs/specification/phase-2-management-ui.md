# RAVIKA POS - Spesifikasi Fase 2: Management UI

**Status:** Approved scope, siap implementasi
**Fase:** 2, Management Interface
**Tanggal:** 16 November 2026
**Referensi utama:** `docs/PRD.md`, `docs/ROADMAP.md`, `docs/design/design-brief.md`, `docs/design/design-direction.md`, `docs/design/design-system.md`, `docs/design/ui-ux-guidelines.md`, `docs/specification/phase-1-frontend-foundation-design-system.md`, `docs/specification/phase-1-5-ui-ux-refinement.md`

## 0. Agent quick start

Baca dokumen ini sebelum mengubah management UI.

Aturan wajib:

1. Fase 2 hanya frontend. Jangan membuat backend, database, API, auth nyata, atau SSE.
2. Gunakan mock data dan mock service terpusat. Jangan hardcode data berulang di komponen.
3. Jangan menambah route detail per record. Create, edit, dan detail memakai drawer atau sheet.
4. Jangan menambah dependency selain `react-hook-form`, `zod`, dan `@hookform/resolvers`.
5. Jangan menambah TanStack Query atau Zustand di Fase 2. Keduanya ditunda sampai integrasi backend.
6. Jangan menambah pajak, diskon, biaya layanan, refund, atau field pelanggan yang belum final di PRD.
7. Jangan membuat QR scannable. Gunakan placeholder yang jelas.
8. Jangan membuat upload gambar produk. Gunakan placeholder netral.
9. Jangan memakai em dash atau middle dot di copy UI. Nilai kosong memakai "Tidak ada" atau "Belum ada".
10. Pertahankan permission-aware navigation dan action.
11. Setiap halaman harus memiliki loading, empty, error, dan success state yang relevan.
12. Jalankan `pnpm check` dan `pnpm build` sebelum menyatakan selesai.
13. Jalankan antislop Delivery Gate sebelum handoff.

## 1. Ringkasan

Fase 2 menyelesaikan management UI untuk owner dan staf yang memiliki izin. Semua halaman memakai data dummy yang konsisten dan interaksi simulasi.

Halaman yang termasuk:

- Authentication UI
- Dashboard
- Products
- Categories
- Tables dan QR
- Orders
- Payments
- Users
- Roles dan Permissions
- Outlets
- Settings
- Reports
- License
- Backup

Fase 2 tidak membuat POS, KDS, atau QR ordering penuh. Halaman operasional tersebut tetap Fase 3.

## 2. Goals, non-goals, anti-goals

### Goals

- Semua halaman management dapat diakses melalui mega menu.
- CRUD simulasi dapat didemonstrasikan.
- Search, filter, sort, dan pagination berfungsi.
- Form memakai React Hook Form dan Zod.
- Permission-aware page dan action.
- Mock login dan guard berfungsi.
- Data antar halaman konsisten.
- Loading, empty, error, dan success state tersedia.
- Layout responsive, light/dark, dan keyboard accessible.

### Non-goals

- Tidak ada backend, database, API, auth nyata, atau SSE.
- Tidak ada persistence data bisnis.
- Tidak ada payment recording. Payments read-only.
- Tidak ada create order. Orders read-only dengan cancel simulation.
- Tidak ada upload gambar produk.
- Tidak ada QR scannable.
- Tidak ada pajak, diskon, biaya layanan, refund, atau data pelanggan takeaway.
- Tidak ada route detail per record.
- Tidak ada test runner baru.

### Anti-goals

- Halaman yang hanya menampilkan data statis tanpa interaksi.
- Form tanpa validasi atau feedback.
- Tombol yang tidak memiliki perilaku.
- Menu atau action yang tidak mengikuti permission.
- Mock data yang tersebar dan tidak konsisten.
- Data mock yang terlihat seperti data produksi tanpa label.
- Drawer yang menutupi konten atau tidak bisa ditutup dengan keyboard.
- Table yang rusak di mobile.

## 3. Keputusan yang dikunci

| Area | Keputusan |
|---|---|
| Orders dan Payments | Masuk Fase 2 |
| Payments | Read-only management: list, filter, detail |
| Orders | List, filter, detail, cancel simulation |
| Authentication | Mock login dan route guard |
| Session | `sessionStorage`, bukan keamanan nyata |
| Form | React Hook Form, Zod, `@hookform/resolvers` |
| Data layer | Async mock service dan in-memory store |
| Create/edit/detail | Drawer atau sheet |
| QR meja | Placeholder, belum scannable |
| Gambar produk | Placeholder netral, belum upload |
| Settings | Profil bisnis, preferensi tampilan, ringkasan outlet |
| Outlet CRUD | Halaman Outlets |
| Backend | Tidak ada |
| Database | Tidak ada |
| API/SSE | Tidak ada |
| TanStack Query/Zustand | Ditunda sampai Fase 7 |

## 4. Dependency

Tambahkan:

- `react-hook-form`
- `zod`
- `@hookform/resolvers`

Jangan tambahkan:

- TanStack Query
- Zustand
- Chart library
- QR library
- UI library
- Test runner
- SQLite, Drizzle, better-sqlite3

## 5. Arsitektur

### 5.1 Auth dan session

- `MockSessionProvider` global di root layout.
- Session disimpan di `sessionStorage` dengan key `ravika-session-user-id`.
- Session berisi user ID. User diambil dari `mockUsers`.
- `isReady` boolean untuk mencegah redirect sebelum session dibaca.
- Login sukses menyimpan user ID dan mengarahkan sesuai role.
- Logout menghapus sessionStorage dan kembali ke `/login`.
- Tidak ada cookie, token, atau verifikasi server.

Demo accounts:

| Role | Email | Username | Password | Landing |
|---|---|---|---|---|
| OWNER | `owner@ravika.id` | `owner` | `demo123` | `/app` |
| CASHIER | `cashier@ravika.id` | `cashier` | `demo123` | `/app/pos` |
| BARISTA | `barista@ravika.id` | `barista` | `demo123` | `/kds` |

Catatan: identitas login final masih OPEN-002. Demo memakai email dan username.

### 5.2 Guard

- `/app/*` membutuhkan session.
- Tanpa session: redirect `/login`.
- Barista membuka `/app`: redirect `/kds`.
- Cashier dan owner dapat membuka management sesuai permission.
- `/app/pos` membutuhkan `orders.create` atau role OWNER/CASHIER.
- `/kds` membutuhkan `kds.view` atau role OWNER/BARISTA.
- Login page jika sudah login: redirect ke landing role.
- Guard menampilkan loading state sampai `isReady`.
- Guard hanya simulasi. Tidak ada keamanan nyata.

### 5.3 Permission

Permission registry terpusat di `src/mocks/permissions.ts`.

Grup permission:

| Grup | Permission |
|---|---|
| Dashboard | `dashboard.view` |
| Business | `business.view`, `business.update` |
| Outlets | `outlets.view`, `outlets.manage` |
| Users | `users.view`, `users.manage` |
| Roles | `roles.manage`, `permissions.manage` |
| Categories | `categories.view`, `categories.manage` |
| Products | `products.view`, `products.manage` |
| Tables | `tables.view`, `tables.manage` |
| Orders | `orders.view`, `orders.create`, `orders.cancel` |
| Payments | `payments.view`, `payments.create`, `payments.refund` |
| KDS | `kds.view`, `kds.update_status` |
| Reports | `reports.view` |
| Backup | `backup.create`, `backup.restore` |
| Settings | `settings.manage` |
| License | `license.view` |

Page access:

| Page | Owner | Cashier | Barista |
|---|---|---|---|
| Dashboard | Ya | Ya, terbatas | Tidak |
| Products | Kelola | Lihat | Lihat |
| Categories | Kelola | Lihat | Lihat |
| Tables | Kelola | Lihat dan kelola operasional | Lihat |
| Orders | Lihat dan cancel | Lihat dan cancel terbatas | Tidak di management |
| Payments | Lihat | Lihat | Tidak |
| Users | Kelola | Tidak | Tidak |
| Roles | Kelola | Tidak | Tidak |
| Outlets | Kelola | Lihat | Lihat |
| Settings | Kelola | Tidak | Tidak |
| Reports | Ya | Tidak | Tidak |
| License | Lihat | Tidak | Tidak |
| Backup | Kelola | Tidak | Tidak |

Komponen:

- `PermissionGate`: menyembunyikan action tanpa permission.
- `RequirePermission`: menampilkan `PermissionDeniedState` untuk halaman.
- `RequireSession`: guard session.
- Frontend permission bukan pengganti authorization backend.

### 5.4 Mock data layer

Struktur:

```text
src/types/domain.ts
src/mocks/management/seed.ts
src/mocks/management/store.ts
src/mocks/management/service.ts
src/mocks/management/hooks.ts
src/mocks/management/controls.ts
src/mocks/permissions.ts
```

Karakter:

- In-memory store.
- Reset saat reload.
- Async service dengan delay 400 sampai 800 ms.
- Pagination, search, filter, dan sort.
- Mutasi mengubah store dan memberi toast.
- `mockControls` untuk latency dan error simulation.
- Tidak ada persistence bisnis.
- `sessionStorage` hanya untuk auth.

Store API:

```ts
type StoreListener = () => void;

type ManagementStore = {
  getState: () => ManagementState;
  setState: (updater: (current: ManagementState) => ManagementState) => void;
  subscribe: (listener: StoreListener) => () => void;
  reset: () => void;
};
```

Hook:

```ts
useManagementStore(selector)
useAsyncData(loader, deps)
```

`useAsyncData` mengembalikan:

```ts
{
  data: T | null;
  error: string | null;
  isLoading: boolean;
  refresh: () => void;
}
```

### 5.5 Types domain

Tipe minimal:

- `Business`
- `Outlet`
- `Category`
- `Product`
- `ProductVariant`
- `AddOn`
- `ProductAddOn`
- `DiningTable`
- `User`
- `Role`
- `Permission`
- `Order`
- `OrderItem`
- `OrderItemAddOn`
- `Payment`
- `OrderStatusHistory`
- `License`
- `BackupRecord`
- `ReportSummary`

Aturan:

- Harga integer Rupiah.
- Waktu ISO string.
- Order item menyimpan snapshot nama dan harga.
- Payment status dan preparation status terpisah.
- Order type: `DINE_IN`, `TAKEAWAY`.
- Source: `CASHIER`, `QR`.
- Table status: `AVAILABLE`, `OCCUPIED`, `INACTIVE`.
- License status: `VALID`, `EXPIRING`, `INVALID`.
- Backup status: `READY`, `IN_PROGRESS`, `FAILED`.

### 5.6 Service contract

Bentuk pagination:

```ts
type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
};
```

List params:

```ts
type BaseListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  outletId?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
};
```

Service methods:

```ts
managementService.getDashboard(params)
managementService.listProducts(params)
managementService.getProduct(id)
managementService.createProduct(input)
managementService.updateProduct(id, input)
managementService.setProductActive(id, active)
managementService.setProductAvailability(id, available)

managementService.listCategories(params)
managementService.createCategory(input)
managementService.updateCategory(id, input)
managementService.moveCategory(id, direction)
managementService.setCategoryActive(id, active)

managementService.listTables(params)
managementService.createTable(input)
managementService.updateTable(id, input)
managementService.setTableStatus(id, status)
managementService.regenerateTableToken(id)

managementService.listOrders(params)
managementService.getOrder(id)
managementService.cancelOrder(id, reason)

managementService.listPayments(params)
managementService.getPayment(id)

managementService.listUsers(params)
managementService.createUser(input)
managementService.updateUser(id, input)
managementService.setUserActive(id, active)

managementService.listRoles()
managementService.getRole(id)
managementService.createRole(input)
managementService.updateRole(id, input)
managementService.setRolePermissions(id, permissionCodes)

managementService.getBusiness()
managementService.updateBusiness(input)
managementService.listOutlets(params)
managementService.createOutlet(input)
managementService.updateOutlet(id, input)
managementService.setOutletActive(id, active)

managementService.getSalesReport(params)
managementService.getLicense()
managementService.listBackups()
managementService.createBackup()
managementService.restoreBackup(id)
```

Semua method async. Service boleh melempar error untuk simulasi. Semua mutasi menulis ke store.

## 6. Navigasi dan route

Route yang dipakai:

| Route | Page |
|---|---|
| `/login` | Login |
| `/app` | Dashboard |
| `/app/products` | Products |
| `/app/categories` | Categories |
| `/app/tables` | Tables |
| `/app/orders` | Orders |
| `/app/payments` | Payments |
| `/app/users` | Users |
| `/app/roles` | Roles dan Permissions |
| `/app/outlets` | Outlets |
| `/app/settings` | Settings |
| `/app/reports` | Reports |
| `/app/license` | License |
| `/app/backup` | Backup |
| `/app/design-system` | Preview internal |

Tidak ada route detail per record. Detail memakai drawer atau sheet.

Update navigation:

- Tambah `Payments` ke grup Operasional.
- Permission `payments.view`.
- Icon `Wallet` atau `CreditCard`.
- Semua route di atas harus ada.
- Mega menu tetap permission-aware.

## 7. Page specification

### 7.1 Login

Tujuan: simulasi login dan pemilihan role.

Layout:

- Split layout existing.
- Panel kiri brand navy.
- Panel kanan form.
- Mobile satu kolom.

Form:

- Email atau username.
- Password.
- Checkbox "Ingat sesi di perangkat ini" hanya UI. Session tetap sessionStorage.
- Button "Masuk".

Demo accounts:

- Tampilkan tiga akun demo dengan role dan tombol isi otomatis.
- Password demo terlihat.
- Label "Mode UI, bukan autentikasi nyata".

Validasi:

- Email atau username wajib.
- Password minimal 6 karakter.
- Kredensial salah menampilkan error yang tidak membocorkan field mana yang salah.

State:

- Loading saat submit.
- Error inline.
- Success redirect.
- Jika sudah login, redirect ke landing role.

### 7.2 Dashboard

Tujuan: ringkasan operasional.

Filter:

- Periode: Hari ini, 7 hari, 30 hari.
- Outlet: semua outlet yang diizinkan.

Konten:

- Penjualan periode.
- Jumlah transaksi.
- Rata-rata transaksi.
- Item terjual.
- Antrean status persiapan.
- Chart penjualan.
- Produk terlaris.
- Recent orders.

Data:

- `getDashboard({ outletId, range })`.
- Angka dihitung dari seed orders dan payments.
- Order CANCELLED tidak dihitung sebagai penjualan sah.
- Label "Data simulasi".

State:

- Skeleton cards dan chart saat loading.
- Empty state jika tidak ada transaksi.
- Error state dengan retry.
- Filter mengubah data tanpa reload halaman.

### 7.3 Products

Tujuan: mengelola katalog.

List:

- Search nama produk.
- Filter kategori.
- Filter status aktif.
- Filter ketersediaan.
- Sort nama, harga, kategori.
- Pagination 10 per halaman.
- Kolom: nama, kategori, harga, ketersediaan, status, action.
- Mobile: card list.

Create/edit drawer:

- Nama produk.
- Deskripsi.
- Kategori.
- Harga dasar.
- Tersedia.
- Aktif.
- Gambar placeholder netral.
- Varian repeatable: nama, price adjustment, aktif.
- Add-on repeatable: nama, harga, aktif.
- Product add-on relation: required, minimum selection, maximum selection.
- Validasi Zod.
- Dirty form confirmation.

Detail drawer:

- Info produk.
- Varian.
- Add-on.
- Status.
- Action edit.

Permission:

- `products.manage` untuk create/edit.
- `products.view` untuk list/detail.

### 7.4 Categories

List:

- Search.
- Sort order.
- Status aktif.
- Pagination.
- Mobile card list.

Create/edit drawer:

- Nama.
- Deskripsi.
- Urutan.
- Aktif.

Action:

- Naik/turun urutan.
- Aktif/nonaktif.
- Konfirmasi jika kategori memiliki produk.

Permission:

- `categories.manage`.

### 7.5 Tables dan QR

List:

- Filter outlet.
- Filter status.
- Search nama/nomor meja.
- Mobile card grid.

Create/edit drawer:

- Nama atau nomor meja.
- Outlet.
- Status: AVAILABLE, OCCUPIED, INACTIVE.
- Aktif.

Detail drawer:

- Info meja.
- QR placeholder.
- Label "Pratinjau QR, belum scannable".
- Copy link token contoh.
- Print preview.
- Regenerate token dengan konfirmasi.

Permission:

- `tables.manage`.
- `tables.view` untuk lihat.

### 7.6 Orders

List:

- Search nomor order.
- Filter outlet.
- Filter status pesanan.
- Filter status pembayaran.
- Filter tanggal.
- Sort waktu.
- Pagination.
- Kolom: nomor, waktu, outlet, tipe, total, pembayaran, persiapan.
- Mobile card list.

Detail drawer:

- Nomor, waktu, outlet, tipe, meja.
- Item snapshot.
- Varian dan add-on snapshot.
- Catatan.
- Subtotal, total.
- Payment records.
- Status history.
- Payment status dan preparation status terpisah.

Cancel:

- Permission `orders.cancel`.
- Hanya status NEW, ACCEPTED, PREPARING.
- Wajib alasan minimal 3 karakter.
- Konfirmasi dialog.
- Status menjadi CANCELLED.
- Status history ditambahkan.
- Tidak menghapus order.
- Kebijakan cashier dan owner adalah mock. OPEN-011 belum final.

Tidak ada create order.

### 7.7 Payments

Read-only management.

List:

- Search order number.
- Filter metode: CASH, QRIS, TRANSFER, E_WALLET.
- Filter status pembayaran.
- Filter outlet.
- Filter tanggal.
- Pagination.
- Kolom: order, metode, nominal, status, waktu, dicatat oleh.
- Mobile card list.

Detail drawer:

- Order terkait.
- Metode.
- Nominal.
- Status.
- Referensi.
- Catatan.
- Waktu.
- Dicatat oleh.
- Link ke detail order.

Tidak ada create payment, edit, atau refund. Refund menunggu OPEN-008.

### 7.8 Users

List:

- Search nama atau email.
- Filter role.
- Filter status aktif.
- Pagination.
- Mobile card list.

Create/edit drawer:

- Nama.
- Email atau username.
- Role.
- Outlet.
- Aktif.
- Password hanya untuk create, mock.

Rules:

- Minimal satu owner aktif.
- Tidak bisa menonaktifkan owner terakhir.
- Role assignment mengikuti permission.
- User baru tidak otomatis bisa login kecuali memakai akun demo. Login demo tetap tiga akun.

Permission:

- `users.manage`.

### 7.9 Roles dan Permissions

List:

- Nama role.
- Kode.
- Deskripsi.
- Jumlah permission.
- Built-in badge.
- Mobile card list.

Create/edit drawer:

- Nama.
- Kode.
- Deskripsi.
- Permission matrix.

Permission matrix:

- Group: Dashboard, Business, Outlets, Users, Roles, Categories, Products, Tables, Orders, Payments, KDS, Reports, Backup, Settings, License.
- Checkbox per permission.
- Select all per group.
- Simpan ke mock store.
- Built-in roles tidak bisa dihapus.
- Perubahan permission memengaruhi nav dan action visibility untuk session role tersebut.

Permission:

- `roles.manage`.
- `permissions.manage`.

### 7.10 Outlets

List:

- Search nama atau kode.
- Filter status aktif.
- Pagination.
- Mobile card list.

Create/edit drawer:

- Nama.
- Kode.
- Alamat.
- Aktif.

Rules:

- Kode outlet unik.
- Outlet tidak bisa dihapus jika memiliki order. Gunakan nonaktif.
- Outlet aktif muncul di outlet switcher.
- Outlet context di shell memakai store.

Permission:

- `outlets.manage`.

### 7.11 Settings

Tujuan: profil bisnis dan preferensi tampilan.

Sections:

1. Profil bisnis:
   - Nama bisnis.
   - Kode bisnis.
   - Alamat.
   - Telepon.
2. Tampilan:
   - Theme: light, dark, system.
   - Zona waktu: Asia/Jakarta, label "Nilai pilot, belum final (OPEN-003)".
   - Format mata uang: IDR, read-only.
3. Ringkasan outlet:
   - Jumlah outlet.
   - Link ke `/app/outlets`.

Tidak ada pajak, diskon, biaya layanan, atau field lain yang belum final.

Permission:

- `settings.manage`.

### 7.12 Reports

Filter:

- Periode: hari ini, 7 hari, 30 hari, custom.
- Outlet.

Konten:

- Penjualan kotor.
- Total pembayaran diterima.
- Jumlah transaksi.
- Rata-rata transaksi.
- Chart penjualan.
- Top products table.
- Sales table.

Definisi mock:

- `salesTotal`: jumlah `grandTotal` order non-CANCELLED pada periode.
- `paidTotal`: jumlah payment pada periode.
- `transactionCount`: jumlah order non-CANCELLED.
- `averageTransaction`: `salesTotal / transactionCount`.
- `topProducts`: kuantitas item dari order non-CANCELLED.
- Label "Data simulasi, bukan laporan akuntansi final".

State:

- Loading, empty, error, retry.
- Tidak menghitung CANCELLED sebagai penjualan sah.

Permission:

- `reports.view`.

### 7.13 License

Konten:

- Status lisensi: VALID, EXPIRING, INVALID.
- Nama bisnis.
- Business identifier.
- Installation ID.
- Tanggal terbit.
- Masa berlaku.
- Public key fingerprint, mock.
- Catatan "Validasi lokal nyata ada di Fase 6".

Action:

- Refresh status simulation.
- Tidak ada aktivasi atau upload license.

Permission:

- `license.view`.

### 7.14 Backup

Konten:

- Daftar backup: file, ukuran, waktu, status, checksum.
- Status backup terakhir.
- Peringatan backup harus disalin ke media terpisah.
- Tombol "Buat backup".
- Tombol "Restore" per backup.

Create backup:

- Simulasi 800 ms.
- Menambah record READY.
- Toast success.
- Tidak membuat file nyata.

Restore:

- Dialog konfirmasi.
- Menampilkan konsekuensi.
- Simulasi 1000 ms.
- Toast success.
- Tidak mengubah data mock secara nyata.
- Label "Simulasi, bukan restore database nyata".

Permission:

- `backup.create`.
- `backup.restore`.

## 8. Shared UI specification

### 8.1 FormDrawer

- Drawer side right di desktop.
- Full-screen sheet di mobile.
- Title, description, form, sticky footer.
- Cancel dan save.
- Save loading state.
- Dirty form confirmation.
- Focus trap, Escape, restore focus.

### 8.2 ConfirmDialog

- Title, description, consequence.
- Cancel dan confirm.
- Confirm destructive memakai danger variant.
- Loading state.
- Escape dan focus management.

### 8.3 DataTableToolbar

- Search input.
- Filter slots.
- Reset filter.
- Result count.
- Mobile filter sheet.
- Debounce search 250 ms.

### 8.4 SortableTableHead

- Button di header.
- `aria-sort`.
- Indicator asc/desc.
- Sort state controlled oleh page.

### 8.5 TableSkeleton

- 5 sampai 8 baris skeleton.
- Mempertahankan lebar kolom.
- `aria-busy`.

### 8.6 TableEmpty

- Empty state di dalam table.
- Title, description, action jika relevan.
- Tidak memakai "No data".

### 8.7 TablePagination

- Page size 10.
- Previous, next, page numbers.
- `aria-current`.
- Disabled state.

### 8.8 ResponsiveList

- Table desktop.
- Card list mobile.
- Satu render prop untuk mobile card.
- Tidak ada horizontal overflow halaman.

### 8.9 QrPlaceholder

- Pola QR palsu yang deterministik.
- Label "Pratinjau QR".
- Tidak diklaim scannable.
- Copy link token contoh.
- Print preview.

### 8.10 MockControls

- Hanya di `/app/design-system`.
- Toggle latency.
- Fail next request.
- Reset store.
- Tidak muncul di production path.

## 9. Form specification

Semua form memakai RHF + Zod.

### 9.1 Login

```ts
const loginSchema = z.object({
  identity: z.string().min(1, "Email atau username wajib diisi."),
  password: z.string().min(6, "Kata sandi minimal 6 karakter."),
});
```

### 9.2 Business

```ts
const businessSchema = z.object({
  name: z.string().min(1, "Nama bisnis wajib diisi."),
  code: z.string().min(3).max(10),
  address: z.string().optional(),
  phone: z.string().optional(),
});
```

### 9.3 Outlet

```ts
const outletSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(2).max(10),
  address: z.string().optional(),
  isActive: z.boolean(),
});
```

### 9.4 Category

```ts
const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
});
```

### 9.5 Product

```ts
const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string().min(1),
  basePrice: z.number().int().min(0),
  isAvailable: z.boolean(),
  isActive: z.boolean(),
  variants: z.array(variantSchema),
  addOns: z.array(productAddOnSchema),
});
```

### 9.6 Table

```ts
const tableSchema = z.object({
  name: z.string().min(1),
  outletId: z.string().min(1),
  status: z.enum(["AVAILABLE", "OCCUPIED", "INACTIVE"]),
  isActive: z.boolean(),
});
```

### 9.7 User

```ts
const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["OWNER", "CASHIER", "BARISTA"]),
  outletIds: z.array(z.string()).min(1),
  isActive: z.boolean(),
});
```

### 9.8 Role

```ts
const roleSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(2).max(20),
  description: z.string().optional(),
  permissionCodes: z.array(z.string()).min(1),
});
```

### 9.9 Cancel order

```ts
const cancelOrderSchema = z.object({
  reason: z.string().min(3, "Alasan minimal 3 karakter."),
});
```

### 9.10 Settings

```ts
const settingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  timeZone: z.literal("Asia/Jakarta"),
});
```

Validasi copy:

- Bahasa Indonesia.
- Spesifik.
- Tidak menyalahkan pengguna.
- Menjelaskan cara memperbaiki.

## 10. Mock data seed

### 10.1 Business

- Nama: RAVIKA
- Kode: RVK
- Alamat: Jakarta Selatan
- Telepon: nomor contoh

### 10.2 Outlets

- RAVIKA Kemang, KMG, Jakarta Selatan.
- RAVIKA Senopati, SNP, Jakarta Selatan.

### 10.3 Categories

- Kopi
- Non-kopi
- Makanan
- Snack
- Manual Brew

### 10.4 Products

Minimal 12 produk dengan:

- kategori,
- harga,
- ketersediaan,
- status aktif,
- 2 produk memiliki varian,
- 3 produk memiliki add-on.

### 10.5 Tables

Minimal 8 meja:

- 4 di Kemang,
- 4 di Senopati,
- status AVAILABLE, OCCUPIED, INACTIVE.

### 10.6 Users

- 3 akun demo.
- 2 user tambahan untuk daftar management.
- Role OWNER, CASHIER, BARISTA.

### 10.7 Roles

- OWNER
- CASHIER
- BARISTA

Built-in role tidak bisa dihapus.

### 10.8 Orders

Minimal 24 order:

- DINE_IN dan TAKEAWAY.
- CASHIER dan QR.
- Status NEW, ACCEPTED, PREPARING, READY, COMPLETED, CANCELLED.
- Payment UNPAID, PARTIALLY_PAID, PAID, REFUNDED.
- Tersebar di 2 outlet dan 7 hari.
- Item snapshot dan add-on snapshot.

### 10.9 Payments

Minimal 30 payment:

- CASH, QRIS, TRANSFER, E_WALLET.
- Beberapa order memiliki split payment.
- Payment record memiliki recordedBy.

### 10.10 License

- Status VALID.
- Business identifier RAVIKA.
- Installation ID mock.
- Masa berlaku mock.

### 10.11 Backup

- 3 record backup.
- Status READY.
- Ukuran dan waktu mock.

## 11. State handling

Setiap halaman data:

- Loading: skeleton.
- Empty: pesan spesifik dan action jika relevan.
- Error: pesan, retry.
- Success: toast untuk mutasi.
- Permission denied: `PermissionDeniedState`.
- Offline: `OfflineState` jika service gagal karena koneksi.
- Pending: tombol loading dan disabled.
- Dirty form: confirm sebelum close.

Setiap form:

- Inline validation.
- Server/mock error di atas form atau toast.
- Input tetap ada setelah error.
- Save disabled saat pending.
- Success menutup drawer dan refresh list.

## 12. Responsive

| Area | Mobile | Tablet | Desktop |
|---|---|---|---|
| Login | Satu kolom | Satu kolom | Split |
| Dashboard | Satu kolom | Satu kolom | Dua kolom |
| Lists | Card list | Card atau table | Table |
| Forms | Full-screen sheet | Drawer | Drawer |
| Filters | Filter sheet | Inline | Inline |
| Reports | Card summary dan table scroll | Ringkasan dan chart | Penuh |
| Settings | Satu kolom | Satu kolom | Dua kolom |

Aturan:

- Tidak ada horizontal overflow halaman.
- Target sentuh minimal 44 px.
- Sticky header tidak menutupi fokus.
- Drawer mobile memakai full-screen.
- Table desktop memakai sortable header.
- Pagination tetap dapat digunakan di mobile.

## 13. Accessibility

- WCAG 2.2 AA.
- Semua field memiliki label.
- Error terhubung ke field.
- Focus ring terlihat.
- Drawer dan dialog focus trap.
- Escape menutup overlay.
- `aria-sort` pada table.
- `aria-current` pada pagination dan nav.
- Status tidak hanya warna.
- Touch target 44 px.
- Reduced motion.
- Tidak ada clickable div.
- Tidak ada placeholder sebagai satu-satunya label.

## 14. Copywriting

- Bahasa Indonesia.
- Sentence case.
- Tanpa em dash.
- Tanpa middle dot untuk metadata.
- CTA spesifik.
- Empty state menjelaskan sebab dan action.
- Error menjelaskan apa yang gagal dan cara memperbaiki.
- Data mock diberi label "Data contoh" atau "Data simulasi".
- Tidak ada klaim keamanan atau performa palsu.

Contoh:

| Konteks | Copy |
|---|---|
| Login | Masuk |
| Dashboard | Buat pesanan |
| Products | Tambah produk |
| Categories | Tambah kategori |
| Tables | Tambah meja |
| Orders | Lihat detail |
| Payments | Lihat pembayaran |
| Users | Tambah pengguna |
| Roles | Simpan izin |
| Outlets | Tambah outlet |
| Reports | Terapkan filter |
| Backup | Buat backup |
| Restore | Pulihkan data |
| Empty products | Belum ada produk. Tambah produk pertama untuk mulai. |
| Empty orders | Belum ada pesanan pada filter ini. |
| Error | Data gagal dimuat. Coba lagi. |

## 15. QA matrix

| Surface | 390 | 768 | 1024 | 1440 | Light | Dark | Keyboard |
|---|---|---|---|---|---|---|---|
| Login | Ya | Ya | Ya | Ya | Ya | Ya | Ya |
| Dashboard | Ya | Ya | Ya | Ya | Ya | Ya | Ya |
| Products | Ya | Ya | Ya | Ya | Ya | Ya | Ya |
| Categories | Ya | Ya | Ya | Ya | Ya | Ya | Ya |
| Tables | Ya | Ya | Ya | Ya | Ya | Ya | Ya |
| Orders | Ya | Ya | Ya | Ya | Ya | Ya | Ya |
| Payments | Ya | Ya | Ya | Ya | Ya | Ya | Ya |
| Users | Ya | Ya | Ya | Ya | Ya | Ya | Ya |
| Roles | Ya | Ya | Ya | Ya | Ya | Ya | Ya |
| Outlets | Ya | Ya | Ya | Ya | Ya | Ya | Ya |
| Settings | Ya | Ya | Ya | Ya | Ya | Ya | Ya |
| Reports | Ya | Ya | Ya | Ya | Ya | Ya | Ya |
| License | Ya | Ya | Ya | Ya | Ya | Ya | Ya |
| Backup | Ya | Ya | Ya | Ya | Ya | Ya | Ya |

## 16. Acceptance criteria

Fase 2 selesai jika:

- Semua halaman management dapat diakses melalui mega menu.
- Login mock, sessionStorage, guard, dan logout berfungsi.
- Role landing benar.
- Permission-aware nav dan action berfungsi.
- Products, Categories, Tables, Users, Roles, Outlets, Business dapat CRUD simulasi.
- Orders dan Payments read-only dengan filter dan detail.
- Orders dapat dibatalkan sesuai aturan mock.
- Search, filter, sort, dan pagination berfungsi.
- Form memakai RHF + Zod dan menampilkan validasi.
- Loading, empty, error, dan success state tersedia.
- Data mock konsisten antar halaman.
- QR placeholder tidak diklaim scannable.
- Tidak ada upload gambar produk.
- Tidak ada pajak, diskon, atau biaya layanan.
- Tidak ada backend, database, API, atau SSE.
- `pnpm check` lulus.
- `pnpm build` lulus.
- Tidak ada overflow di 320.
- Light/dark, keyboard, dan contrast teruji.
- Antislop Delivery Gate PASS.

## 17. Delivery Gate

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
- Search, filter, sort, pagination berfungsi.
- Touch target minimal 44 px.
- Reduced motion dihormati.
- Tidak ada dependency baru selain RHF, Zod, dan resolver.

## 18. Implementation order

1. P2-00 Shared foundation.
2. P2-01 Authentication UI.
3. P2-02 Dashboard.
4. P2-03 Products.
5. P2-04 Categories.
6. P2-05 Tables dan QR.
7. P2-06 Orders.
8. P2-07 Payments.
9. P2-08 Users.
10. P2-09 Roles dan Permissions.
11. P2-10 Outlets.
12. P2-11 Settings.
13. P2-12 Reports.
14. P2-13 License.
15. P2-14 Backup.
16. P2-15 QA dan docs.

Setiap task selesai jika:

- Implementasi dan typecheck lulus.
- Interaksi utama dapat didemonstrasikan.
- Loading, empty, error, success state tersedia.
- Responsive dan keyboard diperiksa.
- Tidak ada console error.
- Tidak ada P0/P1.

## 19. File map

Baru:

- `src/types/domain.ts`
- `src/mocks/permissions.ts`
- `src/mocks/management/seed.ts`
- `src/mocks/management/store.ts`
- `src/mocks/management/service.ts`
- `src/mocks/management/hooks.ts`
- `src/mocks/management/controls.ts`
- `src/features/auth/mock-session.tsx`
- `src/features/auth/require-session.tsx`
- `src/features/auth/login-form.tsx`
- `src/features/management/form-drawer.tsx`
- `src/features/management/confirm-dialog.tsx`
- `src/features/management/data-table-toolbar.tsx`
- `src/features/management/sortable-table-head.tsx`
- `src/features/management/table-skeleton.tsx`
- `src/features/management/table-empty.tsx`
- `src/features/management/table-pagination.tsx`
- `src/features/management/responsive-list.tsx`
- `src/features/management/qr-placeholder.tsx`
- `src/features/management/mock-controls.tsx`
- `src/features/management/permission-gate.tsx`

Diubah:

- `src/app/layout.tsx`
- `src/app/(auth)/login/page.tsx`
- `src/app/(dashboard)/app/layout.tsx`
- `src/app/(dashboard)/app/page.tsx`
- `src/app/(dashboard)/app/products/page.tsx`
- `src/app/(dashboard)/app/categories/page.tsx`
- `src/app/(dashboard)/app/tables/page.tsx`
- `src/app/(dashboard)/app/orders/page.tsx`
- `src/app/(dashboard)/app/payments/page.tsx`
- `src/app/(dashboard)/app/users/page.tsx`
- `src/app/(dashboard)/app/roles/page.tsx`
- `src/app/(dashboard)/app/outlets/page.tsx`
- `src/app/(dashboard)/app/settings/page.tsx`
- `src/app/(dashboard)/app/reports/page.tsx`
- `src/app/(dashboard)/app/license/page.tsx`
- `src/app/(dashboard)/app/backup/page.tsx`
- `src/app/(dashboard)/app/design-system/page.tsx`
- `src/components/shells/management-shell.tsx`
- `src/components/shells/pos-shell.tsx`
- `src/components/shells/kds-shell.tsx`
- `src/mocks/navigation.ts`
- `src/mocks/session.ts`
- `src/mocks/outlets.ts`
- `src/types/auth.ts`
- `package.json`
- `README.md`
- `AGENTS.md`
- `docs/design/design-system.md` jika ada komponen baru

## 20. Risks

| Risiko | Mitigasi |
|---|---|
| Mock store tersebar | Satu store dan satu service contract |
| SessionStorage disalahartikan sebagai keamanan | Label jelas dan guard hanya simulasi |
| Drawer CRUD terlalu banyak | Satu FormDrawer dan satu pola validasi |
| Permission matrix membingungkan | Grup permission dan label Indonesia |
| Data mock tidak konsisten | Seed ID stabil dan service agregasi |
| Orders dan Payments menambah scope | Payments read-only, Orders tanpa create |
| QR placeholder disalahartikan | Label "Pratinjau QR, belum scannable" |
| Gambar produk belum ada | Placeholder netral dan icon kategori |
| Settings melebar | Hanya field PRD yang jelas |
| Test runner belum ada | Lint, typecheck, build, Playwright manual |

## 21. Open items dari PRD

| ID | Dampak ke Fase 2 | Perlakuan |
|---|---|---|
| OPEN-002 | Login identity | Demo memakai email dan username |
| OPEN-003 | Zona waktu | Tampilkan Asia/Jakarta dengan catatan pilot |
| OPEN-005 | Diskon | Tidak ada field diskon |
| OPEN-006 | Pajak dan biaya layanan | Tidak ada field pajak |
| OPEN-007 | Uang kembalian | Tidak ada di management |
| OPEN-008 | Refund | Payments read-only, tanpa refund |
| OPEN-009 | Takeaway QR | Tidak ada di management |
| OPEN-010 | Data pelanggan takeaway | Tidak ada di management |
| OPEN-011 | Pembatalan setelah preparing | Mock policy, catat belum final |
| OPEN-013 | Penyimpanan gambar | Placeholder netral |
| OPEN-015 | Spesifikasi server | Tidak relevan di UI |

## 22. Handoff ke Fase 3

Setelah Fase 2 selesai:

- Management UI siap direview.
- Mock service dan types siap dipakai ulang.
- Fase 3 membangun POS, KDS, dan QR Menu penuh.
- Fase 3 memakai fixture yang sama atau turunan yang konsisten.
- Jangan mengubah shell dan design system yang sudah disetujui tanpa spec baru.
- Jangan mulai backend sebelum UI Approval Gate M4.
