# RAVIKA POS - Spesifikasi Fase 4: Frontend Review, Revision, and Approval

**Status:** Audit penuh berlangsung
**Fase:** 4, Frontend Review, Revision, and Approval
**Tanggal:** 16 November 2026
**Audit dimulai:** 17 November 2026
**Baseline audit:** `b4a5d60`
**Referensi utama:** `docs/PRD.md`, `docs/ROADMAP.md`, `docs/design/design-brief.md`, `docs/design/design-direction.md`, `docs/design/design-system.md`, `docs/design/ui-ux-guidelines.md`, `docs/specification/phase-2-management-ui.md`, `docs/specification/phase-3-operational-ui.md`

## Daftar isi

- [RAVIKA POS - Spesifikasi Fase 4: Frontend Review, Revision, and Approval](#ravika-pos---spesifikasi-fase-4-frontend-review-revision-and-approval)
  - [Daftar isi](#daftar-isi)
  - [0. Agent quick start](#0-agent-quick-start)
    - [0.1 Prioritas dokumen](#01-prioritas-dokumen)
    - [0.2 Istilah](#02-istilah)
  - [1. Ringkasan](#1-ringkasan)
  - [2. Goals, non-goals, anti-goals](#2-goals-non-goals-anti-goals)
    - [Goals](#goals)
    - [Non-goals](#non-goals)
    - [Anti-goals](#anti-goals)
  - [3. Keputusan yang dikunci](#3-keputusan-yang-dikunci)
  - [4. Scope dan route inventory](#4-scope-dan-route-inventory)
    - [4.1 Route user-facing](#41-route-user-facing)
    - [4.2 Route internal](#42-route-internal)
    - [4.3 Out of scope](#43-out-of-scope)
  - [5. Peran dan tanggung jawab](#5-peran-dan-tanggung-jawab)
    - [5.1 Product owner](#51-product-owner)
    - [5.2 Main agent](#52-main-agent)
    - [5.3 Fix subagent](#53-fix-subagent)
    - [5.4 Reviewer subagent](#54-reviewer-subagent)
  - [6. Prinsip review](#6-prinsip-review)
  - [7. Review matrix](#7-review-matrix)
    - [7.1 Theme dan viewport](#71-theme-dan-viewport)
    - [7.2 Kedalaman per route](#72-kedalaman-per-route)
    - [7.3 Functional flows](#73-functional-flows)
    - [7.4 Cross-cutting](#74-cross-cutting)
  - [8. Metode audit](#8-metode-audit)
    - [8.1 Evidence](#81-evidence)
    - [8.2 Pass 1: Visual dan responsive](#82-pass-1-visual-dan-responsive)
    - [8.3 Pass 2: Functional](#83-pass-2-functional)
    - [8.4 Pass 3: Cross-cutting](#84-pass-3-cross-cutting)
    - [8.5 Console dan runtime](#85-console-dan-runtime)
    - [8.6 Keyboard dan screen reader](#86-keyboard-dan-screen-reader)
  - [9. Issue management](#9-issue-management)
    - [9.1 Skema issue](#91-skema-issue)
    - [9.2 Klasifikasi prioritas](#92-klasifikasi-prioritas)
    - [9.3 Known limitation](#93-known-limitation)
    - [9.4 Triage](#94-triage)
    - [9.5 Fix policy](#95-fix-policy)
  - [10. Fix workflow dan subagent](#10-fix-workflow-dan-subagent)
    - [10.1 Main agent](#101-main-agent)
    - [10.2 Fix subagent](#102-fix-subagent)
    - [10.3 Reviewer subagent](#103-reviewer-subagent)
    - [10.4 Verifikasi fix](#104-verifikasi-fix)
    - [10.5 Commit](#105-commit)
    - [10.6 Template task fix](#106-template-task-fix)
  - [11. Re-review](#11-re-review)
  - [12. Approval gate M4](#12-approval-gate-m4)
    - [12.1 Kriteria approval](#121-kriteria-approval)
    - [12.2 Sign-off record](#122-sign-off-record)
    - [12.3 Baseline dan tag](#123-baseline-dan-tag)
    - [12.4 Post-approval change control](#124-post-approval-change-control)
  - [13. QA matrix](#13-qa-matrix)
  - [14. Responsive rules](#14-responsive-rules)
  - [15. Accessibility rules](#15-accessibility-rules)
  - [16. Copywriting dan formatting](#16-copywriting-dan-formatting)
  - [17. State handling](#17-state-handling)
  - [18. Operational reliability](#18-operational-reliability)
  - [19. Known limitations](#19-known-limitations)
  - [20. Risks dan mitigation](#20-risks-dan-mitigation)
  - [21. Implementation order](#21-implementation-order)
    - [Task 0: Baseline dan dokumen](#task-0-baseline-dan-dokumen)
    - [Task 1: Audit pass 1](#task-1-audit-pass-1)
    - [Task 2: Audit pass 2](#task-2-audit-pass-2)
    - [Task 3: Audit pass 3](#task-3-audit-pass-3)
    - [Task 4: Triage](#task-4-triage)
    - [Task 5 sampai N: Fix batch](#task-5-sampai-n-fix-batch)
    - [Task N+1: Re-review](#task-n1-re-review)
    - [Task N+2: Demo dan sign-off](#task-n2-demo-dan-sign-off)
    - [Task N+3: Handoff ke Fase 5](#task-n3-handoff-ke-fase-5)
  - [22. File map](#22-file-map)
    - [Dokumen](#dokumen)
    - [Route](#route)
    - [Komponen](#komponen)
    - [Data](#data)
  - [23. Riwayat issue awal](#23-riwayat-issue-awal)
  - [24. Open items dan handoff ke Fase 5](#24-open-items-dan-handoff-ke-fase-5)
    - [Open items](#open-items)
    - [Handoff ke Fase 5](#handoff-ke-fase-5)
  - [Appendix A: Route checklist](#appendix-a-route-checklist)
  - [Appendix B: Flow scripts](#appendix-b-flow-scripts)
    - [B.1 Auth](#b1-auth)
    - [B.2 Management](#b2-management)
    - [B.3 POS](#b3-pos)
    - [B.4 KDS](#b4-kds)
    - [B.5 Customer QR](#b5-customer-qr)
    - [B.6 Cross-tab](#b6-cross-tab)
  - [Appendix C: Evidence checklist](#appendix-c-evidence-checklist)
  - [Appendix D: Approval template](#appendix-d-approval-template)

## 0. Agent quick start

Baca dokumen ini sebelum melakukan audit, revisi, atau approval UI.

Aturan wajib:

1. Fase 4 hanya review, revisi, dan approval frontend.
2. Jangan menambah fitur baru, route baru, atau dependency baru tanpa persetujuan product owner.
3. Jangan membuat backend, database, API, auth nyata, atau SSE.
4. Jangan mengubah business rules, data model, payment, permission, atau state tanpa keputusan product owner.
5. Gunakan mock data dan mock service yang sudah ada.
6. Gunakan design tokens dan komponen yang sudah ada.
7. Setiap temuan harus dicatat sebagai issue dengan bukti.
8. Semua issue P0, P1, P2, dan P3 UI wajib selesai sebelum approval.
9. Batasan pengujian dan issue arsitektur dicatat sebagai known limitation dengan persetujuan tertulis.
10. Audit browser dilakukan oleh main agent. Fix task didelegasikan ke subagent. Reviewer terpisah memeriksa hasil fix.
11. Setiap fix batch wajib lulus `pnpm check`, `pnpm build`, dan retest Playwright pada area yang berubah.
12. Jangan menyatakan PASS tanpa bukti.
13. Product owner wajib menyatakan approval eksplisit sebelum M4 dicatat.
14. Jangan memulai Fase 5 sebelum M4 disetujui.

### 0.1 Prioritas dokumen

Jika terjadi konflik:

1. `docs/PRD.md` untuk scope produk, business rules, permission, dan state.
2. `docs/design/design-system.md` untuk token dan komponen.
3. `docs/design/design-direction.md` dan `docs/design/ui-ux-guidelines.md` untuk penerapan visual dan interaksi.
4. `docs/ROADMAP.md` untuk urutan fase dan gate.
5. Dokumen ini untuk metode review, klasifikasi issue, workflow revisi, dan approval Fase 4.

Jika ditemukan requirement ambigu yang memengaruhi workflow, data, pembayaran, permission, atau state, berhenti dan minta keputusan product owner.

### 0.2 Istilah

| Istilah          | Arti                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------ |
| Phase 4          | Frontend review, revision, and approval                                              |
| M4               | Milestone UI Approved                                                                |
| P0               | Blocker, alur utama tidak dapat digunakan atau UI salah fundamental                  |
| P1               | High, kesalahan besar pada layout, navigasi, atau interaksi utama                    |
| P2               | Medium, inkonsistensi atau usability yang tidak memblokir alur utama                 |
| P3               | Low, detail kosmetik atau penyempurnaan minor                                        |
| Known limitation | Batasan pengujian atau arsitektur yang disetujui, bukan issue UI                     |
| Issue register   | Daftar temuan dengan bukti, prioritas, status, dan commit                            |
| Audit pass       | Satu putaran review dengan fokus tertentu                                            |
| Fix batch        | Satu kelompok issue yang diperbaiki dalam satu task                                  |
| Reviewer         | Subagent independen yang memeriksa diff dan hasil fix                                |
| Evidence         | Screenshot, console log, route, viewport, langkah reproduksi, atau catatan pengujian |
| Baseline         | Commit UI yang disetujui setelah M4                                                  |

## 1. Ringkasan

Fase 4 memastikan seluruh frontend RAVIKA POS siap menjadi baseline backend.

Fase ini mencakup:

- Review visual light dan dark.
- Review responsive dari mobile sampai layar lebar.
- Review dashboard dan seluruh halaman management.
- Review alur POS dari pemilihan produk sampai pembayaran.
- Review alur KDS dan perubahan status.
- Review customer QR Menu dan status publik.
- Review copywriting, format uang, tanggal, dan waktu.
- Review empty, loading, error, disabled, dan success state.
- Review navigasi, konsistensi komponen, aksesibilitas, dan usability.
- Perbaikan issue berdasarkan prioritas.
- Re-review setelah revisi.
- Approval product owner dan penetapan baseline UI.

Fase 4 bukan redesign dan bukan penambahan fitur. Arah visual sudah ditetapkan. Fase ini menutup gap antara UI yang sudah dibangun dan ekspektasi produk.

## 2. Goals, non-goals, anti-goals

### Goals

- Semua halaman MVP tersedia dan dapat diakses.
- Semua alur utama dapat didemonstrasikan dengan data dummy.
- Tidak ada issue P0, P1, P2, atau P3 UI yang OPEN sebelum approval.
- Light dan dark theme terbaca dan konsisten.
- Layout responsive pada 320, 390, 768, 1024, 1440, dan 1920 spot-check.
- Copywriting konsisten, jelas, dan sesuai aturan proyek.
- State loading, empty, error, disabled, dan success tersedia.
- Navigasi dan permission-aware action konsisten.
- Keyboard, focus, Escape, kontras, dan reduced motion diperiksa.
- Issue register lengkap dan dapat diaudit.
- Product owner menyatakan approval eksplisit.
- Baseline UI dicatat dan dibekukan.

### Non-goals

- Tidak ada fitur baru.
- Tidak ada route baru.
- Tidak ada redesign visual.
- Tidak ada backend, database, API, auth nyata, atau SSE.
- Tidak ada payment gateway.
- Tidak ada refund.
- Tidak ada upload gambar produk.
- Tidak ada QR scanner internal.
- Tidak ada test runner baru.
- Tidak ada perubahan dependency tanpa persetujuan.
- Tidak ada perubahan business rule tanpa persetujuan.

### Anti-goals

- Review yang hanya melihat happy path.
- Issue tanpa bukti.
- PASS tanpa screenshot, langkah, atau console check.
- Perbaikan yang mengubah business flow secara diam-diam.
- Perbaikan yang menambah fitur di luar issue.
- Issue P3 yang diabaikan tanpa persetujuan.
- Known limitation yang tidak dicatat.
- Approval yang dicatat tanpa pernyataan product owner.
- UI baseline yang berubah signifikan setelah approval tanpa evaluasi.

## 3. Keputusan yang dikunci

| Topik            | Keputusan                                                           |
| ---------------- | ------------------------------------------------------------------- |
| Cakupan halaman  | 18 route user-facing direview penuh                                 |
| Design system    | Regression check, bukan sign-off produk                             |
| Root redirect    | Smoke test                                                          |
| Theme            | Light dan dark                                                      |
| Viewport         | 320, 390, 768, 1024, 1440, dan 1920 spot-check                      |
| Issue policy     | Semua P0 sampai P3 UI wajib selesai                                 |
| Known limitation | Batasan pengujian dan issue arsitektur dengan persetujuan           |
| Review mode      | Agent audit, product owner demo dan spot-check                      |
| QR fisik         | Known limitation, bukan issue UI                                    |
| Eksekusi         | Audit di main agent, fix dan review lewat subagent                  |
| Dokumen          | Satu dokumen di `docs/specification/phase-4-ui-approval.md`         |
| Approval         | Sign-off tertulis di dokumen dan pernyataan eksplisit product owner |
| Baseline         | Commit dan tag `phase-4-ui-approved`                                |
| Backend          | Tidak dimulai sebelum M4                                            |

## 4. Scope dan route inventory

### 4.1 Route user-facing

| Shell      | Route                  | Kedalaman review |
| ---------- | ---------------------- | ---------------- |
| Auth       | `/login`               | Penuh            |
| Management | `/app`                 | Penuh            |
| Management | `/app/products`        | Penuh            |
| Management | `/app/categories`      | Penuh            |
| Management | `/app/tables`          | Penuh            |
| Management | `/app/orders`          | Penuh            |
| Management | `/app/payments`        | Penuh            |
| Management | `/app/users`           | Penuh            |
| Management | `/app/roles`           | Penuh            |
| Management | `/app/outlets`         | Penuh            |
| Management | `/app/settings`        | Penuh            |
| Management | `/app/reports`         | Penuh            |
| Management | `/app/license`         | Penuh            |
| Management | `/app/backup`          | Penuh            |
| POS        | `/app/pos`             | Penuh            |
| KDS        | `/kds`                 | Penuh            |
| Customer   | `/menu/[token]`        | Penuh            |
| Customer   | `/order/[publicToken]` | Penuh            |

### 4.2 Route internal

| Route                | Perlakuan                               |
| -------------------- | --------------------------------------- |
| `/app/design-system` | Regression check, bukan sign-off produk |
| `/`                  | Smoke test redirect                     |

### 4.3 Out of scope

- Backend, database, API, auth nyata, SSE.
- Fitur baru atau route baru.
- Redesign visual.
- Perubahan business rule.
- Perubahan data model.
- Perubahan permission.
- Perubahan payment.
- Perubahan state order.
- Upload gambar produk.
- QR scanner internal.
- Test runner baru.
- Deployment produksi.

## 5. Peran dan tanggung jawab

### 5.1 Product owner

- Menentukan prioritas produk.
- Menyetujui known limitation.
- Menerima demo.
- Menyatakan approval eksplisit.
- Menyetujui perubahan scope.

### 5.2 Main agent

- Menjalankan audit browser dengan Playwright.
- Mencatat issue dan bukti.
- Menjaga issue register.
- Melakukan triage bersama product owner.
- Membuat task fix yang terbatas.
- Menjalankan `pnpm check`, `pnpm build`, dan retest.
- Meminta review subagent.
- Menjaga agar tidak ada perubahan di luar scope.
- Mencatat sign-off dan baseline.

### 5.3 Fix subagent

- Mengerjakan satu fix batch yang sudah disetujui.
- Mengikuti file dan expected behavior yang diberikan.
- Tidak menambah fitur, dependency, atau perubahan business rule.
- Tidak menyentuh file di luar scope task.
- Melaporkan perubahan, verifikasi, dan blocker.
- Tidak menyatakan PASS tanpa menjalankan verifikasi yang diminta.

### 5.4 Reviewer subagent

- Memeriksa diff fix batch.
- Memeriksa apakah issue benar-benar selesai.
- Memeriksa regresi pada area terkait.
- Memeriksa aksesibilitas dasar dan konsistensi.
- Memberi temuan dengan lokasi dan severity.
- Tidak melakukan scope creep.

## 6. Prinsip review

1. Review terhadap PRD dan design docs, bukan selera pribadi.
2. Review semua halaman, bukan hanya halaman yang sering dipakai.
3. Review semua state, bukan hanya happy path.
4. Review semua breakpoint yang ditetapkan.
5. Review light dan dark.
6. Review keyboard dan focus.
7. Review copy dan format data.
8. Review permission-aware action.
9. Setiap issue punya bukti.
10. Setiap fix punya verifikasi.
11. Tidak ada perubahan di luar issue.
12. Tidak ada backend sebelum M4.

## 7. Review matrix

### 7.1 Theme dan viewport

| Dimensi            | Cakupan                                                   |
| ------------------ | --------------------------------------------------------- |
| Visual light       | 18 route pada 1440                                        |
| Visual dark        | 18 route pada 1440                                        |
| Responsive         | 18 route pada 320, 768, 1024, 1440                        |
| Mobile operasional | 390 untuk POS, KDS, QR menu, status publik                |
| Dark mobile        | 320 dan 768 untuk POS, KDS, QR menu, status publik        |
| Wide               | 1920 spot-check untuk dashboard, tables, orders, POS, KDS |
| Console            | Semua route, light dan dark, target 0 error               |
| Keyboard           | Tab order, focus visible, Escape dialog, focus return     |
| Kontras            | Token light dan dark, teks dan status                     |
| Zoom               | 200% pada 320 dan 390 untuk halaman form dan transaksi    |

### 7.2 Kedalaman per route

| Route                  | Visual     | Responsive | Flow       | State      | A11y       |
| ---------------------- | ---------- | ---------- | ---------- | ---------- | ---------- |
| `/login`               | Ya         | Ya         | Ya         | Ya         | Ya         |
| `/app`                 | Ya         | Ya         | Ya         | Ya         | Ya         |
| `/app/products`        | Ya         | Ya         | Ya         | Ya         | Ya         |
| `/app/categories`      | Ya         | Ya         | Ya         | Ya         | Ya         |
| `/app/tables`          | Ya         | Ya         | Ya         | Ya         | Ya         |
| `/app/orders`          | Ya         | Ya         | Ya         | Ya         | Ya         |
| `/app/payments`        | Ya         | Ya         | Ya         | Ya         | Ya         |
| `/app/users`           | Ya         | Ya         | Ya         | Ya         | Ya         |
| `/app/roles`           | Ya         | Ya         | Ya         | Ya         | Ya         |
| `/app/outlets`         | Ya         | Ya         | Ya         | Ya         | Ya         |
| `/app/settings`        | Ya         | Ya         | Ya         | Ya         | Ya         |
| `/app/reports`         | Ya         | Ya         | Ya         | Ya         | Ya         |
| `/app/license`         | Ya         | Ya         | Ya         | Ya         | Ya         |
| `/app/backup`          | Ya         | Ya         | Ya         | Ya         | Ya         |
| `/app/pos`             | Ya         | Ya         | Ya         | Ya         | Ya         |
| `/kds`                 | Ya         | Ya         | Ya         | Ya         | Ya         |
| `/menu/[token]`        | Ya         | Ya         | Ya         | Ya         | Ya         |
| `/order/[publicToken]` | Ya         | Ya         | Ya         | Ya         | Ya         |
| `/app/design-system`   | Regression | Regression | Regression | Regression | Regression |

### 7.3 Functional flows

- Auth: login owner, cashier, barista, wrong password, redirect guard, logout.
- Dashboard: range, outlet, summary, queue, recent orders, top products.
- Products: create, edit, variant, add-on, search, filter, sort, pagination, availability.
- Categories: create, edit, reorder, delete guard.
- Tables: create, edit, QR, regenerate token, status guard, outlet filter.
- Orders: filter, detail, cancel guard, status history.
- Payments: read-only list, filter, detail.
- Users: create, edit, role, outlet, deactivate guard.
- Roles: permission matrix, read/edit.
- Outlets: create, edit, deactivate guard.
- Settings: business profile, display preference, outlet summary.
- Reports: range, outlet, sales, top products, export if implemented.
- License: status and installation info.
- Backup: create and restore confirmation.
- Design system: component preview and reset mock.
- POS: product discovery, configurator, cart, table, checkout, KDS sync, payment, split payment, payable orders, outlet switch, cart reload.
- KDS: five columns, transitions, timer, outlet switch, empty, sync, permission.
- Customer: valid QR, invalid QR, cart, checkout, status publik, invalid public token, regenerate token.
- Cross-tab: POS ke KDS, KDS ke status publik, reset mock.

### 7.4 Cross-cutting

- Copy Indonesia, tanpa em dash dan middle dot.
- Format Rupiah, tanggal, waktu, dan timezone.
- Empty, loading, error, disabled, dan success state.
- Status pembayaran dan persiapan tetap terpisah.
- Permission-aware navigation dan action.
- Konfirmasi aksi kritis.
- Konsistensi komponen dan navigasi.
- Touch target minimal 44px.
- Keyboard tidak menutup kontrol penting.
- Reduced motion.
- Kontras WCAG AA.
- Status tidak hanya warna.

## 8. Metode audit

### 8.1 Evidence

Setiap issue wajib memiliki:

- ID issue.
- Prioritas.
- Area dan route.
- Viewport dan theme.
- Langkah reproduksi.
- Expected.
- Actual.
- Bukti screenshot atau console.
- Usulan fix.
- Status.
- Commit setelah fix.

Screenshot disimpan di `/tmp/opencode/phase4/` dan tidak masuk repo.

### 8.2 Pass 1: Visual dan responsive

Cakupan:

- 18 route light dan dark pada 1440.
- 18 route pada 320, 768, 1024, 1440.
- 390 untuk POS, KDS, QR menu, status publik.
- 1920 spot-check untuk dashboard, tables, orders, POS, KDS.
- Overflow horizontal.
- Clipping.
- Hierarchy.
- Spacing.
- Typography.
- Warna dan kontras.
- Sticky dan fixed element.
- Bottom sheet dan dialog.
- Touch target.
- Keyboard tidak menutup kontrol.

Output:

- Issue visual dan layout.
- Screenshot per route.
- Catatan viewport yang gagal.

### 8.3 Pass 2: Functional

Cakupan:

- Auth dan permission.
- Management CRUD dan guard.
- POS end-to-end.
- KDS end-to-end.
- Customer QR end-to-end.
- Cross-tab sync.
- State loading, empty, error, disabled, success.
- Double submit.
- Failed action.
- Confirmation.
- Focus return.

Output:

- Issue fungsional dan usability.
- Langkah reproduksi.
- Bukti console dan screenshot.

### 8.4 Pass 3: Cross-cutting

Cakupan:

- Copywriting.
- Format uang, tanggal, waktu.
- Label status.
- Konsistensi komponen.
- Navigasi.
- Aksesibilitas.
- Keyboard.
- Kontras.
- Reduced motion.
- Permission-aware action.
- Tidak ada em dash atau middle dot.
- Tidak ada shadow dekoratif.
- Tidak ada glassmorphism.

Output:

- Issue lintas halaman.
- Daftar inkonsistensi.
- Daftar label yang perlu diperbaiki.

### 8.5 Console dan runtime

- Console error 0 pada route utama.
- Tidak ada hydration mismatch.
- Tidak ada uncaught exception.
- Tidak ada warning React yang berulang.
- Tidak ada 404 aset.
- Tidak ada layout shift yang mengganggu.

### 8.6 Keyboard dan screen reader

- Tab order mengikuti urutan visual.
- Focus terlihat.
- Escape menutup dialog dan drawer.
- Focus kembali ke trigger.
- Form label dan error terbaca.
- Status tidak hanya warna.
- Screen reader tidak diuji pada Fase 4. Catat sebagai known limitation.

## 9. Issue management

### 9.1 Skema issue

| Field      | Isi                                                     |
| ---------- | ------------------------------------------------------- |
| ID         | `P4-009` dan seterusnya                                 |
| Prioritas  | P0, P1, P2, P3                                          |
| Area       | Auth, dashboard, management, POS, KDS, customer, global |
| Route      | Path                                                    |
| Viewport   | 320, 390, 768, 1024, 1440, 1920                         |
| Theme      | Light atau dark                                         |
| Langkah    | Reproduksi                                              |
| Expected   | Hasil yang benar                                        |
| Actual     | Hasil sekarang                                          |
| Bukti      | Screenshot, console, atau catatan                       |
| Usulan fix | Perubahan minimum                                       |
| Status     | OPEN, IN_PROGRESS, FIXED, DEFERRED, WONTFIX             |
| Commit     | Hash fix                                                |

### 9.2 Klasifikasi prioritas

| Prioritas | Definisi                                                     | Perlakuan        |
| --------- | ------------------------------------------------------------ | ---------------- |
| P0        | Alur utama tidak dapat digunakan atau UI salah fundamental   | Wajib diperbaiki |
| P1        | Kesalahan besar pada layout, navigasi, atau interaksi utama  | Wajib diperbaiki |
| P2        | Inkonsistensi atau usability yang tidak memblokir alur utama | Wajib diperbaiki |
| P3        | Detail kosmetik atau penyempurnaan minor                     | Wajib diperbaiki |

Semua P0 sampai P3 UI wajib selesai sebelum approval.

### 9.3 Known limitation

Known limitation bukan issue UI. Kategori ini mencakup:

- Batasan pengujian.
- Batasan perangkat.
- Batasan browser.
- Batasan arsitektur frontend.
- Issue yang membutuhkan backend.
- Issue yang membutuhkan keputusan produk.
- Issue yang membutuhkan perubahan data model atau business flow.

Known limitation wajib dicatat dan disetujui product owner. Jangan menandai issue UI sebagai known limitation untuk menghindari perbaikan.

### 9.4 Triage

1. Main agent mengumpulkan issue.
2. Main agent mengelompokkan issue per area dan prioritas.
3. Product owner melihat tabel triage.
4. Product owner menyetujui known limitation.
5. Fix batch dibuat.
6. Issue yang membutuhkan keputusan produk ditahan sampai keputusan diterima.

### 9.5 Fix policy

- Fix hanya untuk issue yang tercatat.
- Tidak ada fitur baru.
- Tidak ada refactor besar tanpa alasan.
- Jika fix menyentuh business rule, data, payment, permission, atau state, berhenti dan tanya.
- Jika fix membutuhkan perubahan arsitektur, jadikan known limitation dengan persetujuan.
- Jika fix membutuhkan dependency baru, berhenti dan tanya.
- Setiap fix batch harus memiliki verifikasi.

## 10. Fix workflow dan subagent

### 10.1 Main agent

- Menjalankan audit.
- Menulis issue.
- Menjaga bukti.
- Menjalankan triage.
- Membuat task fix.
- Menjalankan `pnpm check` dan `pnpm build`.
- Menjalankan retest Playwright.
- Meminta review.
- Mencatat commit.
- Menjaga scope.

### 10.2 Fix subagent

Gunakan `general` untuk fix yang lebih besar. Gunakan `cavecrew-builder` untuk fix 1 sampai 2 file.

Prompt fix subagent wajib berisi:

- Issue ID.
- Prioritas.
- Route dan viewport.
- Expected behavior.
- File yang boleh diubah.
- Batasan scope.
- Verifikasi yang harus dijalankan.
- Larangan menambah dependency, fitur, atau perubahan business rule.

Subagent tidak boleh:

- Menyentuh file di luar scope.
- Mengubah test atau data untuk membuat hasil terlihat lulus.
- Menghapus komponen atau perilaku yang tidak diminta.
- Menyatakan selesai tanpa verifikasi.

### 10.3 Reviewer subagent

Gunakan `cavecrew-reviewer` atau `general` sebagai reviewer independen.

Reviewer memeriksa:

- Apakah issue benar-benar selesai.
- Apakah diff minimal.
- Apakah ada regresi.
- Apakah aksesibilitas dasar tetap.
- Apakah copy dan format tetap.
- Apakah tidak ada perubahan di luar scope.

Reviewer memberikan temuan dengan format:

`path:line: severity: problem. fix.`

### 10.4 Verifikasi fix

Setiap fix batch wajib:

- `pnpm check`.
- `pnpm build`.
- Retest Playwright pada route dan viewport yang terdampak.
- Console error 0 pada area yang diubah.
- Screenshot before dan after jika relevan.
- Cek keyboard untuk perubahan interaksi.
- Cek light dan dark untuk perubahan visual.

### 10.5 Commit

Format commit:

- `fix(phase-4): <ringkasan issue>`
- `docs(phase-4): <ringkasan dokumen>`

Aturan:

- Satu commit per fix batch.
- Jangan gabungkan fix yang tidak terkait.
- Jangan commit screenshot.
- Jangan commit file sementara.
- Pastikan working tree bersih sebelum pindah task.

### 10.6 Template task fix

```text
Issue: P4-0xx
Prioritas: P1
Route: /app/...
Viewport: 390 light
Expected: ...
Actual: ...
Bukti: ...

File yang boleh diubah:
- src/...

Batasan:
- Jangan menambah dependency.
- Jangan mengubah business rule.
- Jangan menyentuh file lain.

Verifikasi:
- pnpm check
- pnpm build
- Playwright: langkah retest
```

## 11. Re-review

Setelah semua fix selesai:

1. Jalankan ulang audit pass 1, 2, dan 3.
2. Bandingkan hasil dengan issue register.
3. Pastikan tidak ada issue OPEN.
4. Pastikan tidak ada regresi baru.
5. Jalankan `pnpm check` dan `pnpm build`.
6. Jalankan console check pada route utama.
7. Jalankan keyboard check pada dialog dan drawer.
8. Perbarui issue register dengan status FIXED dan commit.
9. Siapkan demo product owner.

Re-review tidak boleh hanya spot-check pada area yang diperbaiki. Audit penuh wajib diulang.

## 12. Approval gate M4

### 12.1 Kriteria approval

Fase 4 selesai hanya jika:

- 18 route user-facing tersedia.
- Semua alur utama dapat didemonstrasikan dengan data dummy.
- Tidak ada issue P0, P1, P2, atau P3 UI yang OPEN.
- Known limitation sudah disetujui product owner.
- Product owner menyatakan approval eksplisit.
- `pnpm check` PASS.
- `pnpm build` PASS.
- Console error 0 pada route utama.
- Light dan dark terbaca.
- Responsive 320 sampai 1440 lulus.
- Keyboard dan Escape lulus.
- Baseline commit dicatat.
- Tag `phase-4-ui-approved` dibuat.
- ROADMAP M4 diperbarui.

### 12.2 Sign-off record

Sign-off dicatat di dokumen ini dengan format Appendix D.

Sign-off wajib berisi:

- Nama product owner.
- Tanggal.
- Baseline commit.
- Tag.
- Scope yang disetujui.
- Known limitation yang disetujui.
- Pernyataan approval eksplisit.

### 12.3 Baseline dan tag

Setelah approval:

- Commit terakhir menjadi baseline.
- Buat tag `phase-4-ui-approved`.
- Catat hash di dokumen.
- Bekukan UI baseline.

### 12.4 Post-approval change control

Setelah approval:

- Perubahan UI yang mengubah business flow atau kebutuhan data harus dicatat.
- Dampak terhadap API harus dievaluasi sebelum implementasi.
- Perubahan signifikan membutuhkan persetujuan product owner.
- Perubahan kosmetik kecil tidak boleh mengubah baseline tanpa catatan.

## 13. QA matrix

| Area          | Pemeriksaan                                    | Bukti                        |
| ------------- | ---------------------------------------------- | ---------------------------- |
| Visual        | Token, hierarchy, spacing, typography          | Screenshot light dan dark    |
| Theme         | Light dan dark terbaca                         | Screenshot dan kontras       |
| Responsive    | 320, 390, 768, 1024, 1440, 1920                | Screenshot dan scrollWidth   |
| Auth          | 3 role, wrong password, redirect, logout       | Langkah dan screenshot       |
| Dashboard     | Filter, summary, queue, recent orders          | Langkah dan screenshot       |
| Products      | CRUD, varian, add-on, filter, sort, pagination | Langkah dan screenshot       |
| Categories    | CRUD, reorder, delete guard                    | Langkah dan screenshot       |
| Tables        | CRUD, QR, regenerate, status guard             | Langkah dan screenshot       |
| Orders        | Filter, detail, cancel guard, history          | Langkah dan screenshot       |
| Payments      | Read-only, filter, detail                      | Langkah dan screenshot       |
| Users         | CRUD, role, outlet, deactivate                 | Langkah dan screenshot       |
| Roles         | Permission matrix                              | Langkah dan screenshot       |
| Outlets       | CRUD, deactivate guard                         | Langkah dan screenshot       |
| Settings      | Profile, preference, outlet summary            | Langkah dan screenshot       |
| Reports       | Range, outlet, sales, top products             | Langkah dan screenshot       |
| License       | Status dan informasi                           | Langkah dan screenshot       |
| Backup        | Create dan restore confirmation                | Langkah dan screenshot       |
| POS           | Product sampai payment                         | Langkah, screenshot, console |
| KDS           | Status dan timer                               | Langkah, screenshot, console |
| Customer QR   | Token, cart, checkout, status                  | Langkah, screenshot, console |
| Sync          | POS ke KDS, KDS ke status                      | Dua tab dan screenshot       |
| Copy          | Label, format, empty value                     | Grep dan screenshot          |
| States        | Empty, loading, error, disabled, success       | Screenshot                   |
| Accessibility | Keyboard, focus, Escape, kontras               | Langkah dan catatan          |
| Reliability   | Double submit, failed action, confirmation     | Langkah dan console          |

## 14. Responsive rules

- 320: layout satu kolom, tanpa overflow, touch target 44px.
- 390: layout mobile operasional, bottom sheet full width.
- 768: tablet, grid dua kolom jika sesuai.
- 1024: desktop awal, sidebar atau panel sesuai shell.
- 1440: desktop utama.
- 1920: wide spot-check, konten tidak meregang berlebihan.
- Tidak ada horizontal scroll pada body.
- Tabel memakai responsive list atau scroll container.
- Sticky header dan bottom bar tidak menutup konten.
- Keyboard tidak menutup input penting.
- Dialog dan drawer tidak terpotong.
- Bottom sheet full width.
- Teks tidak keluar container.
- Tombol tidak bertumpuk.

## 15. Accessibility rules

- Semua kontrol dapat dijangkau keyboard.
- Focus visible pada semua kontrol.
- Escape menutup dialog dan drawer.
- Focus kembali ke trigger setelah dialog ditutup.
- Form memiliki label yang terhubung.
- Error form terbaca dan tidak hanya warna.
- Status tidak hanya warna.
- Kontras teks minimal 4.5:1.
- Kontras komponen minimal 3:1.
- Touch target minimal 44px.
- Reduced motion dihormati.
- Teks dapat di-zoom 200%.
- Tidak ada `outline: none` tanpa pengganti.
- Icon-only button memiliki accessible name.
- Gambar dekoratif memakai `alt=""`.
- Dialog memakai native `<dialog>` atau focus trap yang setara.

## 16. Copywriting dan formatting

- UI copy memakai Bahasa Indonesia.
- Tidak ada em dash.
- Tidak ada middle dot.
- Empty value memakai `Tidak ada` atau `Belum ada`.
- Currency memakai Rupiah dan format `id-ID`.
- Tanggal dan waktu memakai `id-ID`.
- Timezone acuan `Asia/Jakarta`.
- Status pembayaran dan persiapan memakai label yang berbeda.
- Label aksi memakai kata kerja yang jelas.
- Error menyebut masalah dan langkah pemulihan.
- Konfirmasi menyebut konsekuensi.
- Tidak ada buzzword.
- Tidak ada klaim tanpa bukti.
- Tidak ada data mock yang terlihat seperti data produksi tanpa label `Data contoh` atau `Data simulasi`.

## 17. State handling

| State             | Perilaku                                                |
| ----------------- | ------------------------------------------------------- |
| Loading           | Skeleton atau loading state yang menjelaskan konteks    |
| Empty             | Menjelaskan penyebab dan langkah berikutnya             |
| Error             | Menjelaskan masalah dan menyediakan retry               |
| Disabled          | Kontrol tidak dapat dipakai dan terlihat disabled       |
| Success           | Toast, dialog, atau inline feedback                     |
| Pending mutation  | Tombol loading dan tidak dapat submit ganda             |
| Failed mutation   | Input pengguna tetap ada                                |
| Permission denied | Pesan yang jelas dan tidak menampilkan action terlarang |
| Invalid token     | Halaman invalid tanpa membocorkan data internal         |

## 18. Operational reliability

- UI tidak boleh menyatakan sukses sebelum mutation selesai.
- Double submit dicegah.
- Aksi kritis memakai konfirmasi.
- Cancel order berbayar ditolak.
- Status pembayaran dan persiapan tidak saling mengubah.
- KDS hanya memakai transisi maju.
- KDS menampilkan status koneksi mock.
- Refresh tidak boleh kehilangan input yang dapat dipulihkan.
- Mock data reset saat reload harus dijelaskan.
- Tidak ada klaim offline yang tidak didukung.

## 19. Known limitations

Known limitation berikut dicatat dan tidak dihitung sebagai issue UI:

- Scan QR fisik dari ponsel belum diuji.
- Screen reader belum diuji.
- Perangkat fisik dan browser matrix belum diuji.
- Backend, API, auth nyata, dan SSE belum ada.
- Mock data reset saat reload.
- BroadcastChannel memakai full-state sync, last-write-wins.
- Dashboard queue refresh lewat navigasi atau filter, bukan live subscription.
- Issue yang membutuhkan perubahan arsitektur atau keputusan produk.
- Issue yang membutuhkan backend.
- Issue yang membutuhkan perubahan data model atau business flow.

Known limitation wajib disetujui product owner sebelum approval.

## 20. Risks dan mitigation

| Risiko                        | Dampak                   | Mitigasi                                   |
| ----------------------------- | ------------------------ | ------------------------------------------ |
| P3 fix-all memperpanjang fase | Approval tertunda        | Triage dini, kelompokkan fix kosmetik      |
| Subagent kehilangan konteks   | Fix tidak sesuai         | Prompt berisi issue, file, expected, bukti |
| Tidak ada test runner         | Regresi tidak terdeteksi | Playwright dan re-review penuh             |
| Mock data reset               | Reproduksi sulit         | Langkah repeatable dan reset control       |
| Light/dark tidak konsisten    | UI tidak layak           | Screenshot kedua tema                      |
| Responsive terlewat           | UI rusak di mobile       | Matrix 320 sampai 1920                     |
| Issue arsitektur dianggap UI  | Fix tidak mungkin        | Klasifikasikan known limitation            |
| Approval tanpa bukti          | Baseline tidak valid     | Sign-off dengan evidence                   |

## 21. Implementation order

### Task 0: Baseline dan dokumen

- Konfirmasi baseline `3e42471`.
- Pastikan working tree bersih.
- Jalankan `pnpm check`.
- Jalankan `pnpm build`.
- Perbarui dokumen ini dengan status audit.
- Commit dokumen.

### Task 1: Audit pass 1

- Visual light dan dark.
- Responsive 320, 390, 768, 1024, 1440.
- Wide 1920 spot-check.
- Catat issue P4-009 dan seterusnya.

### Task 2: Audit pass 2

- Auth.
- Management.
- POS.
- KDS.
- Customer QR.
- Cross-tab.
- Catat issue.

### Task 3: Audit pass 3

- Copy.
- Format.
- State.
- Aksesibilitas.
- Konsistensi.
- Catat issue.

### Task 4: Triage

- Kelompokkan issue.
- Tentukan prioritas.
- Tentukan fix batch.
- Minta persetujuan known limitation.

### Task 5 sampai N: Fix batch

- Satu subagent per fix batch.
- Reviewer terpisah.
- `pnpm check`.
- `pnpm build`.
- Retest Playwright.
- Commit.

### Task N+1: Re-review

- Ulangi audit pass 1 sampai 3.
- Pastikan tidak ada issue OPEN.
- Pastikan tidak ada regresi.

### Task N+2: Demo dan sign-off

- Demo product owner.
- Spot-check.
- Sign-off.
- Update ROADMAP M4.
- Tag baseline.

### Task N+3: Handoff ke Fase 5

- Bekukan UI.
- Catat known limitation.
- Serahkan baseline.

## 22. File map

### Dokumen

- `docs/PRD.md`
- `docs/ROADMAP.md`
- `docs/design/design-brief.md`
- `docs/design/design-direction.md`
- `docs/design/design-system.md`
- `docs/design/ui-ux-guidelines.md`
- `docs/specification/phase-2-management-ui.md`
- `docs/specification/phase-3-operational-ui.md`
- `docs/specification/phase-4-ui-approval.md`

### Route

- `src/app/(auth)/login/page.tsx`
- `src/app/(dashboard)/app/**`
- `src/app/(cashier)/app/pos/page.tsx`
- `src/app/(kds)/kds/page.tsx`
- `src/app/(customer)/menu/[token]/page.tsx`
- `src/app/(customer)/order/[publicToken]/page.tsx`
- `src/app/page.tsx`

### Komponen

- `src/components/shells/**`
- `src/components/ui/**`
- `src/components/feedback/**`
- `src/components/theme/**`
- `src/features/**`

### Data

- `src/mocks/management/**`
- `src/mocks/navigation.ts`
- `src/mocks/permissions.ts`
- `src/mocks/session.ts`
- `src/types/**`
- `src/lib/**`
- `src/styles/tokens.css`
- `src/app/globals.css`

## 23. Riwayat issue awal

Delapan issue awal sudah FIXED sebelum audit penuh.

| ID     | Prioritas | Area      | Masalah                                                         | Perbaikan                                                                 | Status | Commit    |
| ------ | --------- | --------- | --------------------------------------------------------------- | ------------------------------------------------------------------------- | ------ | --------- |
| P4-001 | P1        | Pesanan   | Search dan lima filter membungkus menjadi tiga baris            | Search nomor pesanan dan modal filter draft                               | FIXED  | `1f414c7` |
| P4-002 | P1        | POS       | Daftar item memakai nested scroll dan area scroll terlalu kecil | Satu area scroll per mode, catatan masuk area scroll, CTA fixed           | FIXED  | `1f414c7` |
| P4-003 | P2        | Global    | Drop shadow dipakai di card, input, overlay, dan login          | Hapus semua drop shadow, pertahankan focus ring                           | FIXED  | `1f414c7` |
| P4-004 | P2        | Login     | Split layout dibungkus card, header, dan footer                 | Split penuh tanpa card, header, dan footer                                | FIXED  | `1f414c7` |
| P4-005 | P2        | Status    | Status badge memakai dot dekoratif                              | Hapus dot, pertahankan label dan warna                                    | FIXED  | `1f414c7` |
| P4-006 | P2        | Stepper   | Hanya status pertama yang berwarna                              | Warna per status, state tetap terbaca                                     | FIXED  | `1f414c7` |
| P4-007 | P1        | Dashboard | Card Antrean persiapan hanya count, state terbalik, tanpa tiket | Card Antrean pesanan dengan warna status, empat tiket tertua, empty state | FIXED  | `bedb681` |
| P4-008 | P2        | Drawer    | Bottom sheet terpotong `max-width` bawaan browser               | Tambah `max-w-none` pada side `bottom`                                    | FIXED  | `2077f14` |

## 24. Open items dan handoff ke Fase 5

### Open items

- Audit penuh belum dimulai.
- Issue P4-009 dan seterusnya belum ada.
- Known limitation belum disetujui.
- Sign-off belum dicatat.
- Baseline final belum ditetapkan.

### Handoff ke Fase 5

Setelah M4:

- Bekukan UI baseline.
- Serahkan issue register yang sudah selesai.
- Serahkan daftar known limitation.
- Serahkan baseline commit dan tag.
- Finalisasi domain model berdasarkan UI yang disetujui.
- API contract harus mengikuti kebutuhan UI yang disetujui.
- Perubahan UI setelah approval harus dievaluasi dampaknya terhadap API.

## Appendix A: Route checklist

Gunakan checklist ini per route.

- [ ] Route dapat diakses.
- [ ] Permission sesuai.
- [ ] Light theme terbaca.
- [ ] Dark theme terbaca.
- [ ] 320 tanpa overflow.
- [ ] 390 tanpa overflow.
- [ ] 768 tanpa overflow.
- [ ] 1024 tanpa overflow.
- [ ] 1440 tanpa overflow.
- [ ] 1920 spot-check jika relevan.
- [ ] Loading state.
- [ ] Empty state.
- [ ] Error state.
- [ ] Disabled state.
- [ ] Success state.
- [ ] Keyboard dapat digunakan.
- [ ] Focus terlihat.
- [ ] Dialog dapat ditutup dengan Escape.
- [ ] Copy sesuai.
- [ ] Format uang, tanggal, waktu sesuai.
- [ ] Tidak ada em dash.
- [ ] Tidak ada middle dot.
- [ ] Tidak ada shadow dekoratif.
- [ ] Console error 0.

## Appendix B: Flow scripts

### B.1 Auth

1. Buka `/login`.
2. Isi akun owner.
3. Masuk.
4. Pastikan redirect ke dashboard.
5. Logout.
6. Ulangi untuk cashier dan barista.
7. Coba password salah.
8. Pastikan error tampil.
9. Pastikan route terlarang redirect.

### B.2 Management

1. Dashboard: ubah range dan outlet.
2. Products: create, edit, search, filter, sort, pagination.
3. Categories: create, edit, reorder, delete guard.
4. Tables: create, edit, QR, regenerate, status guard.
5. Orders: filter, detail, cancel guard.
6. Payments: filter, detail, read-only.
7. Users: create, edit, role, outlet, deactivate.
8. Roles: permission matrix.
9. Outlets: create, edit, deactivate guard.
10. Settings: profile dan preference.
11. Reports: range dan outlet.
12. License: status.
13. Backup: create dan restore confirmation.
14. Design system: reset mock.

### B.3 POS

1. Buka `/app/pos`.
2. Pilih produk tanpa varian.
3. Pilih produk dengan varian dan add-on.
4. Ubah kuantitas.
5. Tambah catatan item.
6. Pilih dine-in dan meja.
7. Pilih takeaway.
8. Buka cart drawer di mobile.
9. Reload halaman dan pastikan cart bertahan.
10. Checkout.
11. Pastikan order muncul di KDS.
12. Bayar tunai.
13. Pastikan kembalian.
14. Bayar digital.
15. Pastikan verifikasi.
16. Split payment.
17. Pastikan status pembayaran.
18. Buka payable orders.
19. Ganti outlet dengan cart berisi.
20. Pastikan konfirmasi dan cart kosong.

### B.4 KDS

1. Buka `/kds`.
2. Pastikan kolom dan tiket.
3. Terima order.
4. Mulai siapkan.
5. Tandai siap.
6. Selesaikan.
7. Pastikan timer.
8. Ganti outlet.
9. Pastikan empty state.
10. Pastikan status publik ikut berubah.

### B.5 Customer QR

1. Buka `/app/tables`.
2. Salin tautan meja.
3. Buka `/menu/[token]`.
4. Tambah produk.
5. Ubah kuantitas.
6. Buka cart.
7. Kirim pesanan.
8. Buka status publik.
9. Pastikan status.
10. Regenerate token.
11. Pastikan token lama invalid.
12. Buka token invalid.

### B.6 Cross-tab

1. Buka POS di tab 1.
2. Buka KDS di tab 2.
3. Buat order di POS.
4. Pastikan order muncul di KDS.
5. Ubah status di KDS.
6. Pastikan status publik berubah.
7. Reset mock.
8. Pastikan kedua tab kembali ke seed.

## Appendix C: Evidence checklist

- [ ] Route.
- [ ] Viewport.
- [ ] Theme.
- [ ] Langkah.
- [ ] Expected.
- [ ] Actual.
- [ ] Screenshot.
- [ ] Console.
- [ ] Usulan fix.
- [ ] Commit setelah fix.

## Appendix D: Approval template

```text
## M4 UI Approval

Product owner: <nama>
Tanggal: <tanggal>
Baseline commit: <hash>
Tag: phase-4-ui-approved
Scope: 18 route user-facing
Known limitation disetujui:
- ...
- ...

Pernyataan:
"Saya menyetujui frontend UI RAVIKA POS sebagai baseline Fase 5.
Semua issue P0, P1, P2, dan P3 UI sudah selesai.
Known limitation yang tercatat sudah saya setujui."

Status: APPROVED
```
