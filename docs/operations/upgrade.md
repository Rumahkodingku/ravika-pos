# Upgrade

1. Buat backup dan salin ke media terpisah.
2. Catat versi saat ini.
3. Hentikan service: `sudo systemctl stop ravika-pos`.
4. Ambil source versi baru.
5. Jalankan `pnpm install --frozen-lockfile`.
6. Jalankan `pnpm build`.
7. Jalankan `sudo systemctl start ravika-pos`.
8. Cek `curl http://127.0.0.1:3000/api/health`.
9. Login dan cek data utama.

Migration database berjalan otomatis saat API pertama kali diakses. Jika build atau health gagal, kembalikan source dan database dari backup sebelum memulai ulang.
