# 🎫 Klaim Voucher

Aplikasi web untuk sistem klaim voucher yang aman, cepat, dan mudah digunakan.

Proyek ini dirancang untuk memvalidasi kode voucher secara _client-side_ dengan keamanan yang ditingkatkan, serta terintegrasi dengan Google Sheets untuk pencatatan klaim real-time.

## 🔐 Konsep Kriptografi

Meskipun berjalan sepenuhnya di sisi klien (_client-side_), aplikasi ini menerapkan prinsip keamanan kriptografi untuk melindungi kerahasiaan data voucher:

### 1. One-Way Hashing (SHA-256) + Salt

Kode voucher yang valid tidak disimpan secara langsung dalam _source code_. Sebaliknya, sistem menyimpan **Hash SHA-256** dari setiap kode.

- **Keunggulan**: Memastikan bahwa daftar kode asli tidak dapat di-_reverse engineer_ meskipun file database (`data.js`) diakses oleh publik.
- **Verifikasi**: Saat pengguna memasukkan kode, sistem akan melakukan _hashing_ pada input tersebut dan mencocokkannya dengan database hash.

### 2. Client-Side Decryption (Zero-Knowledge Prize)

Informasi jenis hadiah (misalnya: "Sepeda", "Smartphone", "ZONK") disimpan dalam keadaan **terenkripsi**.

- **Kunci Dekripsi**: Kunci untuk membuka data hadiah diturunkan secara dinamis dari kode voucher itu sendiri.
- **Mekanisme**: Jika pengguna memasukkan kode yang salah, kunci yang dihasilkan juga salah, sehingga data hadiah tidak akan terbaca (_gibberish_). Hanya kode yang tepat yang dapat mendekripsi informasi hadiah dengan benar.

### 3. Validasi Real-Time (Anti-Replay)

Untuk mencegah satu kode digunakan berulang kali, sistem melakukan verifikasi ganda ke server (Google Apps Script) untuk memastikan status kode tersebut belum pernah diklaim sebelumnya.

## ✨ Fitur

- **Validasi Kode Aman**: Menggunakan mekanisme hashing satu arah memastikan kode asli tidak dapat dibaca dari source code browser.
- **Proteksi Data Hadiah**: Informasi hadiah dienkripsi dan hanya dapat dibuka ketika pengguna memasukkan kode yang valid.
- **Pencegahan Klaim Ganda**: Terintegrasi dengan cloud functions untuk memverifikasi bahwa satu kode hanya bisa digunakan sekali.
- **Responsif**: Tampilan yang optimal untuk perangkat mobile dan desktop.

### Deployment

Aplikasi ini berbasis HTML/JS statis, sehingga dapat di-hosting dengan mudah di:

- GitHub Pages
- Vercel / Netlify
- Hosting statis lainnya

Cukup upload file `index.html`, `style.css`, `script.js`, dan `data.js` ke server hosting Anda.

## Keamanan & Privasi

- **Client-Side Security**: Meskipun berjalan di browser, logika validasi dirancang untuk mencegah pengintipan kode voucher yang valid.
- **Data Master**: File berisi data mentah kode voucher. **JANGAN** pernah mempublish file ini ke repository publik atau hosting.

## ⚠️ Disclaimer

Pastikan Anda telah menguji sistem secara menyeluruh sebelum menggunakannya untuk produksi massal. Pengembang tidak bertanggung jawab atas kebocoran data akibat kesalahan konfigurasi atau pengelolaan file master yang tidak aman.
