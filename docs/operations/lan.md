# Akses LAN

1. Buka `/app/settings/network` sebagai owner.
2. Lihat alamat akses utama dan alamat IP cadangan.
3. Buka alamat tersebut dari ponsel atau komputer lain.
4. Pastikan client berada di Wi-Fi/LAN yang sama.
5. Jangan meneruskan port ke internet publik.

Di Windows, installer menambahkan firewall rule TCP 3000 dan UDP 5353 untuk `LocalSubnet`. Jangan menonaktifkan Windows Firewall atau mengubah profile Public menjadi Private.

Jika mDNS tersedia, gunakan `http://ravika-pos.local:3000`. Jika tidak, gunakan alamat IP. QR meja harus memakai alamat LAN, bukan `localhost`, agar bisa dipindai dari ponsel.

Di Linux, cari IP server dengan `hostname -I` atau `ip addr`.

Aplikasi berjalan tanpa internet wajib. HTTP LAN berarti cookie dan data tidak terenkripsi di jaringan. HTTPS tetap risiko pilot sesuai PRD OPEN-012.
