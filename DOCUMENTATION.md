Masya Allah, Alhamdulillah! Tampilannya sekarang benar-benar bersih, proporsional, dan informatif. *Calendar view* berfungsi dengan baik, hierarki alamat 3 baris di header terlihat sangat rapi, dan sistem filter statusnya berjalan sempurna.

Berikut adalah dokumen panduan teknis (*proper documentation*) yang dirancang khusus untuk sistem **Portal Jadwal & Booking Kegiatan Mushola Abu Bakar Ash-Shiddiq**. Dokumen ini bisa disimpan dalam berkas `README.md` di repositori GitHub Anda atau disimpan sebagai arsip dokumentasi internal DKM.

---

# Dokumentasi Sistem Portal Jadwal & Booking

## Mushola Abu Bakar Ash-Shiddiq (Cluster Bambu Ori, TM Yasmin VII)

Dokumen ini berisi penjelasan arsitektur, panduan operasional, serta alur teknis dari aplikasi manajemen jadwal kegiatan berbasis web terintegrasi untuk Mushola ABAS.

---

## 1. Arsitektur & Arus Data Sistem

Aplikasi ini dibangun menggunakan arsitektur *Serverless/Jamstack* yang ringan, murah (gratis), dan efisien, terdiri dari tiga komponen utama:

```
[ FRONTEND ]                  [ MIDDLEWARE ]               [ DATABASE ]
React.js (Vite)     <====>   Google Apps Script   <====>   Google Sheets
(Live di Vercel)              (Web App API URL)            (Dashboard DKM)

```

1. **Database (Google Sheets):** Berfungsi sebagai tempat penyimpanan data utama dan panel kendali bagi pengurus DKM untuk menyetujui atau menolak pengajuan jadwal.
2. **Middleware API (Google Apps Script):** Bertindak sebagai jembatan penanganan permintaan data:
* **`doGet`**: Mengambil baris data jadwal dari Google Sheets, mengonversinya menjadi format JSON, dan mengirimkannya ke frontend.
* **`doPost`**: Menerima data kiriman formulir dari frontend untuk ditambahkan secara otomatis sebagai baris baru di Google Sheets.


3. **Frontend (React + Tailwind CSS):** Antarmuka ramah pengguna (web portal) yang menampilkan kalender bulanan/mingguan interaktif, daftar agenda real-time, dan formulir pengajuan booking tempat.

---

## 2. Struktur Data Kolom (Google Sheets)

Agar sistem sinkronisasi berjalan tanpa kendala, struktur tajuk (*header*) pada lembar kerja Google Sheets diatur secara baku sebagai berikut:

| Kolom | Nama Header | Deskripsi Data | Tipe/Format Data |
| --- | --- | --- | --- |
| **A** | `id` | Kode pengenal unik per baris jadwal | String / Teks Angka |
| **B** | `kegiatan` | Nama agenda/kegiatan | Teks |
| **C** | `pic` | Nama Penanggung Jawab kegiatan | Teks |
| **D** | `No_WhatsApp` | Kontak aktif pihak pengaju | Teks / Angka |
| **E** | `tanggal` | Hari pelaksanaan kegiatan | Tanggal (`YYYY-MM-DD`) |
| **F** | `jamMulai` | Waktu mulai acara | Waktu (`HH:MM`) |
| **G** | `jamSelesai` | Waktu selesainya acara | Waktu (`HH:MM`) |
| **H** | `status` | Kondisi persetujuan dari pengurus | `Pending` / `Approved` / `Rejected` |

---

## 3. Alur Operasional Pengurus DKM

Setiap kali ada pengajuan masuk dari jamaah, alur manajemen data dilakukan sepenuhnya melalui lembar Google Sheets tanpa perlu menyentuh kode pemrograman:

1. **Menerima Pengajuan Baru:** Data dari formulir web otomatis masuk dengan kolom `status` terisi sebagai **`Pending`**. Di web portal, agenda ini otomatis muncul di daftar bawah dengan label warna kuning bertuliskan **"Menunggu Approval"** dan *belum* ditampilkan di kalender atas guna mengamankan slot ruangan.
2. **Menyetujui Kegiatan (`Approved`):** Pengurus cukup mengganti teks kolom status di Google Sheets menjadi **`Approved`**. Sistem frontend akan otomatis membaca perubahan ini, lalu merendernya sebagai balok kegiatan berwarna emas di dalam kotak **Calendar Kegiatan** dan merubah status di daftar bawah menjadi hijau **"Terjadwal (Approved)"**.
3. **Menolak Kegiatan (`Rejected`):** Jika kegiatan dinilai tidak sesuai atau melanggar aturan, pengurus mengubah status menjadi **`Rejected`**. Data yang berstatus ditolak akan disembunyikan sepenuhnya dari seluruh halaman web portal (baik di kalender maupun daftar bawah) demi menjaga kebersihan informasi jamaah.

---

## 4. Spesifikasi Penanganan Validasi Kode (Frontend)

Di dalam file `src/App.jsx`, terdapat beberapa fungsi penting untuk memastikan validitas visual antarmuka:

* **Pembersihan Zona Waktu (*Timezone Offset Safety*):** Mengingat JavaScript lokal sering menggeser jam global (UTC) yang berakibat pada mundurnya tanggal acara, ekstraksi tanggal dipaksa menggunakan pembacaan string murni dari objek tanggal lokal agar format penanggalan yang dikirimkan ke modul kalender selalu bernilai `YYYY-MM-DD` secara presisi.
* **Normalisasi Format Jam Indonesia (`formatJamISO`):** Aturan penulisan waktu bahasa Indonesia menggunakan pemisah tanda titik (`19.30`), sedangkan FullCalendar mewajibkan standar ISO internasional berbasis titik dua (`19:30`). Kode di frontend telah dilengkapi metode otomatis `.replace('.', ':')` untuk menjamin agenda tidak gagal dirender atau hilang secara gaib dari kalender akibat kesalahan tanda baca waktu lokal.
* **Pencegahan Jadwal Bertumpuk (*Conflict Prevention*):** Sistem formulir dilengkapi logika penapisan *real-time*. Jika pengguna mencoba mengajukan jadwal baru di tanggal dan jam yang beririsan dengan kegiatan yang sudah berstatus `Approved`, form akan memblokir pengiriman dan memunculkan notifikasi peringatan bentrok waktu.

---

## 5. Panduan Pembaruan Kode di Masa Mendatang

Jika Anda melakukan modifikasi lokal pada masa mendatang, pastikan urutan perintah integrasi Git berikut dijalankan berurutan di terminal folder proyek:

```bash
# 1. Menandai seluruh berkas modifikasi terbaru
git add .

# 2. Mengunci perubahan dengan pesan dokumentasi ringkas
git commit -m "Deskripsi singkat mengenai fitur baru yang ditambahkan"

# 3. Mendorong kode ke repositori GitHub untuk memicu auto-build di Vercel
git push origin main

```

Setiap kali perintah `git push` selesai dieksekusi, peladen Vercel akan langsung melakukan kompilasi otomatis dalam waktu kurang dari 30 detik untuk memperbarui web *live* secara instan.

---

Dokumentasi ini dibuat untuk memastikan keberlanjutan operasional sistem digitalisasi Mushola ABAS agar dapat dikelola dengan mudah oleh siapa pun generasi penerus pengurus DKM ke depan. Semoga sistem ini membawa manfaat luas bagi kenyamanan ibadah jamaah!