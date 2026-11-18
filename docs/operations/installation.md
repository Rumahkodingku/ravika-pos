# Instalasi Ubuntu LTS

Target: satu komputer server Ubuntu LTS di LAN. Aplikasi tidak boleh diekspos langsung ke internet publik.

## Prasyarat

- Node.js 26.9.0. Versi ini bukan LTS; tinjau sebelum pilot.
- pnpm 10.34.5.
- Git dan build tools dasar.
- Direktori data lokal: `/opt/ravika-pos/data`.

## Langkah

```bash
sudo useradd --system --home /opt/ravika-pos --shell /usr/sbin/nologin ravika
sudo mkdir -p /opt/ravika-pos
sudo chown ravika:ravika /opt/ravika-pos
sudo -u ravika git clone <repository-url> /opt/ravika-pos
cd /opt/ravika-pos
sudo -u ravika pnpm install --frozen-lockfile
sudo -u ravika cp .env.example .env
```

Isi `.env` minimal:

```text
RAVIKA_DB_PATH=/opt/ravika-pos/data/ravika.sqlite
RAVIKA_SESSION_COOKIE_SECURE=false
RAVIKA_BOOTSTRAP_OWNER_NAME=Pemilik
RAVIKA_BOOTSTRAP_OWNER_EMAIL=owner@example.com
RAVIKA_BOOTSTRAP_OWNER_PASSWORD=<password-kuat>
RAVIKA_QR_TOKEN_KEY=<base64-32-byte>
RAVIKA_INSTALLATION_ID=installation-ravika
RAVIKA_LICENSE_FILE=/opt/ravika-pos/data/license.json
RAVIKA_LICENSE_PUBLIC_KEY=<public-key-der-spki-base64>
```

Build:

```bash
sudo -u ravika pnpm build
sudo -u ravika pnpm start -- -p 3000
```

## systemd

```bash
sudo cp deploy/ravika-pos.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now ravika-pos
sudo systemctl status ravika-pos
```

Sesuaikan `ExecStart` jika path `pnpm` berbeda.

## Firewall

```bash
sudo ufw allow 3000/tcp
```

Health check:

```bash
curl http://127.0.0.1:3000/api/health
```
