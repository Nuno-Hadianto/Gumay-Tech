# Gumay Tech
**Aplikasi Point of Sales (POS) & Manajemen Layanan Servis Komputer/Laptop Offline**

---

## 📖 Tentang Aplikasi

**Gumay Tech** adalah perangkat lunak desktop *offline* yang dirancang secara khusus untuk memfasilitasi kebutuhan manajemen operasional pada pusat layanan perbaikan (servis) perangkat elektronik, seperti komputer, laptop, dan ponsel pintar.

Aplikasi ini dikembangkan untuk memberikan solusi terhadap kendala stabilitas konektivitas internet di lapangan. Dengan arsitektur yang beroperasi secara sepenuhnya *offline*, seluruh data pelanggan, riwayat servis, serta laporan keuangan dicatat dan disimpan dengan aman secara lokal di dalam perangkat pengguna.

## ✨ Fitur Utama

- 📊 **Dashboard Analitik**: Menyediakan ringkasan eksekutif secara *real-time* mengenai status perbaikan, estimasi pendapatan bulanan, serta peringatan otomatis untuk antrean yang tertunda (*abandoned services*).
- 👥 **Manajemen Pelanggan & Integrasi WhatsApp**: Sistem pencatatan basis data pelanggan yang terstruktur. Dilengkapi dengan fungsionalitas untuk mengirim nota tagihan atau pembaruan status servis secara instan melalui WhatsApp Web.
- 🔧 **Pelacakan Siklus Servis (Service Tracking)**: Memantau setiap tahapan operasional secara mendetail, mulai dari *Penerimaan*, *Proses Pengerjaan*, *Selesai*, hingga terminasi pembayaran (uang muka ataupun pelunasan).
- 📦 **Katalog Harga Sparepart**: Basis data harga beli dan harga jual suku cadang. Terintegrasi dengan fitur analitik di Dashboard untuk mengidentifikasi suku cadang yang paling sering digunakan.
- 🖨️ **Ekspor Dokumen & Pelaporan**: Fasilitas ekspor nota tagihan (*invoice*) dan tanda terima dalam format PDF untuk pelanggan, serta fitur ekspor laporan keuangan bulanan secara komprehensif.
- ♻️ **Recycle Bin (Soft Delete)**: Data yang dihapus tidak langsung hilang permanen, melainkan dipindahkan ke keranjang sampah (Recycle Bin) untuk mencegah kehilangan data akibat kelalaian (human error).
- 🎨 **Antarmuka Glassmorphism Premium**: Desain UI modern dengan elemen *glassmorphism* tembus pandang yang elegan dan animasi interaktif yang responsif.
- ⚡ **Sistem Cache Real-time**: Transisi perpindahan antar menu yang instan dan *auto-refresh* tabel data setiap kali ada perubahan data (tanpa perlu reload halaman manual).

## 🚀 Panduan Instalasi (Untuk Pengembang)

Bagi pengembang yang ingin menjalankan, memodifikasi, atau berkontribusi pada basis kode:

### Persyaratan Sistem

- [Node.js](https://nodejs.org/) (Versi 18 atau yang lebih baru)
- Package Manager: `npm` atau `yarn`

### Langkah Instalasi

1. **Kloning Repositori**

   ```bash
   git clone https://github.com/Nuno-Hadianto/Gumay-Tech.git
   cd Gumay-Tech
   ```

2. **Instalasi Dependensi**

   ```bash
   npm install
   ```

3. **Menjalankan Aplikasi (Mode Development)**
   Aplikasi ini menggunakan kombinasi ekosistem Vite untuk modul antarmuka (Frontend) dan Electron untuk modul sistem inti (Backend). Eksekusi perintah berikut untuk memuat kedua servis secara paralel:

   ```bash
   npm run dev:all
   ```

## 📦 Distribusi Produksi (Build .exe)

Untuk memaketkan kode sumber menjadi aplikasi distribusi mandiri *installer* Windows (`.exe`) yang siap digunakan pada perangkat tanpa dependensi:

```bash
npm run build
```

Berkas eksekusi hasil *build* akan di-generate dan diletakkan di dalam direktori `dist/`.

## 🛠️ Stack Teknologi (Tech Stack)

- **Frontend**: [Vue 3](https://vuejs.org/) (Composition API) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/) + **Pinia** (State Management & Caching)
- **Desain UI**: Vanilla CSS dengan desain kustom sistem **Glassmorphism** dan komponen kustom (*CustomSelect*, *ConfirmDialog*).
- **Backend**: [Node.js](https://nodejs.org/) + [Electron](https://www.electronjs.org/)
- **Database**: [SQLite](https://sqlite.org/) (mengimplementasikan modul `better-sqlite3`). Dipilih karena kinerjanya yang ringan, terisolasi secara lokal, serta tidak memerlukan konfigurasi peladen khusus.
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) untuk standarisasi skema database, migrasi asinkron, dan keamanan tipe data (*type-safety*).

## 📄 Lisensi

Proyek ini didistribusikan di bawah [MIT License](LICENSE). Anda diperbolehkan untuk menggunakan, mendistribusikan ulang, memodifikasi, dan mengimplementasikan proyek ini secara bebas untuk tujuan personal maupun komersial.
