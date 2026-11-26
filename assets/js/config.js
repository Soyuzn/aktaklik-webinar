// Pengaturan yang boleh diubah tanpa menyentuh kode form.
window.WEBINAR_CONFIG = {
  // Nomor WhatsApp tim, format 628xxxxxxxxxx. Kosong = tombol mengarah ke aktaklik.id
  waNumber: '',
  // Jadwal untuk Google Calendar (UTC). 11.00 WIB = 04.00 UTC. Durasi 1 jam masih asumsi.
  calendarStart: '20261205T040000Z',
  calendarEnd: '20261205T050000Z',
  // URL penerima data (POST JSON). Kosong = mode dummy, data tidak dikirim ke mana pun.
  endpoint: ''
};
