# Akses LAN

1. Cari IP server: `hostname -I`.
2. Buka `http://<ip-server>:3000` dari ponsel atau komputer lain.
3. Pastikan client berada di Wi-Fi/LAN yang sama.
4. Buka firewall port 3000 hanya untuk subnet LAN.
5. Jangan meneruskan port ke internet publik.

QR meja harus dibuka lewat IP LAN, bukan `localhost`, agar bisa dipindai dari ponsel.

Aplikasi berjalan tanpa internet wajib. HTTP LAN berarti cookie dan data tidak terenkripsi di jaringan. HTTPS tetap risiko pilot sesuai PRD OPEN-012.
