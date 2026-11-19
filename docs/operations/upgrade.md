# Upgrade

## Windows

1. Buat backup dan salin ke media terpisah.
2. Jalankan installer versi baru sebagai Administrator.
3. Installer menghentikan service, mencadangkan app lama dan database, lalu mengganti app files.
4. Installer memulai service dan memeriksa `/api/health`.
5. Jika health gagal, installer mengembalikan app dan database lama secara otomatis.
6. Periksa log di `C:\ProgramData\RAVIKA POS\logs` jika rollback terjadi.
6. Uninstall tidak menghapus `C:\ProgramData\RAVIKA POS`.

## Linux

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
