# RAVIKA POS — Design Direction

> **Status:** Approved  
> **Version:** 1.0.0  
> **Product tagline:** Run your business with clarity.

## 1. Design concept

**Modern Operational SaaS**

RAVIKA POS harus terasa seperti software bisnis modern yang matang: bersih, terstruktur, profesional, dan dapat diandalkan. Visual tidak boleh terasa seperti template admin generik yang dipenuhi kartu statistik, gradient, dan dekorasi tanpa tujuan.

Arah visual menggabungkan:

- Kejelasan dashboard bisnis modern.
- Kecepatan dan keterbacaan software POS.
- Visibilitas tinggi pada kitchen display.
- Kesederhanaan pengalaman mobile customer menu.

## 2. Brand expression

### Brand attributes

- Modern
- Professional
- Reliable
- Clear
- Practical
- Efficient

### Brand personality

RAVIKA berbicara dengan nada yang tenang, ringkas, jelas, dan membantu. Hindari bahasa yang terlalu kasual, terlalu teknis untuk pengguna operasional, atau terlalu promosi.

### Tagline

**Run your business with clarity.**

Tagline digunakan pada materi brand atau halaman yang relevan. Tidak perlu ditampilkan di setiap halaman aplikasi karena ruang antarmuka harus digunakan untuk tugas operasional.

## 3. Logo usage direction

Logo RAVIKA menggunakan geometric R monogram dengan karakter modern dan profesional.

Pedoman:

- Gunakan logomark dan wordmark resmi yang telah disetujui.
- Pertahankan proporsi dan clear space.
- Jangan memiringkan, meregangkan, mengubah bentuk, atau menambahkan efek yang tidak disetujui.
- Gunakan versi berwarna pada latar yang memiliki kontras memadai.
- Siapkan versi monochrome/one-color untuk konteks terbatas.
- Jangan menempatkan logo besar di setiap halaman internal; gunakan ukuran ringkas pada topbar atau login.
- Untuk app icon, gunakan logomark saja.
- File hasil generasi gambar adalah referensi visual raster; sebelum produksi final, gunakan master SVG/vector yang telah diperiksa dan disetujui.

## 4. Visual language

### 4.1 Overall appearance

- Background netral dan tenang.
- Konten dikelompokkan dengan spacing dan alignment.
- Border tipis lebih diutamakan daripada shadow tebal.
- Shadow hanya untuk elevasi yang memiliki makna, misalnya popover, dialog, atau floating cart.
- Warna brand digunakan untuk aksi utama dan penekanan, bukan untuk mewarnai semua elemen.
- Gunakan radius konsisten, umumnya 8–12 px.

### 4.2 Avoid

- Gradient besar sebagai background dashboard.
- Glassmorphism sebagai gaya utama.
- Neumorphism.
- Excessive rounded pills untuk seluruh komponen.
- Shadow berat pada semua card.
- Terlalu banyak warna aksen.
- Chart dekoratif tanpa nilai operasional.
- Animasi yang menghambat transaksi.
- Layout yang terlalu padat atau terlalu kosong.
- Emoji sebagai pengganti ikon UI.

## 5. Color direction

### 5.1 Brand colors

| Token       | Hex       | Intended use                             |
| ----------- | --------- | ---------------------------------------- |
| Deep Navy   | `#101828` | Strong text, dark surfaces, brand anchor |
| Brand Blue  | `#315B91` | Primary brand tone                       |
| Accent Blue | `#3978D5` | Primary interactive accent               |
| White       | `#FFFFFF` | Light surfaces                           |
| Light Gray  | `#F3F5F8` | Subtle background                        |

### 5.2 Semantic colors

| Semantic | Suggested base | Meaning                        |
| -------- | -------------- | ------------------------------ |
| Success  | `#16A36A`      | Completed / successful         |
| Warning  | `#D99019`      | Needs attention / waiting      |
| Danger   | `#DC4C4C`      | Failed / destructive           |
| Info     | `#3978D5`      | Informational / neutral action |

Semantic colors must be adapted into light and dark theme tokens. Do not use the same raw color blindly for foreground, background, and border.

### 5.3 Theme direction

**Light theme**

- Main canvas: white or very light neutral.
- Elevated surfaces: white.
- Borders: subtle cool gray.
- Primary text: Deep Navy.
- Secondary text: neutral gray.
- Primary action: Accent Blue.

**Dark theme**

- Main canvas: deep neutral/navy, not pure black.
- Elevated surfaces: slightly lighter neutral layers.
- Borders: low-contrast but visible.
- Primary text: near-white.
- Secondary text: muted neutral.
- Primary action: blue adjusted for sufficient contrast.

Do not simply invert light theme colors. Re-evaluate contrast, elevation, chart colors, disabled states, and semantic colors independently.

## 6. Typography direction

Primary typeface: **Plus Jakarta Sans**.  
Alternative: **Inter**.

Use typography to establish hierarchy:

