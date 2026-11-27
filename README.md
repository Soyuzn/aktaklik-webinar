# Webinar Aktaklik · 5 Desember 2026

Website pendaftaran webinar (contoh/dummy). HTML, CSS, dan JavaScript polos, tanpa proses build.

Satu halaman: `index.html` (tampilan Bold). Versi Klasik dan top bar pindah versi sudah dihapus. Alamat lama `/bold` diarahkan ke `/`.

## Jalankan di komputer

    python3 -m http.server 8000

Lalu buka http://localhost:8000

## Upload ke Vercel

Import repo ini, Framework Preset **Other**, tanpa build command. Atau jalankan `vercel` dari folder ini.

## Yang perlu diisi sebelum dipakai sungguhan

Semua di `assets/js/config.js`:

- `endpoint`: **saat ini kosong, jadi data pendaftar tidak disimpan di mana pun.**
- `waNumber`: nomor WhatsApp tim. Tombol "KONFIRMASI SEKARANG" di halaman sukses membuka WhatsApp ke nomor ini dengan pesan yang sudah terisi. Kosong berarti WhatsApp terbuka tanpa tujuan.
- `calendarStart` / `calendarEnd`: durasi 1 jam masih asumsi.

Hal lain:

- Cek ulang info acara: online, gratis, link via WhatsApp dan email.
- Link di footer dan form newsletter belum tersambung.
- Halaman diberi `noindex`; hapus tag-nya kalau ingin muncul di mesin pencari.

Desain: Figma "Aktaklik", page "Webinar · 5 Des".
