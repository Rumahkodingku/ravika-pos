# Backup dan Restore

Backup SQLite mencakup data bisnis dan gambar produk BLOB. Simpan salinan ke media terpisah.

Lokasi backup:
- Linux: `data/backups/`
- Windows: `C:\ProgramData\RAVIKA POS\backups`

## Backup

1. Login sebagai owner.
2. Buka `/app/backup`.
3. Klik `Buat backup`.
4. Catat nama file, ukuran, dan checksum.
5. Salin file dari `data/backups/` ke media terpisah.

Jadwal yang disarankan: harian setelah tutup, plus sebelum upgrade.

## Restore

1. Pastikan backup berstatus `READY`.
2. Buka `/app/backup`.
3. Klik `Pulihkan data` pada backup yang dipilih.
4. Konfirmasi.
5. UI akan menampilkan layar restart dan memblokir operasi.
6. Restart service:
   - Linux: `sudo systemctl restart ravika-pos`
   - Windows: `Restart-Service RAVIKA_POS`
7. Tunggu `/api/health` mengembalikan 200.
8. Verifikasi produk, gambar, order, dan laporan.

Restore tanpa restart tidak dianggap selesai.