- Page title: clear and prominent.
- Section title: moderate emphasis.
- Body: highly readable.
- Labels: concise and medium weight.
- Metadata: smaller but still legible.
- Monetary values: use tabular numerals where supported.

Avoid using many font weights or oversized headings in operational screens.

## 7. Iconography and imagery

### Iconography

Use Lucide Icons with consistent stroke weight and sizing. Icons must reinforce labels, not replace important text where ambiguity may occur.

### Product imagery

- Use consistent aspect ratios within a product collection.
- Prefer real product photography supplied by the business.
- Use a neutral image container and predictable crop behavior.
- Provide a fallback when an image is missing or fails to load.
- Do not allow product images to shift card dimensions during loading.

### Empty-state illustrations

Use simple, restrained illustrations only when they help explain why a list is empty or what action to take. Avoid decorative illustrations on every page.

## 8. Layout direction

### 8.1 Management shell

- Topbar-first navigation.
- Brand at left.
- Primary navigation grouped by task.
- Outlet context selector when relevant.
- Utility actions and user menu at right.
- Content area uses a consistent max-width strategy; data-heavy pages may use available width.
- Breadcrumbs only where hierarchy is meaningful.

### 8.2 Dedicated POS

- Separate operational shell.
- Compact header with business/outlet and cashier context.
- Product discovery area as the main workspace.
- Cart/order summary persistently visible on desktop.
- Checkout action visually prominent.
- On small screens, cart becomes a drawer or dedicated panel.
- Avoid management navigation and analytics distractions.

### 8.3 KDS

- Board layout organized by preparation state.
- Large order identifiers and readable item lines.
- Strong status contrast.
- Timer and elapsed time visible.
- Minimal chrome and limited navigation.
- Dark theme as initial default; user/system theme support remains available.

### 8.4 Customer QR Menu

- Mobile-first page.
- Business identity and outlet context at top.
- Search and category navigation accessible.
- Product cards prioritize name, price, availability, and add action.
- Cart summary remains easy to reach.
- Checkout is a short, clear sequence.

## 9. Component styling direction

| Component         | Direction                                                       |
| ----------------- | --------------------------------------------------------------- |
| Buttons           | Clear hierarchy; solid primary, subtle secondary                |
| Inputs            | Visible border, clear label, explicit focus/error               |
| Cards             | Flat surfaces, subtle border                                    |
| Tables            | Clean rows, clear alignment, readable numeric columns           |
| Badges            | Restrained semantic labels                                      |
| Dialogs           | Focused content, explicit actions                               |
| Drawers           | Used for secondary tasks and mobile cart                        |
| Tabs              | Used for peer-level content, not as a substitute for navigation |
| Charts            | Restrained palette, clear units and labels                      |
| POS product cards | Large touch target, clear price and availability                |
| KDS tickets       | High contrast, clear status and timing                          |

## 10. Motion direction

Motion should be subtle, fast, and purposeful.

Use motion for:

- Opening and closing dialogs/drawers.
- Confirming an item was added to cart.
- Updating order state.
- Showing transient feedback.

Avoid:

- Long entrance animations.
- Continuous decorative movement.
- Layout shifts.
- Animations that delay input or transaction completion.

Honor reduced-motion preferences.

## 11. Screen direction by experience

### Owner dashboard

Prioritize business overview, outlet/date context, sales, transaction count, order status, top products, and recent transactions. Avoid filling the first viewport with unrelated widgets.

### Orders and transaction history

Prioritize order number, date/time, outlet, order type, payment status, order/preparation status, total, and accessible detail action. Keep payment state separate from preparation state.

### Product management

Prioritize search, category filters, product status, price, variants/add-ons, and clear create/edit flows. Destructive actions require confirmation and permission.

### Dedicated POS

Prioritize product search, category selection, item customization, cart, total, and checkout. Reduce distractions and preserve cart context.

### KDS

Prioritize new orders, order contents, elapsed time, and next available state transition. READY remains visible until picked up/completed.

### Reports

Prioritize date/outlet filters, metric definitions, currency formatting, and legible charts/tables. Avoid implying precision or metrics not supported by product data.

### Settings and system

Group settings by purpose. License, backup, and system health must have explicit status and actionable guidance.

## 12. Responsive art direction

- Desktop: use space for parallel work areas and data tables.
- Tablet: preserve touch-friendly controls and reduce secondary columns.
- Mobile: show one primary task at a time; use drawers or dedicated screens for secondary content.
- Never shrink desktop UI proportionally until text and controls become unusable.
- Test long labels, large monetary values, empty states, and error messages at narrow widths.

## 13. Reference search terms

When designers or agents need additional visual references, search for:

- Modern business management dashboard top navigation
- Clean restaurant POS product grid and persistent cart
- High-contrast restaurant kitchen display system
- Minimal mobile restaurant QR ordering menu
- Enterprise SaaS light and dark design system

References are inspiration only. Do not copy another product's brand, layout, or proprietary visual identity.
