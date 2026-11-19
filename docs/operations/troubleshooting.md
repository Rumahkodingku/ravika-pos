# Troubleshooting

## Windows service tidak jalan

```powershell
Get-Service RAVIKA_POS
Get-Content "C:\ProgramData\RAVIKA POS\logs\RAVIKA_POS.out.log" -Tail 100
```

Pastikan service account `NT SERVICE\RAVIKA_POS` punya akses Modify ke `C:\ProgramData\RAVIKA POS`.

## Windows firewall memblokir LAN

Pastikan rule `RAVIKA POS HTTP` ada untuk TCP 3000 dan `remoteip=LocalSubnet`. Jangan menonaktifkan firewall atau mengubah profile jaringan.

## mDNS tidak tersedia

Coba alamat IP dari `/app/settings/network`. mDNS bisa diblokir router, access point, atau Windows. Aplikasi tetap berjalan tanpa mDNS.

## Service tidak jalan (Linux)

```bash
sudo systemctl status ravika-pos
sudo journalctl -u ravika-pos -n 100 --no-pager
```

## Health 503

Database belum siap, path salah, atau file terkunci. Cek `RAVIKA_DB_PATH`, permission direktori, dan proses lain yang memakai database.

## Port bentrok

Ganti port `pnpm start -- -p <port>` dan sesuaikan firewall serta systemd.

## KDS tidak update

Cek koneksi browser, status indikator, dan log service. Reconnect akan memicu refetch. SSE hanya berjalan pada satu proses.

## Backup gagal

Periksa ruang disk, izin tulis `data/backups/`, dan log service. Backup terjadwal hanya berjalan saat server aktif. Backup manual tetap tersedia.

## Restore macet

Restart service setelah restore. Jangan melanjutkan transaksi sebelum health 200.

## Database terkunci

Pastikan hanya satu proses aplikasi memakai file SQLite. Jangan menaruh database di network share.
