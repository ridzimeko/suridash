# Suridash

Suridash adalah dashboard full-stack dan antarmuka manajemen untuk Suricata IDS/IPS. Proyek ini menyediakan visualisasi _alert_ secara _real-time_, manajemen agen, dan kemampuan pemblokiran IP melalui antarmuka web modern.

Proyek ini terhubung dalam ekosistem dengan beberapa komponen utama:

- **Client**: Aplikasi React yang dibangun menggunakan Vite, Tailwind CSS, dan Recharts.
- **Server**: Backend Node.js yang menggunakan Express, Drizzle ORM, WebSocket untuk pembaruan _real-time_, dan PostgreSQL.
- **Agent**: Modul agen pemantau yang berjalan di server target (Tersedia di repositori terpisah: [suridash-agent](https://github.com/ridzimeko/suridash-agent)).

## Fitur

- Pemantauan _alert_ Suricata secara _real-time_ (dengan membaca file `eve.json` secara berlanjut)
- Grafik dan analitik untuk event jaringan
- Otomatisasi pemblokiran IP menggunakan `ipset` dan `iptables`
- Manajemen agen dan integrasi

---

## Konfigurasi yang Dibutuhkan

Sebelum menjalankan proyek ini, Anda perlu menyiapkan konfigurasi _environment_ dan dependensi yang diperlukan.

### Prasyarat

1. **Node.js** (v18+) dan **pnpm** telah terinstal.
2. Database **PostgreSQL** berjalan.
3. **Suricata** telah terinstal dan dikonfigurasi untuk mengeluarkan log ke `/var/log/suricata/eve.json`.
4. (Opsional) **ipset** dan **iptables** untuk fitur pemblokiran IP.

### Environment Variables

Salin file `.env.sample` menjadi `.env` di direktori root:

```bash
cp .env.sample .env
```

Pastikan untuk menyesuaikan variabel di dalam `.env` sesuai dengan _setup_ Anda:

- `DATABASE_URL`: String koneksi untuk database PostgreSQL Anda.
- `ORIGINS_URLS` & `APP_BASE_URL`: URL dasar untuk kebutuhan CORS dan Autentikasi.
- `VITE_BASE_URL_API` & `VITE_WS_BASE_URL`: URL API dan WebSocket untuk client.

### Setup Database

Untuk menginisialisasi skema database, jalankan perintah berikut:

```bash
cd server
pnpm db:generate
pnpm db:migrate
# (Opsional) Mengisi database dengan data user awal (seeding)
pnpm seed:user
```

---

## Tahap Running dan Build

Proyek ini menggunakan _workspaces_ dari `pnpm`, sehingga Anda bisa menjalankan perintah untuk _client_ dan _server_ sekaligus dari direktori _root_.

### 1. Instalasi Dependensi

```bash
pnpm install
```

### 2. Mode Development (Pengembangan)

Untuk menjalankan _client_ dan _server_ dalam mode pengembangan dengan fitur _hot-reloading_:

```bash
pnpm dev
```

- Client akan berjalan di `http://localhost:5173`
- Server akan berjalan di `http://localhost:3000`

### 3. Build untuk Produksi

Untuk melakukan _build_ pada _frontend_ dan _backend_ agar siap digunakan pada tahap produksi:

```bash
pnpm build
```
