# RAVIKA POS - Spesifikasi Fase 10: Windows Deployment dan Network Management

**Status:** Implementasi D1-D7 selesai, D8 validasi Windows pending
**Milestone:** M10 - Windows Deployment Ready
**Fase:** 10, Windows Deployment dan Network Management
**Tanggal:** 19 November 2026
**Baseline fitur:** `phase-9-installation-wizard`
**Referensi utama:** `docs/PRD.md`, `docs/ROADMAP.md`, `docs/specification/phase-5-backend-foundation.md`, `docs/specification/phase-6-backend-api-modules.md`, `docs/specification/phase-7-frontend-backend-integration.md`, `docs/specification/phase-8-qa-release-readiness.md`, `docs/specification/phase-9-installation-wizard.md`, `docs/specification/backup-module.md`

## Daftar isi

- [RAVIKA POS - Spesifikasi Fase 10: Windows Deployment dan Network Management](#ravika-pos---spesifikasi-fase-10-windows-deployment-dan-network-management)
  - [Daftar isi](#daftar-isi)
  - [0. Agent quick start](#0-agent-quick-start)
  - [1. Ringkasan](#1-ringkasan)
  - [2. Goals, non-goals, dan anti-goals](#2-goals-non-goals-dan-anti-goals)
    - [Goals](#goals)
    - [Non-goals](#non-goals)
    - [Anti-goals](#anti-goals)
  - [3. Keputusan yang dikunci](#3-keputusan-yang-dikunci)
  - [4. Audit repository dan gap analysis](#4-audit-repository-dan-gap-analysis)
    - [4.1 Stack dan runtime](#41-stack-dan-runtime)
    - [4.2 Build dan deployment](#42-build-dan-deployment)
    - [4.3 Path, data, dan konfigurasi](#43-path-data-dan-konfigurasi)
    - [4.4 Setup dan restart](#44-setup-dan-restart)
    - [4.5 Network dan mDNS](#45-network-dan-mdns)
    - [4.6 Keamanan](#46-keamanan)
    - [4.7 Dokumentasi](#47-dokumentasi)
    - [4.8 Gap analysis](#48-gap-analysis)
  - [5. Perbandingan teknologi](#5-perbandingan-teknologi)
    - [5.1 Installer](#51-installer)
    - [5.2 Service wrapper](#52-service-wrapper)
    - [5.3 Runtime](#53-runtime)
    - [5.4 mDNS](#54-mdns)
    - [5.5 Network detection](#55-network-detection)
    - [5.6 Build pipeline](#56-build-pipeline)
  - [6. Arsitektur](#6-arsitektur)
    - [6.1 Process boundary](#61-process-boundary)
    - [6.2 Deployment model](#62-deployment-model)
    - [6.3 Prinsip arsitektur](#63-prinsip-arsitektur)
    - [6.4 Lifecycle service](#64-lifecycle-service)
  - [7. Direktori, konfigurasi, dan data](#7-direktori-konfigurasi-dan-data)
    - [7.1 Layout direktori](#71-layout-direktori)
    - [7.2 Environment variable](#72-environment-variable)
    - [7.3 Bootstrap Windows](#73-bootstrap-windows)
    - [7.4 ACL dan service account](#74-acl-dan-service-account)
  - [8. Network detection dan monitoring](#8-network-detection-dan-monitoring)
    - [8.1 Sumber data](#81-sumber-data)
    - [8.2 Filtering alamat](#82-filtering-alamat)
    - [8.3 Ranking interface](#83-ranking-interface)
    - [8.4 Preferred interface](#84-preferred-interface)
    - [8.5 Monitoring](#85-monitoring)
  - [9. mDNS](#9-mdns)
    - [9.1 Keputusan mDNS](#91-keputusan-mdns)
    - [9.2 Service advertisement](#92-service-advertisement)
    - [9.3 Failure behavior](#93-failure-behavior)
    - [9.4 Validasi hardware](#94-validasi-hardware)
  - [10. API](#10-api)
    - [10.1 `GET /api/system/network`](#101-get-apisystemnetwork)
    - [10.2 `PATCH /api/system/network/preferred`](#102-patch-apisystemnetworkpreferred)
    - [10.3 Permission dan error](#103-permission-dan-error)
  - [11. Frontend](#11-frontend)
    - [11.1 Route](#111-route)
    - [11.2 Summary](#112-summary)
    - [11.3 Adapter](#113-adapter)
    - [11.4 QR dan copy URL](#114-qr-dan-copy-url)
    - [11.5 States](#115-states)
    - [11.6 UI copy](#116-ui-copy)
  - [12. Windows installer dan service](#12-windows-installer-dan-service)
    - [12.1 Installer](#121-installer)
    - [12.2 WinSW](#122-winsw)
    - [12.3 Setup restart](#123-setup-restart)
    - [12.4 Firewall](#124-firewall)
    - [12.5 Logging](#125-logging)
  - [13. Upgrade, rollback, dan uninstall](#13-upgrade-rollback-dan-uninstall)
    - [13.1 Upgrade](#131-upgrade)
    - [13.2 Rollback](#132-rollback)
    - [13.3 Uninstall](#133-uninstall)
  - [14. Keamanan](#14-keamanan)
  - [15. HTTPS dan PWA](#15-https-dan-pwa)
  - [16. Testing](#16-testing)
    - [16.1 Unit](#161-unit)
    - [16.2 Integration](#162-integration)
    - [16.3 RTL](#163-rtl)
    - [16.4 Windows CI](#164-windows-ci)
    - [16.5 Windows manual](#165-windows-manual)
    - [16.6 Client device](#166-client-device)
    - [16.7 Regression](#167-regression)
  - [17. Dokumentasi](#17-dokumentasi)
  - [18. Urutan implementasi](#18-urutan-implementasi)
  - [19. Verifikasi manual](#19-verifikasi-manual)
  - [20. Acceptance criteria](#20-acceptance-criteria)
    - [Installer dan service](#installer-dan-service)
    - [Network](#network)
    - [mDNS](#mdns)
    - [UI dan API](#ui-dan-api)
    - [Keamanan dan data](#keamanan-dan-data)
    - [Kualitas](#kualitas)
  - [21. Risiko dan mitigasi](#21-risiko-dan-mitigasi)
  - [22. Definition of Done](#22-definition-of-done)
  - [23. Handoff](#23-handoff)
  - [Appendix A: File map](#appendix-a-file-map)
    - [Application](#application)
    - [Windows packaging](#windows-packaging)
    - [Configuration](#configuration)
    - [Documentation](#documentation)
  - [Appendix B: Contoh API](#appendix-b-contoh-api)
    - [Network status](#network-status)
    - [Pilih interface](#pilih-interface)
  - [Appendix C: Checklist implementasi](#appendix-c-checklist-implementasi)

## 0. Agent quick start

Baca dokumen ini sebelum mengubah deployment, network, atau installer.

Aturan wajib:

1. Pertahankan Next.js + SQLite. Jangan mengganti ke Electron, Tauri, PostgreSQL, atau arsitektur desktop lain tanpa keputusan produk baru.
2. Satu proses server memiliki database SQLite. Jangan membuka database dari client atau proses kedua.
3. Mulai dari D1. Jangan mulai dari installer sebelum path, config, dan standalone build stabil.
4. Gunakan Inno Setup, WinSW 2.13.0, dan Node 26 LTS x64 yang dibundel.
5. Target resmi: Windows 11 x64. Windows 10 22H2 hanya best effort.
6. Service berjalan sebagai virtual account `NT SERVICE\RAVIKA_POS`. Jangan `LocalSystem`.
7. Jangan menyimpan database, config, backup, atau log di `Program Files`.
8. Jangan menaruh file backup di `public/`.
9. Jangan memakai `process.cwd()` sebagai sumber kebenaran untuk data atau config.
10. Port default 3000 dan hostname `ravika-pos.local` tidak dapat diedit dari UI pada MVP.
11. mDNS aktif default, tetapi IP fallback selalu tersedia. Jangan membuat aplikasi gagal jika mDNS gagal.
12. HTTPS belum termasuk Fase 10. Jangan mengklaim PWA atau secure-context API berjalan di HTTP LAN.
13. Jangan membuat endpoint restart yang tidak terautentikasi.
14. Jangan mengubah Windows Firewall profile dari Public ke Private.
15. Jangan menambah worker, Redis, cloud storage, atau dependency baru tanpa keputusan.
16. Jalankan `pnpm check`, `pnpm test`, dan `pnpm build` sebelum menyatakan selesai.
17. Code signing certificate belum diketahui. Build unsigned hanya untuk pilot internal; rilis publik menunggu certificate.
18. Jika ada konflik dengan PRD atau keputusan di dokumen ini, berhenti dan minta keputusan product owner.

## 1. Ringkasan

Fase 10 membuat RAVIKA POS dapat dipasang dan dijalankan di Windows sebagai service latar belakang, mendeteksi jaringan LAN, menampilkan URL akses, menerbitkan hostname lokal melalui mDNS, dan mengelola upgrade tanpa kehilangan data.

Hasil akhir yang diharapkan:

- Installer Windows untuk pengguna non-teknis.
- RAVIKA POS berjalan sebagai Windows Service.
- Runtime Node dibundel, customer tidak perlu memasang Node.
- Data dan config berada di `ProgramData`, bukan `Program Files`.
- Network Settings menampilkan interface, IP, URL, QR, dan status mDNS.
- Pemilik dapat memilih interface utama.
- mDNS `ravika-pos.local` aktif default dengan fallback IP.
- Firewall rule sempit untuk TCP 3000 dan UDP 5353.
- Setup pertama dapat memicu restart service yang aman.
- Upgrade memiliki pre-upgrade backup dan rollback app + database.
- Uninstall mempertahankan data bisnis.

Fase 10 tidak mengubah model bisnis, database schema bisnis, atau alur POS/KDS/QR.

## 2. Goals, non-goals, dan anti-goals

### Goals

- Menyediakan installer Windows yang dapat dipakai pemilik UMKM.
- Menjalankan aplikasi sebagai service latar belakang yang start otomatis.
- Membundel Node 26 LTS x64.
- Memisahkan aplikasi read-only dari data writable.
- Mendeteksi interface LAN yang valid.
- Menampilkan semua alamat kandidat dan memilih interface utama.
- Menampilkan URL akses, QR, port, dan status server.
- Menjalankan mDNS dengan fallback IP.
- Menyediakan firewall rule yang sempit dan idempotent.
- Menyediakan restart service yang aman setelah `/setup`.
- Menyediakan upgrade, rollback, dan uninstall yang menjaga data.
- Menyediakan logging yang dapat dipakai support.
- Menyediakan automated test dan Windows manual test matrix.

### Non-goals

- Electron, Tauri, atau desktop wrapper.
- PostgreSQL, MySQL, Redis, atau database jaringan.
- Multi-server, clustering, atau replikasi.
- Akses publik lewat internet.
- Cloud sync.
- Konfigurasi router atau port forwarding otomatis.
- Mengubah network profile Public menjadi Private.
- Menjamin `.local` di semua client, router, atau access point.
- HTTPS lokal dengan trust certificate di semua perangkat.
- PWA, service worker, atau offline mode.
- Dukungan macOS atau Linux melalui installer Windows.
- Custom hostname editing.
- Port editing dari UI.
- Auto-update.
- Notifikasi email atau WhatsApp.

### Anti-goals

- Jangan menyalin database langsung saat aplikasi aktif.
- Jangan menjalankan service sebagai Administrator atau `LocalSystem`.
- Jangan membuat firewall rule `allow all`.
- Jangan menonaktifkan Windows Firewall.
- Jangan mengubah network profile secara otomatis.
- Jangan mengekspos path absolut server ke UI publik.
- Jangan menaruh secret di log, QR, atau URL.
- Jangan membuat aplikasi bergantung pada mDNS.
- Jangan membuat installer yang menghapus `ProgramData`.
- Jangan membuat upgrade yang tidak punya pre-upgrade backup.
- Jangan menambah worker terpisah untuk network monitor.

## 3. Keputusan yang dikunci

| Keputusan                | Nilai                                                  |
| ------------------------ | ------------------------------------------------------ |
| Windows resmi            | Windows 11 x64                                         |
| Windows tambahan         | Windows 10 22H2 best effort                            |
| Installer                | Inno Setup                                             |
| Service wrapper          | WinSW 2.13.0                                           |
| Runtime                  | Node 26 LTS x64 bundled                                |
| Build output             | Next.js standalone                                     |
| Build pipeline           | Windows CI                                             |
| Service account          | `NT SERVICE\RAVIKA_POS`                                |
| Fallback account         | `NT AUTHORITY\LocalService` jika virtual account gagal |
| Data root                | `C:\ProgramData\RAVIKA POS`                            |
| App root                 | `C:\Program Files\RAVIKA POS`                          |
| Network detection        | `os.networkInterfaces()` + PowerShell JSON             |
| Monitoring               | Polling 10-15 detik                                    |
| Preferred interface      | Deteksi otomatis + pilihan manual                      |
| mDNS library             | `bonjour-service`                                      |
| mDNS default             | Aktif                                                  |
| mDNS fallback            | IP URL                                                 |
| Hostname                 | `ravika-pos.local`, tidak dapat diedit di UI           |
| IPv6 mDNS                | Ditunda; MVP IPv4                                      |
| Port                     | 3000 tetap, env override untuk operator                |
| HTTPS                    | Ditunda ke milestone terpisah                          |
| Upgrade rollback         | Otomatis app + database                                |
| Code signing             | Wajib untuk publik; certificate belum diketahui        |
| Windows 11 test hardware | Tersedia                                               |

## 4. Audit repository dan gap analysis

### 4.1 Stack dan runtime

- `package.json`: Next.js `16.4.6`, React `19.3`, Drizzle `0.45`, `node:sqlite`, TanStack Query, `qrcode.react`.
- `.nvmrc` dan `engines`: Node `26.9.0`.
- Node 26 sudah Active LTS per November 2026. Untuk Windows release, pin patch LTS terbaru yang sudah diuji.
- `node:sqlite` masih release candidate. Versi Node harus dipin dan diuji saat upgrade.
- Tidak ada native addon aplikasi yang membutuhkan build tools Windows.

### 4.2 Build dan deployment

- `next.config.ts` belum memakai `output: "standalone"`.
- `package.json` hanya menyediakan `next start`.
- `deploy/ravika-pos.service` adalah systemd Linux.
- `scripts/package-release.sh` hanya membuat tarball source.
- `.github/workflows/quality.yml` hanya berjalan di `ubuntu-latest`.
- Tidak ada installer Windows, WinSW config, firewall script, Windows CI, atau service wrapper.

### 4.3 Path, data, dan konfigurasi

- `src/infrastructure/database/client.ts` memakai `process.cwd()/data/ravika.sqlite`.
- `src/infrastructure/database/migrate.ts` memakai `process.cwd()/drizzle`.
- `src/modules/backup/backup.service.ts` memakai `process.cwd()/data/backups`.
- `src/app/api/setup/route.ts` menulis `.env` di `process.cwd()`.
- Ini tidak cocok untuk Windows Service dan pemisahan `Program Files`/`ProgramData`.

### 4.4 Setup dan restart

- `/setup` membuat owner dan menulis `RAVIKA_QR_TOKEN_KEY` ke `.env`.
- `src/features/system/restart-required.tsx` hanya memantau `/api/health`.
- Tidak ada mekanisme yang benar-benar me-restart service.
- Jika proses lama tetap hidup, health bisa 200 dan UI reload tanpa env baru.
- Tidak ada endpoint restart. Endpoint baru tidak boleh terbuka tanpa autentikasi.

### 4.5 Network dan mDNS

- Tidak ada network API, network service, network UI, network monitor, atau mDNS.
- `src/app/(dashboard)/app/settings/page.tsx` hanya berisi profil bisnis dan tampilan.
- `qrcode.react` sudah dipakai di `src/features/management/table-qr-code.tsx`.
- `settings.manage` sudah ada dan hanya dimiliki owner.
- `docs/operations/lan.md` masih memakai `hostname -I` dan asumsi Linux.

### 4.6 Keamanan

- Session cookie: `HttpOnly`, `SameSite=Lax`, `Secure` mengikuti env.
- `assertSameOrigin` memeriksa header `Host`.
- Tidak ada CORS longgar.
- HTTP LAN masih risiko pilot sesuai PRD OPEN-012.
- Tidak ada PWA atau service worker.
- Service Windows harus low privilege dan firewall sempit.

### 4.7 Dokumentasi

- `docs/operations/installation.md`, `upgrade.md`, `troubleshooting.md`, dan `lan.md` masih Linux/Ubuntu.
- `README.md` masih menyebut lisensi dan demo seed yang sudah dihapus.
- Belum ada dokumen Windows, service, firewall, mDNS, atau network troubleshooting.

### 4.8 Gap analysis

| Area               | Status sekarang  | Gap                                         |
| ------------------ | ---------------- | ------------------------------------------- |
| Installer Windows  | Tidak ada        | Perlu installer EXE                         |
| Windows Service    | Tidak ada        | Perlu WinSW                                 |
| Runtime            | Node dari sistem | Perlu runtime bundled                       |
| Build output       | `next start`     | Perlu standalone                            |
| Data path          | `process.cwd()`  | Perlu `ProgramData`                         |
| Config path        | `.env` di cwd    | Perlu `RAVIKA_CONFIG_FILE`                  |
| Firewall           | Tidak ada        | Perlu rule TCP/UDP                          |
| Network detection  | Tidak ada        | Perlu service dan API                       |
| Network monitoring | Tidak ada        | Perlu polling                               |
| mDNS               | Tidak ada        | Perlu publisher dan validasi                |
| Network UI         | Tidak ada        | Perlu `/app/settings/network`               |
| QR akses server    | Belum ada        | Perlu QR URL server                         |
| Setup restart      | Health poll saja | Perlu restart service                       |
| Upgrade            | Manual Linux     | Perlu upgrade/rollback Windows              |
| Uninstall          | Tidak ada        | Perlu preserve data                         |
| Logs               | Console          | Perlu file log dan rotasi                   |
| Windows CI         | Tidak ada        | Perlu Windows build job                     |
| Windows test       | Sebagian         | Windows 11 tersedia, Windows 10 best effort |

## 5. Perbandingan teknologi

### 5.1 Installer

| Opsi        | Kelebihan                                                     | Kekurangan                            | Keputusan             |
| ----------- | ------------------------------------------------------------- | ------------------------------------- | --------------------- |
| Inno Setup  | EXE wizard, mudah untuk UMKM, signing, service/firewall hooks | Bukan MSI, rollback harus dibuat      | Dipilih               |
| WiX Toolset | MSI, service install native, enterprise                       | XML kompleks, learning curve tinggi   | Alternatif enterprise |
| NSIS        | Ringan, fleksibel                                             | Terlalu manual untuk service/firewall | Tidak dipilih         |

Alasan: installer perlu ramah UMKM, bukan enterprise MSI. Inno Setup cukup untuk service, firewall, shortcut, health check, dan rollback script.

### 5.2 Service wrapper

| Opsi           | Kelebihan                                    | Kekurangan                        | Keputusan       |
| -------------- | -------------------------------------------- | --------------------------------- | --------------- |
| WinSW 2.13.0   | Stabil Nov 2026, XML, log roll, restart, MIT | Bukan native service              | Dipilih         |
| NSSM           | Sederhana, dikenal                           | Tidak aktif dipelihara            | Tidak dipilih   |
| Servy          | Aktif, keamanan modern                       | Relatif baru, dependency tambahan | Evaluasi nanti  |
| Native service | Paling bersih                                | Next.js bukan native service      | Tidak realistis |

### 5.3 Runtime

| Opsi                   | Kelebihan                                  | Kekurangan                                | Keputusan     |
| ---------------------- | ------------------------------------------ | ----------------------------------------- | ------------- |
| Bundle Node 26 LTS x64 | Tidak perlu install Node, versi terkontrol | Installer lebih besar                     | Dipilih       |
| Require Node installed | Installer kecil                            | UMKM harus install Node, versi bisa salah | Tidak dipilih |

### 5.4 mDNS

| Opsi                  | Kelebihan                        | Kekurangan                                  | Keputusan                   |
| --------------------- | -------------------------------- | ------------------------------------------- | --------------------------- |
| `bonjour-service`     | TypeScript, aktif, API sederhana | Bug Windows, multicast bisa diblokir        | Dipilih dengan feature flag |
| `multicast-dns`       | Kontrol penuh                    | Harus membuat record DNS-SD sendiri         | Alternatif teknis           |
| Apple Bonjour runtime | Resolusi matang                  | Dependency eksternal dan instalasi tambahan | Tidak dipilih               |
| Tanpa mDNS            | Paling aman                      | Tidak ada hostname ramah                    | Fallback                    |

### 5.5 Network detection

| Opsi                     | Kelebihan                               | Kekurangan                     | Keputusan     |
| ------------------------ | --------------------------------------- | ------------------------------ | ------------- |
| `os.networkInterfaces()` | Built-in, lintas platform               | Tidak ada gateway/tipe adapter | Primary       |
| PowerShell JSON          | Gateway, alias, status, virtual adapter | Windows-only, startup cost     | Enhancement   |
| Native addon             | Paling akurat                           | Dependency native baru         | Tidak dipilih |

### 5.6 Build pipeline

| Opsi              | Kelebihan                            | Kekurangan                 | Keputusan     |
| ----------------- | ------------------------------------ | -------------------------- | ------------- |
| Windows CI        | Sama dengan target, installer native | Runner Windows             | Dipilih       |
| Linux cross-build | CI sekarang                          | Risiko native/path/symlink | Tidak dipilih |

## 6. Arsitektur

### 6.1 Process boundary

```text
Windows Service Manager
  -> WinSW
    -> node.exe
      -> start.mjs
        -> load ProgramData config
        -> Next standalone server
        -> in-process network monitor
        -> in-process mDNS publisher
        -> in-process backup scheduler
```

Tidak ada worker terpisah. Network monitor dan mDNS berjalan di proses aplikasi.

### 6.2 Deployment model

```text
                         Local Wi-Fi / Ethernet LAN
       +------------------------------------------------------+
       |  Owner phone       Cashier tablet      Kitchen PC    |
       |  Browser           Browser             Browser       |
       +--------------------------+---------------------------+
                                  |
                           HTTP over LAN
                                  |
                      Windows server computer
                +----------------------------------+
                | RAVIKA POS Windows Service       |
                |  Next.js application / API       |
                |  Network monitor                 |
                |  mDNS publisher                  |
                |  Health and diagnostics          |
                |            |                     |
                |            v                     |
                |       SQLite database            |
                |       Config / logs / backups    |
                +----------------------------------+
```

### 6.3 Prinsip arsitektur

- Satu proses memiliki SQLite.
- Semua client memakai HTTP API.
- Server bind ke `0.0.0.0:3000`, firewall membatasi ke `LocalSubnet`.
- Network discovery bersifat supporting; IP fallback selalu ada.
- Windows-specific code diisolasi di service dan adapter platform.
- mDNS tidak boleh menggagalkan aplikasi.
- Service manager adalah otoritas lifecycle proses.
- Data dan config tidak berada di folder aplikasi.
- Jangan menambah state library atau worker.

### 6.4 Lifecycle service

| Event                  | Perilaku                                                                  |
| ---------------------- | ------------------------------------------------------------------------- |
| Windows startup        | Service start otomatis, load config, migrasi, health siap                 |
| User logoff            | Service tetap berjalan                                                    |
| Windows shutdown       | Service stop, mDNS unpublish, database close                              |
| Application crash      | WinSW restart sesuai policy                                               |
| Manual service restart | Stop bersih, start ulang, health check                                    |
| Upgrade                | Stop, backup, swap, start, health check, rollback jika gagal              |
| Installer rollback     | Kembalikan app dan database pre-upgrade                                   |
| Uninstall              | Stop, unregister service, hapus app dan firewall rule, data dipertahankan |

## 7. Direktori, konfigurasi, dan data

### 7.1 Layout direktori

```text
C:\Program Files\RAVIKA POS\
  app\
  runtime\
  service\
  scripts\

C:\ProgramData\RAVIKA POS\
  data\ravika.sqlite
  config\.env
  config\network.json
  backups\
  logs\
```

Aturan:

- `Program Files` read-only untuk service.
- `ProgramData` writable hanya untuk service account dan Administrators.
- Database, config, backup, dan logs tidak boleh berada di `Program Files`.
- App dan runtime tidak boleh ditulis saat runtime.
- Backup directory existing tetap dipakai oleh modul backup.

### 7.2 Environment variable

Tambahan yang diperlukan:

```text
RAVIKA_DATA_DIR=C:\ProgramData\RAVIKA POS\data
RAVIKA_BACKUP_DIR=C:\ProgramData\RAVIKA POS\backups
RAVIKA_CONFIG_FILE=C:\ProgramData\RAVIKA POS\config\.env
RAVIKA_MIGRATIONS_DIR=C:\Program Files\RAVIKA POS\app\drizzle
RAVIKA_MDNS_ENABLED=true
RAVIKA_NETWORK_POLL_MS=15000
RAVIKA_SERVICE_RESTART=1
HOSTNAME=0.0.0.0
PORT=3000
```

Variable existing tetap berlaku:

```text
RAVIKA_SESSION_COOKIE_SECURE=false
RAVIKA_QR_TOKEN_KEY=...
RAVIKA_BACKUP_SCHEDULE=...
RAVIKA_BACKUP_TIME=...
RAVIKA_BACKUP_RETENTION=...
```

### 7.3 Bootstrap Windows

`scripts/windows/start.mjs`:

1. Membaca `RAVIKA_CONFIG_FILE` dengan `process.loadEnvFile`.
2. Menetapkan default `PORT=3000`, `HOSTNAME=0.0.0.0`.
3. Mengimpor `server.js` dari Next standalone.
4. Tidak menulis file.
5. Tidak menerima input dari network.

Service wrapper WinSW menetapkan `workingdirectory` ke folder `app`.

### 7.4 ACL dan service account

- Service account: `NT SERVICE\RAVIKA_POS`.
- Berikan `Modify` pada `C:\ProgramData\RAVIKA POS`.
- Berikan `Read & Execute` pada `C:\Program Files\RAVIKA POS`.
- Jangan berikan write ke folder app.
- Jangan jalankan sebagai `LocalSystem`.
- Jika virtual account gagal, fallback ke `NT AUTHORITY\LocalService` dengan ACL yang sama.
- Installer harus idempotent saat mengatur ACL.

## 8. Network detection dan monitoring

### 8.1 Sumber data

Primary:

- `os.networkInterfaces()`.

Windows enhancement:

- PowerShell `Get-NetIPConfiguration` dan `Get-NetAdapter`.
- Output JSON, bukan teks bebas.
- Gunakan `execFile` dengan argumen tetap, bukan shell string.
- Timeout 3-5 detik.
- Jika PowerShell gagal, fallback ke `os.networkInterfaces()`.

Data yang diambil:

- interface alias,
- interface description,
- interface index,
- status,
- IPv4,
- subnet/prefix,
- default gateway,
- virtual adapter hint,
- MAC address hanya jika diperlukan untuk ranking.

Jangan mengambil atau menampilkan data yang tidak dibutuhkan.

### 8.2 Filtering alamat

Keluarkan dari kandidat:

- `127.0.0.0/8`,
- `169.254.0.0/16`,
- interface down,
- alamat tanpa IPv4.

Virtual adapter tidak langsung dibuang. Beri skor rendah dan alasan, karena sebagian bisnis memakai VLAN, VPN, atau virtual network.

### 8.3 Ranking interface

Urutan skor:

1. Interface up dan non-internal.
2. IPv4 valid.
3. Memiliki default gateway.
4. Alamat private RFC1918.
5. Bukan virtual adapter.
6. Interface index lebih rendah.
7. Nama interface sebagai tie-breaker deterministik.

Hasil API harus mengembalikan semua kandidat, bukan hanya pemenang.

### 8.4 Preferred interface

- Pemilik dapat memilih interface utama.
- Simpan identifier stabil di `C:\ProgramData\RAVIKA POS\config\network.json`.
- Gunakan GUID jika tersedia; fallback ke alias.
- Jangan menyimpan IP sebagai kebenaran permanen.
- Jika interface pilihan down, gunakan kandidat terbaik berikutnya.
- UI harus menandai pilihan yang sedang down.
- Perubahan preferred interface dicatat di audit.

### 8.5 Monitoring

- Polling setiap 10-15 detik.
- Cache hasil scan.
- Debounce perubahan 2 detik.
- UI TanStack Query refetch setiap 10 detik.
- Tidak perlu Windows event hook atau SSE baru pada MVP.
- Perubahan network tidak boleh mengubah data bisnis.

## 9. mDNS

### 9.1 Keputusan mDNS

- Library: `bonjour-service`.
- Hostname: `ravika-pos.local`.
- Service type: `_http._tcp`.
- Port dari runtime.
- Feature flag `RAVIKA_MDNS_ENABLED`.
- Default aktif setelah instalasi.
- IP fallback selalu tersedia.
- Custom hostname editing ditunda.
- IPv6 mDNS ditunda; MVP hanya IPv4.

### 9.2 Service advertisement

- Publish saat service start.
- Publish pada preferred interface.
- Unpublish saat shutdown.
- Unpublish dan publish ulang saat preferred interface atau IP berubah.
- Jangan publish jika tidak ada interface valid.
- TXT record minimal, tanpa secret.
- Jangan mengklaim published hanya karena `publish()` dipanggil; status harus mencerminkan error yang tertangkap.

### 9.3 Failure behavior

Jika mDNS gagal:

- Aplikasi tetap berjalan.
- IP fallback tetap tampil.
- Status menjadi `degraded` atau `error`.
- UI menampilkan troubleshooting singkat.
- Jangan restart service karena mDNS gagal.
- Jangan spam log setiap polling.

### 9.4 Validasi hardware

Validasi di Windows 11 x64:

- resolusi A record,
- tidak ada AAAA yang menyesatkan,
- PTR, SRV, TXT,
- port benar,
- multi-interface,
- konflik hostname,
- unpublish saat stop,
- recovery setelah network change,
- multicast diblokir,
- client Windows, Android, iOS, tablet.

Windows 10 22H2 diuji best effort.

## 10. API

Semua endpoint memakai session cookie dan permission guard.

### 10.1 `GET /api/system/network`

Permission: `settings.manage`.

Response contoh:

```json
{
  "status": "available",
  "server": {
    "listening": true,
    "port": 3000
  },
  "preferredAccess": {
    "type": "mdns",
    "url": "http://ravika-pos.local:3000"
  },
  "addresses": [
    {
      "interface": "Wi-Fi",
      "address": "192.168.1.20",
      "family": "IPv4",
      "status": "available",
      "preferred": true
    }
  ],
  "mdns": {
    "enabled": true,
    "status": "published",
    "hostname": "ravika-pos.local"
  },
  "updatedAt": "2026-11-19T10:00:00.000Z"
}
```

Aturan:

- `GET` melakukan scan baru atau memakai cache pendek.
- Jangan mengembalikan path absolut.
- Jangan mengembalikan MAC address kecuali benar-benar diperlukan.
- Jangan mengembalikan raw PowerShell error.
- `server.listening` bernilai true karena request API berhasil mencapai server.
- Jangan mengklaim client reachable.

### 10.2 `PATCH /api/system/network/preferred`

Permission: `settings.manage`.

Request:

```json
{
  "interfaceId": "guid-atau-alias"
}
```

Response: status network terbaru.

Aturan:

- Validasi ID terhadap kandidat yang ditemukan server.
- Jangan menerima alamat IP dari client sebagai sumber kebenaran.
- Simpan ke `network.json`.
- Catat audit `network.preferred_interface`.
- Rate limit atau debounce.

### 10.3 Permission dan error

- Read dan write: `settings.manage`.
- Tidak ada endpoint hostname edit pada MVP.
- Tidak ada endpoint restart.
- Error memakai Problem Details existing.
- Error yang aman: interface tidak ditemukan, scan gagal, mDNS gagal.

## 11. Frontend

### 11.1 Route

Route: `/app/settings/network`.

Guard: `RequirePermission permission="settings.manage"`.

Link dari halaman Settings.

### 11.2 Summary

Tampilkan:

- status keseluruhan,
- URL utama,
- URL IP fallback,
- port,
- server listening,
- mDNS status,
- waktu scan terakhir.

### 11.3 Adapter

Tampilkan:

- nama adapter,
- status,
- IPv4,
- subnet,
- apakah preferred,
- apakah advertised,
- alasan jika tidak dipilih.

Gunakan progressive disclosure untuk detail teknis.

### 11.4 QR dan copy URL

- Gunakan `qrcode.react`.
- QR memakai URL utama yang valid.
- QR berubah saat alamat berubah.
- Sediakan tombol salin URL.
- Jelaskan bahwa perangkat harus berada di jaringan yang sama.
- Jangan memasukkan token, session, atau secret ke QR.

### 11.5 States

State yang harus ada:

- loading,
- available,
- no LAN interface,
- mDNS degraded,
- mDNS disabled,
- preferred interface down,
- scan error,
- permission denied.

### 11.6 UI copy

Gunakan bahasa Indonesia.

Contoh:

- `Status jaringan`
- `Alamat akses`
- `Alamat cadangan`
- `Pilih jaringan utama`
- `Salin alamat`
- `mDNS tidak tersedia`
- `Perangkat harus terhubung ke jaringan yang sama`
- `Belum ada jaringan LAN yang dapat dipakai`

Jangan memakai em dash atau middle dot untuk metadata.

## 12. Windows installer dan service

### 12.1 Installer

Inno Setup harus:

- memeriksa Windows 11 x64 atau Windows 10 22H2 x64,
- memeriksa hak administrator,
- memasang app, runtime, service, dan scripts,
- membuat `ProgramData` directories,
- mengatur ACL,
- memasang WinSW service,
- menambahkan firewall rule,
- membuat shortcut,
- membuka `http://127.0.0.1:3000/setup`,
- tidak mereset data jika sudah terpasang,
- menangani upgrade dan uninstall.

### 12.2 WinSW

Konfigurasi service:

- executable: `runtime\node.exe`,
- arguments: `service\start.mjs`,
- working directory: `app`,
- start mode: automatic,
- restart on failure,
- log roll,
- stop timeout,
- environment variable untuk data, config, backup, port, hostname, mDNS.

Service harus start setelah reboot dan stop bersih.

### 12.3 Setup restart

- Setup route menulis config.
- Jika `RAVIKA_SERVICE_RESTART=1`, jadwalkan `process.exit(1)` setelah response.
- WinSW restart.
- `start.mjs` membaca config baru.
- UI restart screen tetap memakai health polling.
- Jangan membuat endpoint restart.
- Di Linux, systemd `Restart=on-failure` dapat memakai mekanisme yang sama.

### 12.4 Firewall

Installer membuat rule dengan nama stabil:

```text
RAVIKA POS HTTP
RAVIKA POS mDNS
```

Rule:

```text
TCP 3000 inbound, remoteip=LocalSubnet, profile=any
UDP 5353 inbound, remoteip=LocalSubnet, profile=any
```

Aturan:

- Jangan disable Windows Firewall.
- Jangan ubah profile Public ke Private.
- Jangan allow all.
- Hapus hanya rule RAVIKA saat uninstall.
- Idempotent saat reinstall.
- mDNS rule hanya jika mDNS diaktifkan.

### 12.5 Logging

- WinSW menulis stdout/stderr ke `logs`.
- Gunakan rotasi ukuran atau tanggal.
- Aplikasi menulis log terstruktur.
- Jangan menulis password, token, signing key, atau data pelanggan.
- Log network scan, interface change, preferred selection, mDNS publish/unpublish/failure, service start/stop.
- Hindari log berulang saat jaringan tidak stabil.

## 13. Upgrade, rollback, dan uninstall

### 13.1 Upgrade

1. Installer mendeteksi versi lama.
2. Stop service.
3. Jalankan pre-upgrade backup SQLite.
4. Simpan app lama.
5. Ganti app files.
6. Start service.
7. Poll health.
8. Jika health sukses, selesai.
9. Jika health gagal, rollback.

Upgrade tidak boleh menghapus `ProgramData`, config, backup, atau database.

### 13.2 Rollback

- Stop service.
- Restore app lama.
- Restore database pre-upgrade.
- Start service.
- Health check.
- Tampilkan hasil ke operator.

Rollback database hanya otomatis jika health gagal sebelum operator memakai versi baru.

### 13.3 Uninstall

- Stop service.
- Unregister service.
- Hapus app files.
- Hapus firewall rule RAVIKA.
- Pertahankan `ProgramData`.
- Tidak ada opsi hapus data pada MVP.
- Dokumentasikan cara hapus data manual.

## 14. Keamanan

- SQLite hanya di server.
- Service account low privilege.
- App directory read-only.
- Data directory ACL ketat.
- Firewall rule `LocalSubnet`.
- Tidak ada endpoint restart.
- Tidak ada hostname edit pada MVP.
- Validasi input API.
- Jangan memakai shell string dari input user.
- Jangan mengekspos path absolut.
- Jangan menulis secret ke log.
- Same-origin check tetap.
- Cookie `Secure` hanya jika HTTPS.
- Jangan klaim aman untuk jaringan publik.
- Jangan mengubah network profile.
- Jangan menambahkan CORS longgar.
- Review host-header dan CSRF sebelum rilis.
- Jangan membuat service menjadi public-facing server.

## 15. HTTPS dan PWA

Fase 10 tetap HTTP LAN.

- `localhost` memiliki secure-context khusus; LAN IP dan `.local` tidak.
- PWA, service worker, dan camera API membutuhkan secure context pada umumnya.
- Aplikasi belum memakai PWA atau service worker.
- mDNS bukan HTTPS.
- Self-signed certificate tidak otomatis dipercaya.
- HTTPS lokal butuh CA dan trust installation di setiap client.
- HTTPS menjadi milestone terpisah.
- Dokumentasikan risiko penyadapan LAN dan batasan fitur.

## 16. Testing

### 16.1 Unit

- Filtering loopback, APIPA, down interface.
- Klasifikasi private/public.
- Ranking dengan default gateway.
- Multi-interface deterministic.
- Virtual adapter scoring.
- Preferred interface fallback.
- Hostname validation.
- URL generation.
- Network state transitions.
- mDNS state handling.
- Config validation.

### 16.2 Integration

- `GET /api/system/network`.
- Permission `settings.manage`.
- `PATCH preferred`.
- Invalid interface ID.
- Scan failure fallback.
- mDNS disabled/failure.
- Setup restart trigger.
- Backup module regression.

### 16.3 RTL

- Network Settings loading, available, no LAN, mDNS degraded, error.
- Daftar adapter.
- Pilih interface.
- Copy URL.
- QR render dan update.
- Permission denied.

### 16.4 Windows CI

- `windows-latest`.
- Node 26 LTS x64.
- `pnpm install --frozen-lockfile`.
- `pnpm check`.
- `pnpm test`.
- `pnpm build`.
- Next standalone packaging.
- Copy `public`, `.next/static`, `drizzle`.
- Compile Inno Setup installer.
- Upload artifact.
- Signing jika certificate tersedia.

### 16.5 Windows manual

Windows 11 x64 full matrix:

- fresh install,
- upgrade,
- reinstall,
- uninstall preserve data,
- reboot,
- service crash/restart,
- Wi-Fi disconnect/reconnect,
- Ethernet connect/disconnect,
- multiple adapters,
- VPN dan virtual adapter,
- firewall enabled,
- mDNS conflict,
- multicast blocked,
- no network at startup,
- network available after startup,
- setup restart.

Windows 10 22H2 best effort.

### 16.6 Client device

- Windows browser.
- Android browser.
- iOS browser.
- Tablet browser.

Catat perangkat, OS, browser, router/AP, dan hasil. Uji IP fallback dan `.local`.

### 16.7 Regression

- Owner setup dan login.
- Cashier.
- KDS.
- Produk.
- Order dan payment.
- Reports.
- Backup dan restore.
- QR menu.
- Linux deployment tidak boleh rusak.

## 17. Dokumentasi

Perbarui:

- `docs/operations/installation.md` - Windows + Linux.
- `docs/operations/upgrade.md` - Windows upgrade/rollback.
- `docs/operations/troubleshooting.md` - service, firewall, mDNS, network.
- `docs/operations/lan.md` - IP, hostname, firewall, client.
- `docs/operations/backup-restore.md` - lokasi data Windows.
- `docs/operations/qa-checklist.md` - Windows matrix.
- `README.md` - hapus referensi lisensi/demo yang sudah tidak berlaku.
- `AGENTS.md` - aturan service, path, dan network.

## 18. Urutan implementasi

| Tahap | Isi                                                                      | Dependency |
| ----- | ------------------------------------------------------------------------ | ---------- |
| D1    | Path/config separation, standalone output, Windows bootstrap, Windows CI | Tidak ada  |
| D2    | Network types, detection, filtering, ranking, unit tests                 | D1         |
| D3    | Network monitor, cache, API, permission, integration tests               | D2         |
| D4    | Network Settings UI, QR, copy URL, states                                | D3         |
| D5    | mDNS adapter, feature flag, conflict/failure, Windows validation         | D3         |
| D6    | Inno Setup, WinSW, runtime bundle, ACL, firewall, service                | D1         |
| D7    | Setup restart, pre-upgrade backup, rollback, uninstall                   | D6         |
| D8    | Windows QA matrix, client tests, docs, release                           | D5, D7     |

Aturan:

- Jangan mulai D6 sebelum D1 selesai.
- Jangan anggap mDNS selesai sebelum validasi Windows 11.
- Jangan rilis publik sebelum code signing certificate tersedia.

## 19. Verifikasi manual

1. Install di Windows 11 x64.
2. Service start otomatis setelah reboot.
3. Buka `http://127.0.0.1:3000/setup`.
4. Selesaikan setup.
5. Pastikan service restart dan health pulih.
6. Login owner.
7. Buka Network Settings.
8. Pastikan IP, URL, port, dan QR tampil.
9. Buka IP fallback dari Android/iPhone.
10. Buka `ravika-pos.local` dari client yang mendukung.
11. Matikan Wi-Fi, sambungkan ulang, cek status.
12. Sambungkan Ethernet, cek dual interface.
13. Pilih interface utama.
14. Blokir multicast, cek status degraded.
15. Buat backup, upgrade, rollback.
16. Uninstall, pastikan data tetap ada.

## 20. Acceptance criteria

### Installer dan service

- [ ] Installer Windows berjalan di Windows 11 x64.
- [ ] Windows 10 22H2 diuji best effort.
- [ ] Runtime Node dibundel.
- [ ] Service start otomatis setelah reboot.
- [ ] Service stop dan restart aman.
- [ ] Setup tetap memakai `/setup`.

### Network

- [ ] IPv4 LAN terdeteksi.
- [ ] Loopback dan APIPA tidak diiklankan.
- [ ] Interface down tidak dianggap usable.
- [ ] Multiple interface ditangani deterministik.
- [ ] Network change memperbarui status.
- [ ] Tidak ada LAN menghasilkan status dan panduan jelas.

### mDNS

- [ ] mDNS tervalidasi di Windows 11.
- [ ] Hostname resolve di client yang didukung.
- [ ] SRV port benar.
- [ ] Konflik dan kegagalan tidak mematikan POS.
- [ ] IP fallback tetap tersedia.

### UI dan API

- [ ] Network Settings menampilkan status dan URL.
- [ ] QR mengikuti URL aktif.
- [ ] Pilih interface memakai permission.
- [ ] UI update setelah network change.
- [ ] UI tidak mengklaim client reachable tanpa bukti.

### Keamanan dan data

- [ ] Firewall rule sempit.
- [ ] Service account low privilege.
- [ ] Tidak ada endpoint restart tanpa autentikasi.
- [ ] Upgrade mempertahankan data dan secret.
- [ ] Uninstall mempertahankan data.
- [ ] Tidak ada secret di log atau QR.

### Kualitas

- [x] `pnpm check` lulus.
- [x] `pnpm test` lulus.
- [x] `pnpm build` lulus.
- [ ] Windows CI lulus.
- [ ] Windows manual matrix selesai.
- [ ] Client compatibility dicatat.
- [ ] Dokumentasi diperbarui.

## 21. Risiko dan mitigasi

| Risiko                       | Dampak                 | Mitigasi                                |
| ---------------------------- | ---------------------- | --------------------------------------- |
| mDNS gagal di Windows/router | Hostname tidak jalan   | IP fallback, status jelas, feature flag |
| Multiple adapter salah pilih | Client tidak connect   | Ranking, tampilkan semua, pilih manual  |
| DHCP IP berubah              | URL lama mati          | Monitor, update QR, hostname            |
| Firewall Public profile      | LAN diblokir           | Rule LocalSubnet, panduan               |
| Service account permission   | App gagal tulis        | ACL ProgramData, test install           |
| Upgrade merusak data         | Kehilangan data        | Pre-upgrade backup, rollback            |
| Setup restart tidak terjadi  | QR key tidak terbaca   | Exit code + WinSW restart               |
| SmartScreen                  | User takut install     | Code signing                            |
| Node RC API berubah          | Build rusak            | Pin Node, test upgrade                  |
| Antivirus lock SQLite        | Database error         | Busy timeout, dokumentasi exclusion     |
| Windows 10 EOL               | Risiko keamanan        | Best effort, dokumentasi                |
| Code signing belum ada       | Rilis publik terhambat | Siapkan certificate sebelum rilis       |

## 22. Definition of Done

- Installer Windows tersedia.
- Service berjalan sebagai WinSW service.
- Node 26 LTS x64 dibundel.
- App dan data terpisah.
- Network detection, API, dan UI tersedia.
- Preferred interface tersedia.
- mDNS tervalidasi di Windows 11.
- Firewall rule terdokumentasi.
- Setup restart bekerja.
- Upgrade, rollback, dan uninstall diuji.
- Data dan config bertahan.
- Code signing certificate tersedia untuk rilis publik.
- Automated test lulus.
- Windows manual matrix selesai.
- Dokumentasi diperbarui.

## 23. Handoff

Saat menyerahkan pekerjaan, sertakan:

- daftar file yang diubah,
- versi Node yang dibundel,
- installer artifact,
- hash installer,
- code signing status,
- firewall rule,
- service account,
- test hasil Windows 11,
- hasil Windows 10 best effort,
- hasil client device,
- risiko yang masih terbuka,
- dokumentasi yang diperbarui.

## Appendix A: File map

### Application

```text
src/modules/network/network.service.ts
src/modules/network/network.types.ts
src/modules/network/network.ranking.ts
src/modules/network/network.config.ts
src/modules/network/mdns.service.ts
src/modules/platform/windows.ts
src/app/api/system/network/route.ts
src/app/api/system/network/preferred/route.ts
src/app/(dashboard)/app/settings/network/page.tsx
src/features/system/api/network.ts
src/features/system/network-settings.tsx
src/instrumentation.ts
```

### Windows packaging

```text
installer/ravika-pos.iss
installer/ravika-pos-service.xml
scripts/windows/start.mjs
scripts/windows/pre-upgrade-backup.mjs
scripts/windows/package-standalone.mjs
.github/workflows/windows-release.yml
```

### Configuration

```text
next.config.ts
package.json
.nvmrc
.env.example
```

### Documentation

```text
docs/operations/installation.md
docs/operations/upgrade.md
docs/operations/troubleshooting.md
docs/operations/lan.md
docs/operations/backup-restore.md
docs/operations/qa-checklist.md
docs/specification/phase-10-windows-deployment-network-management.md
AGENTS.md
README.md
```

## Appendix B: Contoh API

### Network status

```http
GET /api/system/network
```

```json
{
  "status": "available",
  "server": {
    "listening": true,
    "port": 3000
  },
  "preferredAccess": {
    "type": "mdns",
    "url": "http://ravika-pos.local:3000"
  },
  "addresses": [
    {
      "interface": "Wi-Fi",
      "address": "192.168.1.20",
      "family": "IPv4",
      "status": "available",
      "preferred": true
    }
  ],
  "mdns": {
    "enabled": true,
    "status": "published",
    "hostname": "ravika-pos.local"
  },
  "updatedAt": "2026-11-19T10:00:00.000Z"
}
```

### Pilih interface

```http
PATCH /api/system/network/preferred
Content-Type: application/json
```

```json
{
  "interfaceId": "guid-atau-alias"
}
```

## Appendix C: Checklist implementasi

- [x] D1 path/config separation
- [x] D1 standalone output
- [x] D1 Windows bootstrap
- [x] D1 Windows CI
- [x] D2 network filtering
- [x] D2 ranking
- [x] D2 unit tests
- [x] D3 network monitor
- [x] D3 network API
- [x] D3 preferred interface API
- [ ] D3 integration tests
- [x] D4 Network Settings UI
- [x] D4 QR dan copy URL
- [x] D4 RTL tests
- [x] D5 mDNS publisher
- [x] D5 mDNS failure handling
- [ ] D5 Windows mDNS validation
- [x] D6 Inno Setup
- [x] D6 WinSW
- [x] D6 Node runtime bundle
- [x] D6 firewall rules
- [x] D6 service account ACL
- [x] D6 Start Menu dan Desktop shortcut
- [x] D6 Icon brand dengan background putih
- [x] D7 setup restart
- [x] D7 pre-upgrade backup
- [x] D7 rollback
- [x] D7 uninstall
- [ ] D8 Windows 11 matrix
- [ ] D8 Windows 10 best effort
- [ ] D8 client device matrix
- [x] D8 documentation
- [ ] D8 code signing
- [x] `pnpm check`
- [x] `pnpm test`
- [x] `pnpm build`
- [ ] Windows CI lulus
- [ ] Installer lulus
- [ ] Upgrade/rollback lulus
- [ ] Uninstall preserve data
