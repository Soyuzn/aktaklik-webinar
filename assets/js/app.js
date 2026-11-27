(() => {
  const CFG = window.WEBINAR_CONFIG;
  const bold = document.body.dataset.version === 'bold';
  const root = document.getElementById('modal-root');

  const ROLES = ['Notaris', 'PPAT', 'Notaris & PPAT', 'Staf kantor'];
  const ATTEND = ['Saya sendiri', 'Saya bersama tim', 'Diwakilkan staf'];
  const QUESTIONS = [
    ['volume', 'Volume akta per bulan', false, ['0-20', '20-50', '50-100', '100+']],
    ['akta', 'Akta yang paling sering dibuat', true, ['Pendirian/perubahan PT', 'CV', 'Yayasan', 'Fidusia', 'AJB', 'PPJB', 'APHT', 'SKMHT', 'RUPS', 'Lainnya']],
    ['kendala', 'Kendala paling sering saat drafting', true, ['Salah input data klien', 'Waktu habis untuk input manual', 'Lupa dokumen pendukung', 'Lupa daftar dokumen dari klien', 'Due diligence / PMPJ', 'Lainnya']],
    ['minat', 'Apa yang paling ingin Anda lihat di webinar?', false, ['Baca data dari dokumen', 'Alur draft akta', 'Keamanan data', 'Tanya jawab langsung']]
  ];
  const COPY = bold ? {
    1: ['ISI NAMA ANDA', 'tulis kantor Anda dan siapa yang ikut.', 'LANJUT KE LANGKAH 2'],
    2: ['SIAPA YANG IKUT?', '4 pertanyaan singkat, lalu selesai.', 'LANJUT KE LANGKAH 3'],
    3: ['TINGGAL KLIK-KLIK', 'tekan tombol hijau, Anda terdaftar.', 'SELESAI, DAFTARKAN SAYA']
  } : {
    1: ['Daftar Webinar Aktaklik', 'Sabtu, 5 Desember 2026 · 11.00 WIB · Online', 'Lanjut'],
    2: ['Kantor dan peserta', 'Supaya kami tahu siapa saja yang perlu dikirimi link.', 'Lanjut'],
    3: ['Terakhir, 4 pertanyaan singkat', 'Supaya materi webinar sesuai dengan kebutuhan kantor Anda.', 'Kirim Pendaftaran']
  };

  const emptyPerson = () => ({ name: '', job: '' });
  const fresh = () => ({ name: '', wa: '', email: '', role: '', office: '', city: '', attend: '', people: [emptyPerson()], volume: '', akta: [], kendala: [], minat: '' });
  let data = fresh();
  let step = 0;
  let errors = {};
  let opener = null;

  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const filledPeople = () => data.people.filter((p) => p.name.trim());
  const totalPeople = () => data.attend === 'Saya sendiri' ? 1 : filledPeople().length + (data.attend === 'Saya bersama tim' ? 1 : 0);
  const totalText = () => `Total ${totalPeople()} peserta${data.attend === 'Saya bersama tim' ? ', termasuk Anda' : ''}.`;
  const waDigits = () => data.wa.replace(/\D/g, '').replace(/^(62|0)/, '');

  const error = (key) => errors[key] ? `<p class="error" id="err-${key}">${errors[key]}</p>` : '';
  const text = (key, label, placeholder, attrs = '', prefix = '') => `
    <div class="field ${errors[key] ? 'invalid' : ''}">
      <label class="label" for="f-${key}">${label}</label>
      <div class="input">${prefix ? `<span class="pre">${prefix}</span>` : ''}<input id="f-${key}" name="${key}" value="${esc(data[key])}" placeholder="${placeholder}" ${attrs} ${errors[key] ? `aria-invalid="true" aria-describedby="err-${key}"` : ''}></div>
      ${error(key)}
    </div>`;
  const chips = (key, label, options, multi = false, number = 0) => `
    <fieldset class="field ${number ? 'q' : ''} ${errors[key] ? 'invalid' : ''}">
      <legend class="label">${number ? `<em>${number}.</em>` : ''}${label}${multi ? ' <small>(boleh lebih dari satu)</small>' : ''}</legend>
      <div class="chips">${options.map((o) => `<label class="chip"><input type="${multi ? 'checkbox' : 'radio'}" name="${key}" value="${esc(o)}" ${(multi ? data[key].includes(o) : data[key] === o) ? 'checked' : ''}><span>${esc(o)}</span></label>`).join('')}</div>
      ${error(key)}
    </fieldset>`;

  const attendees = () => {
    if (!data.attend) return '';
    if (data.attend === 'Saya sendiri') return '<p class="hint" style="margin:0 0 12px">Link webinar dikirim ke WhatsApp dan email Anda.</p>';
    const label = data.attend === 'Saya bersama tim' ? 'Peserta lain yang ikut' : 'Staf yang akan hadir';
    return `<fieldset class="field ${errors.people ? 'invalid' : ''}"><legend class="label">${label}</legend>
      ${data.people.map((p, i) => `<div class="person">
        <div class="input"><input data-person="${i}" data-key="name" value="${esc(p.name)}" placeholder="Nama peserta" aria-label="Nama peserta ${i + 1}" maxlength="80"></div>
        <div class="input"><input data-person="${i}" data-key="job" value="${esc(p.job)}" placeholder="Jabatan" aria-label="Jabatan peserta ${i + 1}" maxlength="60"></div>
        <button type="button" class="close" data-remove="${i}" aria-label="Hapus peserta ${i + 1}">×</button>
      </div>`).join('')}
      <button type="button" class="add" data-add>+ Tambah peserta</button>
      <p class="total" aria-live="polite">${totalText()}</p>${error('people')}
    </fieldset>`;
  };

  const body = {
    1: () => text('name', 'Nama lengkap', 'Contoh: Budi Santoso, S.H., M.Kn.', 'autocomplete="name" maxlength="100"')
      + text('wa', 'Nomor WhatsApp', '812 3456 7890', 'type="tel" inputmode="tel" autocomplete="tel-national" maxlength="18"', '+62')
      + text('email', 'Email', 'nama@kantor.com', 'type="email" autocomplete="email" maxlength="120"')
      + chips('role', 'Anda berpraktik sebagai', ROLES),
    2: () => text('office', 'Nama kantor', 'Contoh: Kantor Notaris Budi Santoso', 'autocomplete="organization" maxlength="120"')
      + text('city', 'Lokasi kantor (kota / kabupaten)', 'Contoh: Kota Bandung', 'maxlength="80"')
      + chips('attend', 'Siapa yang akan hadir?', ATTEND)
      + attendees(),
    3: () => QUESTIONS.map(([key, label, multi, options], i) => chips(key, label, options, multi, i + 1)).join('')
  };

  const header = () => {
    const close = '<button type="button" class="close" data-close aria-label="Tutup">×</button>';
    if (!bold) return `<div class="top"><div class="progress"><p>LANGKAH ${step} DARI 3</p><div>${[1, 2, 3].map((n) => `<i class="${n <= step ? 'on' : ''}"></i>`).join('')}</div></div>${close}</div>`;
    return `<div class="top"><ol class="stepper">${['Data Anda', 'Kantor', 'Selesai'].map((l, i) => {
      const n = i + 1;
      return `<li class="${n <= step ? 'reached' : ''} ${n === step ? 'now' : ''}" ${n === step ? 'aria-current="step"' : ''}><b>${n < step ? '✓' : n}</b><span>${l}</span></li>`;
    }).join('')}</ol>${close}</div><p class="pill">LANGKAH ${step} DARI 3</p>`;
  };

  const calendarUrl = () => 'https://calendar.google.com/calendar/render?' + new URLSearchParams({
    action: 'TEMPLATE', text: 'Webinar Aktaklik', dates: `${CFG.calendarStart}/${CFG.calendarEnd}`,
    details: 'Webinar online Aktaklik. Link dikirim ke WhatsApp dan email yang didaftarkan.', location: 'Online'
  });
  // Pesan siap kirim ke tim. Nomor kosong = WhatsApp terbuka tanpa tujuan (pilih kontak sendiri).
  const waMessage = () => [
    'Halo tim Aktaklik, saya mau konfirmasi pendaftaran webinar 5 Desember 2026 (11.00 WIB).', '',
    `Nama: ${data.name.trim()}`, `Kantor: ${data.office.trim()}`, `Peserta: ${totalPeople()} orang`, '',
    'Mohon dikirimi link webinarnya ya. Terima kasih.'
  ].join('\n');
  const waUrl = () => `https://wa.me/${(CFG.waNumber || '').replace(/\D/g, '')}?text=${encodeURIComponent(waMessage())}`;
  const waIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z"/><path d="M8.5 9.5c.3 2.4 2.6 4.7 5 5l1.3-1.3-1.9-1-.8.8c-.9-.4-1.7-1.2-2.1-2.1l.8-.8-1-1.9z" fill="currentColor" stroke="none"/></svg>';

  const success = () => {
    const actions = `
      <a class="btn-main" href="${waUrl()}" target="_blank" rel="noopener">${waIcon}${bold ? 'KIRIM KE WHATSAPP' : 'Konfirmasi via WhatsApp'}</a>
      <p class="hint wa-note">WhatsApp terbuka dengan pesan yang sudah kami tulis. Anda tinggal menekan kirim.</p>
      <a class="btn-line" href="${calendarUrl()}" target="_blank" rel="noopener">${bold ? 'Simpan jadwal ke kalender' : 'Simpan ke Google Calendar'}</a>
      <button type="button" class="textbtn" data-close>Kembali ke halaman utama</button>`;
    const middle = bold ? `
      <p class="lead">Cuma <b>2 ketukan</b> supaya link webinar sampai ke Anda.</p>
      <ol class="next-list">${[['Tekan tombol hijau', 'WhatsApp terbuka, pesannya sudah siap.'], ['Tekan kirim', 'Tim kami balas dengan link webinar.'], ['Hadir Sabtu, 5 Desember', 'Jam 11.00 WIB, online.']].map(([a, b], i) => `<li><i>${i + 1}</i><span><b>${a}</b><small>${b}</small></span></li>`).join('')}</ol>
      <p class="hint who">${esc(data.office)} · ${totalPeople()} peserta</p>` : `
      <p class="lead">Konfirmasi lewat WhatsApp untuk menerima link webinar. Pesannya sudah kami siapkan.</p>
      <dl class="summary">${[['Acara', 'Webinar Aktaklik'], ['Tanggal', 'Sabtu, 5 Desember 2026'], ['Waktu', '11.00 WIB · Online'], ['Kantor', data.office], ['Peserta', `${totalPeople()} orang`]].map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
    return `<div class="success"><button type="button" class="close" data-close aria-label="Tutup">×</button>
      <img class="blend" src="assets/img/icon-success.webp" alt="" width="112" height="112">
      <p class="pill">LANGKAH TERAKHIR</p>
      <h2 class="title" id="dialog-title" tabindex="-1">${bold ? 'SATU LANGKAH LAGI!' : 'Pendaftaran diterima'}</h2>${middle}${actions}</div>`;
  };

  const form = () => {
    const [title, sub, button] = COPY[step];
    return `${header()}
      <h2 class="title" id="dialog-title" tabindex="-1">${title}</h2>
      <p class="lead">${bold ? `<b>Setelah ini:</b> ${sub}` : sub}</p>
      <form novalidate>${body[step]()}
        <button class="btn-main" type="submit">${button} <span aria-hidden="true">→</span></button>
      </form>
      ${step === 1 ? '<p class="privacy">Data Anda aman dan tidak diperjualbelikan.</p>' : '<button type="button" class="textbtn" data-back>← Kembali</button>'}`;
  };

  function render(keepPosition = false) {
    const top = keepPosition ? root.querySelector('.overlay')?.scrollTop : 0;
    const active = keepPosition ? document.activeElement : null;
    const refocus = active?.name ? `input[name="${active.name}"][value="${CSS.escape(active.value)}"]` : null;
    root.innerHTML = `<div class="overlay"><div class="dialog ${step === 3 ? 'wide' : ''}" role="dialog" aria-modal="true" aria-labelledby="dialog-title">${step === 4 ? success() : form()}</div></div>`;
    if (keepPosition) root.querySelector('.dialog').style.animation = 'none';
    root.querySelector('.overlay').scrollTop = top || 0;
    if (refocus) root.querySelector(refocus)?.focus({ preventScroll: true });
    else if (!keepPosition) root.querySelector('#dialog-title').focus({ preventScroll: true });
  }

  function validate() {
    const e = {};
    const need = (key, msg) => { if (!String(data[key]).trim() || (Array.isArray(data[key]) && !data[key].length)) e[key] = msg; };
    if (step === 1) {
      need('name', 'Nama belum diisi.');
      if (!/^8\d{7,12}$/.test(waDigits())) e.wa = 'Isi nomor WhatsApp yang benar, contoh 812 3456 7890.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) e.email = 'Isi email yang benar, contoh nama@kantor.com.';
      need('role', 'Pilih salah satu.');
    }
    if (step === 2) {
      need('office', 'Nama kantor belum diisi.');
      need('city', 'Lokasi kantor belum diisi.');
      need('attend', 'Pilih salah satu.');
      if (data.attend && data.attend !== 'Saya sendiri') {
        if (!filledPeople().length) e.people = 'Isi minimal 1 nama peserta.';
        else if (data.people.some((p) => p.job.trim() && !p.name.trim())) e.people = 'Ada jabatan tanpa nama.';
      }
    }
    if (step === 3) QUESTIONS.forEach(([key]) => need(key, 'Pilih jawaban dulu.'));
    errors = e;
    return !Object.keys(e).length;
  }

  const payload = () => ({
    ...data,
    wa: '62' + waDigits(),
    people: data.attend === 'Saya sendiri' ? [] : filledPeople(),
    total: totalPeople(),
    version: document.body.dataset.version
  });

  async function submit(button) {
    if (CFG.endpoint) {
      button.disabled = true;
      try {
        const res = await fetch(CFG.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload()) });
        if (!res.ok) throw new Error(res.status);
      } catch {
        button.disabled = false;
        button.textContent = 'Gagal terkirim, coba lagi';
        return;
      }
    }
    step = 4;
    render();
  }

  function open(from) {
    opener = from;
    if (step === 0 || step === 4) { data = fresh(); step = 1; }
    errors = {};
    document.body.classList.add('locked');
    [...document.body.children].forEach((el) => { if (el !== root) el.inert = true; });
    render();
  }

  function close() {
    root.innerHTML = '';
    document.body.classList.remove('locked');
    [...document.body.children].forEach((el) => { el.inert = false; });
    opener?.focus({ preventScroll: true });
  }

  document.addEventListener('click', (ev) => {
    const t = ev.target.closest('button');
    if (!t) return;
    if (t.hasAttribute('data-open')) open(t);
    else if (t.hasAttribute('data-close')) close();
    else if (t.hasAttribute('data-back')) { step -= 1; errors = {}; render(); }
    else if (t.hasAttribute('data-add')) {
      if (data.people.length < 20) data.people.push(emptyPerson());
      render(true);
      root.querySelector(`[data-person="${data.people.length - 1}"]`)?.focus();
    } else if (t.hasAttribute('data-remove')) {
      data.people.splice(Number(t.dataset.remove), 1);
      if (!data.people.length) data.people.push(emptyPerson());
      render(true);
    }
  });

  root.addEventListener('input', (ev) => {
    const el = ev.target;
    if (el.dataset.person !== undefined) {
      data.people[el.dataset.person][el.dataset.key] = el.value;
      root.querySelector('.total').textContent = totalText();
    } else if (el.type === 'checkbox') {
      data[el.name] = [...root.querySelectorAll(`input[name="${el.name}"]:checked`)].map((i) => i.value);
    } else if (el.name) {
      data[el.name] = el.value;
    }
    const field = el.closest('.invalid');
    if (field) {
      delete errors[el.dataset.person !== undefined ? 'people' : el.name];
      field.classList.remove('invalid');
      el.removeAttribute('aria-invalid');
    }
  });

  root.addEventListener('change', (ev) => {
    if (ev.target.name === 'attend') render(true);
  });

  root.addEventListener('submit', (ev) => {
    ev.preventDefault();
    if (!validate()) {
      render(true);
      const first = root.querySelector('.invalid');
      first?.querySelector('input')?.focus({ preventScroll: true });
      first?.scrollIntoView({ block: 'center' });
      return;
    }
    if (step === 3) submit(ev.submitter);
    else { step += 1; render(); }
  });

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && root.firstChild) close();
  });

  document.querySelector('[data-news]')?.addEventListener('submit', (ev) => {
    ev.preventDefault();
    ev.target.nextElementSibling.textContent = 'Fitur ini belum tersambung (website contoh).';
  });
})();
