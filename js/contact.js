/* js/contact.js */
(() => {
  const $ = s => document.querySelector(s);

  const form  = $('#contactForm');
  const nameI = $('#name');
  const mailI = $('#email');
  const msgI  = $('#msg');
  const hp    = $('#website');          // Honeypot
  const alert = $('#formAlert');
  const btn   = $('#sendBtn');

  if (!form) return;

  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

  const setAlert = (msg, good=false) => {
    if (!alert) return;
    alert.textContent = msg || '';
    alert.style.color = good ? 'var(--accent)' : '#ff9aa2';
  };

  function validate() {
    const errs = [];
    if (!nameI.value.trim() || nameI.value.trim().length < 2) errs.push('Bitte gib einen gültigen Namen ein.');
    if (!emailRx.test(mailI.value.trim())) errs.push('Bitte gib eine gültige E-Mail an.');
    if (!msgI.value.trim() || msgI.value.trim().length < 5) errs.push('Nachricht bitte mit mindestens 10 Zeichen.');
    if (hp.value) errs.push('Spam erkannt.');
    return errs;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setAlert('');

    const errs = validate();
    if (errs.length) {
      setAlert(errs[0]);
      return;
    }

    btn.disabled = true;
    const orig = btn.textContent;
    btn.textContent = 'Wird gesendet …';

    try {
      const fd = new FormData(form);
      const res = await fetch(form.getAttribute('action') || 'php/send.php', {
        method: 'POST',
        body: fd,
        headers: {'Accept': 'application/json'}
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Senden fehlgeschlagen.');
      }

      // Erfolg → Danke-Seite
      window.location.href = 'thanks.html';
    } catch (err) {
      setAlert(err.message || 'Es ist ein Fehler aufgetreten.');
      btn.disabled = false;
      btn.textContent = orig;
    }
  });
})();
